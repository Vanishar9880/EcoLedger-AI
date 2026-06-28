import protect from "../middleware/authMiddleware.js";
import Ledger from "../models/Ledger.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import multer from "multer";
import { PdfReader } from "pdfreader";
import fs from "fs";
import { extractInvoiceData } from "../services/geminiExtractor.js";
import {
  emissionFactors,
  normalizeCategory,
  normalizeUnit,
  getEmissionFactor,
  validateCategoryUnit,
} from "../config/emissionFactors.js";

import Document from "../models/Document.js";
import AuditTrail from "../models/AuditTrail.js";

const router = express.Router();

const uploadsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "uploads"
);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const buildUnsupportedResponse = ({
  reason,
  extraction,
  category,
  unit,
  factorEntry,
  extractedData,
}) => ({
  supported: false,
  error: reason,
  reason,
  geminiOutput: extraction,
  normalizedCategory: category,
  normalizedUnit: unit,
  factorFound: factorEntry?.factor ?? null,
  availableCategories: Object.keys(emissionFactors),
  extractedData,
});

const validateExtraction = (extraction, extractedText) => {
  const activity = extraction.activity;
  const quantity = Number(extraction.quantity);
  const unit = normalizeUnit(extraction.unit);
  const category = normalizeCategory(extraction.category);
  const confidence = extraction.confidence;

  const extractedData = {
    category: extraction.category,
    normalizedCategory: category,
    activity,
    quantity,
    unit: extraction.unit,
    normalizedUnit: unit,
    confidence,
  };

  if (!quantity || quantity <= 0) {
    return {
      ok: false,
      status: 400,
      body: { error: "Invalid quantity extracted" },
    };
  }

  const unitValidation = validateCategoryUnit(category, unit);
  if (!unitValidation.valid) {
    const factorEntry = getEmissionFactor(category);
    return {
      ok: false,
      status: 422,
      body: buildUnsupportedResponse({
        reason: unitValidation.reason,
        extraction,
        category,
        unit,
        factorEntry,
        extractedData,
      }),
    };
  }

  const factorEntry = getEmissionFactor(category);
  if (!factorEntry || !factorEntry.factor) {
    return {
      ok: false,
      status: 422,
      body: buildUnsupportedResponse({
        reason: `No emission factor available for category: ${category}`,
        extraction,
        category,
        unit,
        factorEntry,
        extractedData,
      }),
    };
  }

  const factor = factorEntry.factor;
  const co2 = quantity * factor;

  if (!co2 || co2 <= 0) {
    return {
      ok: false,
      status: 422,
      body: buildUnsupportedResponse({
        reason: "Calculated CO₂e is zero; entry not supported",
        extraction,
        category,
        unit: unitValidation.unit,
        factorEntry,
        extractedData,
      }),
    };
  }

  return {
    ok: true,
    activity,
    quantity,
    unit: unitValidation.unit,
    category: factorEntry.category,
    confidence,
    factor,
    co2,
    factorEntry,
    extractedData,
    extraction,
    extractedText,
  };
};

const buildValidationLog = (validated) => {
  const { extraction, extractedData, factorEntry, category, unit, quantity } =
    validated;

  const log = [];

  if (extraction.category !== category) {
    log.push({
      step: "Category normalized",
      status: "pass",
      message: `"${extraction.category}" → "${category}"`,
    });
  } else {
    log.push({
      step: "Category normalized",
      status: "pass",
      message: `Category confirmed as "${category}"`,
    });
  }

  if (extractedData.unit !== unit) {
    log.push({
      step: "Unit normalized",
      status: "pass",
      message: `"${extractedData.unit}" → "${unit}"`,
    });
  } else {
    log.push({
      step: "Unit validated",
      status: "pass",
      message: `Unit confirmed as "${unit}"`,
    });
  }

  log.push({
    step: "Emission factor found",
    status: "pass",
    message: `${factorEntry.factor} kg CO₂e per ${factorEntry.unit} (${category})`,
  });

  log.push({
    step: "Quantity validated",
    status: "pass",
    message: `Quantity ${quantity} ${unit} is valid`,
  });

  log.push({
    step: "CO₂ calculated",
    status: "pass",
    message: `${quantity} × ${factorEntry.factor} = ${(quantity * factorEntry.factor).toFixed(2)} kg CO₂e`,
  });

  log.push({
    step: "Saved to Ledger",
    status: "pass",
    message: "Ledger, Document, and AuditTrail records created",
  });

  return log;
};

