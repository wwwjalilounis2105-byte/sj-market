require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { seedIfEmpty } = require("./seed");
const productsRouter = require("./routes.products");
const ordersRouter = require("./routes.orders");
const statsRouter = require("./routes.stats");

// تعبئة المنتجات تلقائيًا عند أول تشغيل (لا حاجة لـ Shell)
seedIfEmpty();

const app = express();
app.use(cors()); // ملاحظة: مفتوح للجميع الآن — قيّده لنطاق متجرك عند الإنتاج
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Souqna backend API يعمل بنجاح" });
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/stats", statsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "المسار غير موجود" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✔ Souqna backend يعمل على المنفذ ${PORT}`);
});
const db = require("./db");

const products = [
  { name: "سماعات بلوتوث لاسلكية", category: "elec", price: 4500, stock: 42, threshold: 10 },
  { name: "شاحن سريع 65 واط", category: "elec", price: 2200, stock: 8, threshold: 10 },
  { name: "قميص رجالي قطني", category: "mode", price: 2800, stock: 65, threshold: 15 },
  { name: "فستان صيفي نسائي", category: "mode", price: 3600, stock: 3, threshold: 10 },
  { name: "طقم أواني طبخ 12 قطعة", category: "home", price: 8900, stock: 19, threshold: 5 },
  { name: "مكنسة كهربائية صغيرة", category: "home", price: 6200, stock: 0, threshold: 5 },
  { name: "طقم عناية بالبشرة", category: "beaute", price: 3200, stock: 27, threshold: 10 },
  { name: "عطر رجالي فرنسي", category: "beaute", price: 5400, stock: 14, threshold: 8 },
  { name: "حذاء رياضي جري", category: "sport", price: 5900, stock: 6, threshold: 10 },
  { name: "سجادة يوغا مانعة للانزلاق", category: "sport", price: 1900, stock: 33, threshold: 10 },
  { name: "لعبة تركيب مكعبات", category: "kids", price: 2600, stock: 21, threshold: 8 },
  { name: "عربة أطفال قابلة للطي", category: "kids", price: 12500, stock: 4, threshold: 5 },
];

function seedIfEmpty() {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (existing === 0) {
    const insert = db.prepare(
      "INSERT INTO products (name, category, price, stock, threshold) VALUES (@name, @category, @price, @stock, @threshold)"
    );
    const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(products);
    console.log(`تمت إضافة ${products.length} منتج بنجاح.`);
  } else {
    console.log("قاعدة البيانات تحتوي منتجات بالفعل — لم تتم إعادة التعبئة.");
  }
}

// إذا شُغّل هذا الملف مباشرة (node seed.js) — نفّذ التعبئة فورًا
if (require.main === module) {
  seedIfEmpty();
}

module.exports = { seedIfEmpty };
