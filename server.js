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