const persistAnalyzedInvoice = async (userId, originalName, validated) => {
  const {
    activity,
    quantity,
    unit,
    category,
    confidence,
    factor,
    co2,
    factorEntry,
    extraction,
    extractedText,
  } = validated;

  let ledgerEntry;
  let document;

  try {
    ledgerEntry = await Ledger.create({
      user: userId,
      category: factorEntry.category,
      activity,
      quantity,
      unit,
      factor,
      co2,
      confidence,
    });

    document = await Document.create({
      userId,
      originalName,
      extractedText,
      geminiOutput: extraction,
      activity,
      quantity,
      unit,
      factor,
      co2e: co2,
      confidence,
      supported: true,
    });

    await AuditTrail.create({
      userId,
      documentId: document._id,
      originalFileName: originalName,
      extractedText,
      aiOutput: extraction,
      geminiRawOutput: extraction,
      structuredData: {
        category,
        activity,
        quantity,
        unit,
      },
      normalizedCategory: category,
      normalizedUnit: unit,
      factorUsed: factor,
      emissionFactor: factor,
      co2Calculated: co2,
      confidence,
      processingStatus: "saved",
      validationLog: buildValidationLog(validated),
    });
  } catch (dbError) {
    if (document?._id) {
      await Document.findByIdAndDelete(document._id);
    }
    if (ledgerEntry?._id) {
      await Ledger.findByIdAndDelete(ledgerEntry._id);
    }
    throw dbError;
  }

  return document;
};

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No PDF uploaded",
      });
    }

    let extractedText = "";
    await new Promise((resolve, reject) => {
      new PdfReader().parseFileItems(req.file.path, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve();
        } else if (item.text) {
          extractedText += item.text + " ";
        }
      });
    });

    const extraction = await extractInvoiceData(extractedText);
    const validated = validateExtraction(extraction, extractedText);

    if (!validated.ok) {
      if (validated.status === 422) {
        console.error(
          "Analysis rejected (422):",
          JSON.stringify(validated.body, null, 2)
        );
      }
      return res.status(validated.status).json(validated.body);
    }

    res.json({
      success: true,
      supported: true,
      analyzed: true,
      originalName: req.file.originalname,
      category: validated.category,
      activity: validated.activity,
      quantity: validated.quantity,
      unit: validated.unit,
      factor: validated.factor,
      co2: validated.co2,
      confidence: validated.confidence,
      extractedText: validated.extractedText,
      geminiOutput: validated.extraction,
    });
  } catch (error) {
    console.error(error);

    const clientError =
      error.message?.includes("extracted from the PDF") ||
      error.message?.includes("AI returned") ||
      error.message?.includes("AI extraction") ||
      error.message?.includes("Invalid quantity");

    res.status(clientError ? 400 : 500).json({
      error: error.message,
    });
  }
});

router.post("/save", protect, async (req, res) => {
  try {
    const { originalName, extractedText, geminiOutput } = req.body;

    if (!originalName || !extractedText || !geminiOutput) {
      return res.status(400).json({
        error: "Missing required fields to save invoice",
      });
    }

    const validated = validateExtraction(geminiOutput, extractedText);

    if (!validated.ok) {
      if (validated.status === 422) {
        console.error(
          "Save rejected (422):",
          JSON.stringify(validated.body, null, 2)
        );
      }
      return res.status(validated.status).json(validated.body);
    }

    const document = await persistAnalyzedInvoice(
      req.userId,
      originalName,
      validated
    );

    res.status(201).json({
      success: true,
      supported: true,
      saved: true,
      documentId: document._id,
      category: validated.category,
      activity: validated.activity,
      quantity: validated.quantity,
      unit: validated.unit,
      factor: validated.factor,
      co2: validated.co2,
      confidence: validated.confidence,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Failed to save invoice to ledger",
    });
  }
});

export default router;
