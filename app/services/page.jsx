"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/footer";

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
    <div ref={ref} className={className} style={{
      transitionProperty: "opacity, transform", transitionDuration: "700ms",
      transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)", transitionDelay: `${delay}ms`,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)",
    }}>{children}</div>
  );
}

const services = [
  {
    id: "ocean-freight",
    icon: "🚢",
    title: "Ocean Freight",
    tagline: "Global reach. Local expertise.",
    heroColor: "linear-gradient(135deg, #1A365D, #2C5282)",
    desc: "Our ocean freight service covers Full Container Load (FCL) and Less-than-Container Load (LCL) consolidation and booking across all major global trade lanes. We manage the full lifecycle — booking with vetted vessel operators, documentation, customs, and delivery coordination — so you don't have to.",
    features: [
      "FCL & LCL shipments on all major routes",
      "Real-time cargo tracking & status updates",
      "Bill of Lading and documentation management",
      "Multi-port transhipment coordination",
      "Competitive freight rate negotiation",
      "Consolidation services for small shippers",
    ],
    stats: [{ v: "8+", l: "Ports" }, { v: "6+", l: "Routes" }, { v: "24h", l: "Quote" }],
  },
  {
    id: "bulk-cargo",
    icon: "⚓",
    title: "Bulk Cargo",
    tagline: "Volume handled. Value delivered.",
    heroColor: "linear-gradient(135deg, #2C5282, #319795)",
    desc: "We specialise in consolidating and booking dry bulk commodities including coal, grain, fertilizers, minerals and other loose cargo. Through our partnerships with terminal operators and vessel lines at Tuticorin Port, we coordinate loading, stowage and safe delivery on selected carrier vessels.",
    features: [
      "Dry bulk: coal, grain, fertilizers, minerals",
      "Terminal coordination at Tuticorin Port",
      "Draft survey and cargo inspection liaison",
      "Moisture & contamination monitoring",
      "Fumigation and pre-shipment certification",
      "Vessel booking and appointment coordination",
    ],
    stats: [{ v: "12+", l: "Commodities" }, { v: "25K", l: "Max DWT" }, { v: "48h", l: "Turnaround" }],
  },
  {
    id: "port-logistics",
    icon: "🏭",
    title: "Port Logistics",
    tagline: "Precision at every berth.",
    heroColor: "linear-gradient(135deg, #319795, #437A96)",
    desc: "Our port logistics team coordinates stevedoring, cargo handling, and inter-terminal transfers at Tuticorin Port through trusted partner networks. We know every berth, every regulation and every gate process — keeping your cargo moving without unnecessary delays.",
    features: [
      "Stevedoring coordination with licensed operators",
      "Port agency facilitation and customs liaison",
      "Pre-berthing & post-departure formalities",
      "CFS (Container Freight Station) coordination",
      "Inland container depot (ICD) booking",
      "Last-mile delivery within Tamil Nadu",
    ],
    stats: [{ v: "#1", l: "Tuti Port" }, { v: "365", l: "Days/Year" }, { v: "<4h", l: "Clearance" }],
  },
  {
    id: "customs-clearance",
    icon: "📋",
    title: "Customs Clearance",
    tagline: "Zero delays. Full compliance.",
    heroColor: "linear-gradient(135deg, #437A96, #1A365D)",
    desc: "Navigating Indian customs can be complex. Our licensed customs brokers handle all import and export declarations, duty calculations, DGFT compliance, and port clearance — ensuring your cargo clears without a single avoidable delay.",
    features: [
      "Import & export customs declarations",
      "DGFT licensing and EXIM documentation",
      "Duty drawback and exemption management",
      "GST reconciliation on imports",
      "Bond / warehouse supervision",
      "AEO (Authorised Economic Operator) advisory",
    ],
    stats: [{ v: "0", l: "Avg Delays" }, { v: "100%", l: "Compliance" }, { v: "24h", l: "Clearance" }],
  },
  {
    id: "cargo-insurance",
    icon: "🛡️",
    title: "Cargo Insurance",
    tagline: "Protected from port to port.",
    heroColor: "linear-gradient(135deg, #1A365D, #319795)",
    desc: "Cargo moves across unpredictable environments. Our marine cargo insurance plans cover all-risk, total loss, and specific peril policies underwritten by leading Indian insurers — giving you complete peace of mind from origin to destination.",
    features: [
      "All-risk marine cargo insurance policies",
      "Total loss & specific peril coverage",
      "War, strikes and SRCC endorsements",
      "Claim handling and surveyor coordination",
      "Annual open policy for regular shippers",
      "Certificate of insurance on demand",
    ],
    stats: [{ v: "100%", l: "Coverage" }, { v: "<24h", l: "Certificate" }, { v: "₹∞", l: "Insurable" }],
  },
  {
    id: "container-services",
    icon: "📦",
    title: "Container Services",
    tagline: "Containers on demand. Per-day rentals available.",
    heroColor: "linear-gradient(135deg, #319795, #2C5282)",
    desc: "We provide comprehensive container solutions with flexible per-day leasing options. Through partnerships with container operators and depots at Tuticorin Port, we ensure containers are available when you need them — with transparent daily rates and real-time availability across all container types.",
    features: [
      "Flexible per-day container leasing & rental rates",
      "All container types: 20ft, 40ft, HC, Reefer, Flat Rack, Open Top",
      "Container depot management & instant booking",
      "Equipment interchange documentation (EIR)",
      "Container repair & maintenance coordination",
      "24/7 container availability & real-time tracking",
    ],
    stats: [{ v: "All", l: "Types" }, { v: "Daily", l: "Rates" }, { v: "Tuticorin", l: "Hub" }],
  },
];

