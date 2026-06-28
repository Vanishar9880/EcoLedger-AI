import express from "express";
import protect from "../middleware/authMiddleware.js";
import AuditTrail from "../models/AuditTrail.js";
import Document from "../models/Document.js";

const router = express.Router();

const formatListItem = (record) => ({
  _id: record._id,
  originalFileName:
    record.originalFileName ||
    record.documentId?.originalName ||
    "Unknown invoice",
  uploadDate: record.createdAt,
  normalizedCategory:
    record.normalizedCategory ||
    record.structuredData?.category ||
    record.documentId?.activity ||
    "N/A",
  co2Calculated: record.co2Calculated ?? record.documentId?.co2e ?? 0,
  confidence: record.confidence ?? record.documentId?.confidence ?? null,
  processingStatus: record.processingStatus || "saved",
});

const formatDetail = (record) => {
  const doc = record.documentId;
  const structured = record.structuredData || {
    category: record.normalizedCategory || doc?.activity,
    activity: doc?.activity,
    quantity: doc?.quantity,
    unit: record.normalizedUnit || doc?.unit,
  };

  return {
    _id: record._id,
    originalFileName:
      record.originalFileName || doc?.originalName || "Unknown invoice",
    uploadDate: record.createdAt,
    extractedText: record.extractedText || doc?.extractedText || "",
    geminiRawOutput: record.geminiRawOutput || record.aiOutput || doc?.geminiOutput || {},
    structuredData: structured,
    normalizedCategory: record.normalizedCategory || structured.category,
    normalizedUnit: record.normalizedUnit || structured.unit,
    emissionFactor: record.emissionFactor ?? record.factorUsed ?? doc?.factor ?? 0,
    factorUsed: record.factorUsed ?? doc?.factor ?? 0,
    co2Calculated: record.co2Calculated ?? doc?.co2e ?? 0,
    confidence: record.confidence ?? doc?.confidence ?? null,
    processingStatus: record.processingStatus || "saved",
    validationLog: record.validationLog || [],
    documentId: record.documentId?._id || record.documentId,
  };
};

const getUserAuditIds = async (userId) => {
  const [byUserId, userDocuments] = await Promise.all([
    AuditTrail.find({ userId }).select("_id"),
    Document.find({ userId }).select("_id"),
  ]);

  const documentIds = userDocuments.map((d) => d._id);

  const byDocument = documentIds.length
    ? await AuditTrail.find({ documentId: { $in: documentIds } }).select("_id")
    : [];

  const idSet = new Set([
    ...byUserId.map((r) => String(r._id)),
    ...byDocument.map((r) => String(r._id)),
  ]);

  return [...idSet];
};

router.get("/", protect, async (req, res) => {
  try {
    const auditIds = await getUserAuditIds(req.userId);

    if (!auditIds.length) {
      return res.json([]);
    }

    const records = await AuditTrail.find({ _id: { $in: auditIds } })
      .populate("documentId", "originalName co2e confidence activity quantity unit factor")
      .sort({ createdAt: -1 });

    res.json(records.map(formatListItem));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch audit trail" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const auditIds = await getUserAuditIds(req.userId);

    if (!auditIds.includes(req.params.id)) {
      return res.status(404).json({ error: "Audit record not found" });
    }

    const record = await AuditTrail.findById(req.params.id).populate(
      "documentId",
      "originalName extractedText geminiOutput activity quantity unit factor co2e confidence userId"
    );

    if (!record) {
      return res.status(404).json({ error: "Audit record not found" });
    }

    res.json(formatDetail(record));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch audit record" });
  }
});

export default router;
