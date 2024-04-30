const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  startingCash: {
    type: Number,
    required: true,
  },
  endingCash: {
    type: Number,
  },

  expectedCashAmount: {
    type: Number,
  },
});

module.exports = mongoose.model("Shift", shiftSchema);
