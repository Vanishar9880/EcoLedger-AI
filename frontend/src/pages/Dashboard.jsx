import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useLedger } from "../context/LedgerContext";
import Recommendations from "../components/Recommendations";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

function Dashboard() {
  const { user } = useAuth();
  const { ledger, totalEmissions } = useLedger();

  const categoryMap = {};

  ledger.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.co2;
  });

  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const highest =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.value > b.value ? a : b))
      : null;

  const monthMap = {};

  ledger.forEach((item) => {
    const month = new Date(item.createdAt || item.date).toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

    monthMap[month] = (monthMap[month] || 0) + item.co2;
  });

  const monthlyData = Object.keys(monthMap).map((month) => ({
    month,
    emissions: monthMap[month],
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eefdf4] to-white text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-green-600 font-semibold mb-2">
            Enterprise Sustainability Workspace
          </p>

          <h1 className="text-4xl font-bold mb-2 text-slate-950">
            Welcome, {user?.name || "Sustainability Officer"}
          </h1>

          <p className="text-slate-500">
            {user?.companyName || "EcoLedger"} carbon intelligence workspace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="grid md:grid-cols-4 gap-5 mb-8"
        >
          <StatCard title="Total Emissions" value={`${totalEmissions} kg`} />
          <StatCard title="Activities" value={ledger.length} />
          <StatCard title="Categories" value={chartData.length} />
          <StatCard title="Carbon Hotspot" value={highest ? highest.name : "N/A"} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card title="Category Breakdown">
            {chartData.length === 0 ? (
              <EmptyText>No chart data available.</EmptyText>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" outerRadius={100}>
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
              <EmptyText>No emission data available.</EmptyText>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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

        <Card title="Monthly Emissions Trend">
          {ledger.length === 0 ? (
            <EmptyText>No monthly trend available yet.</EmptyText>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <div className="mb-8">
          <Recommendations />
        </div>

        <Card title="Recent Audit Activity">
          {ledger.length === 0 ? (
            <EmptyText>No activity yet. Add entries from Data Ingestion.</EmptyText>
          ) : (
            <div className="space-y-3">
              {ledger.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b border-slate-200 pb-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.activity}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>

                  <p className="text-green-600 font-bold">{item.co2} kg CO₂e</p>
                </div>
              ))}
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

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <p className="text-slate-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-slate-950">{value}</h2>
    </motion.div>
  );
}

function EmptyText({ children }) {
  return <p className="text-slate-500">{children}</p>;
}

export default Dashboard;