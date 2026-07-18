import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", { email, password });
      localStorage.setItem("avefit_token", res.data.token);
      localStorage.setItem("avefit_admin", JSON.stringify(res.data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">

      {/* Left — hero panel */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col justify-center px-12 lg:px-16 xl:px-20">
        <h1 className="text-5xl lg:text-6xl font-bold">AveFit</h1>
        <p className="mt-4 text-xl text-blue-100">Fitness Analytics Platform</p>
        <p className="mt-3 text-blue-200 max-w-sm leading-relaxed">
          Manage members, workouts, nutrition plans, analytics, and personalized
          recommendations from one dashboard.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm">
          {[
            { value: "245", label: "Active Members" },
            { value: "56", label: "Workout Plans" },
            { value: "87%", label: "Completion Rate" },
          ].map((s) => (
            <div key={s.label} className="bg-blue-500 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-blue-200 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 md:hidden">AveFit</h1>
            <h2 className="text-2xl font-bold text-slate-800 mt-2">Admin Login</h2>
            <p className="text-gray-500 text-sm mt-1">Avenue Power and Fitness Gym</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@avefit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="mt-5 text-center">
              <p className="text-slate-400 text-sm">Are you a member?</p>
              <button
                onClick={() => navigate("/")}
                className="text-blue-500 text-sm hover:underline mt-1"
              >
                Go to Member Portal →
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            AveFit — Batangas State University Capstone Project 2026
          </p>
        </div>
      </div>
    </div>
  );
}