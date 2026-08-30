'use client';

import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Building2,
  RefreshCw,
  Layers,
  FileText,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface FacebookUserAccount {
  id: string;
  name: string;
  fbUserId: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  portfolios: Array<{
    id: string;
    name: string;
    fbBusinessId: string;
    vertical?: string;
    verificationStatus: string;
    adAccounts: Array<{
      id: string;
      name: string;
      accountId: string;
      currency: string;
      campaigns: Array<{ id: string; spend: number; conversions: number; status: string }>;
    }>;
    pages: Array<{
      id: string;
      name: string;
      pageId: string;
    }>;
  }>;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<FacebookUserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken) return;

    setConnecting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: newToken }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConnectModal(false);
        setNewToken('');
        setNotice(`✅ تم ربط الحساب (${data.result?.user?.name}) وسحب ${data.result?.portfoliosCount || 0} بيزنس بورتفوليو بنجاح!`);
        fetchAccounts();
      } else {
        setNotice(`❌ حدث خطأ: ${data.error}`);
      }
    } catch (err) {
      setNotice('فشل الاتصال بالخادم');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في فصل الحساب "${name}" وجميع البورتفوليو المرتبطة به؟`)) return;
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAccounts();
      }
    } catch (err) {
      console.error('Failed to disconnect account:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight">
              إدارة الحسابات والبيزنس بورتفوليو (Multi-Portfolio Hub)
            </h1>
          </div>
          <p className="text-xs text-[#8b9bb4]">
            ربط حسابات فيسبوك متعددة وسحب كافة الـ Business Managers والحسابات الإعلانية والصفحات التابعة لها تلقائياً
          </p>
        </div>

        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ربط حساب فيسبوك جديد</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
        </div>
      )}

      {/* 2. Connected Accounts & Portfolios Hierarchy */}
      <div className="space-y-5">
        {accounts.length === 0 ? (
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-12 text-center text-[#64748b] text-xs">
            لا توجد حسابات متصلة حالياً. اضغط على زر "ربط حساب فيسبوك جديد" للبدء.
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
            >
              {/* Account User Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {acc.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#f1f5f9]">{acc.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>متصل بنشاط</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
                      FB User ID: {acc.fbUserId} • {acc.portfolios.length} بيزنس بورتفوليو مكتشف
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDisconnect(acc.id, acc.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>فصل الحساب</span>
                  </button>
                </div>
              </div>

              {/* Portfolios Hierarchy Grid */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-[#8b9bb4] uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>البيزنس بورتفوليو والحسابات التابعة ({acc.portfolios.length} Portfolios):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acc.portfolios.map((portfolio) => {
                    return (
                      <div
                        key={portfolio.id}
                        className="bg-[#0b0e14] border border-[#1e2638] rounded-2xl p-4 space-y-3 hover:border-[#28344c] transition"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-[#1e2638] pb-2.5">
                          <div>
                            <h5 className="font-bold text-xs text-[#f1f5f9] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{portfolio.name}</span>
                            </h5>
                            <span className="text-[10px] text-[#64748b] font-mono">
                              BM ID: {portfolio.fbBusinessId} • {portfolio.vertical || 'E-Commerce'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {portfolio.verificationStatus}
                          </span>
                        </div>

                        {/* Ad Accounts under this portfolio */}
                        <div className="space-y-2 text-xs">
                          <span className="text-[#8b9bb4] font-medium text-[11px] flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-400" />
                            <span>الحسابات الإعلانية ({portfolio.adAccounts.length}):</span>
                          </span>
                          <div className="space-y-1.5">
                            {portfolio.adAccounts.map((adAcc) => (
                              <div
                                key={adAcc.id}
                                className="p-2.5 rounded-xl bg-[#111622] border border-[#1e2638] flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-[#cbd5e1]">{adAcc.name}</span>
                                  <p className="text-[10px] text-[#64748b] font-mono">
                                    ID: {adAcc.accountId} • {adAcc.currency}
                                  </p>
                                </div>
                                <span className="text-emerald-400 font-semibold font-mono text-[11px]">
                                  {adAcc.campaigns.length} حملات
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pages under this portfolio */}
                        {portfolio.pages.length > 0 && (
                          <div className="space-y-1.5 text-xs pt-1.5 border-t border-[#1e2638]">
                            <span className="text-[#8b9bb4] font-medium text-[10px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-sky-400" />
                              <span>الصفحات المربوطة ({portfolio.pages.length}):</span>
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {portfolio.pages.map((p) => (
                                <span
                                  key={p.id}
                                  className="px-2 py-0.5 rounded-lg bg-[#111622] border border-[#1e2638] text-[#cbd5e1] text-[10px]"
                                >
                                  📄 {p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-sm font-bold text-[#f1f5f9]">ربط حساب فيسبوك واكتشاف البورتفوليو</h3>
              <button onClick={() => setShowConnectModal(false)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">
                  Facebook User Access Token (System User / Personal Token)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="EAAB..."
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono text-xs focus:outline-none focus:border-blue-500/60 resize-none"
                />
                <p className="text-[11px] text-[#8b9bb4] mt-1.5 leading-relaxed">
                  * سيقوم النظام تلقائياً بالاتصال بـ Meta Graph API، والتحقق من هوية الحساب، وجلب جميع الـ <b>Business Portfolios / Business Managers</b> والحسابات الإعلانية والصفحات والحملات المرتبطة به.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8] hover:text-[#f1f5f9]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connecting ? 'animate-spin' : ''}`} />
                  <span>{connecting ? 'جاري التحقق وسحب البيانات...' : 'بدء الربط والاكتشاف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
