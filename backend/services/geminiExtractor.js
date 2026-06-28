import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const extractInvoiceData = async (text) => {
  const prompt = `
You are an ESG data extraction system.

Extract sustainability data from the invoice.

Return ONLY valid JSON.

{
  "category": "Facility Energy",
  "activity": "Electricity Consumption",
  "quantity": 534,
  "unit": "kWh"
}

Invoice Text:

${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const raw = response.text;

  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

    console.log("RAW GEMINI:", raw);
console.log("CLEANED:", cleaned);

  return JSON.parse(cleaned);
};