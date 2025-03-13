require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MetricsTable = require('./models/MetricsTable');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));


  app.post('/api/save-metrics', async (req, res) => {
    try {
        console.log("Received Data:", req.body);  // Log received data

        const newMetrics = new MetricsTable(req.body);
        const savedMetrics = await newMetrics.save();

        console.log("Saved Data in DB:", savedMetrics);  // Log saved data

        res.status(201).json({
            message: "Metrics saved successfully",
            data: savedMetrics
        });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ message: "Failed to save metrics", error });
    }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
