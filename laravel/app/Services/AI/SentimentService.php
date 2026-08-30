<?php

namespace App\Services\AI;

class SentimentService
{
    /**
     * Classifies Arabic text sentiment and intent (Price inquiry, negative, positive, spam)
     */
    public function classify(string $text): array
    {
        $normalized = mb_strtolower(trim($text));

        $priceKeywords = [
            'بكام', 'بكم', 'السعر', 'سعر', 'كام', 'التكلفة', 'تكلفة', 'اسعار', 'أسعار',
            'التفاصيل', 'تفاصيل', 'المقاس', 'مقاسات', 'عرض', 'عروض', 'خصم', 'الجملة',
            'شحن', 'توصيل', 'متاح', 'فين', 'عنوان', 'رقم', 'واتس', 'واتساب'
        ];

        $negativeKeywords = [
            'سيء', 'سيئة', 'وحش', 'زفت', 'نصابين', 'نصب', 'تأخير', 'اتأخر', 'خربان',
            'مكسور', 'تالف', 'خدمة سيئة', 'شكوى', 'مشكلة', 'حرام', 'غالي جدا', 'مقلد'
        ];

        $positiveKeywords = [
            'تحفة', 'ممتاز', 'ممتازة', 'روعة', 'جميل', 'ما شاء الله', 'شكرا', 'الله يبارك',
            'تسلم', 'عاش', 'شغل نظيف', 'فخم', 'راقي', 'أفضل'
        ];

        foreach ($negativeKeywords as $word) {
            if (str_contains($normalized, $word)) {
                return ['sentiment' => 'NEGATIVE', 'intent' => 'COMPLAINT'];
            }
        }

        foreach ($priceKeywords as $word) {
            if (str_contains($normalized, $word)) {
                return ['sentiment' => 'INQUIRY_PRICE', 'intent' => 'PRICE_INQUIRY'];
            }
        }

        foreach ($positiveKeywords as $word) {
            if (str_contains($normalized, $word)) {
                return ['sentiment' => 'POSITIVE', 'intent' => 'PRAISE'];
            }
        }

        return ['sentiment' => 'NEUTRAL', 'intent' => 'GENERAL'];
    }

    /**
     * Generates a conversion-focused smart response in authentic Egyptian or Gulf dialect
     */
    public function generateSmartReply(string $text, string $senderName, ?string $pageName = null): string
    {
        $classification = $this->classify($text);
        $name = explode(' ', $senderName)[0] ?? 'يا فندم';
        $page = $pageName ?? '';

        if ($classification['sentiment'] === 'NEGATIVE') {
            return "نعتذر لحضرتك جداً يا {$name} على أي إزعاج! 🙏 يرجى التواصل معنا في الرسائل الخاصة برقم هاتفك وفريق خدمة العملاء سيتواصل معك فوراً لحل المشكلة وتعويضك.";
        }

        if (str_contains($page, 'عاصمة الكون') || str_contains($page, 'الرياض') || str_contains($page, 'مكة')) {
            return "أهلاً بك يا {$name}! 🌟 يسعدنا خدمتك في مؤسسة عاصمة الكون للمصاعد. بخصوص استفسارك، نوفر أحدث الموديلات الإيطالية والهيدروليك بضمان شامل وصيانة مجانية. تفضل بتحديد المدينة ورقم جوالك لنرسل لك عرض السعر الفني فوراً 🚀";
        }

        if (str_contains($page, 'الهبا')) {
            return "أهلاً بك يا {$name}! 🌟 نورت شركة الهبا للبالة الخليجي. بضاعة السوبر كريم مفروزة على الفرازة والشكاير بتبدأ من 25 و 45 كيلو لأعلى جودة بأفضل سعر جملة في مصر. تحب أبعتلك قايمة الأسعار وكتالوج الشغل على الواتساب فوراً برقم تليفونك؟ 📦🔥";
        }

        if (str_contains($page, 'حنيجل')) {
            return "مساء الخير يا {$name}، نورت شركة حنيجل للكاميرات وأنظمة المراقبة! 📷 السيستم متاح حالياً بالضمان المعتمد وبأعلى دقة 5MP وعليه خصم خاص بمناسبة العرض. ابعتلنا رقم تليفونك واللوكيشن ومهندس التركيبات هيتواصل معاك فوراً لتحديد موعد المعاينة ⚡";
        }

        return "أهلاً بك يا {$name}! 🌟 شكراً لتواصلك معنا. طلبك متاح وفي خدمتك دايماً، ممكن رقم تليفونك ومندوب المبيعات سيتواصل معك فوراً بجميع التفاصيل وكود الخصم! 🚀";
    }
}
