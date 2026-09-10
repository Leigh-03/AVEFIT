import {
  Home, Users, BarChart3,
  Settings, LogOut, Bell, UserCheck, Dumbbell, ClipboardList,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const navItems = [
  { to: "/admin/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { to: "/admin/members", icon: <Users size={20} />, label: "Members" },
  { to: "/admin/trainers", icon: <UserCheck size={20} />, label: "Trainers" },
  { to: "/admin/workouts", icon: <Dumbbell size={20} />, label: "Exercises" },
  { to: "/admin/workout-plans", icon: <ClipboardList size={20} />, label: "Workout Plans" },
  { to: "/admin/analytics", icon: <BarChart3 size={20} />, label: "Analytics" },
  { to: "/admin/notifications", icon: <Bell size={20} />, label: "Notifications" },
  { to: "/admin/settings", icon: <Settings size={20} />, label: "Settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("avefit_token");
    localStorage.removeItem("avefit_admin");
    navigate("/login");
  };

  return (
    <aside className="ave-sidebar w-64 flex flex-col h-screen sticky top-0 border-r">
      <div className="px-6 py-7 border-b border-inherit">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">A</div><div><h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ave<span className="text-orange-500">Fit</span></h1><p className="text-[10px] uppercase tracking-[0.18em] ave-brand-subtitle mt-0.5">Admin portal</p></div></div>
      </div>

      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}
              className={`ave-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "active" : ""}`}>
              {item.icon}
              <span className="font-medium flex-1">{item.label}</span>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-inherit">
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 py-2.5 rounded-xl transition font-semibold text-sm">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}