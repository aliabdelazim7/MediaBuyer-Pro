'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  EyeOff, 
  Plus, 
  CheckCircle2, 
  AlertOctagon, 
  Heart, 
  HelpCircle, 
  Filter,
  UserPlus,
  Building2,
  RefreshCw
} from 'lucide-react';

interface CommentItem {
  id: string;
  postId: string;
  commentId: string;
  senderName: string;
  message: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'INQUIRY_PRICE' | 'SPAM' | 'NEUTRAL';
  intent: string;
  status: 'PENDING' | 'REPLIED' | 'HIDDEN' | 'RESOLVED';
  replyMessage?: string;
  repliedAt?: string;
  isPrivateReplied: boolean;
  createdAt: string;
  page?: { name: string };
}

export default function ModerationPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('ALL');
  const [editingReplies, setEditingReplies] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation Form
  const [simName, setSimName] = useState('علي المصري');
  const [simMessage, setSimMessage] = useState('بكام الشوز ده ومتاح منه مقاس 43؟');
  const [simPageName, setSimPageName] = useState('شركة الهبا للبالة الخليجى');
  const [simAutoReply, setSimAutoReply] = useState(false);

  const realPages = [
    'شركة الهبا للبالة الخليجى',
    'عاصمة الكون للمصاعد',
    'عاصمة الكون للمصاعد مكه',
    'شركة حنيجل للكاميرات',
    'Pixelmind',
    'El Wazeer',
    'Bella Vida Homes',
    'حسن الحوت للآلات الزراعية',
    'Codever'
  ];

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/comments');
      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
        const replyMap: Record<string, string> = {};
        (data.comments || []).forEach((c: CommentItem) => {
          if (c.replyMessage) replyMap[c.id] = c.replyMessage;
        });
        setEditingReplies(replyMap);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAction = async (id: string, action: 'REPLY' | 'SEND_DM' | 'HIDE') => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const message = editingReplies[id];
      const res = await fetch(`/api/comments/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(
          action === 'REPLY'
            ? '✅ تم نشر الرد على الصفحة مباشرة!'
            : action === 'SEND_DM'
            ? '📩 تم إرسال الرسالة الخاصة (DM) للعميل!'
            : '👁️ تم إخفاء التعليق بنجاح.'
        );
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to execute action:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleConvertToLead = async (comment: CommentItem) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: comment.senderName,
          source: comment.page?.name || 'Social Comment',
          dealValue: 350,
          currency: 'EGP',
          notes: `تم تحويله تلقائياً من تعليق: "${comment.message}"`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`🎉 تم تحويل العميل (${comment.senderName}) إلى مسار الـ CRM بنجاح!`);
      }
    } catch (err) {
      console.error('Failed to convert to lead:', err);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: simName,
          message: simMessage,
          autoReplyEnabled: simAutoReply,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSimulateModal(false);
        setSimMessage('');
        fetchComments();
        setToastMessage('⚡ تم استقبال التعليق وتحليله ذكياً بنجاح.');
      }
    } catch (err) {
      console.error('Failed to simulate comment:', err);
    }
  };

  const filteredComments = comments.filter((c) => {
    const matchesSentiment = sentimentFilter === 'ALL' || c.sentiment === sentimentFilter;
    const matchesPage = selectedPageFilter === 'ALL' || (c.page?.name || '').includes(selectedPageFilter);
    return matchesSentiment && matchesPage;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight">
              مركز الموديريشن والتفاعل الذكي (Social Inbox & AI Replies)
            </h1>
          </div>
          <p className="text-xs text-[#8b9bb4]">
            استقبال تعليقات الصفحات الحية، الرد التلقائي بالعامية، كشف النوايا الشرائية، وتحويل المعلقين إلى عملاء CRM
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchComments()}
            className="p-2 rounded-xl bg-[#161c2b] text-blue-400 hover:bg-[#1e2638] border border-[#1e2638] transition"
            title="تحديث التعليقات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>محاكاة وصول تعليق جديد</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
        </div>
      )}

      {/* 2. Sentiment & Connected Pages Filter Bar */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Sentiment Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'ALL', label: 'كافة التعليقات', icon: Filter },
              { key: 'INQUIRY_PRICE', label: 'استفسارات الأسعار والطلبات 🔥', icon: HelpCircle, color: 'text-blue-400' },
              { key: 'POSITIVE', label: 'تفاعل إيجابي ومدح ❤️', icon: Heart, color: 'text-emerald-400' },
              { key: 'NEGATIVE', label: 'شكاوى وتجارب سلبية ⚠️', icon: AlertOctagon, color: 'text-rose-400' },
              { key: 'SPAM', label: 'إعلانات وسبام 🚫', icon: EyeOff, color: 'text-[#64748b]' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = sentimentFilter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSentimentFilter(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition text-xs ${
                    isSelected
                      ? 'bg-[#1e293b] text-blue-400 font-bold border border-blue-500/30'
                      : 'bg-[#0b0e14] text-[#8b9bb4] hover:text-[#e2e8f0] border border-[#1e2638]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color || ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Connected Page Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#64748b]" />
            <select
              value={selectedPageFilter}
              onChange={(e) => setSelectedPageFilter(e.target.value)}
              className="p-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#cbd5e1] font-medium"
            >
              <option value="ALL">كافة الصفحات المربوطة ({realPages.length})</option>
              {realPages.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Comments Stream */}
      <div className="space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-12 text-center text-[#64748b] text-xs">
            لا توجد تعليقات في هذا القسم حالياً.
          </div>
        ) : (
          filteredComments.map((c) => {
            const isLoading = actionLoading[c.id];

            const sentimentBadgeMap = {
              INQUIRY_PRICE: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
              POSITIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              NEGATIVE: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold',
              SPAM: 'bg-[#1e2638] text-[#8b9bb4] border border-[#2b364e]',
              NEUTRAL: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
            };

            const sentimentLabelMap = {
              INQUIRY_PRICE: '🔥 يسأل عن السعر / تفاصيل',
              POSITIVE: '❤️ تفاعل إيجابي',
              NEGATIVE: '⚠️ شكوى / مشكلة',
              SPAM: '🚫 سبام ورابط مزعج',
              NEUTRAL: '💬 استفسار عام',
            };

            return (
              <div
                key={c.id}
                className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm space-y-3.5 transition hover:border-[#28344c]"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                      {c.senderName.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#f1f5f9]">{c.senderName}</h4>
                      <p className="text-[10px] text-[#64748b] font-mono">
                        {c.page?.name || 'الصفحة الرئيسية'} • ID: {c.commentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium ${sentimentBadgeMap[c.sentiment]}`}>
                      {sentimentLabelMap[c.sentiment]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'REPLIED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : c.status === 'HIDDEN'
                          ? 'bg-[#1e2638] text-[#8b9bb4]'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {c.status === 'REPLIED' ? 'تم الرد' : c.status === 'HIDDEN' ? 'مخفي' : 'معلق'}
                    </span>
                  </div>
                </div>

                {/* Comment Text Content */}
                <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] text-xs text-[#e2e8f0] leading-relaxed">
                  &ldquo;{c.message}&rdquo;
                </div>

                {/* AI Suggested Reply Box */}
                {c.status !== 'HIDDEN' && (
                  <div className="p-3.5 rounded-xl bg-[#0e131d] border border-[#1e2638] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-300 flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>الرد الذكي المقترح بالعامية (AI Draft):</span>
                      </span>
                      <span className="text-[10px] text-[#64748b]">جاهز للإرسال الفوري أو التعديل</span>
                    </div>

                    <textarea
                      rows={2}
                      value={editingReplies[c.id] || ''}
                      onChange={(e) =>
                        setEditingReplies((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60 resize-none"
                      placeholder="اكتب ردك هنا..."
                    />

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleConvertToLead(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition"
                        title="إضافة كعميل مهتم في الـ CRM"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>تحويل إلى ليد CRM</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(c.id, 'HIDE')}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#161c2b] text-[#8b9bb4] hover:text-[#f1f5f9] transition disabled:opacity-50"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>إخفاء</span>
                        </button>

                        <button
                          onClick={() => handleAction(c.id, 'SEND_DM')}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/15 transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال في الخاص (DM)</span>
                        </button>

                        <button
                          onClick={() => handleAction(c.id, 'REPLY')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isLoading ? 'جاري الإرسال...' : 'نشر الرد العام'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-sm font-bold text-[#f1f5f9]">محاكاة وصول تعليق جديد عبر Webhook</h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">الصفحة المستهدفة</label>
                <select
                  value={simPageName}
                  onChange={(e) => setSimPageName(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                >
                  {realPages.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">نص التعليق</label>
                <textarea
                  rows={3}
                  required
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] resize-none"
                  placeholder="اكتب تعليقاً باللهجة المصرية أو الخليجية..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoReplySim"
                  checked={simAutoReply}
                  onChange={(e) => setSimAutoReply(e.target.checked)}
                  className="rounded bg-[#0b0e14] border-[#1e2638] text-blue-600"
                />
                <label htmlFor="autoReplySim" className="text-[#cbd5e1] cursor-pointer">
                  تفعيل الرد الآلي الفوري (Auto-Reply)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold"
                >
                  إرسال واختبار التحليل الذكي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
