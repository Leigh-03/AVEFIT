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
      navigate("/admin/dashboard"); // ← fixed redirect
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col justify-center px-16">
        <h1 className="text-6xl font-bold">AveFit</h1>
        <p className="mt-6 text-xl text-blue-100">Fitness Analytics Web Application</p>
        <p className="mt-4 text-blue-200">
          Manage members, workouts, nutrition plans, analytics, and personalized
          recommendations from one dashboard.
        </p>
        <div className="mt-10 flex gap-4">
          <div className="bg-blue-500 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">245</p>
            <p className="text-blue-200 text-sm">Active Members</p>
          </div>
          <div className="bg-blue-500 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">56</p>
            <p className="text-blue-200 text-sm">Workout Plans</p>
          </div>
          <div className="bg-blue-500 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">87%</p>
            <p className="text-blue-200 text-sm">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 md:hidden">AveFit</h1>
            <h2 className="text-2xl font-bold text-slate-800 mt-2">Admin Login</h2>
            <p className="text-gray-500 text-sm mt-1">Avenue Power and Fitness Gym</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" placeholder="admin@avefit.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">Are you a member?</p>
            <button onClick={() => navigate("/")}
              className="text-blue-500 text-sm hover:underline mt-1">
              Go to Member Portal →
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            AveFit — Batangas State University Capstone Project 2026
          </p>
        </div>
      </div>
    </div>
  );
}