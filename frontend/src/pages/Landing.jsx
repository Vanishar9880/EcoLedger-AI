import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  FileText,
  Zap,
  Globe2,
  LineChart,
  Database,
  CheckCircle2,
} from "lucide-react";

function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-950 overflow-hidden">
      <Hero />
      <TrustBar />
      <Features />
      <DashboardPreview />
      <HowItWorks />
      <ImpactSection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#03140f] text-white px-6 md:px-14 pt-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.25),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.18),transparent_30%)]" />

      <nav className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="text-green-400" />
          EcoLedger AI
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm text-gray-300">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#impact">Impact</a>
          <a href="#how">How it works</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-300">
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-green-400 text-black px-5 py-2 rounded-xl font-semibold text-sm"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      <div className="relative z-10 grid lg:grid-cols-2 gap-14 items-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-300 px-4 py-2 rounded-full text-sm mb-8">
            <Leaf size={16} />
            AI-Powered Sustainability Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Track. Analyze. <br />
            <span className="text-green-400">Reduce. Impact.</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-xl mb-8">
            EcoLedger AI helps enterprises track carbon emissions, analyze
            sustainability impact, and generate audit-ready ESG reports with AI.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Link
              to="/signup"
              className="bg-green-400 text-black px-7 py-4 rounded-2xl font-semibold flex items-center gap-2 shadow-[0_0_30px_rgba(74,222,128,0.35)]"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="border border-white/20 px-7 py-4 rounded-2xl font-semibold flex items-center gap-2"
            >
              View Dashboard <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex gap-6 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              Setup in 2 minutes
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-2xl backdrop-blur"
        >
          <MiniDashboard />
        </motion.div>
      </div>
    </section>
  );
}

function MiniDashboard() {
  return (
    <div className="bg-[#071b15] rounded-[1.5rem] p-5 border border-white/10">
      <div className="flex justify-between mb-6">
        <h3 className="font-bold">Dashboard Overview</h3>
        <span className="text-xs bg-white/10 px-3 py-1 rounded-full">This Month</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MiniCard title="Total Emissions" value="24,560" />
        <MiniCard title="Net Emissions" value="18,240" />
        <MiniCard title="Avoided" value="6,320" />
        <MiniCard title="Reduction Goal" value="72%" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-black/20 rounded-2xl p-4 h-56">
          <p className="text-sm text-gray-300 mb-6">Emissions Trend</p>
          <div className="h-32 rounded-xl bg-gradient-to-t from-green-400/30 to-transparent border-b border-green-400/50 flex items-end gap-3 px-4">
            {[35, 45, 38, 60, 68, 72, 90, 78, 85].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-full bg-green-400/70 rounded-t-lg"
              />
            ))}
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 h-56 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full border-[16px] border-green-400 border-r-blue-400 flex items-center justify-center">
            <span className="font-bold">24.5K</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">Emissions by Scope</p>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
      <p className="text-xs text-gray-400">{title}</p>
      <h4 className="text-xl font-bold mt-2">{value}</h4>
      <p className="text-xs text-green-400 mt-1">+12.5% vs last month</p>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="grid md:grid-cols-4 gap-6 px-6 md:px-14 py-8 border-b">
      <Trust icon={<Zap />} title="AI-Powered Insights" text="Smart recommendations to reduce emissions." />
      <Trust icon={<LineChart />} title="Real-time Tracking" text="Monitor emissions across scopes." />
      <Trust icon={<Database />} title="Automated Data" text="Extract data from invoices and logs." />
      <Trust icon={<ShieldCheck />} title="Compliance Ready" text="Generate ESG-ready reports." />
    </section>
  );
}

