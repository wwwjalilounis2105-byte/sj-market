# Souqna Backend — واجهة برمجية (API) خلفية للمتجر

Backend حقيقي مبني بـ Node.js + Express + SQLite، يخدم:
- المتجر (`souqna-store.jsx`)
- صفحة الهبوط (`souqna-landing.jsx`)
- لوحة تحكم التاجر (`souqna-dashboard.jsx`)

## 1) التشغيل محليًا

```bash
cd backend
npm install
cp .env.example .env
```

افتح ملف `.env` وبدّل `ADMIN_API_KEY` بمفتاح سري خاص بك (أي نص عشوائي طويل).

```bash
npm run seed     # تعبئة قاعدة البيانات بمنتجات ابتدائية (مرة واحدة فقط)
npm start        # تشغيل السيرفر على http://localhost:3000
```

## 2) نقاط الوصول (Endpoints)

| Method | المسار | الوصول | الوصف |
|---|---|---|---|
| GET | `/api/products` | عام | كل المنتجات |
| GET | `/api/products/:id` | عام | منتج واحد |
| POST | `/api/products` | 🔒 إدارة | إضافة منتج |
| PATCH | `/api/products/:id` | 🔒 إدارة | تعديل سعر/مخزون/اسم |
| DELETE | `/api/products/:id` | 🔒 إدارة | حذف منتج |
| POST | `/api/orders` | عام | إنشاء طلب (من المتجر أو صفحة الهبوط) |
| GET | `/api/orders` | 🔒 إدارة | كل الطلبات (فلترة اختيارية `?status=pending`) |
| PATCH | `/api/orders/:id` | 🔒 إدارة | تغيير حالة الطلب |
| GET | `/api/stats/overview` | 🔒 إدارة | إحصائيات لوحة التحكم |

🔒 المسارات المحمية تحتاج ترويسة (header): `x-api-key: <ADMIN_API_KEY>`

## 3) مثال إنشاء طلب (يُستخدم من المتجر/صفحة الهبوط)

```js
await fetch("https://your-backend-url.com/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "محمد بلعيد",
    phone: "0555123456",
    wilaya: "الجزائر",
    commune: "باب الزوار",
    address: "شارع تجريبي",
    deliveryType: "home",
    items: [{ productId: 8, name: "عطر رجالي فرنسي", qty: 1, price: 5400 }],
    subtotal: 5400,
    deliveryFee: 400,
    total: 5800,
    source: "landing", // أو "store"
  }),
});
```

## 4) النشر (Deployment)

أبسط طريقة مجانية للانطلاق:

**Render.com** (موصى به للمبتدئين):
1. ارفع مجلد `backend` إلى مستودع GitHub.
2. من Render: New ← Web Service ← اربط المستودع.
3. Build Command: `npm install` — Start Command: `npm start`.
4. في Environment Variables أضف `ADMIN_API_KEY` بقيمتك السرية.
5. بعد النشر، فعّل الأمر التالي مرة واحدة عبر Render Shell: `npm run seed`.
6. انسخ الرابط الذي يعطيك إياه Render (مثل `https://souqna-backend.onrender.com`).

**ملاحظة عن SQLite:** قاعدة البيانات ملف واحد (`souqna.db`) — بسيطة ومناسبة جدًا للانطلاق، لكن على منصات مثل Render (الخطة المجانية) الملفات قد تُمسح عند إعادة التشغيل. إذا كبر مشروعك، الأفضل الانتقال لقاعدة بيانات مُدارة مثل PostgreSQL (Render وRailway يوفرونها مجانًا كخطوة تالية).

## 5) ربط الملفات الحالية بالـ backend

بعد نشر الـ backend والحصول على رابطه:

- **في `souqna-store.jsx`**: استبدل `sendOrderToSheet(...)` (أو أضف بجانبها) نداء `fetch` إلى `POST /api/orders` بدل التخزين المحلي فقط.
- **في `souqna-landing.jsx`**: نفس الشيء — استبدل الحفظ المحلي بنداء حقيقي لـ `POST /api/orders`.
- **في `souqna-dashboard.jsx`**: استبدل `window.storage` بنداءات `fetch` إلى `/api/products`, `/api/orders`, `/api/stats/overview` مع إرسال ترويسة `x-api-key`.

قل لي متى تحب نعدّل هذي الملفات الثلاثة فعليًا لتتصل بالرابط الحقيقي لسيرفرك، ونهيّئها للنشر أونلاين.

## 6) هيكل المشروع

```
backend/
├── package.json
├── .env.example
├── server.js       # نقطة الدخول
├── db.js            # إعداد قاعدة البيانات SQLite
├── seed.js           # تعبئة أولية بمنتجات تجريبية
├── auth.js           # حماية مسارات الإدارة بمفتاح API
├── routes.products.js
├── routes.orders.js
└── routes.stats.js
```
