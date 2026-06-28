import Sidebar from "../components/Sidebar";
import { useLedger } from "../context/LedgerContext";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

function Analytics() {
  const { ledger } = useLedger();

  const categoryMap = {};

  ledger.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.co2;
  });

  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const highestEmitter =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.value > b.value ? a : b))
      : null;

  const totalEmissions = chartData.reduce((sum, item) => sum + item.value, 0);

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
            Carbon Intelligence
          </p>

          <h1 className="text-4xl font-bold text-slate-950">Analytics</h1>

          <p className="text-slate-500 mt-2">
            Visualize emission categories, total footprint and operational
            carbon hotspots.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-5 mb-8"
        >
          <StatCard
            icon={<BarChart3 size={22} />}
            title="Total Activities"
            value={ledger.length}
          />

          <StatCard
            icon={<PieIcon size={22} />}
            title="Categories"
            value={chartData.length}
          />

          <StatCard
            icon={<TrendingUp size={22} />}
            title="Highest Emitter"
            value={highestEmitter ? highestEmitter.name : "N/A"}
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card title="Emissions by Category">
            {chartData.length === 0 ? (
              <p className="text-slate-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={115}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Emission Volume">
            {chartData.length === 0 ? (
              <p className="text-slate-500">No emission data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card title="Emission Summary">
          {chartData.length === 0 ? (
            <p className="text-slate-500">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-3">Category</th>
                    <th>Total CO₂e</th>
                    <th>Share</th>
                  </tr>
                </thead>

                <tbody>
                  {chartData.map((item) => {
                    const share = totalEmissions
                      ? ((item.value / totalEmissions) * 100).toFixed(1)
                      : 0;

                    return (
                      <tr
                        key={item.name}
                        className="border-b border-slate-100 hover:bg-green-50/50 transition"
                      >
                        <td className="py-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.name}
                          </span>
                        </td>

                        <td className="font-bold text-green-600">
                          {item.value} kg
                        </td>

                        <td className="text-slate-600">{share}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <h2 className="text-2xl font-bold mb-5 text-slate-950">{title}</h2>
      {children}
    </motion.div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
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

export default Analytics;