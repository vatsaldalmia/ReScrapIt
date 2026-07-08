import Chat from "../models/chat.models.js"

export const createChat = async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        const memberA = user1 || req.user._id;
        const memberB = user2;
        if (!memberB) {
            return res.status(400).json({ message: "A second participant is required" });
        }
        const existingChat = await Chat.findOne({ members: { $all: [memberA, memberB] } });
        if (existingChat) {
            const populated = await existingChat.populate("members", "name email");
            return res.status(200).json(populated);
        }
        const chat = new Chat({ members: [memberA, memberB] });
        await chat.save();
        const populated = await chat.populate("members", "name email");
        res.status(201).json(populated);
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
      const chats = await Chat.find({ members: req.user._id })
        .populate("members", "name email")
        .sort({ updatedAt: -1 });
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
