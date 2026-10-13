<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DonorProfile;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new Food Donor or Receiving Institution in MySQL.
     * Public registration cannot create Administrator accounts.
     */
    public function register(Request $request)
    {
        // 1. Validation rules
        $validator = Validator::make($request->all(), [
            'name'                  => ['required', 'string', 'min:2', 'max:150'],
            'email'                 => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'phone'                 => ['required', 'string', 'min:9', 'max:25'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
            'role'                  => ['required', 'string', Rule::in(['donor', 'institution'])],
            
            // Food Donor fields
            'donor_type'            => ['required_if:role,donor', 'nullable', 'string'],
            'venue_name'            => ['nullable', 'string', 'max:191'],
            'address'               => ['required', 'string', 'max:500'],
            'area'                  => ['required', 'string', 'max:100'],
            'district'              => ['nullable', 'string', 'max:50'],

            // Institution fields
            'institution_name'      => ['required_if:role,institution', 'nullable', 'string', 'max:191'],
            'institution_type'      => ['required_if:role,institution', 'nullable', Rule::in(["Children's Home", "Elders' Home", "Care Centre"])],
            'registration_number'   => ['required_if:role,institution', 'nullable', 'string', 'max:100', 'unique:institutions,registration_number'],
            'contact_person'        => ['required_if:role,institution', 'nullable', 'string', 'max:150'],
            'resident_count'        => ['required_if:role,institution', 'nullable', 'integer', 'min:1'],
        ], [
            'email.unique'          => 'This email address is already registered. Please log in or use a different email.',
            'role.in'               => 'Role must be either Food Donor or Receiving Institution.',
            'password.confirmed'    => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Prevent admin creation via public endpoint
        if ($request->role === 'admin') {
            return response()->json([
                'message' => 'Forbidden: Administrator accounts cannot be created via public registration.',
            ], 403);
        }

        // 2. Hash password securely (Argon2id or Bcrypt via Laravel Hash)
        $user = User::create([
            'name'        => trim($request->name),
            'email'       => strtolower(trim($request->email)),
            'phone'       => trim($request->phone),
            'password'    => Hash::make($request->password), // Irreversible hash
            'role'        => $request->role,
            'is_verified' => false,
        ]);

        // 3. Create role-specific profile record
        if ($request->role === 'donor') {
            DonorProfile::create([
                'user_id'           => $user->id,
                'organization_type' => $request->donor_type ?? 'Wedding Hall',
                'venue_name'        => $request->venue_name ?? $request->name,
                'address'           => $request->address,
                'area'              => $request->area ?? 'Nallur',
                'district'          => $request->district ?? 'Jaffna',
                'contact_person'    => $request->name,
            ]);
        } elseif ($request->role === 'institution') {
            Institution::create([
                'user_id'             => $user->id,
                'name'                => $request->institution_name ?? $request->name,
                'institution_type'    => $request->institution_type ?? "Children's Home",
                'registration_number' => $request->registration_number,
                'address'             => $request->address,
                'area'                => $request->area ?? 'Jaffna Town',
                'district'            => $request->district ?? 'Jaffna',
                'contact_person'      => $request->contact_person ?? $request->name,
                'resident_count'      => $request->resident_count ?? 30,
            ]);
        }

        // 4. Generate Sanctum Bearer Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account registered successfully in MySQL.',
            'token'   => $token,
            'user'    => $user->load($request->role === 'donor' ? 'donorProfile' : 'institution'),
        ], 201);
    }

    /**
     * Authenticate an existing user against MySQL database records.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        // 1. Account existence check
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address. Please register an account first.',
                'errors'  => [
                    'email' => ['No registered account matches this email.'],
                ],
            ], 404);
        }

        // 2. Cryptographic password verification
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials. The password entered is incorrect.',
                'errors'  => [
                    'password' => ['Incorrect password. Please verify and try again.'],
                ],
            ], 401);
        }

        // 3. Issue authentic Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $user->load($user->role === 'donor' ? 'donorProfile' : 'institution'),
        ], 200);
    }

    /**
     * Terminate user session and revoke current Sanctum token.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully. Authenticated token revoked.',
        ]);
    }

    /**
     * Get current authenticated user details.
     */
    public function currentUser(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => $user->load($user->role === 'donor' ? 'donorProfile' : 'institution'),
        ]);
    }

    /**
     * Send password reset link with SMTP verification check.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', strtolower($request->email))->first();
        if (!$user) {
            return response()->json([
                'message' => 'No registered account found with this email address.',
            ], 404);
        }

        // Verify if real mailer is configured
        $mailHost = config('mail.mailers.smtp.host');
        if (empty($mailHost) || $mailHost === 'mailpit' || $mailHost === '127.0.0.1') {
            return response()->json([
                'configured'     => false,
                'message'        => 'Live SMTP mail server is unconfigured in this environment. Please configure MAIL_HOST, MAIL_PORT, MAIL_USERNAME, and MAIL_PASSWORD in your .env file.',
                'setup_required' => [
                    'driver'    => 'smtp',
                    'variables' => ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_ADDRESS'],
                ],
            ], 503);
        }

        // Dispatch reset link
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)])
            : response()->json(['message' => __($status)], 400);
    }
}
