const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotEnv = require("dotenv");
const colors = require("colors");
const itemRoutes = require("./routes/items");
const userRoutes = require("./routes/user");
const billsRoutes = require("./routes/bills");
const shiftRoutes = require("./routes/shift");
const connectDb = require("./config/config");
const path = require("path");

// dotenv config
dotEnv.config();

// Set timezone
process.env.TZ = "Asia/Manila";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL.split(","),
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "client", "build")));

// Define API routes
app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/bills", billsRoutes);
app.use("/shifts", shiftRoutes);

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

// Connect to the database
connectDb();

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Server Running On Port ${port}`.bgGreen.white);
});

module.exports = { app, mongoose };
