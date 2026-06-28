import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Building2, Mail, Settings as SettingsIcon } from "lucide-react";

function Settings() {
  const { user } = useAuth();

  const [message, setMessage] = useState("");

  const [factors, setFactors] = useState({
    logistics: "0.12",
    travel: "150",
    electricity: "0.7",
  });

  const handleFactorChange = (e) => {
    setFactors({
      ...factors,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateFactors = () => {
    setMessage("Emission factors updated for this workspace.");
  };

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
            Workspace Configuration
          </p>

          <h1 className="text-4xl font-bold text-slate-950">Settings</h1>

          <p className="text-slate-500 mt-2">
            Manage your organization profile, workspace details and emission
            factor configuration.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Organization Profile">
            <div className="space-y-4">
              <ReadOnlyField
                icon={<Building2 size={18} />}
                label="Company Name"
                value={user?.companyName || "Not available"}
              />

              <ReadOnlyField
                icon={<User size={18} />}
                label="Account Owner"
                value={user?.name || "Not available"}
              />

              <ReadOnlyField
                icon={<Mail size={18} />}
                label="Registered Email"
                value={user?.email || "Not available"}
              />
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Profile data is linked to your registered EcoLedger account.
            </p>
          </Card>

          <Card title="Emission Factors">
            <div className="space-y-4">
              <InputField
                label="Logistics factor"
                sublabel="kg CO₂e per km"
                name="logistics"
                value={factors.logistics}
                onChange={handleFactorChange}
              />

              <InputField
                label="Business Travel factor"
                sublabel="kg CO₂e per passenger"
                name="travel"
                value={factors.travel}
                onChange={handleFactorChange}
              />

              <InputField
                label="Electricity factor"
                sublabel="kg CO₂e per kWh"
                name="electricity"
                value={factors.electricity}
                onChange={handleFactorChange}
              />

              <button
                onClick={handleUpdateFactors}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold"
              >
                Update Factors
              </button>

              {message && (
                <p className="text-green-600 font-medium">{message}</p>
              )}
            </div>
          </Card>
        </div>

        <Card title="System Configuration" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <ConfigItem text="CSV Export Enabled" />
            <ConfigItem text="Audit Ledger Enabled" />
            <ConfigItem text="Carbon Analytics Enabled" />
            <ConfigItem text="ESG Compliance Tracking Enabled" />
            <ConfigItem text="MongoDB User-wise Storage Enabled" />
            <ConfigItem text="Gemini AI Extraction Enabled" />
          </div>
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
          <SettingsIcon size={20} />
        </div>

        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      </div>

      {children}
    </motion.div>
  );
}

function ReadOnlyField({ icon, label, value }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-2">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
        <span className="text-green-600">{icon}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function InputField({ label, sublabel, name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1">
        {label}
      </label>

      <p className="text-sm text-slate-500 mb-2">{sublabel}</p>

      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </div>
  );
}

function ConfigItem({ text }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-green-700 font-semibold">
      ✓ {text}
    </div>
  );
}

export default Settings;