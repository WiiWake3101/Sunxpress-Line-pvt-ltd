import { useState, useEffect } from "react";

const CAROUSEL_IMAGES = [
  { src: "https://images.unsplash.com/photo-1578574494644-30c38b0ecf0f?w=1200&h=750&fit=crop", caption: "Tuticorin Deep-Water Port" },
  { src: "https://images.unsplash.com/photo-1590659481751-4b7dc8b3da9c?w=1200&h=750&fit=crop", caption: "Bulk Cargo Operations" },
  { src: "https://images.unsplash.com/photo-1537998016104-04e4b52a8a9b?w=1200&h=750&fit=crop", caption: "Container Logistics" },
  { src: "https://images.unsplash.com/photo-1578574494644-30c38b0ecf0f?w=1200&h=750&fit=crop", caption: "Indian Ocean Trade Routes" },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => goTo((active + 1) % CAROUSEL_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, [active]);

  function goTo(i) {
    if (animating || i === active) return;
    setAnimating(true);
    setTimeout(() => { setActive(i); setAnimating(false); }, 400);
  }

  return (
    <div className="relative w-full" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))" }}>
      <div className="rounded-2xl overflow-hidden relative" style={{
        aspectRatio: "16/10",
        border: "1px solid rgba(160,233,229,0.25)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}>
        {CAROUSEL_IMAGES.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-all duration-500"
            style={{ opacity: i === active && !animating ? 1 : 0, transform: i === active && !animating ? "scale(1)" : "scale(1.04)" }}>
            <img src={img.src} alt={img.caption} className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.style.background = [
                  "linear-gradient(135deg,#1A365D,#319795)",
                  "linear-gradient(135deg,#2C5282,#437A96)",
                  "linear-gradient(135deg,#319795,#2C5282)",
                  "linear-gradient(135deg,#437A96,#1A365D)",
                ][i];
                const el = document.createElement("div");
                el.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;";
                el.innerHTML = `<div style="font-size:2.5rem">🚢</div><p style="color:rgba(255,255,255,0.7);font-size:0.7rem;text-align:center;padding:0 24px">${img.caption}</p>`;
                e.target.parentNode.appendChild(el);
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
              style={{ background: "linear-gradient(transparent, rgba(13,31,60,0.85))" }}>
              <p className="text-white text-xs font-semibold">{img.caption}</p>
            </div>
          </div>
        ))}
        {/* Arrows */}
        <button onClick={() => goTo((active - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => goTo((active + 1) % CAROUSEL_IMAGES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300"
            style={{ width: i === active ? "20px" : "7px", height: "7px", background: i === active ? "#A0E9E5" : "rgba(160,233,229,0.3)" }} />
        ))}
      </div>
      {/* Live badge */}
      <div className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
        style={{ background: "linear-gradient(135deg, #A0E9E5, #71D5D0)", color: "#1A365D", boxShadow: "0 6px 20px rgba(160,233,229,0.4)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Live Port Operations
      </div>
    </div>
  );
}
