const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  const { from, to } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};
