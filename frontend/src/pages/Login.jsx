import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, ShieldCheck, BarChart3, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03140f] via-[#06251a] to-[#f8fafc] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.25),transparent_32%),radial-gradient(circle_at_80%_25%,rgba(74,222,128,0.18),transparent_30%)]" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-8 w-full max-w-6xl items-center">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block text-white"
        >
          <Link to="/" className="flex items-center gap-3 mb-10 w-fit">
            <div className="bg-green-400/15 p-3 rounded-2xl">
              <Leaf className="text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">EcoLedger AI</h1>
              <p className="text-sm text-gray-400">Carbon Intelligence Platform</p>
            </div>
          </Link>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Welcome back to your <span className="text-green-400">carbon intelligence</span> workspace.
          </h2>

          <p className="text-gray-300 text-lg max-w-xl mb-8">
            Track emissions, monitor ESG readiness, and generate audit-ready
            sustainability insights from your enterprise activity data.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Feature icon={<Sparkles />} title="AI Extraction" />
            <Feature icon={<BarChart3 />} title="Live Analytics" />
            <Feature icon={<ShieldCheck />} title="ESG Reports" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
        >
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <Leaf className="text-green-500" />
            <h1 className="text-2xl font-bold text-slate-950">EcoLedger AI</h1>
          </Link>

          <p className="text-green-600 font-semibold mb-2">Secure Login</p>

          <h2 className="text-4xl font-bold mb-2 text-slate-950">
            Welcome back
          </h2>

          <p className="text-slate-500 mb-8">
            Login to your enterprise sustainability workspace.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-5">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
              placeholder="Company email"
            />

            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
              placeholder="Password"
              type="password"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>

          <p className="text-slate-500 text-center mt-6">
            New here?{" "}
            <Link to="/signup" className="text-green-600 font-semibold">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-3xl p-4">
      <div className="text-green-400 mb-3">{icon}</div>
      <p className="font-semibold">{title}</p>
    </div>
  );
}

export default Login;