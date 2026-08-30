'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Search,
  MessageCircle,
  TrendingUp,
  DollarSign,
  UserCheck,
  Filter
} from 'lucide-react';

interface LeadItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  stage: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATING' | 'WON' | 'LOST';
  dealValue: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

const STAGES: Array<{ key: LeadItem['stage']; label: string; color: string; bg: string }> = [
  { key: 'NEW', label: 'عملاء جدد (New)', color: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
  { key: 'CONTACTED', label: 'تم التواصل (Contacted)', color: 'text-amber-400', bg: 'border-amber-500/20 bg-amber-500/5' },
  { key: 'QUALIFIED', label: 'مؤهل للشراء (Qualified)', color: 'text-purple-400', bg: 'border-purple-500/20 bg-purple-500/5' },
  { key: 'NEGOTIATING', label: 'جاري التفاوض (Negotiating)', color: 'text-indigo-400', bg: 'border-indigo-500/20 bg-indigo-500/5' },
  { key: 'WON', label: 'تم البيع بنجاح (Won) 🏆', color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5' },
  { key: 'LOST', label: 'ملغي / غير مهتم (Lost)', color: 'text-rose-400', bg: 'border-rose-500/20 bg-rose-500/5' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState('500');
  const [currency, setCurrency] = useState('EGP');
  const [source, setSource] = useState('شركة الهبا للبالة الخليجى');
  const [notes, setNotes] = useState('');

  const brandOptions = [
    'شركة الهبا للبالة الخليجى',
    'مؤسسة عاصمة الكون للمصاعد',
    'حسن الحوت للآلات الزراعية',
    'شركة حنيجل للكاميرات',
    'Pixelmind',
    'El Wazeer',
    'Bella Vida Homes',
    'حملة إعلانية / رسائل واتساب'
  ];

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (id: string, newStage: LeadItem['stage']) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          dealValue: parseFloat(dealValue) || 0,
          currency,
          source,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setName('');
        setPhone('');
        setNotes('');
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (l.phone || '').includes(searchTerm) ||
                          (l.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrandFilter === 'ALL' || l.source.includes(selectedBrandFilter);
    return matchesSearch && matchesBrand;
  });

  const totalWonValue = filteredLeads
    .filter((l) => l.stage === 'WON')
    .reduce((acc, l) => acc + l.dealValue, 0);

  const totalPipelineValue = filteredLeads
    .filter((l) => l.stage !== 'LOST')
    .reduce((acc, l) => acc + l.dealValue, 0);

  const wonLeadsCount = filteredLeads.filter((l) => l.stage === 'WON').length;
  const winRate = filteredLeads.length > 0 ? Math.round((wonLeadsCount / filteredLeads.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* 1. Top Header & Stats */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight">
              مسار تحويل العملاء والـ CRM (Leads & Deals Pipeline)
            </h1>
          </div>
          <p className="text-xs text-[#8b9bb4]">
            متابعة العملاء المحتملين من الحملات، إدارة مراحل الصفقات، وفتح محادثات واتساب مباشرة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* 2. Pipeline KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#111622] border border-[#1e2638]">
          <span className="text-[11px] text-[#8b9bb4]">إجمالي قيمة المسار البيعي:</span>
          <p className="text-sm font-bold text-white font-mono mt-0.5">{totalPipelineValue.toLocaleString()} ج.م / ر.س</p>
          <span className="text-[10px] text-[#64748b]">{filteredLeads.length} عميل مسجل</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-[#1e2638]">
          <span className="text-[11px] text-[#8b9bb4]">المبيعات المحققة (Won Deals):</span>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{totalWonValue.toLocaleString()} ج.م / ر.س</p>
          <span className="text-[10px] text-[#64748b]">{wonLeadsCount} طلب ناجح</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-[#1e2638]">
          <span className="text-[11px] text-[#8b9bb4]">نسبة إغلاق الصفقات (Win Rate):</span>
          <p className="text-sm font-bold text-blue-400 font-mono mt-0.5">{winRate}%</p>
          <span className="text-[10px] text-[#64748b]">معدل التحويل الكلي</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#111622] border border-[#1e2638]">
          <span className="text-[11px] text-[#8b9bb4]">عملاء قيد التفاوض:</span>
          <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
            {filteredLeads.filter((l) => l.stage === 'QUALIFIED' || l.stage === 'NEGOTIATING').length} عميل
          </p>
          <span className="text-[10px] text-[#64748b]">جاهزون للإغلاق</span>
        </div>
      </div>

      {/* 3. Search & Brand Filter Bar */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو المنتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#64748b]" />
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="p-1.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#cbd5e1] font-medium"
          >
            <option value="ALL">كافة البورتفوليو والماركات</option>
            {brandOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Kanban Stages Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.key);
          const stageValue = stageLeads.reduce((acc, l) => acc + l.dealValue, 0);

          return (
            <div
              key={stage.key}
              className={`rounded-2xl border p-3.5 flex flex-col gap-2.5 min-h-[480px] bg-[#111622] ${stage.bg}`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0b0e14] text-[#8b9bb4]">
                  {stageLeads.length}
                </span>
              </div>

              {/* Stage Value */}
              <div className="text-[10px] text-[#64748b] font-mono">
                القيمة: {stageValue.toLocaleString()}
              </div>

              {/* Lead Cards */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] hover:border-[#2b364e] transition space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-[#f1f5f9] leading-tight">{lead.name}</h4>
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">
                        {lead.dealValue} {lead.currency}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#64748b] font-mono">
                      المصدر: {lead.source}
                    </div>

                    {lead.phone && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#8b9bb4] font-mono text-[11px]">{lead.phone}</span>
                        <a
                          href={`https://wa.me/2${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`أهلاً بك يا ${lead.name}! بخصوص طلبك من ${lead.source}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1 text-[10px]"
                          title="فتح محادثة واتساب"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    )}

                    {lead.notes && (
                      <p className="text-[10px] text-[#8b9bb4] bg-[#161c2b] p-1.5 rounded-lg line-clamp-2">
                        {lead.notes}
                      </p>
                    )}

                    {/* Stage Switch Arrows */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1a2130] text-[10px]">
                      <span className="text-[#64748b] font-mono">
                        {new Date(lead.createdAt).toLocaleDateString('ar-EG')}
                      </span>

                      <div className="flex items-center gap-1">
                        {stage.key !== 'NEW' && (
                          <button
                            onClick={() => {
                              const currIdx = STAGES.findIndex((s) => s.key === stage.key);
                              if (currIdx > 0) handleStageChange(lead.id, STAGES[currIdx - 1].key);
                            }}
                            className="p-1 rounded-lg bg-[#161c2b] hover:bg-[#1e2638] text-[#8b9bb4]"
                            title="المرحلة السابقة"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {stage.key !== 'WON' && stage.key !== 'LOST' && (
                          <button
                            onClick={() => {
                              const currIdx = STAGES.findIndex((s) => s.key === stage.key);
                              if (currIdx < STAGES.length - 1) handleStageChange(lead.id, STAGES[currIdx + 1].key);
                            }}
                            className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                            title="المرحلة التالية"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-sm font-bold text-[#f1f5f9]">إضافة عميل جديد للمسار</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">اسم العميل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">المصدر / البيزنس بورتفوليو</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                >
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">رقم الهاتف (واتساب)</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">قيمة الطلب المتوقعة</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                    >
                      <option value="EGP">EGP</option>
                      <option value="SAR">SAR</option>
                      <option value="AED">AED</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">ملاحظات الطلب والمنتج</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] resize-none"
                  placeholder="تفاصيل المنتج المطلوب أو مواعيد الاتصال..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
