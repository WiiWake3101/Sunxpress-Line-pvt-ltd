"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/footer";

// ── Animation hook ──────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "700ms",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Counter animation ────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const num = parseInt(target);
    const duration = 1800;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const timeline = [
  { year: "Dec 2025", title: "Company Incorporated", desc: "Sun Xpress Line Pvt. Ltd. registered under ROC Chennai, Ministry of Corporate Affairs, India." },
  { year: "Q1 2026", title: "Operations Launch", desc: "First shipments processed through Tuticorin Port, establishing relationships with key port authorities." },
  { year: "Q2 2026", title: "Route Expansion", desc: "Extended coverage to 15+ trade routes across the Indian Ocean and Southeast Asian sea lanes." },
  { year: "Q3 2026", title: "Fleet Partnership", desc: "Partnered with leading vessel operators to provide dedicated bulk carrier and container vessel access." },
  { year: "2027", title: "Regional Hub", desc: "Vision: become South India's most trusted maritime logistics company with 50+ active port connections." },
];

const values = [
  { icon: "🎯", title: "Precision", desc: "Every shipment planned to the detail. No guesswork, no shortcuts." },
  { icon: "🤝", title: "Trust", desc: "Relationships built on transparency, fair pricing and honest communication." },
  { icon: "🌊", title: "Resilience", desc: "The sea is unpredictable. Our contingency planning ensures your cargo always arrives." },
  { icon: "🌍", title: "Global Reach", desc: "Local expertise with an international mindset connecting South India to the world." },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── HERO (Light) ─────────────────────────────── */}
      <section className="w-full relative overflow-hidden bg-white pt-24 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(160,233,229,0.12) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(67,122,150,0.07) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <FadeUp>
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— Our Story</span>
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mt-3 mb-6"
                  style={{ fontFamily: "'Georgia', serif", color: "#0D1F3C", letterSpacing: "-0.02em" }}
                >
                  About
                  <br />
                  <span style={{ color: "#437A96" }}>Sun Xpress</span>
                  <br />Line
                </h1>
              </FadeUp>
              <FadeUp delay={120}>
                <p className="text-lg leading-relaxed max-w-lg mb-8" style={{ color: "#4A5568", lineHeight: "1.9" }}>
                  Born in Tuticorin, built for the world. We're a freshly incorporated maritime company with deep port roots and a bold vision for Indian ocean logistics.
                </p>
              </FadeUp>
              <FadeUp delay={200}>
                <div className="flex flex-wrap gap-3">
                  {["ROC Chennai", "Est. Dec 2025", "Tuticorin HQ", "MCA Registered"].map((tag) => (
                    <span key={tag} className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: "#EBF8FF", color: "#2C5282" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Stats card */}
            <FadeUp delay={150} className="flex-1 w-full">
              {(() => {
                const statsData = [
                  { value: "8", suffix: "+", label: "Ports Connected", bg: "linear-gradient(135deg,#1A365D,#2C5282)" },
                  { value: "35", suffix: "+", label: "Shipments", bg: "white", dark: false },
                  { value: "6", suffix: "+", label: "Trade Routes", bg: "white", dark: false },
                ];
                if (statsData.length === 3) {
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {statsData.slice(0, 2).map((s) => (
                          <div key={s.label} className="rounded-2xl p-6 text-center relative overflow-hidden"
                            style={{ background: s.bg, border: !s.bg.includes("gradient") ? "1.5px solid #EDF2F7" : "none", boxShadow: s.bg.includes("gradient") ? "0 16px 40px rgba(26,54,93,0.22)" : "0 4px 16px rgba(0,0,0,0.05)" }}>
                            <p className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif", color: s.bg.includes("gradient") ? "#A0E9E5" : "#1A365D" }}>
                              <Counter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-xs font-semibold mt-1" style={{ color: s.bg.includes("gradient") ? "rgba(255,255,255,0.55)" : "#718096" }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-4">
                        <div style={{ width: "50%" }}>
                          <div className="rounded-2xl p-6 text-center relative overflow-hidden"
                            style={{ background: statsData[2].bg, border: !statsData[2].bg.includes("gradient") ? "1.5px solid #EDF2F7" : "none", boxShadow: statsData[2].bg.includes("gradient") ? "0 16px 40px rgba(26,54,93,0.22)" : "0 4px 16px rgba(0,0,0,0.05)" }}>
                            <p className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif", color: statsData[2].bg.includes("gradient") ? "#A0E9E5" : "#1A365D" }}>
                              <Counter target={statsData[2].value} suffix={statsData[2].suffix} />
                            </p>
                            <p className="text-xs font-semibold mt-1" style={{ color: statsData[2].bg.includes("gradient") ? "rgba(255,255,255,0.55)" : "#718096" }}>{statsData[2].label}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {statsData.map((s) => (
                        <div key={s.label} className="rounded-2xl p-6 text-center relative overflow-hidden"
                          style={{ background: s.bg, border: !s.bg.includes("gradient") ? "1.5px solid #EDF2F7" : "none", boxShadow: s.bg.includes("gradient") ? "0 16px 40px rgba(26,54,93,0.22)" : "0 4px 16px rgba(0,0,0,0.05)" }}>
                          <p className="text-4xl font-black" style={{ fontFamily: "'Georgia', serif", color: s.bg.includes("gradient") ? "#A0E9E5" : "#1A365D" }}>
                            <Counter target={s.value} suffix={s.suffix} />
                          </p>
                          <p className="text-xs font-semibold mt-1" style={{ color: s.bg.includes("gradient") ? "rgba(255,255,255,0.55)" : "#718096" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  );
                }
              })()}
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MISSION BAND ─────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#0D1F3C,#1A365D,#319795)" }} className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: "#A0E9E5" }}>Our Mission</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-4xl mx-auto" style={{ fontFamily: "'Georgia', serif", lineHeight: "1.2" }}>
              "To make maritime logistics from South India
              <span style={{ color: "#A0E9E5" }}> genuinely world-class</span> — accessible, transparent, and reliable for every Indian business."
            </h2>
          </FadeUp>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-14">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— What Drives Us</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>Our Core Values</h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <FadeUp key={v.title} delay={i * 80}>
                <div className="rounded-2xl p-7 h-full group cursor-default"
                  style={{
                    border: "1.5px solid #EDF2F7",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                    transitionProperty: "transform, box-shadow, border-color",
                    transitionDuration: "280ms",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(26,54,93,0.12)"; e.currentTarget.style.borderColor = "#A0E9E5"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#EDF2F7"; }}
                >
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#1A365D" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#718096", lineHeight: "1.7" }}>{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────── */}
      <section className="py-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— Our Journey</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>Company Timeline</h2>
            </div>
          </FadeUp>
          <div className="relative">
            {/* Centre line */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg,#A0E9E5,#2C5282,#1A365D)", transform: "translateX(-50%)" }} />
            <div className="flex flex-col gap-10">
              {timeline.map((t, i) => (
                <FadeUp key={t.year} delay={i * 100}>
                  <div className={`flex items-start gap-6 lg:gap-0 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                    {/* Content */}
                    <div className={`flex-1 pl-14 lg:pl-0 ${i % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                      <div
                        className="inline-block rounded-2xl p-5"
                        style={{
                          background: "white",
                          border: "1.5px solid #EDF2F7",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        }}
                      >
                        <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>{t.year}</span>
                        <h3 className="text-base font-bold mt-1 mb-1.5" style={{ color: "#1A365D" }}>{t.title}</h3>
                        <p className="text-sm" style={{ color: "#718096", lineHeight: "1.6" }}>{t.desc}</p>
                      </div>
                    </div>
                    {/* Dot */}
                    <div className="absolute left-6 lg:left-1/2 flex-shrink-0 w-4 h-4 rounded-full mt-5" style={{ background: "linear-gradient(135deg,#A0E9E5,#319795)", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(49,151,149,0.5)" }} />
                    <div className="flex-1 hidden lg:block" />
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#1A365D,#2C5282)" }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>Ready to work with us?</h2>
            <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>Let's move your cargo. Get a free, no-obligation quote today.</p>
            <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg,#A0E9E5,#71D5D0)", color: "#1A365D" }}>
              Get a Free Quote →
            </a>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}