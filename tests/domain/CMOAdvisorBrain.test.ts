import { describe, it, expect } from 'vitest';
import { CMOAdvisorBrain } from '../../src/domain/services/CMOAdvisorBrain';

describe('CMOAdvisorBrain Multi-turn & Data-Driven Intelligence', () => {
  const brain = new CMOAdvisorBrain();

  const mockCampaigns = [
    {
      id: 'c1',
      name: '🔥 Mega Flash Sale - Conversions (Egypt)',
      status: 'ACTIVE',
      spend: 115.4,
      conversions: 18,
      cpa: 6.41,
      roas: 3.99,
      ctr: 2.93,
      cpm: 2.38,
      dailyBudget: 120,
    },
    {
      id: 'c2',
      name: '⚠️ High CPA Warning - Retargeting DPA',
      status: 'ACTIVE',
      spend: 72.8,
      conversions: 2,
      cpa: 36.4,
      roas: 0.74,
      ctr: 1.7,
      cpm: 4.0,
      dailyBudget: 75,
    },
  ];

  it('should analyze live campaigns specifically by name and metrics in general evaluation', () => {
    const response = brain.generateResponse({
      userMessage: 'ايه رأيك في الكامبينز اللي شغالة؟',
      history: [],
      campaigns: mockCampaigns,
      portfolioName: 'Egyptian Brands & Apparel',
    });

    expect(response).toContain('Mega Flash Sale');
    expect(response).toContain('High CPA Warning');
    expect(response).toContain('3.99');
    expect(response).toContain('36.4');
  });

  it('should handle multi-turn follow-up expressing dissatisfaction with specific tactical remedies', () => {
    const response = brain.generateResponse({
      userMessage: 'بس مش عجباني النتايج وشايف الصرف رايح ع الفاضي',
      history: [
        { sender: 'USER', text: 'ايه رأيك في الكامبينز اللي شغالة؟' },
        { sender: 'CMO', text: 'الأداء العام متوسط وفيه حملات رابحة وحملات خاسرة...' },
      ],
      campaigns: mockCampaigns,
      portfolioName: 'Egyptian Brands & Apparel',
    });

    expect(response).not.toBe(brain.generateResponse({ userMessage: 'ايه رأيك في الكامبينز اللي شغالة؟', history: [], campaigns: mockCampaigns }));
    expect(response).toContain('High CPA');
    expect(response).toContain('إيقاف');
  });

  it('should give market-specific guidance when asked about Saudi Arabia / GCC expansion', () => {
    const response = brain.generateResponse({
      userMessage: 'عايز أبدأ أبيع في السعودية.. إيه الخطة والميزانية وطريقة الدفع؟',
      history: [],
      campaigns: mockCampaigns,
      portfolioName: 'GCC Scaling',
    });

    expect(response).toContain('السعودية');
    expect(response).toContain('UGC');
    expect(response).toContain('مدى');
  });

  it('should give detailed creative video hooks when asked for ad content ideas', () => {
    const response = brain.generateResponse({
      userMessage: 'اقترحلي أفكار إعلانات وفيديوهات جديدة تكسر الدنيا',
      history: [],
      campaigns: mockCampaigns,
      portfolioName: 'Egyptian Brands',
    });

    expect(response).toContain('Hook');
    expect(response).toContain('ثواني');
  });
});
