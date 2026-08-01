const express = require("express");
const db = require("./db");
const { requireAdminKey } = require("./auth");

const router = express.Router();

// GET /api/products — عام، يستخدمه المتجر وصفحة الهبوط
router.get("/", (req, res) => {
  const products = db.prepare("SELECT * FROM products ORDER BY id").all();
  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
  res.json(product);
});

// POST /api/products — إضافة منتج جديد (يتطلب مفتاح الإدارة)
router.post("/", requireAdminKey, (req, res) => {
  const { name, category, price, stock = 0, threshold = 5 } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: "الاسم والفئة والسعر مطلوبة" });
  }
  const result = db
    .prepare("INSERT INTO products (name, category, price, stock, threshold) VALUES (?, ?, ?, ?, ?)")
    .run(name, category, price, stock, threshold);
  const created = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PATCH /api/products/:id — تعديل السعر أو المخزون (يتطلب مفتاح الإدارة)
router.patch("/:id", requireAdminKey, (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

  const { name, category, price, stock, stockDelta, threshold } = req.body;
  const next = {
    name: name ?? product.name,
    category: category ?? product.category,
    price: price ?? product.price,
    stock: stockDelta != null ? Math.max(0, product.stock + stockDelta) : stock ?? product.stock,
    threshold: threshold ?? product.threshold,
  };

  db.prepare(
    "UPDATE products SET name = ?, category = ?, price = ?, stock = ?, threshold = ? WHERE id = ?"
  ).run(next.name, next.category, next.price, next.stock, next.threshold, req.params.id);

  res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id));
});

// DELETE /api/products/:id — حذف منتج (يتطلب مفتاح الإدارة)
router.delete("/:id", requireAdminKey, (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

module.exports = router;
