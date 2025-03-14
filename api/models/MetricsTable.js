const mongoose = require('mongoose');

const MetricsSchema = new mongoose.Schema({
  dwellAvg: { type: Number, required: true },
  flightAvg: { type: Number, required: true },
  trajAvg: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
},{ collection: 'MetricsTable' });

module.exports = mongoose.model('MetricsTable', MetricsSchema);
