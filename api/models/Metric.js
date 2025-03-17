const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  avgDwellTime: {
    type: Number,
    required: true,
  },
  avgFlightTime: {
    type: Number,
    required: true,
  },
  flightStdDev: {
    type: Number,
    required: true,
  },
  wpm: {
    type: Number,
    required: true,
  },
  hScore: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Metric', MetricSchema);
