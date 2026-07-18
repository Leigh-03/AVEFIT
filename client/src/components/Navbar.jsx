import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

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

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] || "AveFit";
  const admin = JSON.parse(localStorage.getItem("avefit_admin") || "{}");
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    api.get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 w-full">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 flex-shrink-0"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Center: search (hidden on small, visible md+) */}
      <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 flex-1 max-w-sm">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-2 w-full text-sm"
        />
      </div>

      {/* Right: notification + admin info */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Search size={20} />
        </button>

        <button
          onClick={() => navigate("/admin/notifications")}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Bell size={20} className="text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={28} className="text-slate-500 flex-shrink-0" />
          <div className="hidden sm:block">
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              {admin.name || "Administrator"}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Mobile search bar (drops down) */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 md:hidden z-30">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="bg-transparent outline-none ml-2 w-full text-sm"
            />
          </div>
        </div>
      )}
    </header>
  );
}