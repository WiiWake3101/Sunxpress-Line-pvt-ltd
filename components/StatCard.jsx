import { useState } from "react";
export default function StatCard({ stat: s }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="rounded-2xl p-6 text-center relative overflow-hidden cursor-default"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "linear-gradient(135deg, #1A365D, #2C5282)" : "white", border: hovered ? "none" : "1.5px solid #EDF2F7", boxShadow: hovered ? "0 20px 60px rgba(26,54,93,0.3)" : "0 4px 20px rgba(0,0,0,0.06)", transform: hovered ? "translateY(-6px)" : "translateY(0)", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "rgba(160,233,229,0.12)", transform: "translate(30%,-30%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div className="text-2xl mb-2 relative z-10">{s.icon}</div>
      <p className="text-4xl font-black relative z-10" style={{ color: hovered ? "#A0E9E5" : "#1A365D", fontFamily: "'Georgia', serif", transition: "color 0.3s ease" }}>{s.value}</p>
      <p className="text-xs font-semibold mt-1 relative z-10" style={{ color: hovered ? "rgba(255,255,255,0.55)" : "#718096", transition: "color 0.3s ease" }}>{s.label}</p>
    </div>
  );
}
