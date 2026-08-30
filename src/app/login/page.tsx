'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('admin@mediabuyer.pro');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setErrorMessage(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err: any) {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#111622] border border-[#1e2638] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/30">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-[#f1f5f9] tracking-tight">
          MediaBuyer <span className="text-blue-500">Pro</span>
        </h1>
        <p className="text-xs text-[#8b9bb4]">
          منظومة إدارة الإعلانات وحماية الميزانيات والـ Social CRM
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="block text-[#cbd5e1] font-semibold">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#64748b] absolute right-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mediabuyer.pro"
              className="w-full pl-4 pr-10 py-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#cbd5e1] font-semibold">كلمة المرور</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#64748b] absolute right-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-3 text-[#64748b] hover:text-[#cbd5e1]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Demo Credentials Hint */}
        <div className="p-3 bg-[#0b0e14] border border-[#1e2638] rounded-2xl text-[11px] text-[#8b9bb4] space-y-1">
          <div className="flex justify-between">
            <span>البريد الافتراضي:</span>
            <span className="font-mono text-blue-400 font-bold">admin@mediabuyer.pro</span>
          </div>
          <div className="flex justify-between">
            <span>كلمة المرور:</span>
            <span className="font-mono text-blue-400 font-bold">Admin@2026</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>جاري التحقق والدخول...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول للمنظومة</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-[#1e2638]">
        <span className="text-[11px] text-[#64748b]">
          نظام آمن ومحمي بأعلى معايير التشفير والصلاحيات
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-[#64748b] text-xs">جاري التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
