# MediaBuyer Pro CRM — Laravel 11 Edition

منظومة إدارة الإعلانات المتقدمة والـ Social CRM مبنية بالكامل على **PHP 8.3 / Laravel 11** بمعمارية نظيفة (Clean Architecture / Service Layer).

---

## 🚀 متطلبات التشغيل السريع (Prerequisites):
- PHP >= 8.2 (مع الإضافات: `pdo`, `sqlite` أو `pdo_mysql`, `curl`, `mbstring`)
- Composer >= 2.0

---

## 🛠️ خطوات التثبيت والتشغيل المحلي (Setup Guide):

### 1. تثبيت الحزم والتبعيات:
```bash
cd laravel
composer install
```

### 2. إعداد ملف البيئة والمفتاح:
```bash
cp .env.example .env
php artisan key:generate
```

### 3. تشغيل الـ Migrations:
```bash
# لإنشاء الجداول في قاعدة بيانات SQLite أو MySQL
php artisan migrate
```

### 4. تشغيل السيرفر المحلي:
```bash
php artisan serve
```
افتح المتصفح على: **`http://localhost:8000`**

---

## ⚡ أوامر الـ Artisan المتاحة (CLI Commands):

- **مزامنة الحملات من فيسبوك:**
  ```bash
  php artisan campaigns:sync --datePreset=maximum
  ```
- **فحص وتطبيق قواعد الأمان وقاطع النزيف:**
  ```bash
  php artisan rules:evaluate
  ```
- **تشغيل المهام المجدولة (Scheduler):**
  ```bash
  php artisan schedule:work
  ```

---

## 📂 هيكل المشروع (Project Structure):

- **`app/Models/`**: نماذج Eloquent لجميع الجداول (حسابات، بورتفوليو، حملات، شاتات، عملاء).
- **`app/Services/Meta/`**: خدمة الربط المباشر مع **Meta Graph API v21.0** وتعديل ميزانيات الـ ABO والـ CBO.
- **`app/Services/Rules/`**: محرك تقييم قواعد الأمان وقواطع النزيف التلقائية.
- **`app/Services/AI/`**: محركات الذكاء الاصطناعي للهجات المصرية والخليجية ومختبر الـ CMO.
- **`app/Http/Controllers/`**: متحكمات الـ Web والـ API لجميع العمليات.
- **`resources/views/`**: واجهات Blade التفاعلية مع **Tailwind CSS** و **Alpine.js**.
- **`routes/web.php` & `routes/api.php`**: مسارات الـ Web والـ REST API.
