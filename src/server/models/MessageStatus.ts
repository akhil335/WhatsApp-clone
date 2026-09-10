import mongoose from "mongoose";

const messageStatusSchema = new mongoose.Schema(
  {
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false } // no separate _id needed — the map key (participantId) is already the identifier
);

export default messageStatusSchema;