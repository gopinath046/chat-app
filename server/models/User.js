const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  token: String, // ✅ store issued JWT token
  online: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('User', userSchema);
