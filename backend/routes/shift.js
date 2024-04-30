const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/shift");
const { verify } = require("../middlewares/auth");

router.post("/openShift", shiftController.openShift);

router.put("/closeShift", shiftController.closeShift);

router.get("/getShift", shiftController.getShifts);

router.get("/getCashierTotalSales", shiftController.getDailySalesByCashier);

module.exports = router;
