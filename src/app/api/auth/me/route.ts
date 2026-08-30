import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return NextResponse.json({ authenticated: true, user: payload });
  } catch (e) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
