import { useState } from "react";
export default function ServiceCard({ service: s, id }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div id={id} className="relative rounded-2xl p-7 overflow-hidden cursor-pointer h-full scroll-mt-24"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "linear-gradient(135deg, #1A365D, #2C5282)" : "white", border: hovered ? "none" : "1.5px solid #EDF2F7", boxShadow: hovered ? "0 20px 60px rgba(26,54,93,0.3)" : "0 2px 16px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-6px)" : "translateY(0)", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(160,233,229,0.1)", transform: "translate(30%,-30%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div className="text-3xl mb-5">{s.icon}</div>
      <h3 className="text-base font-bold mb-2" style={{ color: hovered ? "white" : "#1A365D", transition: "color 0.3s ease" }}>{s.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: hovered ? "rgba(255,255,255,0.65)" : "#718096", lineHeight: "1.7", transition: "color 0.3s ease" }}>{s.desc}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: hovered ? "#A0E9E5" : s.accent, transition: "color 0.3s ease" }}>
        Learn more
        <svg className="w-3.5 h-3.5" style={{ transform: hovered ? "translateX(4px)" : "translateX(0)", transition: "transform 0.3s ease" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
}
