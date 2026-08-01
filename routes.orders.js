const express = require("express");
const db = require("./db");
const { requireAdminKey } = require("./auth");

const router = express.Router();

function generateOrderId() {
  return "SQ-" + Math.floor(100000 + Math.random() * 900000);
}

// POST /api/orders — عام، يستخدمه المتجر وصفحة الهبوط عند تأكيد الطلب
router.post("/", (req, res) => {
  const {
    name, phone, wilaya, commune, address,
    deliveryType = "home", items = [], subtotal, deliveryFee = 0, total,
    source = "store",
  } = req.body;

  if (!name || !phone || !wilaya || !items.length || subtotal == null || total == null) {
    return res.status(400).json({ error: "بيانات الطلب غير مكتملة" });
  }
  if (!/^0[5-7][0-9]{8}$/.test(String(phone).replace(/\s/g, ""))) {
    return res.status(400).json({ error: "رقم الهاتف غير صحيح" });
  }

  const id = generateOrderId();

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, customer_name, phone, wilaya, commune, address, delivery_type, items, subtotal, delivery_fee, total, status, source)
    VALUES (@id, @customer_name, @phone, @wilaya, @commune, @address, @delivery_type, @items, @subtotal, @delivery_fee, @total, 'pending', @source)
  `);
  const decrementStock = db.prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?");

  const createOrder = db.transaction(() => {
    insertOrder.run({
      id, customer_name: name, phone, wilaya, commune: commune || "", address: address || "",
      delivery_type: deliveryType, items: JSON.stringify(items), subtotal, delivery_fee: deliveryFee, total, source,
    });
    items.forEach((it) => {
      if (it.productId) decrementStock.run(it.qty || 1, it.productId);
    });
  });
  createOrder();

  res.status(201).json({ id, status: "pending" });
});

// GET /api/orders — لوحة التحكم فقط (يتطلب مفتاح الإدارة)
router.get("/", requireAdminKey, (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC").all(status)
    : db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  res.json(rows.map((o) => ({ ...o, items: JSON.parse(o.items) })));
});

// PATCH /api/orders/:id — تغيير حالة الطلب (يتطلب مفتاح الإدارة)
router.patch("/:id", requireAdminKey, (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `الحالة يجب أن تكون واحدة من: ${valid.join(", ")}` });
  }
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "الطلب غير موجود" });

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ...order, status, items: JSON.parse(order.items) });
});

module.exports = router;
