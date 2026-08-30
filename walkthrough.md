# Multi-Portfolio Media Buyer Command Center & AI CMO Growth Lab

## 🌟 Executive Summary
A production-grade **Media Buyer Operations Command Center & AI CMO Growth Lab** engineered with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma ORM (SQLite), and Meta Graph API v21.0 integration.

---

## 🎯 Verified Features & Milestones

### 1. Live Multi-Portfolio & Meta Graph API Discovery
- Direct synchronization with live Meta Graph API using System User Access Tokens.
- Automatically discovers:
  - Meta User Profile (`Shahd Henagl`)
  - 8 Live Business Portfolios (`عاصمة الكون`, `حسن الحوت`, `الهبا للبالة`, `Pixelmind`, `الوزير`, `حنيجل للكاميرات`, `Bella Vida Homes`, `Codever`).
  - Ad Accounts & multi-currency support (`EGP`, `SAR`, `AED`, `USD`).
  - Active campaigns, ABO/CBO daily budgets, impressions, clicks, CTR, CPM, CPC, and exact conversion counts matching Meta Ads Manager Results.

### 2. Calibrated Conversion Matching & Date Presets
- Results alignment with Meta Ads Manager (`onsite_conversion.messaging_conversation_started_7d`, `purchases`, `leads`).
- Date Presets:
  - 📅 **اليوم (Today)**
  - 📅 **أمس (Yesterday)**
  - 📅 **آخر 7 أيام (Last 7 Days)**
  - 📅 **آخر 14 يوم (Last 14 Days)**
  - 📅 **آخر 30 يوم (Last 30 Days)**
  - 📅 **هذا الشهر (This Month)**
  - 📅 **كل الأوقات (Lifetime)**
- Dynamic KPI summary recalculation for the selected timeframe.

### 3. Campaign Deep Analytics & AdSets Inspection
- Interactive slide-over modal for each campaign displaying:
  - KPI breakdown & delivery objective
  - Underlying Ad Sets breakdown with individual budgets and performance
  - AI CMO Verdict & Scaling / Ad Fatigue recommendations
  - Instant toggle status & +20% budget scaling controls

### 4. AI CMO & Strategy Lab (`/advisor`)
- Interactive Unit Economics & Break-even ROAS calculator.
- 5-Angle Viral Hook & 3-Column UGC Video Script generator (Egyptian & Saudi dialects).
- Multi-turn conversational AI CMO consultant with memory and live database campaign awareness.

### 5. Automated Rules Engine & Telegram Alerts
- Background Kill Switch and Scaling triggers.
- Instant Telegram notifications on triggered rules or critical bleeder alerts.

---

## 🧪 Test Verification & Production Build
- **Unit & Integration Tests:** 22/22 tests passing (100% green across 6 test suites).
- **Test Database Isolation:** Dedicated `test.db` environment preventing collision with production `dev.db`.
- **Production Build:** `next build` compiled with 0 TypeScript/Turbopack errors.
