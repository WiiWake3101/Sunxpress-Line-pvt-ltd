"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import HeroCarousel from "../components/HeroCarousel";
import ServiceCard from "../components/ServiceCard";
import StatCard from "../components/StatCard";
import ContainerMarquee from "../components/ContainerMarquee";
import Reveal from "../components/Reveal";
import { useState } from "react";

/* ─── Data ─── */
const services = [
  { icon: "🚢", title: "Ocean Freight",     desc: "FCL & LCL consolidation and booking across global trade lanes with real-time cargo tracking.", accent: "#437A96" },
  { icon: "⚓", title: "Bulk Cargo",        desc: "Consolidating coal, grain, fertilizers and minerals through trusted terminal partners.", accent: "#319795" },
  { icon: "🏭", title: "Port Logistics",    desc: "Coordinating stevedoring, cargo handling and terminal operations at Tuticorin Port.", accent: "#2C5282" },
  { icon: "📋", title: "Customs Clearance", desc: "Hassle-free documentation and brokerage ensuring zero-delay clearance every time.", accent: "#437A96" },
  { icon: "🛡️", title: "Cargo Insurance",  desc: "Comprehensive marine insurance protecting your shipments from origin to destination.", accent: "#319795" },
  { icon: "📦", title: "Container Services", desc: "Container leasing, depot management, and logistics coordination designed for every shipment need.", accent: "#437A96" },
];

const stats = [
  { value: "8+",   label: "Ports Connected", icon: "⚓" },
  { value: "35+",  label: "Shipments",       icon: "📦" },
  { value: "6+",   label: "Trade Routes",    icon: "🗺️" },
];

const shippingPartners = [
  { name: "Maersk",     type: "Global Container",   region: "All Major Routes", color: "#1A365D" },
  { name: "MSC",        type: "Container & General", region: "Worldwide",        color: "#2C5282" },
  { name: "CMA CGM",    type: "Container & RoRo",   region: "Europe, Asia",     color: "#319795" },
  { name: "COSCO",      type: "Bulk & Container",   region: "China Routes",     color: "#437A96" },
];

const whyUs = [
  { num: "01", title: "Tuticorin Expertise", desc: "Deep-rooted port knowledge giving you an operational edge no newcomer can match." },
  { num: "02", title: "Transparent Pricing", desc: "Detailed quotes upfront — no hidden fees, no surprises at the dock." },
  { num: "03", title: "24 / 7 Support",      desc: "Real people, real updates. Our ops team is reachable around the clock." },
  { num: "04", title: "Full Compliance",     desc: "Fully aligned with DGFT, Indian maritime law and international standards." },
];

const majorPorts = [
  "Singapore", "Shanghai", "Rotterdam", "Hamburg", "Dubai",
  "Hong Kong", "Busan", "Port Said", "Los Angeles", "Long Beach",
  "Ningbo", "Antwerp", "Qingdao", "Tokyo", "Bangkok",
  "Kaohsiung", "Tianjin", "Shenzhen", "Jeddah", "Suez",
  "Port Klang", "Colombo", "Dalian", "Mumbai", "Gothenburg",
  "Barcelona", "Gdansk", "Valencia", "Penang", "Chennai",
  "Cochin", "Tuticorin", "Kandla", "Paradip", "Kolkata"
];

