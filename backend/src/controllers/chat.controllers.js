import Chat from "../models/chat.models.js"
import Message from "../models/message.models.js"
import User from "../models/user.models.js"

export const createChat = async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        const memberA = user1 || req.user._id;
        const memberB = user2;
        if (!memberB) {
            return res.status(400).json({ message: "A second participant is required" });
        }

        // Respect blocks in either direction.
        const [me, them] = await Promise.all([
            User.findById(memberA).select("blockedUsers"),
            User.findById(memberB).select("blockedUsers"),
        ]);
        if (me?.blockedUsers?.some((b) => b.toString() === memberB.toString())) {
            return res.status(403).json({ message: "You have blocked this user" });
        }
        if (them?.blockedUsers?.some((b) => b.toString() === memberA.toString())) {
            return res.status(403).json({ message: "You cannot start a chat with this user" });
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
        .sort({ updatedAt: -1 })
        .lean();

      // Attach per-chat unread counts.
      const withUnread = await Promise.all(
        chats.map(async (c) => {
          const unread = await Message.countDocuments({ chatId: c._id, sender: { $ne: req.user._id }, seen: false });
          return { ...c, unread };
        })
      );
      res.json(withUnread);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// Block / unblock a user.
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: "userId is required" });
        const me = await User.findById(req.user._id);
        const already = me.blockedUsers.some((b) => b.toString() === userId.toString());
        if (already) {
            me.blockedUsers = me.blockedUsers.filter((b) => b.toString() !== userId.toString());
        } else {
            me.blockedUsers.push(userId);
        }
        await me.save();
        res.status(200).json({ message: already ? "User unblocked" : "User blocked", blocked: !already });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
