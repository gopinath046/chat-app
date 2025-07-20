const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const initSocket = require('./socket');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ✅ Initialize socket
initSocket(server);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log(err));

// ✅ Update CORS to allow Netlify frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://one-to-one-chatsystem.netlify.app'],
  credentials: true,
}));

app.use(express.json());

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ✅ Start server
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
