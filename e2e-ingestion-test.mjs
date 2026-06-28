import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "backend", ".env") });

const BASE = "http://localhost:5000";
const backendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "backend");
const fixturesDir = path.join(backendDir, "uploads", "e2e-fixtures");

const results = [];

function fixture(name, builder) {
  const filePath = path.join(fixturesDir, name);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    builder(doc);
    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

async function createFixtures() {
  fs.mkdirSync(fixturesDir, { recursive: true });
  await fixture("01-electricity-standard.pdf", (d) =>
    d.fontSize(12).text("MSEB Electricity Bill\nUnits Consumed: 500 kWh\nTotal Payable: INR 4,850")
  );
  await fixture("02-electricity-layout-b.pdf", (d) => {
    d.fontSize(10).text("POWER SUPPLY STATEMENT", { align: "center" });
    d.moveDown().text("Active Units: 1240 kWh\nNet Amount Due: INR 11,420");
  });
  await fixture("03-diesel-invoice.pdf", (d) =>
    d.fontSize(12).text("HP Fuel Station\nProduct: Diesel\nQuantity: 45 litres\nAmount: INR 4,230")
  );
  await fixture("04-logistics-invoice.pdf", (d) =>
    d.fontSize(12).text("BlueRoute Logistics\nRoute Distance: 320 km\nFreight Charge: INR 18,500")
  );
  await fixture("05-water-bill.pdf", (d) =>
    d.fontSize(12).text("City Water Board\nConsumption: 85 KL\nWater Charges: INR 1,250")
  );
  await fixture("06-telecom-bill.pdf", (d) =>
    d.fontSize(12).text("Airtel Postpaid Bill\nPlan: Unlimited 5G\nBill Amount: INR 899")
  );
  await fixture("07-random-resume.pdf", (d) =>
    d.fontSize(12).text("John Smith\nSoftware Engineer\nSkills: React, Node.js, Leadership")
  );
  const emptyPath = path.join(fixturesDir, "08-empty-text.pdf");
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(emptyPath);
    doc.pipe(stream);
    doc.addPage();
    doc.end();
    stream.on("finish", () => resolve(emptyPath));
    stream.on("error", reject);
  });
}

