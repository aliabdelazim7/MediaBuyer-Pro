'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Bell,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Building2
} from 'lucide-react';

interface RuleItem {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  targetType: string;
  metric: string;
  operator: string;
  threshold: number;
  minSpendCondition?: number;
  action: string;
  actionParam?: number;
  notifyTelegram: boolean;
  lastTriggeredAt?: string;
  logs?: Array<{
    id: string;
    targetName: string;
    actionTaken: string;
    reason: string;
    createdAt: string;
  }>;
}

export default function RulesPage() {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [runningRules, setRunningRules] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formMetric, setFormMetric] = useState('CPA');
  const [formOperator, setFormOperator] = useState('GREATER_THAN');
  const [formThreshold, setFormThreshold] = useState('30');
  const [formMinSpend, setFormMinSpend] = useState('40');
  const [formAction, setFormAction] = useState('PAUSE');
  const [formActionParam, setFormActionParam] = useState('20');
  const [formNotifyTelegram, setFormNotifyTelegram] = useState(true);

  // Pre-built rule templates
  const ruleTemplates = [
    {
      title: '🛑 قاطع النزيف (High CPA Kill Switch)',
      desc: 'إيقاف أي إعلان فوراً إذا تخطى سعر التحويل 35$ بعد صرف 40$',
      metric: 'CPA',
      operator: 'GREATER_THAN',
      threshold: '35',
      minSpend: '40',
      action: 'PAUSE',
      param: '0',
    },
    {
      title: '🚀 توسيع الرابحين (Auto-Scale +20%)',
      desc: 'رفع الميزانية اليومية بنسبة 20% للإعلانات ذات العائد العالي ROAS >= 3.0x',
      metric: 'ROAS',
      operator: 'GREATER_THAN_OR_EQUAL',
      threshold: '3.0',
      minSpend: '30',
      action: 'BOOST_BUDGET',
      param: '20',
    },
    {
      title: '📉 كاشف الإجهاد الإعلاني (Ad Fatigue)',
      desc: 'إرسال تنبيه عاجل للموبايل عند هبوط معدل النقر CTR عن 1.2% لتغيير الكرييتف',
      metric: 'CTR',
      operator: 'LESS_THAN',
      threshold: '1.2',
      minSpend: '20',
      action: 'SEND_ALERT',
      param: '0',
    },
  ];

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rules');
      const data = await res.json();
      if (data.success) {
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isEnabled: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه القاعدة؟')) return;
    try {
      const res = await fetch(`/api/rules?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleApplyTemplate = (tmpl: any) => {
    setFormName(tmpl.title);
    setFormMetric(tmpl.metric);
    setFormOperator(tmpl.operator);
    setFormThreshold(tmpl.threshold);
    setFormMinSpend(tmpl.minSpend);
    setFormAction(tmpl.action);
    setFormActionParam(tmpl.param);
    setShowCreateModal(true);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          metric: formMetric,
          operator: formOperator,
          threshold: formThreshold,
          minSpendCondition: formMinSpend,
          action: formAction,
          actionParam: formActionParam,
          notifyTelegram: formNotifyTelegram,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormName('');
        fetchRules();
        setFeedback('✅ تم إنشاء وحفظ قاعدة الأمان بنجاح!');
      }
    } catch (err) {
      console.error('Failed to create rule:', err);
    }
  };

  const handleRunEvaluation = async () => {
    setRunningRules(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/rules/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const count = data.result?.triggeredCount || 0;
        setFeedback(
          count > 0
            ? `⚡ تم فحص كافة البورتفوليو وتطبيق ${count} إجراءات أمان وإرسال تنبيه التليجرام!`
            : '✅ تم الفحص: جميع الحملات في كافة البيزنس بورتفوليو تعمل ضمن الحدود الآمنة.'
        );
        fetchRules();
      }
    } catch (err) {
      setFeedback('حدث خطأ أثناء تنفيذ القواعد');
    } finally {
      setRunningRules(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Evaluation Controls */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#f1f5f9] tracking-tight">
              محرك قواعد الأمان وقاطع النزيف (Auto-Pilot & Kill Switches)
            </h1>
          </div>
          <p className="text-xs text-[#8b9bb4]">
            حماية الميزانية تلقائياً: إيقاف الإعلانات الخاسرة، رفع ميزانية الحملات الرابحة، وإشعارات تليجرام فورية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunEvaluation}
            disabled={runningRules}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161c2b] hover:bg-[#1e2638] text-amber-300 border border-amber-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningRules ? 'animate-spin' : ''}`} />
            <span>{runningRules ? 'جاري الفحص الحي...' : 'فحص وتطبيق القواعد الآن'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>قاعدة جديدة</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
        </div>
      )}

      {/* 2. Quick Media Buyer Ready Templates */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#8b9bb4] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>قوالب أمان ميديا باير جاهزة للتفعيل بنقرة واحدة (Battle-Tested Templates):</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ruleTemplates.map((tmpl, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-blue-500/40 transition cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#f1f5f9] group-hover:text-blue-400 transition">
                  {tmpl.title}
                </span>
                <span className="p-1 rounded-lg bg-[#0b0e14] text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Plus className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-[#8b9bb4] leading-relaxed">{tmpl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => {
          const isPauseAction = rule.action === 'PAUSE';
          const isBoostAction = rule.action === 'BOOST_BUDGET';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.isEnabled
                  ? 'bg-[#111622] border-[#1e2638] hover:border-[#2b364e]'
                  : 'bg-[#0e121b] border-[#1a2130] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#f1f5f9] leading-snug">{rule.name}</h3>
                  </div>
                  {rule.description && (
                    <p className="text-[11px] text-[#8b9bb4] line-clamp-2">{rule.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleToggleRule(rule.id, rule.isEnabled)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition duration-300 cursor-pointer shrink-0 ${
                    rule.isEnabled ? 'bg-emerald-600 justify-end' : 'bg-[#1e2638] justify-start'
                  }`}
                  title={rule.isEnabled ? 'مفعلة' : 'معطلة'}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>
              </div>

              {/* Conditions Box */}
              <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] space-y-1.5 text-xs font-mono mb-4">
                <div className="flex items-center justify-between text-[#cbd5e1]">
                  <span className="text-[#64748b]">الشرط:</span>
                  <span className="font-bold text-blue-400">
                    {rule.metric} {rule.operator === 'GREATER_THAN' ? '>' : rule.operator === 'LESS_THAN' ? '<' : '>='} {rule.threshold}
                  </span>
                </div>
                {rule.minSpendCondition ? (
                  <div className="flex items-center justify-between text-[#cbd5e1]">
                    <span className="text-[#64748b]">الحد الأدنى للصرف:</span>
                    <span className="text-amber-400 font-mono">${rule.minSpendCondition}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-[#cbd5e1]">
                  <span className="text-[#64748b]">الإجراء:</span>
                  <span className={`font-semibold ${isPauseAction ? 'text-rose-400' : isBoostAction ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {isPauseAction ? '🛑 إيقاف الحملة' : isBoostAction ? `🚀 زيادة الميزانية (+${rule.actionParam}%)` : '⚠️ إرسال تنبيه'}
                  </span>
                </div>
              </div>

              {/* Bottom Actions & Last Trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1e2638] text-[11px] text-[#64748b]">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>{rule.notifyTelegram ? 'إشعار تليجرام فوري' : 'بدون إشعار'}</span>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-[#64748b] hover:text-rose-400 p-1 transition"
                  title="حذف القاعدة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modal: Create New Rule */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#111622] border border-[#1e2638] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-sm font-bold text-[#f1f5f9]">إنشاء قاعدة أمان وتحكم جديدة</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748b] hover:text-[#f1f5f9]">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">اسم القاعدة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إيقاف الإعلان لو الـ CPA تخطى 30 دولار"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">المؤشر (Metric)</label>
                  <select
                    value={formMetric}
                    onChange={(e) => setFormMetric(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  >
                    <option value="CPA">CPA (تكلفة التحويل)</option>
                    <option value="ROAS">ROAS (العائد على الصرف)</option>
                    <option value="SPEND">Spend (إجمالي الصرف)</option>
                    <option value="CTR">CTR (نسبة النقر)</option>
                    <option value="CPM">CPM (تكلفة الألف ظهور)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">المعامل (Operator)</label>
                  <select
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  >
                    <option value="GREATER_THAN">أكبر من (&gt;)</option>
                    <option value="LESS_THAN">أقل من (&lt;)</option>
                    <option value="GREATER_THAN_OR_EQUAL">أكبر من أو يساوي (&gt;=)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">القيمة المستهدفة</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">الحد الأدنى للصرف قبل الفحص ($)</label>
                  <input
                    type="number"
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(e.target.value)}
                    placeholder="مثال: 30"
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">الإجراء المطلوب (Action)</label>
                  <select
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  >
                    <option value="PAUSE">🛑 إيقاف الحملة (Kill Switch)</option>
                    <option value="BOOST_BUDGET">🚀 زيادة الميزانية (+%)</option>
                    <option value="DECREASE_BUDGET">📉 تخفيض الميزانية (-%)</option>
                    <option value="SEND_ALERT">⚠️ إرسال تنبيه فقط</option>
                  </select>
                </div>
              </div>

              {(formAction === 'BOOST_BUDGET' || formAction === 'DECREASE_BUDGET') && (
                <div>
                  <label className="block text-[#cbd5e1] font-medium mb-1">نسبة التعديل في الميزانية (%)</label>
                  <input
                    type="number"
                    value={formActionParam}
                    onChange={(e) => setFormActionParam(e.target.value)}
                    placeholder="20"
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] focus:outline-none focus:border-blue-500/60"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="telegramCheck"
                  checked={formNotifyTelegram}
                  onChange={(e) => setFormNotifyTelegram(e.target.checked)}
                  className="rounded bg-[#0b0e14] border-[#1e2638] text-blue-600 focus:ring-0"
                />
                <label htmlFor="telegramCheck" className="text-[#cbd5e1] font-medium cursor-pointer">
                  إرسال إشعار فوري إلى بوت التليجرام عند التنفيذ
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#161c2b] text-[#94a3b8] hover:text-[#f1f5f9]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold"
                >
                  حفظ وتفعيل القاعدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
