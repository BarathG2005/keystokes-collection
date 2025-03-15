require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const models = require('./models/MetricsTable')

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Route
app.post('/api/save-metrics', async (req, res) => {

  try {
    const {dwellAvg,flightAvg,trajAvg} = req.body
    const creation = await models.create({dwellAvg,flightAvg,trajAvg})
    //const result = await models.deleteMany({});
    res.status(200).json({creation})
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Failed to save metrics", error });
  }
});

// Test Route
app.get('/', (req, res) => {
  res.json("Vanakkam");
});

app.listen(process.env.PORT,()=>{console.log("Port running on port 5000")});

// Export the handler for Vercel
module.exports= app;
module.exports.handler = serverless(app);