export default function ServicesPage() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── HERO (Dark) ───────────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(135deg,#0D1F3C 0%,#1A365D 50%,#2C5282 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(160,233,229,0.10) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]"><defs><pattern id="gr" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0L0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#gr)"/></svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#A0E9E5" }}>— What We Offer</span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mt-4 mb-6" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
              Our Services
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.8" }}>
              Eight core services. One seamless maritime experience — from the first quote to final delivery.
            </p>
          </FadeUp>

          {/* Service pills nav */}
          <FadeUp delay={150}>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {services.map((s) => (
                <a key={s.id} href={`#${s.id}`}
                  className="px-4 py-2 rounded-full text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(160,233,229,0.2)", color: "#A0E9E5" }}
                >
                  {s.icon} {s.title}
                </a>
              ))}
            </div>
          </FadeUp>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none"><path d="M0 60V30C360 0 720 60 1080 30C1260 15 1380 45 1440 30V60H0Z" fill="white"/></svg>
        </div>
      </section>

      {/* ── SERVICE BLOCKS ───────────────────────────── */}
      <div className="bg-white">
        {services.map((s, i) => (
          <section key={s.id} id={s.id} className={`py-24 ${i % 2 !== 0 ? "" : ""}`} style={{ background: i % 2 === 0 ? "white" : "#F8FAFC" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>

                {/* Visual */}
                <FadeUp delay={0} className="flex-1 w-full">
                  <div className="rounded-3xl p-10 relative overflow-hidden" style={{ background: s.heroColor, minHeight: "320px" }}>
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.06)", transform: "translate(30%,-30%)" }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-30%,30%)" }} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="text-6xl mb-6">{s.icon}</div>
                      <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Georgia', serif" }}>{s.title}</h2>
                      <p className="text-sm font-semibold mb-8" style={{ color: "#A0E9E5" }}>{s.tagline}</p>
                      {/* Mini stats */}
                      <div className="flex gap-4 mt-auto">
                        {s.stats.map((st) => (
                          <div key={st.l} className="text-center">
                            <p className="text-xl font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>{st.v}</p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{st.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeUp>

                {/* Text */}
                <FadeUp delay={120} className="flex-1">
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— {s.title}</span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>{s.tagline}</h2>
                  <p className="text-base leading-relaxed mb-7" style={{ color: "#4A5568", lineHeight: "1.9" }}>{s.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {s.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ background: "linear-gradient(135deg,#A0E9E5,#71D5D0)" }}>
                          <svg className="w-3 h-3" fill="none" stroke="#1A365D" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p className="text-sm" style={{ color: "#2D3748" }}>{f}</p>
                      </div>
                    ))}
                  </div>
                  <a href="/contact" className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#437A96,#1A365D)", boxShadow: "0 6px 20px rgba(26,54,93,0.22)" }}>
                    Get a Quote for {s.title} →
                  </a>
                </FadeUp>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#1A365D,#2C5282)" }} className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>Need a custom solution?</h2>
            <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>Our team can design a bespoke logistics plan combining multiple services for your exact cargo needs.</p>
            <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg,#A0E9E5,#71D5D0)", color: "#1A365D" }}>
              Contact Our Team →
            </a>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}