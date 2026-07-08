import Message from "../models/message.models.js";
import Chat from "../models/chat.models.js";
import User from "../models/user.models.js";
import { notify } from "../lib/notify.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, media } = req.body;
    const sender = req.user._id;

    if (!chatId || (!text && !media)) {
      return res.status(400).json({ message: "chatId and text or media are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const recipient = chat.members.find((m) => m.toString() !== sender.toString());
    // Respect blocks in either direction.
    if (recipient) {
      const me = await User.findById(sender).select("blockedUsers");
      const them = await User.findById(recipient).select("blockedUsers");
      if (me?.blockedUsers?.some((b) => b.toString() === recipient.toString())) {
        return res.status(403).json({ message: "You have blocked this user" });
      }
      if (them?.blockedUsers?.some((b) => b.toString() === sender.toString())) {
        return res.status(403).json({ message: "You cannot message this user" });
      }
    }

    const message = new Message({ chatId, sender, text, media });
    await message.save();

    chat.lastMessage = { text: text || "📎 attachment", sender, createdAt: message.createdAt };
    chat.updatedAt = new Date();
    await chat.save();

    if (recipient) {
      await notify({
        recipient,
        type: "message",
        title: `New message from ${req.user.name}`,
        body: (text || "Sent an attachment").slice(0, 80),
        link: "/dashboard",
      });
    }

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

// Mark all messages in a chat (not sent by me) as seen — read receipts.
export const markSeen = async (req, res) => {
  try {
    await Message.updateMany(
      { chatId: req.params.chatId, sender: { $ne: req.user._id }, seen: false },
      { seen: true }
    );
    res.status(200).json({ message: "Marked seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
