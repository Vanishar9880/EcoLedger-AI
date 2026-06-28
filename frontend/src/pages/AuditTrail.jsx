import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AuditDetailDrawer from "../components/AuditDetailDrawer";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Eye,
  FileText,
  Brain,
  Activity,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/audit";

function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRecords = async () => {
    const token = localStorage.getItem("ecoledger_token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load audit trail");
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);

    const token = localStorage.getItem("ecoledger_token");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load details");
      setDetail(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const filtered = records.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.originalFileName?.toLowerCase().includes(q) ||
      item.normalizedCategory?.toLowerCase().includes(q)
    );
  });

  const totalCo2 = records.reduce(
    (sum, item) => sum + Number(item.co2Calculated || 0),
    0
  );

  const avgConfidence =
    records.length > 0
      ? Math.round(
          records.reduce((sum, item) => sum + Number(item.confidence || 0), 0) /
            records.length
        )
      : 0;

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
            Explainable AI Intelligence
          </p>
          <h1 className="text-4xl font-bold text-slate-950">AI Audit Trail</h1>
          <p className="text-slate-500 mt-2">
            Transparent, auditable record of every AI extraction and carbon
            calculation decision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={<FileText size={22} />}
            title="Audited Invoices"
            value={records.length}
          />
          <StatCard
            icon={<Brain size={22} />}
            title="Avg AI Confidence"
            value={records.length ? `${avgConfidence}%` : "N/A"}
          />
          <StatCard
            icon={<Activity size={22} />}
            title="Total CO₂ Audited"
            value={`${totalCo2.toFixed(1)} kg`}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Decision Audit Log
                </h2>
                <p className="text-slate-500 text-sm">
                  {filtered.length} records found
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or category..."
                className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 animate-pulse py-8 text-center">
              Loading audit trail...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">
              No audit records yet. Upload and save an invoice from Data
              Ingestion to create your first explainable AI record.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-3">Invoice Name</th>
                    <th>Upload Date</th>
                    <th>Category</th>
                    <th>CO₂</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <motion.tr
                      key={item._id}
                      whileHover={{ backgroundColor: "rgba(240,253,244,0.5)" }}
                      className="border-b border-slate-100 transition"
                    >
                      <td className="py-4 font-medium text-slate-900">
                        {item.originalFileName}
                      </td>
                      <td className="text-slate-600">
                        {new Date(item.uploadDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.normalizedCategory}
                        </span>
                      </td>
                      <td className="font-bold text-green-600">
                        {Number(item.co2Calculated || 0).toFixed(2)} kg
                      </td>
                      <td>
                        <ConfidenceBadge value={item.confidence} />
                      </td>
                      <td>
                        <StatusBadge status={item.processingStatus} />
                      </td>
                      <td>
                        <button
                          onClick={() => openDetail(item._id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {selectedId && (
        <AuditDetailDrawer
          record={detail}
          loading={detailLoading}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="bg-green-100 text-green-600 w-fit p-3 rounded-2xl mb-4">
        {icon}
      </div>
      <p className="text-slate-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2 text-slate-950">{value}</h2>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const isSaved = status === "saved";
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        isSaved
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      {isSaved ? "Saved" : status || "Unknown"}
    </span>
  );
}

function ConfidenceBadge({ value }) {
  if (value == null) return <span className="text-slate-400">N/A</span>;

  const color =
    value >= 80
      ? "bg-green-100 text-green-700"
      : value >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {value}%
    </span>
  );
}

export default AuditTrail;
