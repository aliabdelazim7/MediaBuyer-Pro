'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Search, 
  CheckCheck, 
  Phone, 
  UserPlus, 
  Building2, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  User, 
  MessageCircle,
  Camera,
  ArrowRight,
  Plus,
  Layers,
  FileText,
  Zap,
  Info,
  ShieldAlert
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'AI';
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  platform: 'MESSENGER' | 'INSTAGRAM_DM' | 'WHATSAPP';
  platformThreadId: string;
  senderName: string;
  senderId: string;
  senderAvatar?: string;
  pageName?: string;
  portfolioName?: string;
  status: 'OPEN' | 'RESOLVED' | 'FLAGGED';
  unreadCount: number;
  lastMessageText: string;
  lastMessageAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'INQUIRY_PRICE' | 'SPAM' | 'NEUTRAL';
  leadId?: string;
  messages: ChatMessage[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [selectedPageTab, setSelectedPageTab] = useState<string>('ALL');
  
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (selectId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (platformFilter !== 'ALL') params.append('platform', platformFilter);

      const res = await fetch(`/api/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0) {
          const toSelect = selectId
            ? data.conversations.find((c: any) => c.id === selectId)
            : activeConversation
            ? data.conversations.find((c: any) => c.id === activeConversation.id) || data.conversations[0]
            : data.conversations[0];
          setActiveConversation(toSelect || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [platformFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSelectConversation = async (conv: ConversationItem) => {
    setActiveConversation(conv);
    try {
      const res = await fetch(`/api/messages/${conv.id}`);
      const data = await res.json();
      if (data.success && data.conversation) {
        setActiveConversation(data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Failed to load conversation thread:', err);
    }
  };

  const handleLiveMetaSync = async () => {
    setSyncingMeta(true);
    setToastMessage(null);
    setPermissionNotice(false);
    try {
      const res = await fetch('/api/messages/sync', { method: 'POST' });
      const data = await res.json();
      if (data.permissionMissing) {
        setPermissionNotice(true);
      } else if (data.syncedConversationsCount > 0) {
        setToastMessage(`🎉 تم سحب ${data.syncedConversationsCount} محادثة حية من خوادم فيسبوك مباشرة!`);
      } else {
        setToastMessage('✅ تم تحديث ومزامنة كافة الشاتات بنجاح.');
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to sync live page messages:', err);
    } finally {
      setSyncingMeta(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeConversation) return;

    const messageText = replyInput.trim();
    setReplyInput('');
    setSending(true);

    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      senderType: 'AGENT',
      text: messageText,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setActiveConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMsg], lastMessageText: messageText } : null
    );

    try {
      const res = await fetch(`/api/messages/${activeConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, senderType: 'AGENT' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchConversations(activeConversation.id);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!activeConversation) return;
    setGeneratingAi(true);
    try {
      const res = await fetch(`/api/messages/${activeConversation.id}/ai-draft`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.aiDraft) {
        setReplyInput(data.aiDraft);
        setToastMessage('✨ تم توليد رد ذكي جاهز ومعدل حسب لهجة وهوية البراند!');
      }
    } catch (err) {
      console.error('Failed to generate AI draft:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleConvertToCrmLead = async () => {
    if (!activeConversation) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeConversation.senderName,
          source: `${activeConversation.pageName || activeConversation.portfolioName} (${activeConversation.platform})`,
          dealValue: 500,
          currency: 'EGP',
          notes: `تحويل مباشر من محادثة: "${activeConversation.lastMessageText}"`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`🎉 تم تحويل العميل (${activeConversation.senderName}) إلى مسار مبيعات الـ CRM بنجاح!`);
      }
    } catch (err) {
      console.error('Failed to convert to lead:', err);
    }
  };

  // Group pages with their chat counts and unread counts
  const pageMap = new Map<string, { pageName: string; count: number; unreadCount: number; portfolioName?: string }>();

  conversations.forEach((c) => {
    const pName = c.pageName || c.portfolioName || 'صفحات أخرى';
    if (!pageMap.has(pName)) {
      pageMap.set(pName, { pageName: pName, count: 0, unreadCount: 0, portfolioName: c.portfolioName });
    }
    const cur = pageMap.get(pName)!;
    cur.count += 1;
    cur.unreadCount += c.unreadCount;
  });

  const pageTabs = Array.from(pageMap.values());

  // Filter conversations by selected page and search term
  const filteredConversations = conversations.filter((c) => {
    const pName = c.pageName || c.portfolioName || 'صفحات أخرى';
    const matchesPage = selectedPageTab === 'ALL' || pName === selectedPageTab;
    const matchesSearch = c.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPage && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* 1. Top Header */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight">
              صندوق الرسايل الموحد والمحادثات المباشرة (Unified Omnichannel Inbox)
            </h1>
          </div>
          <p className="text-xs text-[#8b9bb4]">
            فصل شاتات ورسائل كل صفحة وبيزنس بورتفوليو في تبويب مستقل مع الرد الذكي والتحويل المباشر للـ CRM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLiveMetaSync}
            disabled={syncingMeta}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
            title="سحب المحادثات الحية من فيسبوك"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingMeta ? 'animate-spin' : ''}`} />
            <span>{syncingMeta ? 'جاري سحب المحادثات الحية...' : 'سحب وتحديث رسايل فيسبوك'}</span>
          </button>
        </div>
      </div>

      {permissionNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>تنبيه بخصوص صلاحيات قراءة رسايل الصفحات المباشرة من فيسبوك:</span>
          </div>
          <p className="text-[#cbd5e1] leading-relaxed">
            توكن فيسبوك الحالي مفعل به صلاحيات الإعلانات والـ Insights (`ads_management`) لسحب الحملات بدقة. لقراءة وسحب المحادثات الحية مباشرة عبر الـ Graph API، تأكد عند إنشاء التوكن في المرات القادمة من تحديد صلاحية <b>`pages_messaging`</b> و <b>`instagram_manage_messages`</b> في بوابة Meta Developers.
          </p>
        </div>
      )}

      {toastMessage && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
        </div>
      )}

      {/* 2. DEDICATED PAGE SEPARATOR TABS BAR */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-bold pb-1">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>اختر الصفحة لعرض محادثاتها بشكل منفصل:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedPageTab('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              selectedPageTab === 'ALL'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-[#0b0e14] text-[#8b9bb4] hover:text-white border border-[#1e2638]'
            }`}
          >
            <span>كافة الصفحات</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-black/30 font-mono">
              {conversations.length}
            </span>
          </button>

          {pageTabs.map((pt) => {
            const isSelected = selectedPageTab === pt.pageName;
            return (
              <button
                key={pt.pageName}
                onClick={() => setSelectedPageTab(pt.pageName)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#1d4ed8] text-white shadow-sm font-bold'
                    : 'bg-[#0b0e14] text-[#8b9bb4] hover:text-[#f1f5f9] hover:bg-[#161c2b] border border-[#1e2638]'
                }`}
              >
                <span>📄 {pt.pageName}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-[#161c2b] text-[#cbd5e1]'
                }`}>
                  {pt.count}
                </span>
                {pt.unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 3-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        
        {/* Left Column: Conversations for Selected Page (4 cols) */}
        <div className="lg:col-span-4 bg-[#111622] border border-[#1e2638] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          
          {/* Search & Platform Filter Chips */}
          <div className="p-3.5 border-b border-[#1e2638] space-y-2.5 bg-[#0d111a]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث في شاتات هذه الصفحة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
              />
            </div>

            {/* Platform Quick Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {[
                { key: 'ALL', label: 'الكل' },
                { key: 'MESSENGER', label: 'Messenger 🔵' },
                { key: 'WHATSAPP', label: 'WhatsApp 🟢' },
                { key: 'INSTAGRAM_DM', label: 'Instagram 🟣' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatformFilter(p.key)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    platformFilter === p.key
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-[#161c2b] text-[#8b9bb4] hover:text-white border border-[#242e42]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1a2130]">
            {filteredConversations.length === 0 ? (
              <div className="p-10 text-center text-[#64748b] text-xs">
                لا توجد محادثات في هذه الصفحة حالياً
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const platformIcon =
                  conv.platform === 'WHATSAPP' ? '🟢' : conv.platform === 'INSTAGRAM_DM' ? '🟣' : '🔵';

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3.5 transition cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-[#161f30] border-r-4 border-blue-500'
                        : 'hover:bg-[#151b27]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                        {conv.senderName.slice(0, 2)}
                      </div>
                      <span className="absolute -bottom-1 -left-1 text-xs">{platformIcon}</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#f1f5f9] truncate">{conv.senderName}</h4>
                        <span className="text-[10px] text-[#64748b] font-mono whitespace-nowrap">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#8b9bb4] truncate">{conv.lastMessageText}</p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#64748b] truncate font-mono">
                          {conv.pageName || conv.portfolioName}
                        </span>

                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Live Chat Thread (5 cols) */}
        <div className="lg:col-span-5 bg-[#111622] border border-[#1e2638] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-[#64748b] text-xs">
              اختر محادثة لبدء الرد المباشر
            </div>
          ) : (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-[#1e2638] flex items-center justify-between gap-3 bg-[#0d111a] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                    {activeConversation.senderName.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#f1f5f9]">{activeConversation.senderName}</h3>
                    <p className="text-[10px] text-[#8b9bb4] font-mono">
                      {activeConversation.pageName || activeConversation.portfolioName} • {activeConversation.platform}
                    </p>
                  </div>
                </div>

                {/* AI Draft Trigger */}
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={generatingAi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-amber-300 border border-amber-500/20 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                  title="توليد رد ذكي مقترح بالعامية"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${generatingAi ? 'animate-spin' : ''}`} />
                  <span>{generatingAi ? 'جاري التوليد...' : 'اقتراح رد AI'}</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b0e14]/50">
                {activeConversation.messages.map((msg) => {
                  const isAgent = msg.senderType === 'AGENT' || msg.senderType === 'AI';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-[#1d4ed8] text-white rounded-br-none shadow-sm'
                            : 'bg-[#161c2b] text-[#f1f5f9] border border-[#242e42] rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-[#64748b] font-mono mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Reply Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1e2638] bg-[#0d111a] flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="اكتب ردك للعميل هنا..."
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-1 p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
                />
                <button
                  type="submit"
                  disabled={sending || !replyInput.trim()}
                  className="p-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white transition active:scale-95 disabled:opacity-50 shrink-0"
                  title="إرسال"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right Column: Customer Info & CRM Actions (3 cols) */}
        <div className="lg:col-span-3 bg-[#111622] border border-[#1e2638] rounded-2xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
          {!activeConversation ? (
            <div className="text-center py-10 text-xs text-[#64748b]">لا توجد بيانات</div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Profile Card */}
                <div className="text-center space-y-2 pb-4 border-b border-[#1e2638]">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                    {activeConversation.senderName.slice(0, 2)}
                  </div>
                  <h3 className="text-sm font-bold text-[#f1f5f9]">{activeConversation.senderName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block">
                    {activeConversation.pageName || activeConversation.portfolioName}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex items-center justify-between">
                    <span className="text-[#64748b]">المنصة:</span>
                    <span className="font-bold text-white font-mono">{activeConversation.platform}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex items-center justify-between">
                    <span className="text-[#64748b]">تصنيف النية:</span>
                    <span className="font-bold text-emerald-400">🔥 استفسار عن السعر</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-[#1e2638] flex items-center justify-between">
                    <span className="text-[#64748b]">الصفحة:</span>
                    <span className="font-semibold text-[#cbd5e1] truncate max-w-[120px]">
                      {activeConversation.pageName || 'الصفحة الرسمية'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct CRM Convert Button */}
              <div className="pt-3 border-t border-[#1e2638] space-y-2">
                <button
                  onClick={handleConvertToCrmLead}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تحويل إلى عميل في الـ CRM</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
