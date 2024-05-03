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
    const {
      firstName,
      startingCash,
      endingCash,
      expectedCashAmount,
      difference,
    } = req.body;

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
        difference,
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

// ==========Controller for fetching shifts==================

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
    let startOfDay, endOfDay;

    // Pag-filter para sa morning shift (4:00 AM - 4:00 PM)
    if (currentDate.getHours() >= 4 && currentDate.getHours() < 16) {
      startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        4, // 4:00 AM
        0,
        0
      );
      endOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        16, // 4:00 PM
        0,
        0
      );
    } else {
      startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        16, // 4:00 PM
        0,
        0
      );
      // Kung night shift, kailangang idagdag ang isang araw sa petsa para sa endOfDay
      endOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1, // idagdag ang isang araw
        4, // 4:00 AM kinabukasan
        0,
        0
      );
    }

    const dailySales = await Bills.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
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

    res.status(200).json(dailySales);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
