import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { APP_CONFIG } from '../../../../infrastructure/config/defaults';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const validEmail = APP_CONFIG.admin.email;
    const validPassword = APP_CONFIG.admin.password;

    // Verify credentials
    if (email === validEmail && password === validPassword) {
      // In production, sign an encrypted JWT or session token
      const sessionToken = Buffer.from(
        JSON.stringify({
          email: validEmail,
          name: 'Media Buyer Admin',
          role: 'ADMIN',
          loggedInAt: Date.now(),
        })
      ).toString('base64');

      const cookieStore = await cookies();
      cookieStore.set('auth_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({
        success: true,
        user: { email: validEmail, name: 'Media Buyer Admin' },
        message: 'تم تسجيل الدخول بنجاح',
      });
    }

    return NextResponse.json(
      { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
