const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');


mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');

    await User.deleteMany(); // remove existing users

    await User.insertMany([
      { username: 'userA', password: '1234' },
      { username: 'userB', password: '1234' },
    ]);

    console.log('✅ Users created!');
    process.exit();
  })
  .catch(err => console.log('❌ MongoDB error:', err));
