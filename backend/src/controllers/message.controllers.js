import Message from "../models/message.models.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const sender = req.user.id;

    const message = new Message({ chatId, sender, text });
    await message.save();

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
