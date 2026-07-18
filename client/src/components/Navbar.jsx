import { Bell, Search, UserCircle } from "lucide-react";
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
    <header className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{pageTitle}</h2>
      </div>
      <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-80">
        <Search size={18} className="text-gray-500" />
        <input type="text" placeholder="Search..." className="bg-transparent outline-none ml-2 w-full text-sm" />
      </div>
      <div className="flex items-center gap-6">
        <button onClick={() => navigate("/admin/notifications")} className="relative hover:bg-slate-100 p-2 rounded-lg transition">
          <Bell size={22} className="text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <UserCircle size={32} className="text-slate-500" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{admin.name || "Administrator"}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}