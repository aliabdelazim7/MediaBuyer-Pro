'use client';

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  Video, 
  MessageSquare, 
  Check, 
  Copy, 
  RefreshCw, 
  Send, 
  Lightbulb, 
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { AdvisoryDiagnosis, ViralHook, UGCScriptScene, UnitEconomicsOutput } from '@/domain/services/MarketingAdvisorEngine';

export default function AdvisorPage() {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'CREATIVE' | 'CHAT'>('AUDIT');
  const [diagnosis, setDiagnosis] = useState<AdvisoryDiagnosis | null>(null);
  const [economics, setEconomics] = useState<UnitEconomicsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  // Unit Economics Form
  const [sellingPrice, setSellingPrice] = useState('500');
  const [productCost, setProductCost] = useState('200');
  const [shipping, setShipping] = useState('50');
  const [packaging, setPackaging] = useState('25');
  const [returnRate, setReturnRate] = useState('10');
  const [calculatingEcon, setCalculatingEcon] = useState(false);

  // Creative Generator Form
  const [productName, setProductName] = useState('حذاء طبي مريح مقاوم للماء');
  const [mainBenefit, setMainBenefit] = useState('راحة تامة لأسفل الظهر أثناء الوقوف الطويل مع خامة طبية');
  const [painPoint, setPainPoint] = useState('ألم الكعب والركبة والتعب بعد يوم شغل طويل');
  const [targetMarket, setTargetMarket] = useState<'EGYPT' | 'SAUDI'>('EGYPT');
  const [generatedHooks, setGeneratedHooks] = useState<ViralHook[]>([]);
  const [generatedScript, setGeneratedScript] = useState<UGCScriptScene[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Chat Form & Multi-turn History
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'USER' | 'CMO'; text: string }>>([
    {
      sender: 'CMO',
      text: 'أهلاً بك يا علي! أنا مستشارك التسويقي ومدير النمو (AI CMO). حملاتك وأرقامك مربوطة ومحللة قدامي بالكامل. اسألني عن أي حاجة: استراتيجيات التوسيع (Scaling)، تخفيض الـ CPA، كتابة إعلانات تكسر الدنيا، أو تسعير المنتجات في مصر والخليج.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const quickQuestions = [
    'ايه رأيك في الكامبينز اللي شغالة؟',
    'بس مش عجباني النتايج وحاسس الفلوس بتضيع',
    'عايز أكبر وأزود الميزانية أعمل إيه؟',
    'إزاي أبدأ أبيع وأتوسع في السعودية؟',
    'اقترحلي 3 زوايا إعلانية وهوكات جديدة',
    'الـ CPA عندي عالي إيه أسبابه وعلاجه؟',
  ];

  const fetchAdvisorData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/advisor');
      const data = await res.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
        setEconomics(data.economics);
        setGeneratedHooks(data.sampleHooks || []);
        setGeneratedScript(data.sampleScript || []);
      }
    } catch (err) {
      console.error('Error fetching advisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  const handleRecalculateEconomics = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculatingEcon(true);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitEconomics: {
            sellingPrice: parseFloat(sellingPrice) || 500,
            productCost: parseFloat(productCost) || 200,
            shippingAndFulfillment: parseFloat(shipping) || 0,
            packagingAndConfirmation: parseFloat(packaging) || 0,
            returnRatePercent: parseFloat(returnRate) || 0,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEconomics(data.economics);
        setDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error('Error recalculating economics:', err);
    } finally {
      setCalculatingEcon(false);
    }
  };

  const handleGenerateCreatives = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSaudi = targetMarket === 'SAUDI';
    setGeneratedHooks([
      {
        hookType: 'خطاف كسر التصفح والصدمة (Scroll Stopper)',
        hookText: isSaudi
          ? `وقف تصفح ثانية.. لو تدور على ${productName} عشان ${mainBenefit}، انتبه تدفع ضعف السعر بدون ما تفحص هذا الشيء!`
          : `وقف سكرول ثانية! لو بتدور على ${productName} عشان ${mainBenefit}.. متشتريش من أي مكان غير لما تشوف الفيديو ده!`,
        angle: 'SHOCK_PATTERN',
        visualCue: 'حركة يد سريعة توقف الشاشة مع صوت صفارة فرامل وتأثير زووم حاد.',
      },
      {
        hookType: 'خطاف لمس الألم والمشكلة (Problem-Agitation)',
        hookText: isSaudi
          ? `تعبت من ${painPoint} وما لقيت حل حقيقي؟ شوف كيف حليت المشكلة في 3 ثواني مع ${productName}!`
          : `لو زهقت من ${painPoint} وعايز حل نهائي يريح بالك، الـ ${productName} ده معمول مخصوص عشانك!`,
        angle: 'PAIN_RELIEF',
        visualCue: 'تعبير وجه يظهر الضيق من المعاناة ثم الانتقال للراحة الفورية بعد الاستخدام.',
      },
      {
        hookType: 'خطاف السر والفضول (Curiosity Gap)',
        hookText: isSaudi
          ? `السالفة باختصار.. هذا هو السر اللي مخلّي ${productName} الأكثر طلباً في السعودية هذا الأسبوع!`
          : `السر اللي معظم الصفحات مخبياه عن ${productName}.. وليه هو تريند في مصر اليومين دول؟`,
        angle: 'CURIOSITY',
        visualCue: 'فتح كرتونة المنتج (Unboxing) مع إضاءة سينمائية وموسيقى تشويقية.',
      },
      {
        hookType: 'خطاف مقارنة القيمة والتوفير (Price-to-Value Anchor)',
        hookText: isSaudi
          ? `بدل ما تخسر مبالغ في حلول مؤقتة.. ${productName} يوفر عليك أكثر من 50% ويعطيك ${mainBenefit} بجودة تدوم!`
          : `بدل ما تدفع مبالغ خيالية في منتجات تانية.. وفر نص فلوسك وخد ${mainBenefit} مع ${productName}!`,
        angle: 'PRICE_VALUE',
        visualCue: 'إمساك المنتج وعرض تفاصيل الخامة والجودة العالية عن قرب مع نص سعر العرض.',
      },
    ]);
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || chatLoading) return;

    const newHistory = [...chatMessages, { sender: 'USER' as const, text: queryText }];
    setChatMessages(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          history: newHistory,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setChatMessages((prev) => [...prev, { sender: 'CMO', text: data.answer }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'CMO', text: 'حدث خطأ في الاتصال، حاول مرة أخرى.' },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'CMO', text: 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(chatInput);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>غرفة الاستراتيجية والنمو الذكي (AI CMO & Creative Lab)</span>
          </h1>
          <p className="text-xs text-[#8b9bb4] mt-0.5">
            تحليل الأرقام والوحدة الاقتصادية، كشف نزيف الميزانية، وتوليد سكريبتات وخطافات فيروسية (Viral Hooks) لأسواق مصر والخليج
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#111622] p-1 rounded-2xl border border-[#1e2638] text-xs">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'AUDIT'
                ? 'bg-[#1e293b] text-blue-400 font-bold shadow-sm'
                : 'text-[#8b9bb4] hover:text-[#f1f5f9]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>التشخيص والحسابات المالية</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATIVE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'CREATIVE'
                ? 'bg-[#1e293b] text-amber-400 font-bold shadow-sm'
                : 'text-[#8b9bb4] hover:text-[#f1f5f9]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>مختبر الكرييتف والـ Hooks</span>
          </button>

          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition ${
              activeTab === 'CHAT'
                ? 'bg-[#1e293b] text-purple-400 font-bold shadow-sm'
                : 'text-[#8b9bb4] hover:text-[#f1f5f9]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>استشارة فورية مع الـ CMO</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT & UNIT ECONOMICS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Unit Economics Calculator */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[#f1f5f9]">حاسبة الوحدة الاقتصادية ونقطة التعادل (Unit Economics & Break-even ROAS)</h3>
              </div>
              <span className="text-[11px] text-[#8b9bb4]">أدخل بيانات منتجك لحساب سقف الـ CPA والـ ROAS الحقيقي</span>
            </div>

            <form onSubmit={handleRecalculateEconomics} className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">سعر البيع للعميل ($ أو ج.م)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">تكلفة المنتج (COGS)</label>
                <input
                  type="number"
                  value={productCost}
                  onChange={(e) => setProductCost(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">الشحن والتوصيل</label>
                <input
                  type="number"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">التغليف وتأكيد الأوردر</label>
                <input
                  type="number"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">نسبة المرتجعات COD (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={calculatingEcon}
                    className="px-3 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs shrink-0"
                  >
                    حساب
                  </button>
                </div>
              </div>
            </form>

            {/* Economics Output Banner */}
            {economics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1e2638]">
                <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[10px] text-[#8b9bb4]">نقطة التعادل (Break-even ROAS):</span>
                  <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{economics.breakEvenRoas}x</p>
                  <span className="text-[10px] text-[#64748b]">أي ROAS أقل من ده يعني خسارة صافية</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[10px] text-[#8b9bb4]">الحد الأقصى للـ CPA المسموح:</span>
                  <p className="text-base font-bold text-rose-400 font-mono mt-0.5">${economics.maxAllowableCpa}</p>
                  <span className="text-[10px] text-[#64748b]">صافي الربح قبل الإعلانات</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[10px] text-[#8b9bb4]">الـ Target CPA المستهدف:</span>
                  <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">${economics.targetCpa}</p>
                  <span className="text-[10px] text-[#64748b]">لتحقيق 35% صافي أرباح في جيبك</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638]">
                  <span className="text-[10px] text-[#8b9bb4]">الميزانية اليومية المقترحة للـ Ad Set:</span>
                  <p className="text-base font-bold text-blue-400 font-mono mt-0.5">${economics.recommendedBudgetPerAdSet}</p>
                  <span className="text-[10px] text-[#64748b]">للخروج السريع من Learning Phase</span>
                </div>
              </div>
            )}
          </div>

          {/* Live Diagnostic Cards */}
          {diagnosis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Scaling Opportunities */}
              <div className="p-5 rounded-2xl bg-[#111622] border border-[#1e2638] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e2638] pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>حملات مؤهلة للـ Scaling ومضاعفة الميزانية</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {diagnosis.scalingOpportunities.length} حملة
                  </span>
                </div>

                {diagnosis.scalingOpportunities.length === 0 ? (
                  <p className="text-[#64748b] py-4 text-center">لا توجد حملات جاهزة للـ Scaling حالياً.</p>
                ) : (
                  <div className="space-y-2.5">
                    {diagnosis.scalingOpportunities.map((op, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#f1f5f9]">{op.campaignName}</h4>
                          <span className="text-emerald-400 font-bold text-[10px]">+{op.suggestedBudgetIncreasePercent}% ميزانية</span>
                        </div>
                        <p className="text-[#8b9bb4]">{op.reason}</p>
                        <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-300 text-[11px] border border-emerald-500/15">
                          💡 <b>خطة العمل:</b> {op.action}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Critical Bleeders */}
              <div className="p-5 rounded-2xl bg-[#111622] border border-[#1e2638] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e2638] pb-2.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>حملات تستنزف ميزانية (Kill-Switch Recommended)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {diagnosis.criticalAlerts.length} حملة
                  </span>
                </div>

                {diagnosis.criticalAlerts.length === 0 ? (
                  <p className="text-[#64748b] py-4 text-center">ممتاز! لا توجد حملات خاسرة خارج حدود الأمان.</p>
                ) : (
                  <div className="space-y-2.5">
                    {diagnosis.criticalAlerts.map((al, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#f1f5f9]">{al.campaignName}</h4>
                          <span className="text-rose-400 font-bold text-[10px]">CPA مرتفع {al.cpaVsTargetRatio}x</span>
                        </div>
                        <p className="text-[#8b9bb4]">{al.reason}</p>
                        <div className="p-2 rounded-lg bg-rose-500/5 text-rose-300 text-[11px] border border-rose-500/15">
                          🛑 <b>الإجراء المقترح:</b> {al.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tactical Recommendations List */}
          {diagnosis && (
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#1e2638] pb-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-[#f1f5f9]">توصيات الـ CMO التكتيكية لتطبيقها اليوم (Growth Playbook)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {diagnosis.cmoTacticalRecommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] text-[#cbd5e1] leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATIVE LAB & VIRAL HOOKS */}
      {activeTab === 'CREATIVE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Form to generate hooks */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e2638] pb-3">
              <Video className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-[#f1f5f9]">مولد الخطافات الإعلانية الفيروسية وسيناريوهات الفيديو (Viral Video Lab)</h3>
            </div>

            <form onSubmit={handleGenerateCreatives} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">اسم المنتج أو الخدمة</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">الميزة الأساسية / القيمة (Main Benefit)</label>
                <input
                  type="text"
                  required
                  value={mainBenefit}
                  onChange={(e) => setMainBenefit(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">نقطة الألم والمعاناة (Pain Point)</label>
                <input
                  type="text"
                  required
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                />
              </div>

              <div>
                <label className="block text-[#cbd5e1] font-medium mb-1">السوق واللهجة المستهدفة</label>
                <div className="flex gap-2">
                  <select
                    value={targetMarket}
                    onChange={(e: any) => setTargetMarket(e.target.value)}
                    className="w-full p-2 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-[#f1f5f9]"
                  >
                    <option value="EGYPT">🇪🇬 مصر (عامية شوارع ذكية)</option>
                    <option value="SAUDI">🇸🇦 السعودية والخليج (لهجة أصيلة)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs shrink-0"
                  >
                    توليد
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Generated Hooks Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#8b9bb4] uppercase tracking-wider">
              5 خطافات إعلانية جاهزة لاختبارها في إعلاناتك (Scroll-Stoppers & Curiosity Gaps):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#111622] border border-[#1e2638] hover:border-[#2b364e] transition space-y-2.5 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#1e2638] pb-2">
                    <span className="font-bold text-amber-400 text-[11px]">{hook.hookType}</span>
                    <button
                      onClick={() => copyText(hook.hookText, `hook-${idx}`)}
                      className="flex items-center gap-1 text-[11px] text-[#8b9bb4] hover:text-white"
                    >
                      {copiedIndex === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === `hook-${idx}` ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#1e2638] text-[#f1f5f9] leading-relaxed font-semibold">
                    &ldquo;{hook.hookText}&rdquo;
                  </div>

                  <div className="text-[11px] text-[#8b9bb4] flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">🎬 اللقطة البصرية:</span>
                    <span>{hook.visualCue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Column UGC Script Table */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#f1f5f9]">سيناريو فيديو UGC متكامل جاهز للتصوير (3-Column Production Brief)</h4>
                <p className="text-xs text-[#8b9bb4]">مبني على هيكل (Hook - Problem - Agitation - Solution - CTA) بدون أي ركاكة روبوتية</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0b0e14] border-b border-[#1e2638] text-[#8b9bb4] font-semibold">
                    <th className="py-2.5 px-4 w-28">التوقيت</th>
                    <th className="py-2.5 px-4 w-1/3">اللقطة البصرية (Visual Cue)</th>
                    <th className="py-2.5 px-4">الكلام المنطوق باللهجة الحية (Audio)</th>
                    <th className="py-2.5 px-4">المؤثرات والنصوص على الشاشة (SFX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2130]">
                  {generatedScript.map((scene, i) => (
                    <tr key={i} className="hover:bg-[#161c2b] transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">{scene.timing}</td>
                      <td className="py-3 px-4 text-[#cbd5e1]">{scene.visual}</td>
                      <td className="py-3 px-4 text-[#f1f5f9] font-medium leading-relaxed">{scene.spokenAudio}</td>
                      <td className="py-3 px-4 text-[#8b9bb4] font-mono text-[11px]">{scene.onScreenTextAndSfx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE INTERACTIVE CMO CHAT */}
      {activeTab === 'CHAT' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                CMO
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f1f5f9]">المحادثة الاستشارية المباشرة مع مدير النمو (AI CMO Consultant)</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  متصل ومربوط بحملاتك وقاعدة البيانات
                </span>
              </div>
            </div>
          </div>

          {/* Quick Suggestions Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
            <span className="text-[10px] text-[#64748b] font-semibold shrink-0">أسئلة سريعة:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(q)}
                className="px-2.5 py-1 rounded-lg bg-[#0b0e14] hover:bg-[#161c2b] border border-[#1e2638] text-[11px] text-[#8b9bb4] hover:text-[#f1f5f9] whitespace-nowrap transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'CMO' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0 text-[10px]">
                    CMO
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-xl whitespace-pre-line ${
                    msg.sender === 'USER'
                      ? 'bg-[#1d4ed8] text-white rounded-tl-none font-medium shadow-sm'
                      : 'bg-[#0b0e14] border border-[#1e2638] text-[#e2e8f0] rounded-tr-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-[#8b9bb4] p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>الـ CMO يحلل أرقام حملاتك ويكتب التوصية الدقيقة...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-[#1e2638] shrink-0">
            <input
              type="text"
              placeholder="اسألني أي شيء.. مثال: إزاي أزود مبيعات الـ E-Commerce في السعودية؟ أو حملتي الـ CPA فيها عالي إيه الحل؟"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-3 bg-[#0b0e14] border border-[#1e2638] rounded-xl text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-blue-500/60"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-bold text-xs disabled:opacity-50 transition active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
