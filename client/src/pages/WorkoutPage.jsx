import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, RotateCcw, Dumbbell, X, Moon } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import userApi from "../userApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function AddWorkoutModal({ exercises, workoutDays, onClose, onSave }) {
  const [form, setForm] = useState({ exercise_id: "", sets: "", reps: "", duration_minutes: "", session_date: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.exercise_id) return;
    setSaving(true);
    try {
      await userApi.post("/workouts", form);
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-slate-800 rounded-t-3xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Add Workout</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Exercise *</label>
          <select value={form.exercise_id} onChange={(e) => setForm({ ...form, exercise_id: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm">
            <option value="">Select exercise...</option>
            {exercises.map((e) => (
              <option key={e.exercise_id} value={e.exercise_id}>{e.exercise_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Sets", key: "sets" },
            { label: "Reps", key: "reps" },
            { label: "Duration (min)", key: "duration_minutes" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
              <input type="number" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Day</label>
          <select value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm">
            <option value="">Select day...</option>
            {(workoutDays && workoutDays.length > 0 ? workoutDays : DAYS).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.exercise_id}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold">
            {saving ? "Adding..." : "Add Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  const { user } = useUserAuth();
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]); // days the user picked as their availability
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, exercisesRes, profileRes] = await Promise.all([
        userApi.get("/workouts"),
        userApi.get("/exercises"),
        userApi.get("/profile"),
      ]);
      setSessions(sessionsRes.data.data || []);
      setExercises(exercisesRes.data.data || []);
      const days = profileRes.data.data?.preferred_days || [];
      setWorkoutDays(days);
      if (days.length > 0 && !days.includes(activeDay)) {
        setActiveDay(days[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const isWorkoutDay = (day) => workoutDays.length === 0 || workoutDays.includes(day);

  const handleComplete = async (id) => {
    await userApi.put(`/workouts/${id}/complete`);
    fetchData();
  };

  const handleDelete = async (id) => {
    await userApi.delete(`/workouts/${id}`);
    fetchData();
  };

  const handleReset = async () => {
    if (!confirm("Reset all workouts for this week?")) return;
    await userApi.delete("/workouts/reset/week");
    fetchData();
  };

  const daySessions = sessions.filter((s) => s.session_date === activeDay || s.day_of_week === activeDay);
  const completedCount = sessions.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showModal && (
        <AddWorkoutModal
          exercises={exercises}
          workoutDays={workoutDays}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-blue-900/50 to-slate-950 px-6 pt-12 pb-6">
        <p className="text-slate-400 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-white">{user?.first_name || "Athlete"} 👋</h1>

        {/* Progress bar */}
        <div className="mt-4 bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Weekly Progress</span>
            <span className="text-sm font-bold text-blue-400">{completedCount}/{sessions.length} done</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: sessions.length > 0 ? `${(completedCount / sessions.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {DAYS.map((day) => {
            const hasWorkout = sessions.some((s) => s.session_date === day || s.day_of_week === day);
            const restDay = !isWorkoutDay(day);
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex flex-col items-center px-4 py-3 rounded-2xl text-sm font-medium transition min-w-[60px] ${
                  activeDay === day
                    ? "bg-blue-600 text-white"
                    : restDay
                    ? "bg-slate-900 text-slate-600"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {restDay ? (
                  <Moon size={10} className={`mt-1 ${activeDay === day ? "text-blue-200" : "text-slate-600"}`} />
                ) : hasWorkout ? (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeDay === day ? "bg-white" : "bg-blue-500"}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workout List */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">{activeDay}'s Workouts</h2>
          {isWorkoutDay(activeDay) && (
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">
                <Plus size={14} /> Add
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : !isWorkoutDay(activeDay) ? (
          <div className="text-center py-16">
            <Moon size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-white font-semibold">Rest Day</p>
            <p className="text-slate-500 text-sm mt-1">You didn't set {activeDay} as a workout day — recover and come back stronger.</p>
          </div>
        ) : daySessions.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500">No workouts for {activeDay}</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 text-blue-400 text-sm hover:underline">Add a workout</button>
          </div>
        ) : (
          daySessions.map((session) => (
            <div key={session.session_id}
              className={`bg-slate-800 rounded-2xl p-4 border ${session.completed ? "border-green-500/30" : "border-slate-700"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-semibold ${session.completed ? "text-slate-400 line-through" : "text-white"}`}>
                    {session.exercise_name || "Workout"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{session.muscle_group || ""}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    {session.sets && <span>💪 {session.sets} sets</span>}
                    {session.reps && <span>🔁 {session.reps} reps</span>}
                    {session.duration_minutes && <span>⏱ {session.duration_minutes} min</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!session.completed && (
                    <button onClick={() => handleComplete(session.session_id)}
                      className="p-2 rounded-xl hover:bg-green-500/10 text-green-400 transition">
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(session.session_id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}