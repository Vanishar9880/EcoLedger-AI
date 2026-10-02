import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLedger } from "../context/LedgerContext";
import API_BASE_URL from "../config/api";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
} from "lucide-react";

function Compliance() {
  const { ledger, totalEmissions } = useLedger();

  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const getScore = () => {
    if (ledger.length === 0) return 0;
    if (ledger.length <= 3) return 40;
    if (ledger.length <= 7) return 70;
    return 94;
  };

  const score = getScore();

  const generateReport = async () => {
    try {
      setLoadingReport(true);

      const token = localStorage.getItem("ecoledger_token");

      const response = await fetch(`${API_BASE_URL}/api/report/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setReport(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem("ecoledger_token");

      const response = await fetch(`${API_BASE_URL}/api/report/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("PDF download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "EcoLedger_ESG_Report.pdf";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("PDF download failed");
    }
  };

  const categoryMap = {};

  ledger.forEach((item) => {
    categoryMap[item.category] =
      (categoryMap[item.category] || 0) + item.co2;
  });

  const highestCategory =
    Object.keys(categoryMap).length > 0
      ? Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const status =
    ledger.length === 0
      ? "No Data"
      : ledger.length < 4
      ? "Incomplete"
      : ledger.length < 8
      ? "Moderate"
      : "Audit Ready";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eefdf4] to-white text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="text-green-600 font-semibold mb-2">
            ESG Compliance Intelligence
          </p>

          <h1 className="text-4xl font-bold text-slate-950">
            Compliance Center
          </h1>

          <p className="text-slate-500 mt-2">
            Generate structured ESG reports from your carbon ledger and download
            audit-ready PDF summaries.
          </p>
        </motion.div>

        <button
          onClick={generateReport}
          disabled={loadingReport}
          className="mb-8 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles size={18} />
          {loadingReport
            ? "Generating ESG Report..."
            : "Generate ESG Report"}
        </button>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <StatCard title="ESG Readiness" value={`${score}%`} />
          <StatCard title="Compliance Status" value={status} />
          <StatCard title="Total Emissions" value={`${totalEmissions} kg`} />
          <StatCard title="Highest Emitter" value={highestCategory} />
        </div>

        <Card title="Compliance Progress">
          <div className="w-full bg-slate-200 rounded-full h-5">
            <div
              className="bg-green-500 h-5 rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-slate-500 mt-4">
            {score < 50
              ? "Add more operational records to improve audit readiness."
              : score < 90
              ? "Your reporting coverage is improving. Add more categories for stronger ESG readiness."
              : "Your ledger is strong and close to audit-ready reporting."}
          </p>
        </Card>

        {report && (
          <Card title="Generated ESG Report">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <ReportBox label="Company" value={report.companyName} />
                <ReportBox label="Prepared For" value={report.preparedFor} />
                <ReportBox label="Email" value={report.email} />
                <ReportBox label="Report Date" value={report.reportDate} />
              </div>

              <ReportSection
                title="Executive Summary"
                value={report.executiveSummary}
              />

              <div className="grid md:grid-cols-4 gap-4">
                <ReportBox
                  label="Total Emissions"
                  value={`${report.totalEmissions} kg CO₂e`}
                />
                <ReportBox label="Activities" value={report.totalActivities} />
                <ReportBox label="ESG Score" value={`${report.score}%`} />
                <ReportBox label="Risk Level" value={report.riskLevel} />
              </div>

              <div>
                <h3 className="font-bold text-green-600 mb-3">
                  Emission Breakdown
                </h3>

                <div className="space-y-3">
                  {report.categories?.map((item) => (
                    <div
                      key={item.category}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-slate-800">
                          {item.category}
                        </span>

                        <span className="text-green-600 font-bold">
                          {item.value} kg ({item.percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ReportSection
                title="Carbon Hotspot Analysis"
                value={`${report.highestCategory} is currently the largest contributor to your organization's recorded carbon footprint.`}
              />

              <div>
                <h3 className="font-bold text-green-600 mb-3">
                  Recommendations
                </h3>

                <ul className="space-y-2">
                  {report.recommendations?.map((item, index) => (
                    <li key={index} className="text-slate-600">
                      {index + 1}. {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-green-600 mb-3">
                  Audit Ledger Preview
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-200">
                        <th className="py-3">Category</th>
                        <th>Activity</th>
                        <th>Quantity</th>
                        <th>CO₂e</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.ledgerPreview?.map((item) => (
                        <tr key={item._id} className="border-b border-slate-100">
                          <td className="py-3">{item.category}</td>
                          <td>{item.activity}</td>
                          <td>
                            {item.quantity} {item.unit}
                          </td>
                          <td className="font-bold text-green-600">
                            {item.co2} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
              >
                <Download size={18} />
                Download PDF Report
              </button>
            </div>
          </Card>
        )}

        <Card title="Compliance Checklist">
          <Checklist
            text="Operational carbon records added"
            done={ledger.length > 0}
          />

          <Checklist
            text="Multiple emission categories tracked"
            done={Object.keys(categoryMap).length >= 2}
          />

          <Checklist text="Audit ledger available" done={ledger.length > 0} />

          <Checklist text="CSV export ready" done={ledger.length > 0} />

          <Checklist
            text="Sufficient data for ESG summary"
            done={ledger.length >= 4}
          />
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] mb-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
          <FileText size={20} />
        </div>

        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>

      {children}
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <p className="text-slate-500">{title}</p>

      <h2 className="text-2xl font-bold mt-2 text-slate-950">{value}</h2>
    </div>
  );
}

function Checklist({ text, done }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-4">
      <span className="text-slate-700">{text}</span>

      <span
        className={
          done
            ? "text-green-600 flex items-center gap-1"
            : "text-red-500 flex items-center gap-1"
        }
      >
        {done ? (
          <>
            <CheckCircle2 size={16} />
            Complete
          </>
        ) : (
          <>
            <AlertTriangle size={16} />
            Pending
          </>
        )}
      </span>
    </div>
  );
}

function ReportSection({ title, value }) {
  return (
    <div>
      <h3 className="font-bold text-green-600 mb-2">{title}</h3>
      <p className="text-slate-600">{value}</p>
    </div>
  );
}

function ReportBox({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <h3 className="text-lg font-bold text-slate-950 mt-1">{value}</h3>
    </div>
  );
}

export default Compliance;