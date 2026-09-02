import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, User, ChevronLeft, ChevronRight, Heart, Sparkles, Briefcase, Check } from "lucide-react";
import userApi from "../userApi";

const GOAL_ALIASES = {
  "Weight Loss": ["weight loss", "weight management", "cardio", "conditioning", "hiit", "circuit training", "group fitness"],
  "Muscle Gain": ["muscle", "bodybuilding", "physique", "hypertrophy", "powerlifting", "olympic weightlifting", "kettlebell training", "calisthenics"],
  "Maintain Weight": ["general fitness", "wellness", "maintenance", "functional fitness", "conditioning", "group fitness"],
  "General Fitness": ["general fitness", "fitness", "functional fitness", "group fitness", "conditioning", "hiit", "circuit training"],
};

function expertiseFor(trainer) {
  const items = [...(trainer.specializations || [])];
  if (trainer.goal_specialty && !items.some((i) => i.toLowerCase() === trainer.goal_specialty.toLowerCase())) items.push(trainer.goal_specialty);
  return items.slice(0, 8);
}

function scoreTrainer(trainer, goal) {
  const text = `${(trainer.specializations || []).join(" ")} ${trainer.bio || ""} ${trainer.goal_specialty || ""}`.toLowerCase();
  const aliases = GOAL_ALIASES[goal] || GOAL_ALIASES["General Fitness"];
  let score = trainer.goal_specialty === goal ? 100 : 0;
  aliases.forEach((word) => { if (text.includes(word)) score += 15; });
  return score;
}

export default function CoachSelect() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [goal, setGoal] = useState("General Fitness");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const goalData = JSON.parse(sessionStorage.getItem("avefit_goal") || "{}");
    setGoal(goalData.goal || "General Fitness");
    userApi.get("/trainers")
      .then((res) => setTrainers(res.data.data || []))
      .catch((err) => { console.error(err); setError("Couldn't load coaches right now."); })
      .finally(() => setLoading(false));
  }, []);

  const ranked = useMemo(() => [...trainers].sort((a, b) => {
    const diff = scoreTrainer(b, goal) - scoreTrainer(a, goal);
    return diff || (a.full_name || "").localeCompare(b.full_name || "");
  }), [trainers, goal]);

  const current = ranked[index];
  const recommended = ranked[0];
  const currentScore = current ? scoreTrainer(current, goal) : 0;
  const currentExpertise = current ? expertiseFor(current) : [];

  const move = (delta) => {
    if (!ranked.length) return;
    setDirection(delta);
    setIndex((i) => (i + delta + ranked.length) % ranked.length);
  };

  const handleTouchStart = (e) => setTouchStart(e.touches?.[0]?.clientX ?? null);
  const handleTouchEnd = (e) => {
    if (touchStart == null) return;
    const end = e.changedTouches?.[0]?.clientX;
    const delta = (end ?? touchStart) - touchStart;
    if (Math.abs(delta) > 55) move(delta < 0 ? 1 : -1);
    setTouchStart(null);
  };

  const selectCurrent = () => {
    if (!current) return;
    setSelectedId(current.trainer_id);
    sessionStorage.setItem("avefit_trainer", JSON.stringify(current));
    setError("");
  };

  const handleContinue = () => {
    if (!selectedId) { setError("Please choose a coach to continue."); return; }
    navigate("/user/confirm");
  };

  const handleSkip = () => { sessionStorage.removeItem("avefit_trainer"); navigate("/user/confirm"); };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b0b] text-slate-900 dark:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3,4,5,6].map((step) => <div key={step} className={`flex-1 h-1.5 rounded-full ${step <= 5 ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"}`} />)}
        </div>
        <div className="bg-white dark:bg-[#111] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
          <button onClick={() => navigate("/user/availability")} className="text-slate-500 hover:text-orange-500 text-sm mb-4">← Back</button>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div><h2 className="text-2xl font-bold">Choose Your Coach</h2><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Swipe through available coaches and find the expertise that fits your goal.</p></div>
            <div className="rounded-full bg-orange-500/10 text-orange-500 p-2"><Heart size={18}/></div>
          </div>

          {loading ? <div className="h-[430px] bg-slate-50 dark:bg-slate-900 rounded-3xl animate-pulse mt-6" /> : !ranked.length ? (
            <div className="text-center py-16 text-slate-500 text-sm">No active coaches are available yet.</div>
          ) : (
            <>
              <div className="relative mt-6">
                <button onClick={() => move(-1)} aria-label="Previous coach" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-11 h-11 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-orange-500 transition"><ChevronLeft/></button>
                <button onClick={() => move(1)} aria-label="Next coach" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-11 h-11 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-orange-500 transition"><ChevronRight/></button>
                <div key={current.trainer_id} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className={`overflow-hidden rounded-3xl border-2 ${selectedId === current.trainer_id ? "border-orange-500" : "border-slate-200 dark:border-slate-800"} bg-slate-50 dark:bg-[#171717] shadow-lg`}>
                  <div className="h-56 bg-black flex items-center justify-center overflow-hidden">
                    {current.photo_url ? <img src={current.photo_url} alt={current.full_name} className="w-full h-full object-cover" /> : <User size={82} className="text-orange-500"/>}
                  </div>
                  <div className="p-5">
                    {index === 0 && <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 text-white px-3 py-1 text-xs font-bold mb-3"><Sparkles size={12}/> Best match for {goal}</span>}
                    <h3 className="text-2xl font-bold">{current.full_name}</h3>
                    <p className="text-orange-500 font-semibold mt-1">{(current.specializations || []).join(" • ") || "General Fitness Coach"}</p>
                    {current.bio && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-6">{current.bio}</p>}
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-2">{currentExpertise.map((item) => <span key={item} className="px-3 py-1 rounded-full bg-white dark:bg-black border border-slate-200 dark:border-slate-700 text-xs font-medium">{item}</span>)}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Briefcase size={14}/> Recommended match score: <b className="text-orange-500">{Math.min(100, Math.max(60, currentScore))}%</b></div>
                    <button onClick={selectCurrent} className={`w-full mt-5 py-3 rounded-xl font-bold transition ${selectedId === current.trainer_id ? "bg-black dark:bg-white text-white dark:text-black" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                      {selectedId === current.trainer_id ? <span className="inline-flex items-center gap-2"><Check size={17}/> Selected Coach</span> : "Choose This Coach"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-1.5 mt-4">{ranked.map((t, i) => <button key={t.trainer_id} onClick={() => setIndex(i)} aria-label={`Show ${t.full_name}`} className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-orange-500" : "w-2 bg-slate-300 dark:bg-slate-700"}`} />)}</div>
              <p className="text-center text-xs text-slate-400 mt-2">Coach {index + 1} of {ranked.length}{direction ? " · use the arrows to browse" : " · swipe-style browsing"}</p>
              <div className="mt-5 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-500/5 p-4"><p className="text-xs font-bold text-orange-500 flex items-center gap-2"><Sparkles size={14}/> Our recommendation</p><p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{recommended.full_name} is the strongest match for <b>{goal}</b> based on the coach's listed specialty and expertise.</p></div>
            </>
          )}
          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          <button onClick={handleContinue} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition mt-5">Continue to Confirmation →</button>
          {ranked.length > 0 && <button onClick={handleSkip} className="w-full text-slate-500 hover:text-orange-500 text-xs py-3 transition">Skip for now, assign me a coach later</button>}
        </div>
      </div>
    </div>
  );
}
