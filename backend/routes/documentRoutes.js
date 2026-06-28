import protect from "../middleware/authMiddleware.js";
import Ledger from "../models/Ledger.js";
import express from "express";

import multer from "multer";
import { PdfReader } from "pdfreader";
import fs from "fs";
import { extractInvoiceData } from "../services/geminiExtractor.js";
import { emissionFactors } from "../config/emissionFactors.js";

import Document from "../models/Document.js";
import AuditTrail from "../models/AuditTrail.js";

const router = express.Router();

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, "uploads/");
},

filename: (req, file, cb) => {
cb(null, Date.now() + "-" + file.originalname);
},
});

const upload = multer({ storage });



router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
error: "No PDF uploaded",
});

}

//   const pdfBuffer = fs.readFileSync(req.file.path);



//  const pdfData = await pdfParse(pdfBuffer);

//   const extractedText = pdfData.text;


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

const activity = extraction.activity;
const quantity = Number(extraction.quantity);
const unit = extraction.unit;
const category = extraction.category;

if (!quantity || quantity <= 0) {
  return res.status(400).json({
    error: "Invalid quantity extracted",
  });
}

const factor =
  emissionFactors[category]?.factor || 0;

const co2 = quantity * factor;

await Ledger.create({
  user: req.userId,
  category,
  activity,
  quantity,
  unit,
  factor,
  co2,
});



  

  const document = await Document.create({
  originalName: req.file.originalname,

  extractedText,

  geminiOutput: extraction,

  activity,
  quantity,
  unit,
  factor,
  co2e: co2,
});

await AuditTrail.create({
  documentId: document._id,

  extractedText,

  aiOutput: extraction,

  factorUsed: factor,

  co2Calculated: co2,
});
  res.json({
    success: true,
    documentId: document._id,
    activity,
    quantity,
    unit,
    factor,
    co2,
    extractedText,
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    error: error.message,
  });
}

}
) ;

export default router;
