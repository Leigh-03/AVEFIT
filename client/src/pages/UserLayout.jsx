import { useNavigate, useLocation } from "react-router-dom";
import { Home, Dumbbell, TrendingUp, User, Info, LogOut, UsersRound } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useUserAuth } from "../context/UserAuthContext";

const navItems = [
  { to: "/user/workout", icon: <Home size={21} />, label: "Home" },
  { to: "/user/exercises", icon: <Dumbbell size={21} />, label: "Exercises" },
  { to: "/user/progress", icon: <TrendingUp size={21} />, label: "Progress" },
  { to: "/user/coaches", icon: <UsersRound size={21} />, label: "Coaches" },
  { to: "/user/about", icon: <Info size={21} />, label: "About" },
  { to: "/user/profile", icon: <User size={21} />, label: "Profile" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useUserAuth();

  const handleLogout = () => { logoutUser(); navigate("/user/login"); };

  return (
    <div className="ave-portal-shell user-portal min-h-screen w-full flex">
      <aside className="ave-sidebar hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r">
        <div className="px-5 py-6 border-b border-inherit flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">A</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ave<span className="text-orange-500">Fit</span></h1>
            <p className="text-[10px] uppercase tracking-wider ave-brand-subtitle mt-0.5 truncate">Avenue Power & Fitness</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button key={item.to} onClick={() => navigate(item.to)} className={`ave-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${isActive ? "active" : ""}`}>
                {item.icon}<span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-inherit">
          {user && <div className="px-4 py-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col relative portal-content">
        <div className="ave-topbar sticky top-0 z-40 h-16 shrink-0 backdrop-blur-xl border-b flex items-center justify-between px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">AveFit</p>
            <p className="hidden sm:block text-[11px] text-slate-500 truncate">Avenue Power and Fitness Gym</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden"><ThemeToggle /></div>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
              <LogOut size={16} /> <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="w-full max-w-6xl mx-auto">{children}</div>
        </div>
      </div>

      <nav className="ave-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl border-t flex items-center justify-around px-2 py-2.5 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return <button key={item.to} onClick={() => navigate(item.to)} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${isActive ? "text-orange-500" : "text-slate-500 dark:text-slate-400 hover:text-orange-500"}`}>
            {item.icon}<span className="text-[11px] font-semibold">{item.label}</span>{isActive && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
          </button>;
        })}
      </nav>
    </div>
  );
}
