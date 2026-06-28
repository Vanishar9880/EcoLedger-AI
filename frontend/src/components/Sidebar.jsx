import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Leaf,
  Upload,
  FileText,
  Settings,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`sticky top-0 h-screen bg-[#03140f] text-white border-r border-white/10 transition-all duration-300 shadow-2xl ${
        open ? "w-72 p-5" : "w-20 p-4"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="mb-6 bg-white/10 hover:bg-white/15 border border-white/10 p-3 rounded-2xl transition"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-400/15 p-3 rounded-2xl">
          <Leaf className="text-green-400 min-w-5" />
        </div>
        {open && (
          <div>
            <h1 className="font-bold text-xl leading-tight">EcoLedger AI</h1>
            <p className="text-xs text-gray-400">Carbon Intelligence</p>
          </div>
        )}
      </div>

      {open && (
        <div className="bg-white/8 border border-white/10 rounded-3xl p-4 mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-green-400 text-[#03140f] flex items-center justify-center font-bold uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">
                {user?.companyName || "EcoLedger Workspace"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <NavItem open={open} icon={<BarChart3 size={18} />} text="Dashboard" link="/dashboard" />
        <NavItem open={open} icon={<Upload size={18} />} text="Data Ingestion" link="/ingestion" />
        <NavItem open={open} icon={<Sparkles size={18} />} text="Analytics" link="/analytics" />
        <NavItem open={open} icon={<FileText size={18} />} text="Audit Ledger" link="/audit" />
        <NavItem open={open} icon={<ShieldCheck size={18} />} text="Compliance" link="/compliance" />
        <NavItem open={open} icon={<Settings size={18} />} text="Settings" link="/settings" />
      </div>

      <button
        onClick={handleLogout}
        className={`absolute bottom-5 left-5 right-5 flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition ${
          open ? "justify-start" : "justify-center"
        }`}
      >
        <LogOut size={18} />
        {open && <span>Logout</span>}
      </button>
    </aside>
  );
}

function NavItem({ icon, text, link, open }) {
  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-2xl transition ${
          open ? "justify-start" : "justify-center"
        } ${
          isActive
            ? "bg-green-400 text-[#03140f] font-semibold shadow-[0_0_25px_rgba(74,222,128,0.25)]"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      {open && <span>{text}</span>}
    </NavLink>
  );
}

export default Sidebar;