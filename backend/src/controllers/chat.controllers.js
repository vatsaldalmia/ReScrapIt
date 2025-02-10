import Chat from "../models/chat.models.js"

export const createChat = async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        const existingChat = await Chat.findOne({ members: { $all: [user1, user2] } });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        const chat = new Chat({ members: [user1, user2] });
        await chat.save();

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json(
            {
                message: error.message
            }
        )
    }
};

export const getUserChats = async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user.id });
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
