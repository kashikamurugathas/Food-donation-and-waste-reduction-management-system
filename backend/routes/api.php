<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| FoodShare Lanka - API Routes
|--------------------------------------------------------------------------
| REST API endpoints connected to MySQL database via Laravel Sanctum.
*/

// Public Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

// Authenticated Routes (Requires Sanctum Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'currentUser']);

    // Role-specific protected routes
    // Food Donor dashboard actions
    Route::middleware('can:donor-access')->group(function () {
        // e.g. Route::post('/donations', [DonationController::class, 'store']);
        // e.g. Route::get('/donor/my-donations', [DonationController::class, 'myListings']);
    });

    // Care Home / Institution dashboard actions
    Route::middleware('can:institution-access')->group(function () {
        // e.g. Route::post('/requests', [RequestController::class, 'store']);
        // e.g. Route::get('/institution/my-requests', [RequestController::class, 'myRequests']);
    });

    // Admin dashboard actions
    Route::middleware('can:admin-access')->group(function () {
        // e.g. Route::post('/admin/verify-institution/{id}', [AdminController::class, 'verify']);
    });
});
