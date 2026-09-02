import { useNavigate, useLocation } from "react-router-dom";
import { Home, Dumbbell, TrendingUp, User, Info, LogOut, UsersRound } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useUserAuth } from "../context/UserAuthContext";

const navItems = [
  { to: "/user/workout", icon: <Home size={22} />, label: "Home" },
  { to: "/user/exercises", icon: <Dumbbell size={22} />, label: "Exercises" },
  { to: "/user/progress", icon: <TrendingUp size={22} />, label: "Progress" },
  { to: "/user/coaches", icon: <UsersRound size={22} />, label: "Coaches" },
  { to: "/user/about", icon: <Info size={22} />, label: "About" },
  { to: "/user/profile", icon: <User size={22} />, label: "Profile" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useUserAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/user/login");
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex">
      {/* Desktop sidebar (lg and up) — black, matching the gym's brand nav */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-black bg-black">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-orange-500">AveFit</h1>
          <p className="text-xs text-slate-400 mt-0.5">Avenue Power and Fitness Gym</p>
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
                  isActive ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          {user && (
            <div className="px-4 py-2">
              <p className="text-sm font-semibold text-white truncate">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content — white, fills the rest of the screen */}
      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-950 relative">
        {/* Sticky account bar: Logout is always reachable, even on long pages such as Exercise Library. */}
        <div className="sticky top-0 z-40 h-14 shrink-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">AveFit</p>
            <p className="hidden sm:block text-[11px] text-slate-400 truncate">Avenue Power and Fitness Gym</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden"><ThemeToggle /></div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Log out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation (below lg) — black bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-black border-t border-slate-800 flex items-center justify-around px-2 py-3 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive ? "text-orange-500" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
