const Shift = require("../models/Shift");
const User = require("../models/User");
const Bills = require("../models/Bills");

// Controller for opening a new shift
exports.openShift = async (req, res) => {
  try {
    const { firstName, startingCash } = req.body;
    // Find the user by firstName
    const user = await User.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const shift = new Shift({
      user: user._id,
      startTime: new Date(),
      startingCash,
    });

    await shift.save();

    res.status(201).json(shift);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for closing an existing shift

exports.closeShift = async (req, res) => {
  try {
    const { firstName, startingCash, endingCash, expectedCashAmount } =
      req.body;

    const user = await User.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const shift = await Shift.findOneAndUpdate(
      { user: user._id, endTime: null },
      {
        endTime: new Date(),
        endingCash,
        startingCash,
        expectedCashAmount,
      },
      { new: true }
    );

    if (!shift) {
      return res
        .status(404)
        .json({ error: "Open shift not found for this user" });
    }

    res.json(shift);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for fetching shifts

exports.getShifts = async (req, res) => {
  try {
    // Extract the date parameter from the request query
    const { date } = req.query;

    // Check if the date parameter is provided
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse the date parameter to a JavaScript Date object
    const selectedDate = new Date(date);

    // Calculate the start and end of the selected day
    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59
    );

    // Find shifts for the selected day
    const shifts = await Shift.find({
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).populate("user");

    res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// =======Fetch Daily Sales by Employee===============
exports.getDailySalesByCashier = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      23,
      59,
      59
    );
    const dailySales = await Bills.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: {
            cashierName: "$cashierName",
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          cashierName: "$_id.cashierName",
          day: "$_id.day",
          totalSales: 1,
        },
      },
    ]);

    // console.log("Daily Sales by Cashier:", dailySales);

    res.status(200).json(dailySales);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
