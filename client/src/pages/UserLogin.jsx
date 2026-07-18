import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useUserAuth();
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first_name: "", last_name: "", email: "", password: "", agreed: false,
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await userApi.post("/login", loginForm);
      loginUser(res.data.user, res.data.token);
      navigate("/user/assessment");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.first_name || !signupForm.last_name || !signupForm.email || !signupForm.password) {
      setError("Please fill in all fields."); return;
    }
    if (!signupForm.agreed) { setError("Please agree to the Terms and Conditions."); return; }
    setLoading(true); setError("");
    try {
      await userApi.post("/register", signupForm);
      setMode("login");
      setError("");
      setLoginForm({ email: signupForm.email, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">

      {/* Left panel — visible on lg+ */}
      <div className="hidden lg:flex w-1/2 xl:w-3/5 flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200')", backgroundSize: "cover" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Dumbbell size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-400">AveFit</h1>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Start Your<br />
            <span className="text-blue-400">Fitness Journey</span><br />
            Today
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-10">
            Personalized workouts, BMI tracking, weight predictions, and
            AI-powered recommendations — all in one app.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { value: "500+", label: "Active Members" },
              { value: "100+", label: "Gym Exercises" },
              { value: "95%", label: "Goal Achievement" },
              { value: "5★", label: "Member Rating" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-6 lg:hidden">
            <h1 className="text-3xl font-bold text-blue-400">AveFit</h1>
            <p className="text-slate-400 mt-1 text-sm">Avenue Power and Fitness Gym</p>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700">
            {/* Toggle */}
            <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition ${
                    mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {mode === "login" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="your@email.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 text-sm"
                    />
                    <button onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={remember}
                      onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                    Remember me
                  </label>
                  <button className="text-blue-400 hover:underline text-xs">Forgot Password?</button>
                </div>
                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl py-2">{error}</p>}
                <button onClick={handleLogin} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "First Name", key: "first_name", placeholder: "Juan" },
                    { label: "Last Name", key: "last_name", placeholder: "dela Cruz" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">{f.label}</label>
                      <input type="text" value={signupForm[f.key]}
                        onChange={(e) => setSignupForm({ ...signupForm, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input type="email" value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 text-sm" />
                    <button onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <label className="flex items-start gap-2 text-slate-400 text-xs cursor-pointer">
                  <input type="checkbox" checked={signupForm.agreed}
                    onChange={(e) => setSignupForm({ ...signupForm, agreed: e.target.checked })}
                    className="rounded mt-0.5" />
                  I agree to the Terms and Conditions of AveFit
                </label>
                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl py-2">{error}</p>}
                <button onClick={handleSignup} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-slate-500 text-sm mt-5">
            <button onClick={() => navigate("/")} className="hover:text-slate-300 transition">
              ← Back to Homepage
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}