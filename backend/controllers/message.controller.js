const Message = require('../models/Message');
const User = require('../models/User');

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide receiver ID and message text' });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      message,
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Messages between current user and another user
exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark these messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of users current user has conversations with
exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    // Extract unique user IDs
    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUserId) {
        userIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== currentUserId) {
        userIds.add(msg.receiver.toString());
      }
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name email avatar role');

    // Add unread message count info
    const chatUsers = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: currentUserId,
          read: false,
        });

        const lastMsg = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: user._id },
            { sender: user._id, receiver: currentUserId },
          ],
        }).sort({ createdAt: -1 });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          unreadCount,
          lastMessage: lastMsg ? lastMsg.message : '',
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        };
      })
    );

    // Sort by last message time
    chatUsers.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

    res.status(200).json({ success: true, data: chatUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
