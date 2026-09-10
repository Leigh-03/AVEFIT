import { useNavigate, useLocation } from "react-router-dom";
import { Users, User, LogOut } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useTrainerAuth } from "../context/TrainerAuthContext";

const navItems = [
  { to: "/trainer/roster", icon: <Users size={20} />, label: "My Roster" },
  { to: "/trainer/profile", icon: <User size={20} />, label: "My Profile" },
];

export default function TrainerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { trainer, logoutTrainer } = useTrainerAuth();
  const handleLogout = () => { logoutTrainer(); navigate("/trainer/login"); };

  return (
    <div className="ave-portal-shell trainer-portal min-h-screen w-full flex">
      <aside className="ave-sidebar hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r">
        <div className="px-5 py-6 border-b border-inherit flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">A</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ave<span className="text-orange-500">Fit</span></h1>
            <p className="text-[10px] uppercase tracking-wider ave-brand-subtitle mt-0.5">Coach portal</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return <button key={item.to} onClick={() => navigate(item.to)} className={`ave-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${isActive ? "active" : ""}`}>{item.icon}{item.label}</button>;
          })}
        </nav>
        <div className="px-3 py-4 border-t border-inherit">
          {trainer && <div className="px-4 py-2 mb-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 overflow-hidden flex items-center justify-center shrink-0">
              {trainer.photo_url ? <img src={trainer.photo_url} alt={trainer.full_name} className="w-full h-full object-cover" /> : <User size={18} className="text-white" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{trainer.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{trainer.specializations?.[0] || trainer.email}</p>
            </div>
          </div>}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition"><LogOut size={20} /> Log Out</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col portal-content">
        <div className="ave-topbar lg:hidden flex items-center justify-between px-4 py-4 border-b">
          <div><h1 className="text-xl font-black text-slate-900 dark:text-white">Ave<span className="text-orange-500">Fit</span> Coach</h1>{trainer && <p className="text-xs text-slate-500">{trainer.full_name}</p>}</div>
          <div className="flex items-center gap-3"><ThemeToggle />{navItems.map((item) => { const isActive = location.pathname === item.to; return <button key={item.to} onClick={() => navigate(item.to)} className={isActive ? "text-orange-500" : "text-slate-500 dark:text-slate-400"}>{item.icon}</button>; })}<button onClick={handleLogout} className="text-slate-500 dark:text-slate-400 hover:text-red-500"><LogOut size={20} /></button></div>
        </div>
        <div className="flex-1 overflow-y-auto pb-8"><div className="w-full max-w-5xl mx-auto">{children}</div></div>
      </div>
    </div>
  );
}
