require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Route
app.post('/save-metrics', async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    res.status(201).json({ message: "Metrics saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save metrics", error });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.json("Vanakkam");
});

// Export the handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);
