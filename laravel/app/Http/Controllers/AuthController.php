<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $adminEmail = config('services.admin.email', env('ADMIN_EMAIL', 'admin@mediabuyer.pro'));
        $adminPassword = config('services.admin.password', env('ADMIN_PASSWORD', 'Admin@2026'));

        if ($credentials['email'] === $adminEmail && $credentials['password'] === $adminPassword) {
            session(['authenticated' => true, 'user_email' => $adminEmail]);
            return redirect()->intended(route('campaigns.index'));
        }

        return back()->withErrors([
            'email' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        $request->session()->flush();
        return redirect()->route('login');
    }
}
