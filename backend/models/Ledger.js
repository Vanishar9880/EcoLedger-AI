import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: String,
    activity: String,
    quantity: Number,
    unit: String,
    factor: Number,
    co2: Number,
    confidence: Number,
    rawInput: String,
    insight: String,
  },
  {
    timestamps: true,
  }
);

const Ledger = mongoose.model("Ledger", ledgerSchema);

export default Ledger; 