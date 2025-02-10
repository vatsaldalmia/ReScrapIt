import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId : {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String
    },
    media: {
      type: String
    },
    seen: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;