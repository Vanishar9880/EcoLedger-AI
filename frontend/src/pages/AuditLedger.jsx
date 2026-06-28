import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLedger } from "../context/LedgerContext";
import { motion } from "framer-motion";
import { Download, Search, Filter, Trash2, FileText } from "lucide-react";

function AuditLedger() {
  const { ledger, deleteEntry } = useLedger();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(ledger.map((item) => item.category))];

  const filteredLedger = ledger.filter((item) => {
    const matchesSearch =
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.activity?.toLowerCase().includes(search.toLowerCase()) ||
      item.rawInput?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.category === filter;

    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers =
      "Date,Category,Activity,Quantity,Unit,Emission Factor,CO2 kg,Raw Input\n";

    const rows = filteredLedger
      .map(
        (item) =>
          `"${item.date || item.createdAt}","${item.category}","${item.activity}","${item.quantity}","${item.unit}","${item.factor}","${item.co2}","${item.rawInput || ""}"`
      )
      .join("\n");

    const csv = headers + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "EcoLedger_Report.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eefdf4] to-white text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8"
        >
          <div>
            <p className="text-green-600 font-semibold mb-2">
              Compliance Data Layer
            </p>

            <h1 className="text-4xl font-bold text-slate-950">
              Audit Ledger
            </h1>

            <p className="text-slate-500 mt-2">
              Search, filter, export and manage carbon audit entries.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 w-fit"
          >
            <Download size={18} />
            Export CSV
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category, activity or raw input..."
                className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Ledger Records
              </h2>
              <p className="text-slate-500 text-sm">
                {filteredLedger.length} matching entries found.
              </p>
            </div>
          </div>

          {filteredLedger.length === 0 ? (
            <p className="text-slate-500">No matching ledger entries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-3">Date</th>
                    <th>Category</th>
                    <th>Activity</th>
                    <th>Quantity</th>
                    <th>CO₂e</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLedger.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-green-50/50 transition"
                    >
                      <td className="py-4 text-slate-600">
                        {item.date ||
                          new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.category}
                        </span>
                      </td>

                      <td className="font-medium text-slate-900">
                        {item.activity}
                      </td>

                      <td className="text-slate-600">
                        {item.quantity} {item.unit}
                      </td>

                      <td className="font-bold text-green-600">
                        {item.co2} kg
                      </td>

                      <td>
                        <button
                          onClick={() => deleteEntry(item.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default AuditLedger;