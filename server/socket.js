const { Server } = require('socket.io');
const Message = require('./models/Message'); // ✅ Message model

// Use a global Map to track online users by their MongoDB user._id
let onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // your frontend URL
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 New socket connected:', socket.id);

    // ✅ Add user to online map using user._id
    socket.on('add-user', (userId) => {
      console.log('✅ User connected:', userId);
      onlineUsers.set(userId, socket.id);
    });

    // ✅ Handle sending messages
    socket.on('send-msg', async ({ to, from, message }) => {
      console.log(`📨 Message from ${from} to ${to}: ${message}`);

      const targetSocket = onlineUsers.get(to);
      console.log('🎯 Recipient socket:', targetSocket);

      // Save message to MongoDB with status
      await Message.create({
        from,
        to,
        text: message,
        status: targetSocket ? 'delivered' : 'sent',
      });

      // Emit to recipient if online
      if (targetSocket) {
        io.to(targetSocket).emit('msg-receive', { from, message });
        io.to(targetSocket).emit('msg-status', { from, status: 'delivered' });
      } else {
        console.log('❌ Recipient is offline');
      }
    });

    // ✅ Typing indicator
    socket.on('typing', ({ to, from }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing', from);
      }
    });

    // ✅ Message seen
    socket.on('message-seen', async ({ from, to }) => {
      const targetSocket = onlineUsers.get(from);

      // Update all messages from 'from' to 'to' that haven't been seen
      await Message.updateMany(
        { from, to, status: { $ne: 'seen' } },
        { $set: { status: 'seen' } }
      );

      if (targetSocket) {
        io.to(targetSocket).emit('msg-status', { to, status: 'seen' });
      }
    });

    // ✅ Handle disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log('❌ User disconnected:', userId);
          break;
        }
      }
    });
  });
};

module.exports = initSocket;