export default function Home() {
  const [quoteForm, setQuoteForm] = useState({
    name: "", company: "", email: "", phone: "", service: "", pol: "", pod: "", container: "", cargo: ""
  });
  const [polSearch, setPolSearch] = useState("");
  const [podSearch, setPodSearch] = useState("");
  const [showPolDropdown, setShowPolDropdown] = useState(false);
  const [showPodDropdown, setShowPodDropdown] = useState(false);

  const filteredPorts = (searchTerm) => {
    return majorPorts.filter(port => port.toLowerCase().includes(searchTerm.toLowerCase())).sort();
  };

  const selectPort = (port, type) => {
    if (type === "pol") {
      setQuoteForm((prev) => ({ ...prev, pol: port }));
      setPolSearch("");
      setShowPolDropdown(false);
    } else {
      setQuoteForm((prev) => ({ ...prev, pod: port }));
      setPodSearch("");
      setShowPodDropdown(false);
    }
  };
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />
      <section className="relative w-full overflow-hidden" style={{
        background: "linear-gradient(135deg, #0D1F3C 0%, #1A365D 40%, #2C5282 70%, #319795 100%)",
        minHeight: "100vh",
      }}>
        {/* BG decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ width: "600px", height: "600px", top: "-200px", right: "-150px", background: "radial-gradient(circle, rgba(160,233,229,0.12) 0%, transparent 70%)" }} />
          <div className="absolute rounded-full" style={{ width: "400px", height: "400px", bottom: "-100px", left: "-100px", background: "radial-gradient(circle, rgba(113,213,208,0.10) 0%, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 py-24 lg:py-32">

            {/* ── LEFT: Text + stats ── */}
            <div className="flex-1 text-white pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
                style={{ background: "rgba(160,233,229,0.15)", border: "1px solid rgba(160,233,229,0.3)", color: "#A0E9E5", animation: "fadeSlideDown 0.8s ease both" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#A0E9E5", boxShadow: "0 0 8px #A0E9E5" }} />
                Now Serving Global Trade Routes
              </div>

              <h1 className="font-black leading-none mb-6"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "-0.02em", animation: "fadeSlideUp 0.9s ease 0.1s both" }}>
                Where the Sea
                <br /><span style={{ color: "#A0E9E5" }}>Meets Strategy.</span>
              </h1>

              <p className="text-lg leading-relaxed mb-10 max-w-lg"
                style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.8", animation: "fadeSlideUp 0.9s ease 0.2s both" }}>
                Sun Xpress Line delivers precision maritime logistics from Tuticorin —
                connecting Indian exporters and importers to the world's most vital trade lanes
                with trust, speed, and transparency.
              </p>

              <div className="flex flex-wrap gap-4 mb-14" style={{ animation: "fadeSlideUp 0.9s ease 0.3s both" }}>
                <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all hover:shadow-2xl hover:-translate-y-1"
                  style={{ background: "linear-gradient(135deg, #A0E9E5, #71D5D0)", color: "#1A365D", boxShadow: "0 8px 32px rgba(160,233,229,0.35)" }}>
                  Get a Free Quote
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a href="#services" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                  style={{ border: "1.5px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.06)" }}>
                  Explore Services
                </a>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", animation: "fadeSlideUp 0.9s ease 0.4s both" }}>
                {stats.map((s, i) => (
                  <div key={s.label} className="px-5 py-4 text-center"
                    style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)" }}>
                    <div className="text-xl mb-0.5">{s.icon}</div>
                    <p className="font-black text-xl" style={{ color: "#A0E9E5", fontFamily: "'Georgia', serif" }}>{s.value}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Carousel on top, containers below ── */}
            <div className="flex-1 w-full flex flex-col gap-5" style={{ animation: "fadeSlideLeft 1s ease 0.3s both" }}>
              {/* Image Carousel */}
              <HeroCarousel />
            </div>

          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 80V40C240 0 480 80 720 40C960 0 1200 80 1440 40V80H0Z" fill="#0D1F3C"/>
          </svg>
        </div>
      </section>

      <section style={{ background: "#0D1F3C", borderBottom: "1px solid rgba(160,233,229,0.08)", padding: "2.5rem 0 1.5rem" }}>
        <ContainerMarquee />
      </section>

      <section id="services" className="w-full py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <Reveal direction="left">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— What We Do</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>Core Services</h2>
            </Reveal>
            <Reveal direction="right">
              <p className="text-base max-w-sm" style={{ color: "#718096", lineHeight: "1.8" }}>End-to-end maritime solutions built for reliability, speed, and full transparency at every step.</p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} direction="up"><ServiceCard service={s} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*  ABOUT  */}
      <section id="about" className="w-full py-28 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <Reveal direction="left" className="flex-1">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— Who We Are</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3 mb-6" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
                Built From<br /><span style={{ color: "#437A96" }}>Tuticorin's Shore</span>
              </h2>
              <p className="text-base leading-relaxed mb-5" style={{ color: "#4A5568", lineHeight: "1.9" }}>
                Sun Xpress Line Private Limited was born in December 2025 with one bold vision — to make
                maritime logistics from South India's most important port genuinely world-class.
              </p>
              <p className="text-base leading-relaxed mb-10" style={{ color: "#4A5568", lineHeight: "1.9" }}>
                Registered under the Registrar of Companies in Chennai, we operate from the heart of
                Tuticorin — giving our clients an unmatched home-ground advantage on every shipment.
              </p>
              <div className="flex flex-col gap-3">
                {["Private Limited Company · ROC Chennai","Tuticorin HQ — India's Southern Deep-Water Port","Indian Ocean & Global Trade Route Specialists","DGFT & International Maritime Law Compliant"].map((item, i) => (
                  <Reveal key={item} delay={i * 80} direction="left">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A0E9E5, #71D5D0)" }}>
                        <svg className="w-3 h-3" fill="none" stroke="#1A365D" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "#2D3748" }}>{item}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
            <Reveal direction="right" className="flex-1 w-full">
              {stats.length === 3 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.slice(0, 2).map((s) => <StatCard key={s.label} stat={s} />)}
                  </div>
                  <div className="flex justify-center mt-4">
                    <div style={{ width: "50%" }}>
                      <StatCard stat={stats[2]} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((s) => <StatCard key={s.label} stat={s} />)}
                </div>
              )}
              <div className="mt-4 rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #EBF8FF, #E6FFFA)", border: "1.5px solid #BEE3F8" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "white" }}>🏛️</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A365D" }}>Registered under MCA, India</p>
                  <p className="text-xs" style={{ color: "#437A96" }}>Ministry of Corporate Affairs · CIN issued Dec 19, 2025</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/*  WHY US  */}
      <section className="w-full py-28 relative overflow-hidden" style={{ background: "#0D1F3C" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(49,151,149,0.12) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#71D5D0" }}>— Why Choose Us</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3 text-white" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
                The Sun Xpress<br /><span style={{ color: "#A0E9E5" }}>Difference</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map((w, i) => (
              <Reveal key={w.num} delay={i * 100} direction="up">
                <div className="rounded-2xl p-7 relative overflow-hidden group h-full transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(160,233,229,0.12)" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(49,151,149,0.08), transparent)" }} />
                  <p className="text-6xl font-black mb-4 leading-none relative z-10" style={{ color: "rgba(160,233,229,0.12)", fontFamily: "'Georgia', serif" }}>{w.num}</p>
                  <h3 className="text-base font-bold text-white mb-2 relative z-10">{w.title}</h3>
                  <p className="text-sm relative z-10" style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.7" }}>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*  SHIPPING PARTNERS  */}
      <section id="fleet" className="w-full py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <Reveal direction="left">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— Our Partners</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>Industry-Leading<br />Shipping Lines</h2>
            </Reveal>
            <Reveal direction="right">
              <p className="text-base max-w-xs" style={{ color: "#718096", lineHeight: "1.8" }}>We partner with the world's top carriers to deliver containerized cargo, breakbulk, and specialized shipments globally.</p>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {shippingPartners.map((p, i) => (
              <Reveal key={p.name} delay={i * 100} direction="up">
                <div className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ border: "1.5px solid #EDF2F7", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div className="h-36 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}CC)` }}>
                    <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)" }} />
                    <svg className="w-20 h-20 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 80 80" fill="none">
                      <rect x="10" y="45" width="60" height="12" rx="2" fill="rgba(255,255,255,0.25)"/>
                      <rect x="18" y="30" width="44" height="16" rx="2" fill="rgba(255,255,255,0.2)"/>
                      <rect x="26" y="20" width="28" height="11" rx="2" fill="rgba(255,255,255,0.18)"/>
                      <rect x="5"  y="57" width="70" height="6"  rx="2" fill="rgba(255,255,255,0.15)"/>
                      <path d="M5 63 Q40 70 75 63" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="p-5 bg-white">
                    <span className="text-xs font-black tracking-widest uppercase" style={{ color: p.color }}>{p.type}</span>
                    <h3 className="text-base font-bold mt-1 mb-2" style={{ color: "#1A365D" }}>{p.name}</h3>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#F0F4F8", color: "#4A5568" }}>🌍 {p.region}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*  CONTACT  */}
      <section id="contact" className="w-full py-28" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#319795" }}>— Get in Touch</span>
              <h2 className="text-4xl sm:text-5xl font-black mt-3" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>Ready to Ship?</h2>
              <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "#718096", lineHeight: "1.8" }}>Tell us about your cargo. We'll put together a competitive quote within 24 hours.</p>
            </div>
          </Reveal>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <Reveal direction="left" className="lg:w-80 flex-shrink-0 flex flex-col gap-4 w-full">
              {[
                { icon: "📍", label: "Address", value: "3/118H Main Road, Shanmugapuram Ayyanadaiap, Korampollam, Tuticorin – 628101" },
                { icon: "✉️", label: "Email",   value: "admin@sunxp.in" },
                { icon: "📞", label: "Phone",   value: "+91 87544 00780" },
                { icon: "🕒", label: "Hours",   value: "Mon – Sat, 9 AM – 6 PM IST" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: "white", border: "1.5px solid #EDF2F7", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{c.icon}</span>
                  <div>
                    <p className="text-xs font-black tracking-widest uppercase mb-0.5" style={{ color: "#A0AEC0" }}>{c.label}</p>
                    <p className="text-sm font-medium" style={{ color: "#2D3748" }}>{c.value}</p>
                  </div>
                </div>
              ))}
            </Reveal>
            <Reveal direction="right" className="flex-1 w-full">
              <div className="rounded-3xl p-8 lg:p-10" style={{ background: "white", border: "1.5px solid #EDF2F7", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
                <h3 className="text-xl font-black mb-7" style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif" }}>Request a Quote</h3>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[{ id: "name", label: "Full Name", placeholder: "John Smith" }, { id: "company", label: "Company", placeholder: "Your Company Ltd." }].map((f) => (
                      <div key={f.id}>
                        <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>{f.label}</label>
                        <input type="text" value={quoteForm[f.id]} onChange={(e) => setQuoteForm((prev) => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                          style={{ border: "1.5px solid #E2E8F0", color: "#2D3748", background: "#FAFBFC" }}
                          onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                          onBlur={(e)  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[{ id: "email", label: "Email", placeholder: "you@company.com", type: "email" }, { id: "phone", label: "Phone", placeholder: "+91 XXXXX XXXXX", type: "tel" }].map((f) => (
                      <div key={f.id}>
                        <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>{f.label}</label>
                        <input type={f.type} value={quoteForm[f.id]} onChange={(e) => setQuoteForm((prev) => ({ ...prev, [f.id]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none transition-all"
                          style={{ border: "1.5px solid #E2E8F0", color: "#2D3748", background: "#FAFBFC" }}
                          onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                          onBlur={(e)  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>Service Required</label>
                    <div style={{ position: "relative" }}>
                      <select value={quoteForm.service} onChange={(e) => setQuoteForm((prev) => ({ ...prev, service: e.target.value }))} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none appearance-none" style={{ border: "1.5px solid #E2E8F0", color: quoteForm.service ? "#2D3748" : "#A0AEC0", background: "#FAFBFC", paddingRight: "32px", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23A0AEC0\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "24px" }}>
                        <option value="">Select a service…</option>
                        {services.map((s) => <option key={s.title}>{s.title}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* POL + POD + Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>Port of Loading</label>
                      <div style={{ position: "relative" }}>
                        <select value={quoteForm.pol} onChange={(e) => setQuoteForm((prev) => ({ ...prev, pol: e.target.value }))} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none appearance-none" style={{ border: "1.5px solid #E2E8F0", color: quoteForm.pol ? "#2D3748" : "#A0AEC0", background: "#FAFBFC", paddingRight: "32px", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23A0AEC0\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "24px" }}>
                          <option value="">Select port…</option>
                          {majorPorts.map((port) => <option key={port} value={port}>{port}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>Port of Discharge</label>
                      <div style={{ position: "relative" }}>
                        <select value={quoteForm.pod} onChange={(e) => setQuoteForm((prev) => ({ ...prev, pod: e.target.value }))} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none appearance-none" style={{ border: "1.5px solid #E2E8F0", color: quoteForm.pod ? "#2D3748" : "#A0AEC0", background: "#FAFBFC", paddingRight: "32px", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23A0AEC0\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "24px" }}>
                          <option value="">Select port…</option>
                          {majorPorts.map((port) => <option key={port} value={port}>{port}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>Container Type</label>
                      <div style={{ position: "relative" }}>
                        <select value={quoteForm.container} onChange={(e) => setQuoteForm((prev) => ({ ...prev, container: e.target.value }))} className="w-full px-4 py-3.5 text-sm rounded-xl outline-none appearance-none" style={{ border: "1.5px solid #E2E8F0", color: quoteForm.container ? "#2D3748" : "#A0AEC0", background: "#FAFBFC", paddingRight: "32px", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23A0AEC0\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "24px" }}>
                          <option value="">Select container…</option>
                          <option value="20ft Standard">20ft Standard</option>
                          <option value="40ft Standard">40ft Standard</option>
                          <option value="40ft High Cube">40ft High Cube</option>
                          <option value="45ft High Cube">45ft High Cube</option>
                          <option value="Reefer">Reefer</option>
                          <option value="Flat Rack">Flat Rack</option>
                          <option value="Open Top">Open Top</option>
                          <option value="Bulk/Tank">Bulk/Tank</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wide" style={{ color: "#4A5568" }}>Cargo Details</label>
                    <textarea rows={4} value={quoteForm.cargo} onChange={(e) => setQuoteForm((prev) => ({ ...prev, cargo: e.target.value }))} placeholder="Describe your cargo, weight, and any special requirements…"
                      className="w-full px-4 py-3.5 text-sm rounded-xl outline-none resize-none transition-all"
                      style={{ border: "1.5px solid #E2E8F0", color: "#2D3748", background: "#FAFBFC" }}
                      onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                      onBlur={(e)  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <button type="button" className="w-full py-4 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-px hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", boxShadow: "0 8px 32px rgba(26,54,93,0.28)", letterSpacing: "0.03em" }}>
                    Send Request →
                  </button>
                  <p className="text-center text-xs" style={{ color: "#A0AEC0" }}>We respond within 24 hours · No obligation</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes sxplMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}