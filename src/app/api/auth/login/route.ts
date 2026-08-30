import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const validEmail = process.env.ADMIN_EMAIL || 'admin@mediabuyer.pro';
    const validPassword = process.env.ADMIN_PASSWORD || 'Admin@2026';

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
