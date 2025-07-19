const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  status: { type: String, default: 'sent' },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
