const mongoose = require("mongoose");
require("colors");

//Connect Database Function
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // { useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    console.log("Connected to MongoDB Atlas successfully.".bgYellow);
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:".bgRed, error);
  }
};

module.exports = connectDb;
