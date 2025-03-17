require('dotenv').config(); // Loads variables from .env file if available

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Metric = require('./models/Metric');

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Use the environment variable or fallback to a default connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/keystrokes';

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API endpoint to save keystroke metrics
app.post('/api/save-metrics', async (req, res) => {
  try {
    
    const { avgDwellTime, avgFlightTime, flightStdDev, wpm, hScore } = req.body;

    // Create a new Metric document using the Mongoose model
    const newMetric = new Metric({
      avgDwellTime,
      avgFlightTime,
      flightStdDev,
      wpm,
      hScore,
    });

    // Save the document to the database
    const savedMetric = await newMetric.save();

    res.status(201).json({ message: 'Metrics saved successfully', data: savedMetric });
  } catch (error) {
    console.error("Error saving metrics:", error);
    res.status(500).json({ message: 'Error saving metrics', error: error.message });
  }
});
app.get("/", (req, res) => {
  res.send("vannakkam");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
