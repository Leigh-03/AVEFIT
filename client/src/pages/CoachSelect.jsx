import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, User } from "lucide-react";
import userApi from "../userApi";

export default function CoachSelect() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [goal, setGoal] = useState("General Fitness");

  useEffect(() => {
    const goalData = JSON.parse(sessionStorage.getItem("avefit_goal") || "{}");
    setGoal(goalData.goal || "General Fitness");

    userApi.get("/trainers")
      .then((res) => setTrainers(res.data.data || []))
      .catch((err) => {
        console.error(err);
        setError("Couldn't load coaches right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const recommendedId = (() => {
    const match = trainers.find((t) => t.goal_specialty === goal);
    return match ? match.trainer_id : null;
  })();

  // Recommended coach shown first.
  const sortedTrainers = [...trainers].sort((a, b) => {
    if (a.trainer_id === recommendedId) return -1;
    if (b.trainer_id === recommendedId) return 1;
    return (a.full_name || "").localeCompare(b.full_name || "");
  });

  const handleContinue = () => {
    if (!selectedId) {
      setError("Please choose a coach to continue.");
      return;
    }
    const trainer = trainers.find((t) => t.trainer_id === selectedId);
    sessionStorage.setItem("avefit_trainer", JSON.stringify(trainer || { trainer_id: selectedId }));
    navigate("/user/confirm");
  };

  const handleSkip = () => {
    sessionStorage.removeItem("avefit_trainer");
    navigate("/user/confirm");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`flex-1 h-1.5 rounded-full ${step <= 5 ? "bg-orange-500" : "bg-slate-100"}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
          <button onClick={() => navigate("/user/availability")} className="text-slate-500 hover:text-slate-900 text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Choose Your Coach</h2>
          <p className="text-slate-500 text-sm mb-6">Pick a trainer to guide your program. We've highlighted the best fit for your goal.</p>

          {loading ? (
            <div className="space-y-3 mb-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : sortedTrainers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm mb-6">
              No coaches available yet — you can still continue and get matched later.
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {sortedTrainers.map((t) => {
                const isRecommended = t.trainer_id === recommendedId;
                const isSelected = selectedId === t.trainer_id;
                return (
                  <button
                    key={t.trainer_id}
                    onClick={() => { setSelectedId(t.trainer_id); setError(""); }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition flex gap-4 items-center ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/10"
                        : isRecommended
                        ? "border-amber-500/60 bg-amber-500/5 hover:border-amber-400"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-1">
                          <Star size={12} className="fill-amber-400" /> Recommended for {goal}
                        </span>
                      )}
                      <p className="font-semibold text-slate-900 truncate">{t.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.specialization || "General Fitness Coach"}</p>
                      {t.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.bio}</p>}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

          <button
            onClick={handleContinue}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition mb-2"
          >
            Continue to Confirmation →
          </button>
          {sortedTrainers.length > 0 && (
            <button onClick={handleSkip} className="w-full text-slate-500 hover:text-slate-600 text-xs py-2 transition">
              Skip for now, assign me a coach later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
