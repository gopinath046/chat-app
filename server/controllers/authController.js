const jwt = require('jsonwebtoken');
const User = require('../models/User');

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    user.token = token;
    user.online = true;
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,              // ✅ important for frontend
        username: user.username,    // ✅ also keep this
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      user.token = null;
      user.online = false;
      await user.save();
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Error logging out' });
  }
};

const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = new User({
      username,
      password,
      online: false,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser, logout, signup };
