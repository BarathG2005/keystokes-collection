require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const MetricsTable = require('./models/MetricsTable');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define API route
app.post('/api/save-metrics', async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    const newMetrics = new MetricsTable(req.body);
    const savedMetrics = await newMetrics.save();
    res.status(201).json({
      message: "Metrics saved successfully",
      data: savedMetrics
    });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save metrics", error });
  }
});

// Optional test route
app.get('/', (req, res) => {
  res.json("Vanakkam");
});

// Start server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => console.log("Server running on http://localhost:5000"));
}

// Export the handler for Vercel
module.exports.handler = serverless(app);
