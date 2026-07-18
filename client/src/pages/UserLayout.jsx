import { useNavigate, useLocation } from "react-router-dom";
import { Home, Dumbbell, TrendingUp, Info, User } from "lucide-react";

const navItems = [
  { to: "/user/workout", icon: <Home size={22} />, label: "Home" },
  { to: "/user/exercises", icon: <Dumbbell size={22} />, label: "Exercises" },
  { to: "/user/progress", icon: <TrendingUp size={22} />, label: "Progress" },
  { to: "/user/about", icon: <Info size={22} />, label: "About" },
  { to: "/user/profile", icon: <User size={22} />, label: "Profile" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col">

      {/* Content — centred on large screens, full width on mobile */}
      <div className="flex-1 w-full pb-20 sm:pb-24">
        <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          {children}
        </div>
      </div>

      {/* Bottom Navigation — full width on mobile, centred card on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-slate-900 border-t border-slate-800 sm:border sm:border-slate-700 sm:rounded-t-2xl sm:mx-auto">
          <div className="flex items-center justify-around px-2 py-2 sm:py-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex flex-col items-center gap-1 px-3 sm:px-5 py-1.5 rounded-xl transition min-w-[52px] ${
                    isActive
                      ? "text-blue-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

    </div>
  );
}