async function getLedgerCount(token) {
  const res = await fetch(`${BASE}/api/ledger`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

async function upload(token, filePath) {
  const form = new FormData();
  form.append(
    "file",
    new Blob([fs.readFileSync(filePath)], { type: "application/pdf" }),
    path.basename(filePath)
  );
  const started = Date.now();
  const response = await fetch(`${BASE}/api/documents/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await response.json();
  return { status: response.status, body, ms: Date.now() - started };
}

async function runTest({ id, name, file, expect, token }) {
  console.log(`\n${"=".repeat(72)}\nTEST ${id}: ${name}\n${"=".repeat(72)}`);
  console.log("REQUEST:");
  console.log(`  POST ${BASE}/api/documents/upload`);
  console.log(`  Authorization: Bearer <jwt>`);
  console.log(`  file: ${path.basename(file)}`);

  const ledgerBefore = await getLedgerCount(token);
  const { status, body, ms } = await upload(token, file);
  const ledgerAfter = await getLedgerCount(token);
  const ledgerDelta = ledgerAfter - ledgerBefore;

  console.log("\nAPI RESPONSE:");
  console.log(`  HTTP ${status} (${ms}ms)`);
  console.log(JSON.stringify(body, null, 2));

  console.log("\nMONGODB WRITES (inferred):");
  console.log(`  Ledger: +${ledgerDelta} (via GET /api/ledger)`);
  console.log(
    `  Document: ${body.documentId ? "+1 (documentId returned)" : status === 422 ? "+1 likely (unsupported audit record)" : "+0"}`
  );
  console.log(
    `  AuditTrail: ${body.success && body.documentId ? "+1 (created with supported upload)" : "+0"}`
  );

  const failures = [];
  if (expect.status !== undefined && status !== expect.status) failures.push(`status ${status} != ${expect.status}`);
  if (expect.supported !== undefined && body.supported !== expect.supported) failures.push(`supported mismatch`);
  if (expect.success !== undefined && body.success !== expect.success) failures.push(`success mismatch`);
  if (expect.category && body.category !== expect.category) failures.push(`category ${body.category} != ${expect.category}`);
  if (expect.unit && body.unit !== expect.unit) failures.push(`unit ${body.unit} != ${expect.unit}`);
  if (expect.co2Approx !== undefined && body.co2 && Math.abs(body.co2 - expect.co2Approx) > 5) {
    failures.push(`co2 ${body.co2} not near ${expect.co2Approx}`);
  }
  if (expect.confidence && typeof body.confidence !== "number") failures.push("missing confidence");
  if (expect.ledgerDelta !== undefined && ledgerDelta !== expect.ledgerDelta) {
    failures.push(`ledger delta ${ledgerDelta} != ${expect.ledgerDelta}`);
  }
  if (expect.errorIncludes && !String(body.error || "").includes(expect.errorIncludes)) {
    failures.push(`error missing "${expect.errorIncludes}"`);
  }
  if (expect.reasonIncludes && !String(body.reason || "").includes(expect.reasonIncludes)) {
    failures.push(`reason missing "${expect.reasonIncludes}"`);
  }
  if (expect.noDocumentId && body.documentId) failures.push("unexpected documentId");
  if (expect.hasDocumentId && !body.documentId) failures.push("missing documentId");

  console.log("\nFRONTEND BEHAVIOR:");
  if (status === 200 && body.success) {
    console.log("  PASS path: pdfResult set, success message, fetchLedger() refreshes dashboard");
  } else if (status === 422) {
    console.log(`  FAIL path: shows "${body.reason || "Invoice analysis failed."}"`);
  } else if (status === 400) {
    console.log(`  FAIL path: shows "${body.error}"`);
  }

  const pass = failures.length === 0;
  console.log(`\nRESULT: ${pass ? "PASS" : "FAIL"}`);
  failures.forEach((f) => console.log(`  - ${f}`));
  results.push({ id, name, pass, status, body, ledgerDelta, failures });
  return { pass, body, ledgerDelta };
}

async function main() {
  await createFixtures();
  const email = `e2e-${Date.now()}@ecoledger.test`;
  const signupRes = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Tester",
      companyName: "EcoLedger QA",
      email,
      password: "E2eTest123!",
    }),
  });
  const signup = await signupRes.json();
  if (!signupRes.ok) {
    console.error("Signup failed:", signup);
    process.exit(1);
  }
  const token = signup.token;
  console.log("AUTH: signup OK, JWT stored (AuthContext.jsx:56-57)");

  await runTest({
    id: 1,
    name: "Valid electricity bill",
    file: path.join(fixturesDir, "01-electricity-standard.pdf"),
    token,
    expect: { status: 200, success: true, supported: true, category: "Facility Energy", unit: "kWh", co2Approx: 358, confidence: true, ledgerDelta: 1, hasDocumentId: true },
  });
  await runTest({
    id: 2,
    name: "Electricity bill different layout",
    file: path.join(fixturesDir, "02-electricity-layout-b.pdf"),
    token,
    expect: { status: 200, success: true, supported: true, category: "Facility Energy", unit: "kWh", co2Approx: 888, confidence: true, ledgerDelta: 1, hasDocumentId: true },
  });
  await runTest({
    id: 3,
    name: "Diesel invoice",
    file: path.join(fixturesDir, "03-diesel-invoice.pdf"),
    token,
    expect: { status: 200, success: true, supported: true, category: "Mobile Combustion", unit: "litres", co2Approx: 120.6, confidence: true, ledgerDelta: 1, hasDocumentId: true },
  });
  await runTest({
    id: 4,
    name: "Logistics invoice",
    file: path.join(fixturesDir, "04-logistics-invoice.pdf"),
    token,
    expect: { status: 200, success: true, supported: true, category: "Logistics", unit: "km", co2Approx: 38.4, confidence: true, ledgerDelta: 1, hasDocumentId: true },
  });
  await runTest({
    id: 5,
    name: "Water bill",
    file: path.join(fixturesDir, "05-water-bill.pdf"),
    token,
    expect: { status: 422, supported: false, ledgerDelta: 0, reasonIncludes: "Unsupported" },
  });
  await runTest({
    id: 6,
    name: "Telecom bill",
    file: path.join(fixturesDir, "06-telecom-bill.pdf"),
    token,
    expect: { status: 422, supported: false, ledgerDelta: 0 },
  });
  await runTest({
    id: 7,
    name: "Random PDF resume",
    file: path.join(fixturesDir, "07-random-resume.pdf"),
    token,
    expect: { status: 422, supported: false, ledgerDelta: 0 },
  });
  await runTest({
    id: 8,
    name: "Empty/scanned PDF",
    file: path.join(fixturesDir, "08-empty-text.pdf"),
    token,
    expect: { status: 400, ledgerDelta: 0, noDocumentId: true, errorIncludes: "No text could be extracted" },
  });

  const finalLedger = await getLedgerCount(token);
  console.log(`\nDASHBOARD REFRESH: ledger now has ${finalLedger} entries (fetchLedger would update UI)`);
  console.log(`\n${"=".repeat(72)}\nSUMMARY\n${"=".repeat(72)}`);
  results.forEach((r) => console.log(`${r.pass ? "PASS" : "FAIL"} - Test ${r.id}: ${r.name}`));
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
