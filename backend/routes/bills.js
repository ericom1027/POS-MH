const express = require("express");
const {
  addBillsController,
  getBills,
  voidInvoiceController,
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getMonthlySalesTotal,
  getWeeklySalesTotal,
  getDailySalesTotal,
  fetchDailyTotalSoldItemsPerItem,
} = require("../controllers/bills");

const { verify, verifyAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/add-bills", addBillsController);

router.get("/get-bills", getBills);

router.get("/daily-sales", getDailySales);

router.post("/weekly-sales", getWeeklySales);

router.post("/monthly-sales", getMonthlySales);

// Get total amount display to Card
router.post("/monthly", getMonthlySalesTotal);

router.post("/weekly", getWeeklySalesTotal);

router.post("/day-sales", getDailySalesTotal);

router.post("/void", verify, verifyAdmin, voidInvoiceController);

router.post("/sales", fetchDailyTotalSoldItemsPerItem);

module.exports = router;
