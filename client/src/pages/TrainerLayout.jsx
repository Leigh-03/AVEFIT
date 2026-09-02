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

  const handleLogout = () => {
    logoutTrainer();
    navigate("/trainer/login");
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-800 bg-slate-900">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-orange-400">AveFit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Coach Portal</p>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? "bg-orange-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          {trainer && (
            <div className="px-4 py-2 mb-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-600 overflow-hidden flex items-center justify-center shrink-0">
                {trainer.photo_url ? (
                  <img src={trainer.photo_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{trainer.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{trainer.specializations?.[0] || trainer.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h1 className="text-xl font-bold text-orange-400">AveFit Coach</h1>
            {trainer && <p className="text-xs text-slate-500">{trainer.full_name}</p>}
          </div>
          <div className="flex items-center gap-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={isActive ? "text-orange-400" : "text-slate-400"}
                >
                  {item.icon}
                </button>
              );
            })}
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          <div className="w-full max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
