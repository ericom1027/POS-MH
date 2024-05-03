const Bills = require("../models/Bills");
const moment = require("moment-timezone");
// Add Bills
module.exports.addBillsController = (req, res) => {
  const {
    cashierName,
    invoiceNumber,
    customerName,
    customerNumber,
    paymentMode,
    cartItems,
    subTotal,
    vatSales,
    vatAmount,
    cash,
    change,
    totalAmount,
  } = req.body;

  // Check if invoiceNumber is provided
  if (!invoiceNumber) {
    return res.status(400).send({ error: "Invoice number is required." });
  }

  // Ensure cartItems is an array
  if (!Array.isArray(cartItems)) {
    return res.status(400).send({ error: "Cart items must be an array." });
  }

  // Ensure qty is present in request body
  if (!cartItems.every((item) => "qty" in item)) {
    return res
      .status(400)
      .send({ error: "Quantity (qty) is required for each item." });
  }

  // Calculate discount for senior citizens and PWDs
  const isSeniorOrPWD = req.body.isSeniorOrPWD;
  let discount = 0;
  if (isSeniorOrPWD) {
    // Apply 20% discount
    discount = totalAmount * 0.2;
  }

  // Construct newBillData object with qty included for each item in cartItems
  const newBillData = {
    cashierName,
    invoiceNumber,
    customerName,
    customerNumber,
    paymentMode,
    cartItems: cartItems.map((item) => ({
      item: item.item,
      qty: item.qty,
      price: item.price,
    })),
    subTotal,
    vatSales,
    vatAmount,
    cash,
    change,
    totalAmount,
    discount, // Include discount in bill data
  };

  // Create new Bills instance
  const newBill = new Bills(newBillData);

  // Save the bill
  newBill
    .save()
    .then((savedBill) => {
      res.status(201).send(savedBill);
    })
    .catch((error) => {
      console.error("Error in saving bill: ", error);
      return res.status(500).send({ error: "Failed to save the bill" });
    });
};

// Get Bills
module.exports.getBills = (req, res) => {
  return Bills.find({})
    .then((bills) => {
      if (bills.length > 0) {
        return res.status(200).send({ bills });
      } else {
        return res.status(200).send({ message: "No bills found." });
      }
    })
    .catch((err) => {
      console.error("Error in finding all bills:", err);
      return res.status(500).send({ error: "Error finding bills." });
    });
};

// ----SECTION Void Controller------------
module.exports.voidInvoiceController = (req, res) => {
  const { invoiceNumber } = req.body;

  // Check if invoiceNumber is provided
  if (!invoiceNumber) {
    return res.status(400).send({ error: "Invoice number is required." });
  }

  // Find the bill in the database
  Bills.findOne({ invoiceNumber })
    .then((bill) => {
      if (!bill) {
        return res.status(404).send({ error: "Invoice not found." });
      }

      // Update the voided status of the invoice
      bill.voided = true;

      // Save the updated bill
      bill
        .save()
        .then((updatedBill) => {
          // Send success message along with updated bill
          res.status(200).send({
            message: "Invoice voided successfully.",
            bill: updatedBill,
          });
        })
        .catch((error) => {
          console.error("Error in updating bill: ", error);
          return res.status(500).send({ error: "Failed to void the invoice." });
        });
    })
    .catch((error) => {
      console.error("Error in finding bill: ", error);
      return res.status(500).send({ error: "Failed to find the invoice." });
    });
};

// ===================Controller for fetching Daily sales======================