function Trust({ icon, title, text }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-green-100 text-green-600 p-3 rounded-full">{icon}</div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    ["Emission Tracking", "Track Scope 1, 2 & 3 emissions accurately.", <Leaf />],
    ["AI Insights", "AI-powered recommendations to reduce carbon impact.", <Zap />],
    ["Hotspot Analysis", "Identify major emission hotspots instantly.", <BarChart3 />],
    ["Audit Ledger", "Store every processed carbon activity securely.", <Database />],
    ["Analytics Dashboard", "Visual dashboards with live emission metrics.", <LineChart />],
    ["Reports & Compliance", "Export CSV reports for ESG compliance.", <FileText />],
  ];

  return (
    <section id="features" className="px-6 md:px-14 py-24">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-green-600 bg-green-100 px-4 py-2 rounded-full text-sm font-semibold">
            Powerful Features
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-5">
            Everything you need to manage your{" "}
            <span className="text-green-500">carbon impact</span>
          </h2>

          <p className="text-slate-500 max-w-lg mb-8">
            EcoLedger AI provides end-to-end visibility into emissions data and
            helps teams make data-driven sustainability decisions.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Explore All Features <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map(([title, text, icon], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-xl transition"
            >
              <div className="bg-green-100 text-green-600 w-fit p-3 rounded-2xl mb-5">
                {icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{title}</h3>
              <p className="text-slate-500 text-sm">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section id="solutions" className="px-6 md:px-14 py-20 bg-gradient-to-br from-green-50 to-white">
      <div className="grid lg:grid-cols-3 gap-10 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-5">
            See Your <span className="text-green-500">Impact</span> in Real-Time
          </h2>
          <p className="text-slate-500 mb-8">
            Beautiful analytics dashboards that turn complex emissions data into
            actionable insights.
          </p>

          {["Real-time emissions tracking", "Interactive data visualizations", "Custom reporting & exports", "Goal tracking & progress"].map(
            (item) => (
              <p key={item} className="flex items-center gap-3 mb-3 text-slate-600">
                <CheckCircle2 size={18} className="text-green-500" />
                {item}
              </p>
            )
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border p-6">
          <MiniDashboardLight />
        </div>
      </div>
    </section>
  );
}

function MiniDashboardLight() {
  return (
    <div>
      <h3 className="font-bold mb-5">Emissions Overview</h3>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <LightCard title="Total" value="24,560" />
        <LightCard title="Net" value="18,240" />
        <LightCard title="Avoided" value="6,320" />
        <LightCard title="Goal" value="72%" />
      </div>
      <div className="h-56 rounded-2xl bg-gradient-to-t from-green-100 to-white border flex items-end gap-3 px-6 py-6">
        {[30, 42, 38, 52, 60, 62, 75, 88].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className="w-full bg-green-400 rounded-t-xl" />
        ))}
      </div>
    </div>
  );
}

function LightCard({ title, value }) {
  return (
    <div className="border rounded-2xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <h4 className="text-xl font-bold">{value}</h4>
    </div>
  );
}

function HowItWorks() {
  const steps = ["Connect", "Collect", "Analyze", "Optimize", "Impact"];

  return (
    <section id="how" className="bg-[#03140f] text-white px-6 md:px-14 py-20">
      <h2 className="text-4xl font-bold mb-14">
        How <span className="text-green-400">It Works</span>
      </h2>

      <div className="grid md:grid-cols-5 gap-8">
        {steps.map((step, i) => (
          <div key={step} className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full border border-green-400 flex items-center justify-center text-green-400">
              <Globe2 />
            </div>
            <h3 className="font-bold mb-2">{step}</h3>
            <p className="text-sm text-gray-400">
              {i === 0 && "Connect your operational data sources."}
              {i === 1 && "Collect invoices, travel and activity logs."}
              {i === 2 && "AI analyzes data and detects hotspots."}
              {i === 3 && "Get recommendations to reduce impact."}
              {i === 4 && "Track measurable sustainability outcomes."}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section id="impact" className="px-6 md:px-14 py-20 grid lg:grid-cols-3 gap-10 items-center">
      <div>
        <h2 className="text-3xl font-bold mb-4">
          Trusted by <span className="text-green-500">Sustainability Leaders</span>
        </h2>
        <p className="text-slate-500">
          EcoLedger AI transforms carbon reporting into automated, intelligent,
          actionable business insight.
        </p>
      </div>

      <div className="bg-green-500 text-white rounded-3xl p-10 text-center shadow-xl">
        <h2 className="text-4xl font-bold mb-4">Ready to Make a Real Impact?</h2>
        <p className="mb-8">Join teams reducing their carbon footprint with AI.</p>
        <Link to="/signup" className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold">
          Start Your Free Trial
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Impact value="1.2M+" label="tCO₂e Tracked" />
        <Impact value="500+" label="Companies" />
        <Impact value="50+" label="Countries" />
        <Impact value="95%" label="Satisfaction" />
      </div>
    </section>
  );
}

function Impact({ value, label }) {
  return (
    <div className="bg-green-50 rounded-3xl p-6">
      <h3 className="text-3xl font-bold text-green-500">{value}</h3>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[#03140f] text-white px-6 md:px-14 py-12">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-4">
            <Leaf className="text-green-400" />
            EcoLedger AI
          </div>
          <p className="text-gray-400 text-sm">
            AI-powered sustainability platform for a greener future.
          </p>
        </div>

        {["Product", "Solutions", "Resources"].map((title) => (
          <div key={title}>
            <h4 className="font-bold mb-4">{title}</h4>
            <p className="text-gray-400 text-sm mb-2">Features</p>
            <p className="text-gray-400 text-sm mb-2">Pricing</p>
            <p className="text-gray-400 text-sm mb-2">Documentation</p>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-sm mt-10">
        © 2026 EcoLedger AI. All rights reserved.
      </p>
    </footer>
  );
}

export default Landing;