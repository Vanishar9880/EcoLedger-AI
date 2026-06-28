import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Brain,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

function AuditDetailDrawer({ record, loading, onClose }) {
  if (!record && !loading) return null;

  const confidence = record?.confidence ?? 0;
  const quantity = record?.structuredData?.quantity ?? 0;
  const unit = record?.structuredData?.unit || record?.normalizedUnit || "-";
  const factor = record?.emissionFactor ?? record?.factorUsed ?? 0;
  const co2 = record?.co2Calculated ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm">
                Explainable AI Record
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                Audit Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X size={22} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-slate-500 animate-pulse">
              Loading audit record...
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <Card icon={<FileText size={20} />} title="Original Invoice">
                <p className="font-semibold text-slate-900">
                  {record.originalFileName}
                </p>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Clock size={14} />
                  {new Date(record.uploadDate).toLocaleString()}
                </p>
              </Card>

              <Card icon={<FileText size={20} />} title="Extracted Text (PdfReader)">
                <pre className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                  {record.extractedText || "No extracted text available."}
                </pre>
              </Card>

              <Card icon={<Brain size={20} />} title="Gemini JSON Output">
                <pre className="text-xs bg-slate-900 text-green-300 rounded-2xl p-4 max-h-56 overflow-y-auto font-mono">
                  {JSON.stringify(record.geminiRawOutput, null, 2)}
                </pre>
              </Card>

              <Card icon={<CheckCircle2 size={20} />} title="Final Interpreted Values">
                <div className="grid sm:grid-cols-2 gap-3">
                  <DetailField label="Category" value={record.normalizedCategory} />
                  <DetailField label="Activity" value={record.structuredData?.activity} />
                  <DetailField
                    label="Quantity"
                    value={`${quantity} ${unit}`}
                  />
                  <DetailField label="Unit" value={unit} />
                </div>
              </Card>

              <Card icon={<Calculator size={20} />} title="CO₂ Calculation">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                    <CalcBlock label="Quantity" value={`${quantity} ${unit}`} />
                    <span className="text-2xl text-slate-400">×</span>
                    <CalcBlock label="Factor" value={factor} />
                    <span className="text-2xl text-slate-400">=</span>
                    <CalcBlock label="CO₂" value={`${co2} kg`} highlight />
                  </div>
                </div>
              </Card>

              <Card icon={<Brain size={20} />} title="AI Confidence">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="font-bold text-green-600 min-w-[3rem] text-right">
                    {confidence}%
                  </span>
                </div>
              </Card>

              <Card icon={<CheckCircle2 size={20} />} title="Validation Log">
                <div className="space-y-3">
                  {(record.validationLog?.length
                    ? record.validationLog
                    : [
                        {
                          step: "Record loaded",
                          status: "pass",
                          message: "Legacy audit record (limited validation log)",
                        },
                      ]
                  ).map((entry, index) => (
                    <div
                      key={`${entry.step}-${index}`}
                      className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-0"
                    >
                      {entry.status === "pass" ? (
                        <CheckCircle2
                          size={18}
                          className="text-green-500 mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          className="text-red-500 mt-0.5 shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">
                          {entry.step}
                        </p>
                        <p className="text-sm text-slate-500">{entry.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 text-green-600 p-2.5 rounded-xl">{icon}</div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-slate-900 mt-1">{value || "N/A"}</p>
    </div>
  );
}

function CalcBlock({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 min-w-[110px] ${
        highlight ? "bg-green-500 text-white" : "bg-white border border-slate-200"
      }`}
    >
      <p className={`text-xs ${highlight ? "text-green-100" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`text-lg font-bold mt-1 ${highlight ? "" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

export default AuditDetailDrawer;
