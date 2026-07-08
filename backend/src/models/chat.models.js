import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ]
    },
    {timestamps: true}
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;