const express = require("express");
const db = require("./db");
const { requireAdminKey } = require("./auth");

const router = express.Router();

// GET /api/stats/overview — يغذّي لوحة التحكم (يتطلب مفتاح الإدارة)
router.get("/overview", requireAdminKey, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders").all().map((o) => ({ ...o, items: JSON.parse(o.items) }));
  const products = db.prepare("SELECT * FROM products").all();

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalSales = validOrders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const avg = validOrders.length ? Math.round(totalSales / validOrders.length) : 0;

  const byDay = {};
  orders.forEach((o) => {
    if (o.status === "cancelled") return;
    const d = new Date(o.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    byDay[key] = (byDay[key] || 0) + o.total;
  });
  const salesSeries = Object.entries(byDay).map(([date, total]) => ({ date, total })).slice(-7);

  const statusCounts = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const productQty = {};
  orders.forEach((o) => o.items.forEach((it) => { productQty[it.name] = (productQty[it.name] || 0) + (it.qty || 1); }));
  const topProducts = Object.entries(productQty).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lowStock = products.filter((p) => p.stock <= p.threshold);

  res.json({
    totalSales, ordersCount: orders.length, pending, avg,
    salesSeries, statusCounts, topProducts, lowStock,
  });
});

module.exports = router;
