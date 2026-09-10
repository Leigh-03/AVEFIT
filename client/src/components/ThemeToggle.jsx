import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light mode" : "Dark mode"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-sm transition hover:bg-orange-50 hover:border-orange-400 dark:border-orange-500/30 dark:bg-[#111] dark:text-orange-400 dark:hover:bg-orange-500/10 ${className}`}
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
