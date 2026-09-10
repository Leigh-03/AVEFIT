import { Bell, Search, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ThemeToggle from "./ThemeToggle";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/members": "Members",
  "/admin/trainers": "Trainers",
  "/admin/workouts": "Exercises",
  "/admin/workout-plans": "Workout Plans",
  "/admin/nutrition": "Meal Plans",
  "/admin/analytics": "Analytics",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] || "AveFit";
  const admin = JSON.parse(localStorage.getItem("avefit_admin") || "{}");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="ave-topbar sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">{pageTitle}</h2>
      </div>
      <div className="ave-search hidden md:flex items-center border rounded-xl px-3 py-2.5 w-72 lg:w-80">
        <Search size={18} className="text-slate-400" />
        <input type="text" placeholder="Search..." className="bg-transparent outline-none ml-2 w-full text-sm placeholder-slate-500 border-0 focus:ring-0" />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button onClick={() => navigate("/admin/notifications")} className="relative hover:bg-white/10 p-2.5 rounded-xl transition">
          <Bell size={22} className="text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {admin.photo_url ? (
            <img src={admin.photo_url} alt="Admin" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <UserCircle size={32} className="text-slate-400" />
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{admin.name || "Administrator"}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
