import { useState } from "react";
import { useLedger } from "../context/LedgerContext";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  Sparkles,
  Database,
  Leaf,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function DataIngestion() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addEntry } = useLedger();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [pdfResult, setPdfResult] = useState(null);

  const addToLedger = async () => {
    if (!result) return;

    try {
      await addEntry({
        category: result.category,
        activity: result.activity,
        quantity: result.quantity,
        unit: result.unit,
        factor: result.factor,
        co2: result.co2,
        confidence: result.confidence,
        insight: result.insight,
        rawInput: input,
      });

      setMessage("Entry added to audit ledger successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to add entry. Please try again.");
    }
  };

  const processText = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI analysis failed");
      }

      setResult(data);
    } catch (error) {
      console.error(error);
      setMessage("AI analysis failed. Please check backend server.");
    } finally {
      setLoading(false);
    }
  };

  const uploadInvoice = async () => {
  if (!selectedFile) {
    setMessage("Please select a PDF file.");
    return;
  }

  setUploading(true);
  setMessage("");

  const token = localStorage.getItem("ecoledger_token");

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(
      "http://localhost:5000/api/documents/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    setPdfResult(data);
    setMessage("Invoice analyzed successfully!");
  } catch (error) {
    console.error(error);
    setMessage("Invoice analysis failed.");
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="flex min-h-screen bg-linear-to-br from-[#f8fafc] via-[#eefdf4] to-white text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="text-green-600 font-semibold mb-2">
            AI Data Pipeline
          </p>

          <h1 className="text-4xl font-bold text-slate-950">
            Data Ingestion
          </h1>

          <p className="text-slate-500 mt-2">
            Paste raw corporate activity data and let EcoLedger AI convert it
            into structured carbon records.
          </p>
        </motion.div>

        <div className="grid xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="xl:col-span-2 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                <Sparkles size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Paste Operational Data
                </h2>
                <p className="text-slate-500 text-sm">
                  Supports logistics, travel and energy usage text.
                </p>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-56 bg-white border border-slate-300 rounded-2xl p-4 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none"
              placeholder="Example: Pune office consumed 5000 kWh electricity in March 2026..."
            />

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={processText}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles size={18} />
                {loading ? "Analyzing..." : "Process Text"}
              </button>

              <button
                onClick={() => {
                  setInput("");
                  setResult(null);
                  setMessage("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold"
              >
                Clear
              </button>
            </div>

            {message && (
              <p
                className={`mt-4 flex items-center gap-2 font-medium ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {message.includes("successfully") ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="bg-[#03140f] text-white p-6 rounded-3xl shadow-2xl"
          >
            <div className="bg-green-400/15 text-green-300 w-fit p-3 rounded-2xl mb-5">
              <Leaf size={24} />
            </div>

            <h2 className="text-2xl font-bold mb-3">What AI extracts</h2>

            <p className="text-gray-300 mb-6">
              EcoLedger detects the activity type, quantity, unit, emission
              factor and CO₂e output from unstructured business text.
            </p>

            <div className="space-y-3 text-sm">
              <Feature text="Activity category" />
              <Feature text="Emission factor" />
              <Feature text="CO₂e calculation" />
              <Feature text="Audit-ready record" />
            </div>
          </motion.div>
        </div>

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] mt-6"
>
  <div className="flex items-center gap-3 mb-5">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
      <Database size={22} />
    </div>

    <div>
      <h2 className="text-2xl font-bold text-slate-950">
        Upload Invoice / Bill
      </h2>

      <p className="text-slate-500 text-sm">
        Upload electricity bills, fuel receipts or travel invoices.
      </p>
    </div>
  </div>

  <input
    type="file"
    accept=".pdf"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    className="w-full border border-slate-300 rounded-2xl p-4"
  />

  {selectedFile && (
    <p className="mt-3 text-sm text-slate-600">
      Selected File: {selectedFile.name}
    </p>
  )}

  <button
    onClick={uploadInvoice}
    disabled={uploading}
    className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold"
  >
    {uploading ? "Analyzing..." : "Upload & Analyze"}
  </button>
</motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] mt-6"
          >
            <p className="text-green-600 animate-pulse font-semibold">
              AI analyzing operational data...
            </p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid lg:grid-cols-2 gap-6 mt-6"
          >
            <ResultCard
              icon={<Database />}
              title="AI Extraction Result"
              rows={[
                ["Category", result.category || "N/A"],
                ["Activity", result.activity || "N/A"],
                [
                  "Quantity",
                  `${result.quantity || 0} ${result.unit || "-"}`,
                ],
                ["AI Confidence", `${result.confidence || 0}%`],
              ]}
            />

            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                  <Calculator size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Carbon Calculation
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Deterministic calculation based on emission factors.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <MiniMetric label="Emission Factor" value={result.factor || 0} />
                <MiniMetric label="Total CO₂e" value={`${result.co2 || 0} kg`} />
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">
                <p className="text-green-700 font-semibold mb-1">
                  AI Sustainability Insight
                </p>

                <p className="text-slate-600 text-sm">
                  {result.insight || "No recommendation available."}
                </p>
              </div>

              <button
                onClick={addToLedger}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
              >
                <Database size={18} />
                Add To Ledger
              </button>
            </div>
          </motion.div>
        )}

       

      </main>
    </div>
  );
}

function Feature({ text }) {
  return (
    <p className="flex items-center gap-2 text-gray-300">
      <CheckCircle2 size={16} className="text-green-400" />
      {text}
    </p>
  );
}

function ResultCard({ icon, title, rows }) {
  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>

      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b border-slate-100 pb-3"
          >
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <h3 className="text-2xl font-bold text-slate-950 mt-1">{value}</h3>
    </div>
  );
}

export default DataIngestion;