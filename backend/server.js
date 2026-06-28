import dotenv from "dotenv";
dotenv.config();

import PDFDocument from "pdfkit";
import protect from "./middleware/authMiddleware.js";
import Ledger from "./models/Ledger.js";
import User from "./models/User.js";
import express from "express";
import cors from "cors";

import { GoogleGenAI } from "@google/genai";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config();
connectDB();




const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/audit", auditRoutes);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("EcoLedger AI backend running");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text input is required" });
    }

    const prompt = `
Extract carbon accounting data from this corporate operational text.

Return ONLY valid JSON in this exact format:
{
  "category": "Logistics | Business Travel | Facility Energy | Unclassified",
  "activity": "short activity name",
  "quantity": number,
  "unit": "km | passengers | kWh | -",
  "factor": number,
  "co2": number,
  "confidence": number,
  "insight": "short sustainability recommendation"
}

Rules:
- Logistics diesel freight factor = 0.12 kg CO2e per km
- Business travel economy flight factor = 150 kg CO2e per passenger
- Facility electricity factor = 0.7 kg CO2e per kWh
- co2 = quantity * factor
- If unclear, return Unclassified.

Text:
${text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

app.post("/api/report", async (req, res) => {
  try {
    const { ledger } = req.body;

    if (!ledger || ledger.length === 0) {
      return res.status(400).json({
        error: "No ledger data found",
      });
    }

    const prompt = `
You are an ESG sustainability consultant.

Analyze this company's carbon ledger:

${JSON.stringify(ledger, null, 2)}

Generate a report in this JSON format:

{
  "executiveSummary": "",
  "topEmissionSource": "",
  "riskLevel": "",
  "auditReadiness": "",
  "recommendations": [
    "",
    "",
    ""
  ]
}

Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const raw = response.text;
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const report = JSON.parse(cleaned);

    res.json(report);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Report generation failed",
    });
  }
});

app.get("/api/report/summary", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const ledger = await Ledger.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    if (!ledger.length) {
      return res.status(400).json({
        error: "No ledger data found",
      });
    }

    const totalEmissions = ledger.reduce(
      (sum, item) => sum + Number(item.co2 || 0),
      0
    );

    const categoryMap = {};

    ledger.forEach((item) => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) + Number(item.co2 || 0);
    });

    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, value]) => ({
        category,
        value,
        percentage: totalEmissions
          ? Number(((value / totalEmissions) * 100).toFixed(1))
          : 0,
      }));

    const highestCategory = categories[0]?.category || "N/A";

    const score =
      ledger.length === 0
        ? 0
        : ledger.length <= 3
        ? 40
        : ledger.length <= 7
        ? 70
        : 94;

    const status =
      ledger.length < 4
        ? "Incomplete"
        : ledger.length < 8
        ? "Moderate"
        : "Audit Ready";

    const riskLevel =
      totalEmissions > 8000
        ? "High"
        : totalEmissions > 3000
        ? "Medium"
        : "Low";

    const recommendations = [];

    if (categoryMap["Facility Energy"]) {
      recommendations.push(
        "Adopt renewable electricity sources, optimize HVAC usage, and implement smart energy monitoring."
      );
    }

    if (categoryMap["Business Travel"]) {
      recommendations.push(
        "Reduce avoidable business travel by encouraging virtual meetings and optimizing travel policies."
      );
    }

    if (categoryMap["Logistics"]) {
      recommendations.push(
        "Optimize freight routes, consolidate shipments, and evaluate low-emission transport alternatives."
      );
    }

    if (!recommendations.length) {
      recommendations.push(
        "Add more categorized operational data to generate stronger sustainability recommendations."
      );
    }

    res.json({
      companyName: user?.companyName || "N/A",
      preparedFor: user?.name || "N/A",
      email: user?.email || "N/A",
      reportDate: new Date().toLocaleDateString(),
      executiveSummary: `This ESG sustainability report summarizes ${ledger.length} operational carbon records. Total recorded emissions are ${totalEmissions} kg CO₂e. The current ESG readiness score is ${score}%, with compliance status marked as ${status}.`,
      totalEmissions,
      totalActivities: ledger.length,
      trackedCategories: categories.length,
      highestCategory,
      riskLevel,
      auditReadiness: status,
      score,
      categories,
      recommendations,
      ledgerPreview: ledger.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Report summary generation failed",
    });
  }
});

