require("dotenv").config();

/**
 * حماية بسيطة لمسارات الإدارة عبر مفتاح API ثابت.
 * ملاحظة: هذا كافٍ لمرحلة الانطلاق، لكن للإنتاج الحقيقي
 * (خصوصًا لو صار عندك أكثر من مستخدم/تاجر) يُفضّل الانتقال
 * لنظام تسجيل دخول حقيقي (JWT أو Sessions).
 */
function requireAdminKey(req, res, next) {
  const key = req.header("x-api-key");
  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ error: "ADMIN_API_KEY غير مضبوط في السيرفر" });
  }
  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "غير مصرّح — مفتاح API غير صحيح" });
  }
  next();
}

module.exports = { requireAdminKey };
