import Message from "../models/message.models.js";
import Chat from "../models/chat.models.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const sender = req.user._id;

    if (!chatId || !text) {
      return res.status(400).json({ message: "chatId and text are required" });
    }

    const message = new Message({ chatId, sender, text });
    await message.save();

    // Bump the chat's updatedAt so chat lists sort by most recent activity
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
