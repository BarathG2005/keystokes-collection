require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const models = require('./models/MetricsTable');

const app = express();
app.use(express.json());
app.use(cors());

let isConnected = false; // Track MongoDB connection

async function connectDB() {
  if (!isConnected) { // Only connect if not connected
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  }
}

// API Route
app.post('/api/save-metrics', async (req, res) => {
  try {
    await connectDB(); // Ensure MongoDB is connected

    const { dwellAvg, flightAvg, trajAvg } = req.body;
    const creation = await models.create({ dwellAvg, flightAvg, trajAvg });

    res.status(200).json({ creation });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save metrics", error });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.json("Vanakkam");
});

// ❌ REMOVE: app.listen() - Not needed for Vercel

// ✅ Correct Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