app.get("/api/report/pdf", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const ledger = await Ledger.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    if (!ledger.length) {
      return res.status(400).json({ error: "No ledger data found" });
    }

    const totalEmissions = ledger.reduce(
      (sum, item) => sum + Number(item.co2 || 0),
      0
    );

    const categoryMap = {};

    ledger.forEach((item) => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) + Number(item.co2 || 0);
    });

    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const highestCategory = categories[0]?.[0] || "N/A";

    const score =
      ledger.length === 0
        ? 0
        : ledger.length <= 3
        ? 40
        : ledger.length <= 7
        ? 70
        : 94;

    const status =
      ledger.length < 4
        ? "Incomplete"
        : ledger.length < 8
        ? "Moderate"
        : "Audit Ready";

    const riskLevel =
      totalEmissions > 8000
        ? "High"
        : totalEmissions > 3000
        ? "Medium"
        : "Low";

    const recommendations = [];

    if (categoryMap["Facility Energy"]) {
      recommendations.push(
        "Adopt renewable electricity sources, optimize HVAC usage, and implement smart energy monitoring."
      );
    }

    if (categoryMap["Business Travel"]) {
      recommendations.push(
        "Reduce avoidable business travel by encouraging virtual meetings and optimizing travel policies."
      );
    }

    if (categoryMap["Logistics"]) {
      recommendations.push(
        "Optimize freight routes, consolidate shipments, and evaluate low-emission transport alternatives."
      );
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="EcoLedger_ESG_Report.pdf"'
    );

    doc.pipe(res);

    doc
      .fontSize(24)
      .fillColor("#0f172a")
      .text("EcoLedger AI - ESG Sustainability Report", {
        align: "center",
      });

    doc.moveDown();

    doc.fontSize(12).fillColor("#475569");
    doc.text(`Company: ${user?.companyName || "N/A"}`);
    doc.text(`Prepared For: ${user?.name || "N/A"}`);
    doc.text(`Email: ${user?.email || "N/A"}`);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("1. Executive Summary");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155").text(
      `This report summarizes the organization's carbon emission activity based on ${ledger.length} recorded operational entries. Total recorded emissions are ${totalEmissions} kg CO2e. The current ESG readiness score is ${score}%, with compliance status marked as ${status}.`
    );

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("2. Key Metrics");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`Total Emissions: ${totalEmissions} kg CO2e`);
    doc.text(`Total Activities: ${ledger.length}`);
    doc.text(`Tracked Categories: ${categories.length}`);
    doc.text(`Highest Emission Source: ${highestCategory}`);
    doc.text(`Risk Level: ${riskLevel}`);
    doc.text(`Audit Readiness: ${status}`);

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("3. Emission Breakdown");
    doc.moveDown(0.5);

    categories.forEach(([category, value]) => {
      const percent = totalEmissions
        ? ((value / totalEmissions) * 100).toFixed(1)
        : 0;

      doc
        .fontSize(12)
        .fillColor("#334155")
        .text(`${category}: ${value} kg CO2e (${percent}%)`);
    });

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("4. Carbon Hotspot Analysis");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155").text(
      `${highestCategory} is the largest contributor to the recorded carbon footprint. This category should be prioritized for reduction strategies and operational optimization.`
    );

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("5. Recommendations");
    doc.moveDown(0.5);

    if (!recommendations.length) {
      recommendations.push(
        "Add more categorized operational data to generate stronger sustainability recommendations."
      );
    }

    recommendations.forEach((item, index) => {
      doc.fontSize(12).fillColor("#334155").text(`${index + 1}. ${item}`);
    });

    doc.moveDown();

    doc.fontSize(18).fillColor("#16a34a").text("6. Audit Ledger Summary");
    doc.moveDown(0.5);

    ledger.slice(0, 15).forEach((item, index) => {
      doc
        .fontSize(10)
        .fillColor("#334155")
        .text(
          `${index + 1}. ${item.category} | ${item.activity} | ${item.quantity} ${item.unit} | ${item.co2} kg CO2e`
        );
    });

    doc.moveDown();

    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(
        "Generated by EcoLedger AI. This report is based on submitted operational carbon ledger entries."
      );

    doc.end();
  } catch (error) {
    console.error("PDF REPORT ERROR:", error);
    res.status(500).json({ error: "PDF report generation failed" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend running on port ${process.env.PORT || 5000}`);
});