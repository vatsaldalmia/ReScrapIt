import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],
        lastMessage: {
            text: { type: String },
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            createdAt: { type: Date },
        }
    },
    {timestamps: true}
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;