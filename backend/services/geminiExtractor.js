import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const parseExtractionJson = (raw) => {
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI returned invalid JSON");
    }
    return JSON.parse(match[0]);
  }
};

export const extractInvoiceData = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("No text could be extracted from the PDF");
  }

  const prompt = `
You are an ESG data extraction system.

Extract sustainability data from the invoice.

Return ONLY valid JSON in this exact format:
{
  "category": "Logistics | Business Travel | Facility Energy | Mobile Combustion",
  "activity": "short activity name",
  "quantity": number,
  "unit": "km | passenger | kWh | litres",
  "confidence": number
}

Rules:
- confidence is 0-100 indicating extraction certainty
- quantity must be physical consumption, never currency
- use Mobile Combustion for diesel or fuel invoices
- for flight tickets or airline invoices: category must be "Business Travel", unit must be "passenger", quantity = number of passengers (default 1 if not stated)
- if the invoice is not a supported carbon activity, still return best-effort fields with low confidence

Invoice Text:

${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const raw = response.text;

  if (!raw || !raw.trim()) {
    throw new Error("AI returned no extraction data");
  }

  const parsed = parseExtractionJson(raw);

  if (
    !parsed.category ||
    !parsed.activity ||
    parsed.quantity == null ||
    !parsed.unit ||
    parsed.confidence == null
  ) {
    throw new Error("AI extraction missing required fields");
  }

  const confidence = Number(parsed.confidence);
  if (Number.isNaN(confidence)) {
    throw new Error("AI extraction returned invalid confidence");
  }

  return {
    category: parsed.category,
    activity: parsed.activity,
    quantity: parsed.quantity,
    unit: parsed.unit,
    confidence: Math.min(100, Math.max(0, confidence)),
  };
};