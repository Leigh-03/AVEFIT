import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useUserAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    agreed: false,
  });

  // Send a freshly-logged-in user to their dashboard if setup is done,
  // otherwise start them on the onboarding flow.
  const goToDestination = (user) => {
    navigate(user?.setup_completed ? "/user/workout" : "/user/assessment");
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await userApi.post("/login", loginForm);
      loginUser(res.data.user, res.data.token);
      goToDestination(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.first_name || !signupForm.last_name || !signupForm.email || !signupForm.phone || !signupForm.password) {
      setError("Please fill in all fields."); return;
    }
    if (!signupForm.agreed) { setError("Please agree to the Terms and Conditions."); return; }
    setLoading(true); setError("");
    try {
      const res = await userApi.post("/register", signupForm);
      // Auto-login right after account creation — no need to type credentials twice.
      loginUser(res.data.user, res.data.token);
      goToDestination(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white via-orange-50 to-white flex items-center justify-center p-4">
      <div className="absolute top-5 right-5 z-20"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500">AveFit</h1>
          <p className="text-slate-500 mt-1">Avenue Power and Fitness Gym</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
          {/* Toggle */}
          <div className="flex bg-slate-50 rounded-xl p-1 mb-6">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                  mode === m ? "bg-orange-500 text-white" : "text-slate-500 hover:text-white"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="rounded" />
                  Remember me
                </label>
                <button className="text-orange-500 hover:underline">Forgot Password?</button>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={signupForm.first_name}
                    onChange={(e) => setSignupForm({ ...signupForm, first_name: e.target.value })}
                    placeholder="Juan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={signupForm.last_name}
                    onChange={(e) => setSignupForm({ ...signupForm, last_name: e.target.value })}
                    placeholder="dela Cruz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 text-slate-500 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={signupForm.agreed}
                  onChange={(e) => setSignupForm({ ...signupForm, agreed: e.target.checked })}
                  className="rounded mt-0.5"
                />
                I agree to the Terms and Conditions of AveFit
              </label>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <button onClick={() => navigate("/")} className="hover:text-slate-600 transition">
            ← Back to Homepage
          </button>
        </p>
      </div>
    </div>
  );
}
