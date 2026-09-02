import { useEffect, useMemo, useState } from "react";
import { Briefcase, ChevronLeft, ChevronRight, Sparkles, User } from "lucide-react";
import userApi from "../userApi";

const aliases = {
  "Weight Loss": ["weight loss", "weight management", "hiit", "circuit training", "group fitness", "conditioning"],
  "Muscle Gain": ["muscle", "bodybuilding", "physique", "powerlifting", "olympic weightlifting", "kettlebell training", "calisthenics"],
  "Maintain Weight": ["wellness", "maintenance", "functional fitness", "group fitness", "conditioning"],
  "General Fitness": ["general fitness", "fitness", "functional fitness", "group fitness", "hiit", "circuit training", "conditioning"],
};
function score(t, goal) { const text=`${(t.specializations||[]).join(" ")} ${t.bio||""} ${t.goal_specialty||""}`.toLowerCase(); return (t.goal_specialty===goal?100:0)+(aliases[goal]||aliases["General Fitness"]).reduce((n,w)=>n+(text.includes(w)?15:0),0); }
function expertise(t){ return [...new Set([...(t.specializations||[]), t.goal_specialty].filter(Boolean))].slice(0,8); }

export default function Coaches(){
 const [coaches,setCoaches]=useState([]),[loading,setLoading]=useState(true),[i,setI]=useState(0),[touch,setTouch]=useState(null);
 const swipeStart=(e)=>setTouch(e.touches?.[0]?.clientX??null); const swipeEnd=(e)=>{if(touch==null)return; const d=(e.changedTouches?.[0]?.clientX??touch)-touch; if(Math.abs(d)>55)setI((n)=>(n+(d<0?1:-1)+ranked.length)%ranked.length); setTouch(null);};
 const user=JSON.parse(localStorage.getItem("avefit_user")||"null");
 const [goal,setGoal]=useState(user?.fitness_goal||"General Fitness");
 useEffect(()=>{
   Promise.all([
     userApi.get("/trainers"),
     user?.fitness_goal ? Promise.resolve(null) : userApi.get("/profile")
   ])
     .then(([trainerRes, profileRes])=>{
       setCoaches(trainerRes.data.data||[]);
       const profile=profileRes?.data?.data||profileRes?.data?.user||profileRes?.data;
       if(profile?.fitness_goal) setGoal(profile.fitness_goal);
     })
     .catch((err)=>{ console.error("Failed to load coaches:", err); })
     .finally(()=>setLoading(false));
 },[]);
 const ranked=useMemo(()=>[...coaches].sort((a,b)=>score(b,goal)-score(a,goal)),[coaches,goal]); const t=ranked[i];
 return <div className="p-6 sm:p-8"><div className="mb-7"><p className="text-orange-500 text-xs font-bold uppercase tracking-widest">AveFit Coaches</p><h1 className="text-3xl font-bold mt-1">Find your coach</h1><p className="text-slate-500 dark:text-slate-400 mt-2">Browse coach profiles and see who specializes in your goal: <b>{goal}</b>.</p></div>
 {loading?<div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse"/>:!t?<div className="text-slate-500">No active coaches are available.</div>:<div className="max-w-xl mx-auto relative"><button onClick={()=>setI((i-1+ranked.length)%ranked.length)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-orange-500"><ChevronLeft/></button><button onClick={()=>setI((i+1)%ranked.length)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-orange-500"><ChevronRight/></button>
 <div onTouchStart={swipeStart} onTouchEnd={swipeEnd} className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] shadow-xl"><div className="h-64 bg-black flex items-center justify-center overflow-hidden">{t.photo_url?<img src={t.photo_url} alt={t.full_name} className="w-full h-full object-cover"/>:<User size={88} className="text-orange-500"/>}</div><div className="p-6">{i===0&&<span className="inline-flex items-center gap-1 bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold"><Sparkles size={12}/> Recommended for you</span>}<h2 className="text-2xl font-bold mt-3">{t.full_name}</h2><p className="text-orange-500 font-semibold">{(t.specializations||[]).join(" • ") || "General Fitness Coach"}</p>{t.bio&&<p className="text-slate-500 dark:text-slate-400 mt-4 leading-6">{t.bio}</p>}<div className="mt-5"><p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Expertise</p><div className="flex flex-wrap gap-2">{expertise(t).map(x=><span key={x} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-xs font-medium">{x}</span>)}</div></div><div className="mt-5 flex gap-2 items-center text-sm text-slate-500 dark:text-slate-400"><Briefcase size={15}/> {score(t,goal)>=100?`Strong match for ${goal}`:"Good all-around match"}</div></div></div><div className="flex justify-center gap-2 mt-4">{ranked.map((x,n)=><button key={x.trainer_id} onClick={()=>setI(n)} className={`h-2 rounded-full ${n===i?"w-7 bg-orange-500":"w-2 bg-slate-300 dark:bg-slate-700"}`}/>)}</div><p className="text-center text-xs text-slate-400 mt-2">Coach {i+1} of {ranked.length}</p></div>}
 </div>
}
