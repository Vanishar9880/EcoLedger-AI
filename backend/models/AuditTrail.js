import mongoose from "mongoose";

const validationLogEntrySchema = new mongoose.Schema(
  {
    step: String,
    status: {
      type: String,
      enum: ["pass", "fail", "warn"],
    },
    message: String,
  },
  { _id: false }
);

const auditTrailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    originalFileName: String,

    extractedText: String,

    aiOutput: Object,

    geminiRawOutput: Object,

    structuredData: {
      category: String,
      activity: String,
      quantity: Number,
      unit: String,
    },

    normalizedCategory: String,

    normalizedUnit: String,

    factorUsed: Number,

    emissionFactor: Number,

    co2Calculated: Number,

    confidence: Number,

    processingStatus: {
      type: String,
      enum: ["saved", "rejected", "analyzed_only"],
      default: "saved",
    },

    validationLog: [validationLogEntrySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuditTrail", auditTrailSchema);
