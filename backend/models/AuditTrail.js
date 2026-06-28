import mongoose from "mongoose";

const auditTrailSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    extractedText: String,

    aiOutput: Object,

    factorUsed: Number,

    co2Calculated: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AuditTrail",
  auditTrailSchema
);