const Shift = require("../models/Shift");
const User = require("../models/User");
const Bills = require("../models/Bills");
const moment = require("moment-timezone");

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
    const { firstName, endingCash } = req.body;

    const user = await User.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const shift = await Shift.findOneAndUpdate(
      { user: user._id, endTime: null },
      { endTime: new Date(), endingCash },
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
    if (req.query.firstName) {
      const shifts = await Shift.find({
        "user.firstName": req.query.firstName,
      }).populate("user");
      if (shifts.length === 0) {
        return res
          .status(404)
          .json({ error: "No shifts found for user with provided first name" });
      }
      res.json(shifts);
    } else {
      const shifts = await Shift.find().populate("user");
      res.json(shifts);
    }
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// =====Fetch all Shift Data======
exports.getAllShifts = async (req, res) => {
  try {
    // Parse the selected date
    const selectedDateParts = req.body.selectedDate.split("-");
    const selectedDate = new Date(
      parseInt(selectedDateParts[2]), // Year
      parseInt(selectedDateParts[0]) - 1, // Month (subtract 1 because months are 0-indexed)
      parseInt(selectedDateParts[1]) // Day
    );

    // Convert selected date to server timezone (Asia/Manila)
    const selectedDateServerTimezone = moment
      .utc(selectedDate)
      .tz("Asia/Manila")
      .toDate();

    const startOfDay = new Date(
      selectedDateServerTimezone.getFullYear(),
      selectedDateServerTimezone.getMonth(),
      selectedDateServerTimezone.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      selectedDateServerTimezone.getFullYear(),
      selectedDateServerTimezone.getMonth(),
      selectedDateServerTimezone.getDate(),
      23,
      59,
      59
    );

    const query = {
      startTime: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    };

    // Fetch all shifts
    const allShifts = await Shift.find(query).populate("user", "firstName");

    if (allShifts.length === 0) {
      // If no records found, send a message
      return res
        .status(200)
        .json({ message: "No records found for the selected date." });
    }

    // If records found, send the shifts data
    res.status(200).json({ allShifts });
  } catch (error) {
    console.error("Error fetching data:", error);
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
