// models/UserActivity.js
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  action: { type: String, enum: ['view', 'contact'], default: 'view' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