module.exports.getDailySales = async (req, res) => {
  try {
    const timestamp = req.query.createdAt; // Get the timestamp from the query parameter
    const date = new Date(parseInt(timestamp));

    // Format the date as a string in ISO format
    const formattedDate = date.toISOString();

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const dailySales = await Bills.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================Controller for  fetching Daily sales per Employee CloseShift======================

module.exports.getDailySalesShift = async (req, res) => {
  try {
    // Get the date for which daily sales are requested
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is missing" });
    }

    const ManilaTime = moment.tz(date, "Asia/Manila");

    // Set shift start time to 4:00 PM of the previous day
    const shiftStartTime = ManilaTime.clone()
      .subtract(1, "day")
      .startOf("day")
      .add(0, "hours");

    // Set shift end time to 4:00 PM of the current day
    const shiftEndTime = ManilaTime.clone().startOf("day").add(16, "hours");

    const bills = await Bills.find({
      createdAt: { $gte: shiftStartTime.toDate(), $lt: shiftEndTime.toDate() },
    });

    const cashierSalesMap = {};
    bills.forEach((bill) => {
      if (!cashierSalesMap[bill.cashierName]) {
        cashierSalesMap[bill.cashierName] = 0;
      }
      cashierSalesMap[bill.cashierName] += bill.totalAmount;
    });

    res.status(200).json({ cashierSales: cashierSalesMap });
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ====================Controller for fetching weekly Sales======================
module.exports.getWeeklySales = async (req, res) => {
  try {
    const { start, end } = req.body;

    // Validate start and end timestamps
    const startTimestamp = new Date(start);
    const endTimestamp = new Date(end);

    // Check if timestamps are valid
    if (isNaN(startTimestamp.getTime()) || isNaN(endTimestamp.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid start or end timestamp" });
    }

    // Calculate start and end timestamps for the week
    const startOfWeek = new Date(startTimestamp);
    startOfWeek.setDate(
      startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)
    ); // Set to Sunday of the current week
    const endOfWeek = new Date(endTimestamp);
    endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6); // Set to Saturday of the current week

    // Proceed with querying the database using valid timestamps
    const weeklySales = await Bills.find({
      createdAt: {
        $gte: startOfWeek.toISOString(),
        $lt: endOfWeek.toISOString(),
      },
    });

    res.json(weeklySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//============ Controller for fetching monthly sales===============================
module.exports.getMonthlySales = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Convert ISO strings back to Date objects
    const startOfMonth = new Date(startDate);
    const endOfMonth = new Date(endDate);

    // Proceed with querying the database using valid timestamps
    const monthlySales = await Bills.find({
      createdAt: {
        $gte: startOfMonth.toISOString(),
        $lte: endOfMonth.toISOString(),
      },
    });

    res.json(monthlySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============Monthly Get Grand Total Display in Dashboard============
module.exports.getMonthlySalesTotal = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Convert ISO strings back to Date objects
    const startOfMonth = new Date(startDate);
    const endOfMonth = new Date(endDate);

    // Proceed with querying the database using valid timestamps
    const monthlySales = await Bills.find({
      createdAt: {
        $gte: startOfMonth.toISOString(),
        $lte: endOfMonth.toISOString(),
      },
    });

    // Calculate the grand total sales
    const grandTotalSales = monthlySales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    );

    res.json({ monthlySales, grandTotalSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============Weekly Get Grand Total Display in Dashboard============
module.exports.getWeeklySalesTotal = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Convert ISO strings back to Date objects
    const startOfWeek = new Date(startDate);
    const endOfWeek = new Date(endDate);

    // Proceed with querying the database using valid timestamps
    const weeklySales = await Bills.find({
      createdAt: {
        $gte: startOfWeek.toISOString(),
        $lte: endOfWeek.toISOString(),
      },
    });

    // Calculate the grand total sales
    const grandTotalSales = weeklySales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    );

    res.json({ weeklySales, grandTotalSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============Daily Get Grand Total Display in Dashboard============
module.exports.getDailySalesTotal = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = req.body;

    // Set start and end of day timestamps with timezone
    const timezone = "Asia/Manila"; // I-set ang timezone dito
    const dayStart = moment.tz(startOfDay, timezone).startOf("day");
    const dayEnd = moment.tz(endOfDay, timezone).endOf("day");

    const daySales = await Bills.find({
      createdAt: {
        $gte: dayStart.toDate(),
        $lte: dayEnd.toDate(),
      },
    });

    // Initialize an object to store daily sales totals
    const dailySales = {};

    // Calculate daily sales totals
    daySales.forEach((sale) => {
      // Get the date without converting it to ISO format
      const date = moment.tz(sale.createdAt, timezone).startOf("day");

      // Accumulate the totalAmount for each day
      if (dailySales[date]) {
        dailySales[date] += sale.totalAmount;
      } else {
        dailySales[date] = sale.totalAmount;
      }
    });

    // Send response with daily sales totals
    res.json({ dailySales });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

// Controller function to fetch daily total sold items per item and corresponding cashier names
module.exports.fetchDailyTotalSoldItemsPerItem = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = req.body;

    // Parse start and end dates
    const startDate = moment.tz(startOfDay, "Asia/Manila").toDate();
    const endDate = moment.tz(endOfDay, "Asia/Manila").endOf("day").toDate();

    // Aggregate data for the specified date range
    const dailyTotalSoldItems = await Bills.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $group: {
          _id: {
            createdAt: "$createdAt",
            cashierName: "$cashierName",
            item: "$cartItems.item",
            price: "$cartItems.price",
          },
          totalQuantity: { $sum: "$cartItems.qty" },
          totalPrice: {
            $sum: { $multiply: ["$cartItems.qty", "$cartItems.price"] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          createdAt: "$_id.createdAt",
          cashierName: "$_id.cashierName",
          item: "$_id.item",
          price: "$_id.price",
          totalQuantity: 1,
          totalPrice: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: dailyTotalSoldItems });
  } catch (err) {
    console.error("Error fetching daily total sold items per item:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
