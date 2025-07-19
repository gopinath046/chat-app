const express = require('express');
const router = express.Router();
const { loginUser, logout, signup } = require('../controllers/authController');

router.post('/login', loginUser);     // ✅ fixed login handler
router.post('/logout', logout);
router.post('/signup', signup);       // ✅ signup route

module.exports = router;
