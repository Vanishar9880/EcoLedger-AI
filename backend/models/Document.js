import mongoose from "mongoose";



const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    originalName: String,
    extractedText: String,
    geminiOutput: {
  type: Object,
},
    activity: String,
    quantity: Number,
    unit: String,
    factor: Number,
    co2e: Number,
  },
  { timestamps: true }

  
);

const Document = mongoose.model("Document", documentSchema);

export default Document;