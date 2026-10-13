# FoodShare Lanka – Laravel REST API Backend Architecture & Local Setup Guide

This guide describes how the backend of **FoodShare Lanka** is structured using a Laravel REST API, MySQL database (via XAMPP on Linux/Ubuntu), and token-based role authentication.

---

## 1. System Requirements for Local Linux Development

| Software | Recommended Version | Installation Command (Ubuntu/Debian) |
| :--- | :--- | :--- |
| **Linux OS** | Ubuntu 22.04 / 24.04 LTS | N/A |
| **PHP** | 8.2 or 8.3 | `sudo apt install php8.2 php8.2-cli php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl` |
| **Composer** | 2.6+ | `sudo apt install composer` |
| **XAMPP / MySQL** | MariaDB 10.4+ / MySQL 8.0 | Download XAMPP for Linux or `sudo apt install mysql-server` |
| **Node.js & npm** | Node 20+ & npm 10+ | `sudo apt install nodejs npm` |

---

## 2. Setting Up MySQL Database via XAMPP

1. Start XAMPP on Linux:
   ```bash
   sudo /opt/lampp/lampp start
   ```
2. Import the provided schema:
   ```bash
   /opt/lampp/bin/mysql -u root -p < database/schema.sql
   ```
   Or access phpMyAdmin via `http://localhost/phpmyadmin/` and import `database/schema.sql`.

---

## 3. Laravel Project Structure & API Endpoints

### Core Models & Relationships:
- `User`: HasOne `DonorProfile`, HasOne `Institution`, HasMany `Notifications`.
- `FoodDonation`: BelongsTo `User` (Donor), HasMany `FoodRequests`, HasMany `DonationPhotos`.
- `FoodRequest`: BelongsTo `FoodDonation`, BelongsTo `Institution`, HasOne `CollectionRecord`.
- `Complaint`: BelongsTo `User` (Reporter).

### REST API Route Table (`routes/api.php`):

```php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ComplaintController;

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/donations', [DonationController::class, 'index']); // Filterable by Jaffna area
Route::get('/donations/{id}', [DonationController::class, 'show']);
Route::get('/institutions', [InstitutionController::class, 'index']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'currentUser']);

    // Donor Specific Routes
    Route::middleware('role:donor')->group(function () {
        Route::post('/donations', [DonationController::class, 'store']);
        Route::put('/donations/{id}', [DonationController::class, 'update']);
        Route::delete('/donations/{id}', [DonationController::class, 'destroy']);
        Route::get('/donor/my-donations', [DonationController::class, 'donorListings']);
        Route::post('/requests/{id}/approve', [RequestController::class, 'approve']);
        Route::post('/requests/{id}/reject', [RequestController::class, 'reject']);
        Route::get('/donations/{id}/smart-matches', [DonationController::class, 'smartMatches']);
    });

    // Institution Specific Routes
    Route::middleware('role:institution')->group(function () {
        Route::post('/requests', [RequestController::class, 'store']);
        Route::get('/institution/my-requests', [RequestController::class, 'institutionRequests']);
        Route::post('/requests/{id}/confirm-received', [RequestController::class, 'confirmReceived']);
    });

    // Admin Moderation Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::post('/admin/verify-user/{id}', [AdminController::class, 'verifyUser']);
        Route::get('/admin/complaints', [ComplaintController::class, 'index']);
        Route::put('/admin/complaints/{id}', [ComplaintController::class, 'update']);
        Route::get('/admin/export-csv', [AdminController::class, 'exportCSV']);
    });

    // General Safety Incident Reporting
    Route::post('/complaints', [ComplaintController::class, 'store']);
});
```

---

## 4. Smart Matching Engine Controller Implementation (PHP/Laravel)

```php
namespace App\Http\Controllers;

use App\Models\FoodDonation;
use App\Models\Institution;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    /**
     * Compute Haversine Distance in Kilometres
     */
    private function calculateDistanceKm($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 1);
    }

    public function getMatches($donationId)
    {
        $donation = FoodDonation::findOrFail($donationId);
        $institutions = Institution::whereHas('user', function ($q) {
            $q->where('is_verified', true);
        })->get();

        $matches = [];
        foreach ($institutions as $inst) {
            $distance = $this->calculateDistanceKm(
                $donation->latitude,
                $donation->longitude,
                $inst->latitude,
                $inst->longitude
            );

            // Dietary compatibility
            $isStrictVeg = in_array('Pure Vegetarian', $inst->dietaryRequirements->pluck('requirement')->toArray());
            $dietaryFit = !$isStrictVeg || $donation->is_vegetarian;

            $suitability = 100 - min(50, $distance * 2.5);
            if (!$dietaryFit) $suitability -= 35;

            $matches[] = [
                'institution' => $inst,
                'distance_km' => $distance,
                'suitability_score' => max(15, min(99, round($suitability))),
                'can_serve' => min($donation->remaining_quantity, $inst->resident_count)
            ];
        }

        usort($matches, fn($a, $b) => $b['suitability_score'] <=> $a['suitability_score']);
        return response()->json($matches);
    }
}
```

---

## 5. Transaction Safety on Food Requests

When an institution requests portions:
```php
public function store(Request $request)
{
    return DB::transaction(function () use ($request) {
        $donation = FoodDonation::lockForUpdate()->findOrFail($request->donation_id);

        if ($donation->safe_collection_deadline < now()) {
            return response()->json(['error' => 'Donation listing has expired for food safety.'], 422);
        }

        if ($donation->remaining_quantity < $request->requested_portions) {
            return response()->json([
                'error' => "Requested portions exceed remaining available ({$donation->remaining_quantity})."
            ], 422);
        }

        $foodRequest = FoodRequest::create([
            'donation_id' => $donation->id,
            'institution_id' => auth()->user()->institution->id,
            'requested_portions' => $request->requested_portions,
            'people_to_feed' => $request->people_to_feed,
            'preferred_collection_time' => $request->preferred_collection_time,
            'logistics_type' => $request->logistics_type,
            'status' => 'Pending'
        ]);

        return response()->json($foodRequest, 201);
    });
}
```
