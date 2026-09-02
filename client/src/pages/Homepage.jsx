import { useNavigate } from "react-router-dom";
import { Dumbbell, TrendingUp, Users, Award } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50 to-white" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600')", backgroundSize: "cover", backgroundPosition: "center" }} />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <h1 className="text-3xl font-bold text-orange-500">AveFit</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
            onClick={() => navigate("/user/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition"
          >
            Login
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6 text-orange-500 text-sm">
            <Dumbbell size={16} />
            Avenue Power and Fitness Gym
          </div>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Fitness
            <span className="text-orange-500"> Journey</span>
            <br />Starts Here
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mb-10">
            Personalized workout plans, BMI tracking, weight predictions, and AI-powered
            fitness recommendations tailored specifically for you.
          </p>
          <button
            onClick={() => navigate("/user/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-10 py-4 rounded-2xl transition transform hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            Join Us →
          </button>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 px-8 pb-16 max-w-4xl mx-auto w-full">
          {[
            { icon: <Users size={24} />, value: "500+", label: "Active Members" },
            { icon: <Dumbbell size={24} />, value: "100+", label: "Workout Plans" },
            { icon: <TrendingUp size={24} />, value: "95%", label: "Goal Achievement" },
            { icon: <Award size={24} />, value: "5★", label: "Member Rating" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 text-center">
              <div className="text-orange-500 flex justify-center mb-2">{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-8 bg-slate-100">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Everything You Need</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🏋️", title: "Personalized Workouts", desc: "Custom weekly plans based on your goals, experience, and available time." },
              { icon: "📊", title: "Progress Tracking", desc: "Monitor your BMI, weight, and body measurements with visual charts." },
              { icon: "🤖", title: "AI Weight Prediction", desc: "Predict when you'll reach your goal weight using smart analytics." },
              { icon: "💪", title: "Exercise Library", desc: "Browse hundreds of exercises filtered by muscle group and difficulty." },
              { icon: "🔔", title: "Smart Notifications", desc: "Get reminders and updates about your workout schedule and progress." },
              { icon: "🥗", title: "Nutrition Guidance", desc: "Personalized meal plans aligned with your fitness goals." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-500/50 transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-8 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Transform?</h3>
        <p className="text-slate-500 mb-8">Join Avenue Power and Fitness Gym today.</p>
        <button
          onClick={() => navigate("/user/login")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-2xl transition"
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        AveFit © 2026 — Batangas State University Capstone Project
      </div>
    </div>
  );
}