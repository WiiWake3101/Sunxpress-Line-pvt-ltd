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

const containerRates = [
  { type: "20ft Standard", capacity: "24 CBM", weight: "18,000 kg", dailyRate: "₹2,500", fclRate: "₹18,000", color: "#1A365D" },
  { type: "40ft Standard", capacity: "67 CBM", weight: "27,000 kg", dailyRate: "₹4,200", fclRate: "₹28,000", color: "#2C5282" },
  { type: "40ft High Cube", capacity: "76 CBM", weight: "27,500 kg", dailyRate: "₹4,800", fclRate: "₹32,000", color: "#319795" },
  { type: "45ft High Cube", capacity: "86 CBM", weight: "29,000 kg", dailyRate: "₹5,500", fclRate: "₹36,500", color: "#437A96" },
  { type: "Reefer 20ft", capacity: "24 CBM", weight: "18,500 kg", dailyRate: "₹3,800", fclRate: "₹26,000", color: "#1A365D" },
  { type: "Reefer 40ft", capacity: "67 CBM", weight: "28,000 kg", dailyRate: "₹6,500", fclRate: "₹44,000", color: "#2C5282" },
  { type: "Flat Rack 20ft", capacity: "18 CBM", weight: "16,000 kg", dailyRate: "₹2,200", fclRate: "₹15,000", color: "#319795" },
  { type: "Open Top 20ft", capacity: "24 CBM", weight: "17,500 kg", dailyRate: "₹2,800", fclRate: "₹19,500", color: "#437A96" },
];

export default function RatesPage() {
  const [selectedType, setSelectedType] = useState(null);

  const getContainerDetails = (type) => {
    return containerRates.find((c) => c.type === type);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 px-4"
        style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #1A365D 50%, #2C5282 100%)" }}
      >
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: "#A0E9E5" }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-10" style={{ background: "#71D5D0" }} />

        <div className="relative max-w-7xl mx-auto text-center">
          <FadeUp>
            <span className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: "#A0E9E5" }}>— Transparent Pricing</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
              Live Container Rates
            </h1>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
              Real-time daily leasing rates and FCL pricing updated continuously. All rates are per day for container leasing or per shipment for FCL bookings.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #A0E9E5 0%, #319795 50%, #2C5282 100%)" }} />

      {/* ── RATES SECTION ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {containerRates.map((rate, i) => (
                <FadeUp key={rate.type} delay={i * 80}>
                  <div
                    onClick={() => setSelectedType(selectedType === rate.type ? null : rate.type)}
                    className="rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      background: "white",
                      border: selectedType === rate.type ? `2.5px solid ${rate.color}` : "1.5px solid #EDF2F7",
                      boxShadow: selectedType === rate.type ? `0 12px 32px ${rate.color}22` : "0 4px 16px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 rounded-full" style={{ background: rate.color }} />
                      <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>
                        {rate.type}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4 text-xs" style={{ color: "#718096" }}>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold">{rate.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Weight:</span>
                        <span className="font-semibold">{rate.weight}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div>
                        <p className="text-xs" style={{ color: "#A0AEC0" }}>Daily Lease Rate</p>
                        <p className="text-2xl font-black" style={{ color: rate.color }}>{rate.dailyRate}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "#A0AEC0" }}>FCL Rate</p>
                        <p className="text-lg font-bold" style={{ color: "#2D3748" }}>{rate.fclRate}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedType(rate.type)}
                      className="w-full mt-4 py-2.5 text-xs font-bold rounded-lg transition-all"
                      style={{
                        background: selectedType === rate.type ? rate.color : "#F0F4F8",
                        color: selectedType === rate.type ? "white" : rate.color,
                      }}
                    >
                      {selectedType === rate.type ? "Selected" : "View Details"}
                    </button>
                  </div>
                </FadeUp>
              ))}
            </div>
          </FadeUp>

          {/* Info Box */}
          <FadeUp delay={100}>
            <div className="rounded-2xl p-8 mt-10" style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#319795" }}>📅 Daily Rates</p>
                  <p className="text-sm" style={{ color: "#4A5568" }}>
                    Leasing rates updated daily. Rates apply for 24-hour use periods with FREE detention for 7 days at port.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#437A96" }}>🌍 FCL Rates</p>
                  <p className="text-sm" style={{ color: "#4A5568" }}>
                    Full Container Load rates from Tuticorin Port to major international ports. Includes documentation & basic port handling.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#2C5282" }}>⚡ Real-Time Updates</p>
                  <p className="text-sm" style={{ color: "#4A5568" }}>
                    Rates reflect current market conditions. Contact us for volume discounts, long-term contracts, or special requirements.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* CTA */}
          <FadeUp delay={150} className="mt-10 text-center">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", boxShadow: "0 6px 20px rgba(26,54,93,0.22)" }}
            >
              Get a Custom Quote →
            </a>
            <p className="mt-4 text-xs" style={{ color: "#718096" }}>
              Need different rates or special containers? Our team can arrange consolidated shipments with custom pricing.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── MODAL ─────────────────────────────── */}
      {selectedType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setSelectedType(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeUp 300ms ease both" }}
          >
            {(() => {
              const details = getContainerDetails(selectedType);
              if (!details) return null;
              return (
                <div>
                  {/* Header */}
                  <div
                    className="p-8 text-white"
                    style={{ background: `linear-gradient(135deg, ${details.color}, ${details.color}dd)` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-black" style={{ fontFamily: "'Georgia', serif" }}>
                        {details.type}
                      </h2>
                      <button
                        onClick={() => setSelectedType(null)}
                        className="text-2xl leading-none opacity-75 hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm opacity-90">Container leasing & shipping rates</p>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    {/* Specifications */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: details.color }}>
                        Specifications
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg p-4" style={{ background: "#F8FAFC" }}>
                          <p className="text-xs text-gray-500 mb-1">Capacity (CBM)</p>
                          <p className="text-lg font-bold" style={{ color: "#1A365D" }}>
                            {details.capacity}
                          </p>
                        </div>
                        <div className="rounded-lg p-4" style={{ background: "#F8FAFC" }}>
                          <p className="text-xs text-gray-500 mb-1">Max Weight</p>
                          <p className="text-lg font-bold" style={{ color: "#1A365D" }}>
                            {details.weight}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: details.color }}>
                        Pricing Options
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg p-4 border-2" style={{ borderColor: details.color, background: "#F8FAFC" }}>
                          <p className="text-xs text-gray-500 mb-2">Daily Lease Rate</p>
                          <p className="text-2xl font-black" style={{ color: details.color }}>
                            {details.dailyRate}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Per 24-hour period</p>
                        </div>
                        <div className="rounded-lg p-4 border" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                          <p className="text-xs text-gray-500 mb-2">FCL Rate</p>
                          <p className="text-2xl font-black" style={{ color: "#1A365D" }}>
                            {details.fclRate}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Full Container Load shipment</p>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="rounded-lg p-4" style={{ background: "#EBF8FF", borderLeft: `4px solid ${details.color}` }}>
                      <p className="text-xs font-bold mb-2" style={{ color: details.color }}>💡 Rate Information</p>
                      <ul className="text-xs space-y-1" style={{ color: "#4A5568", lineHeight: "1.6" }}>
                        <li>✓ Free detention: 7 days at port</li>
                        <li>✓ Includes basic port handling</li>
                        <li>✓ Real-time availability tracking</li>
                        <li>✓ Custom quotes for bulk orders</li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3 pt-4">
                      <a
                        href="/contact"
                        className="flex-1 py-3 text-sm font-bold text-white text-center rounded-lg transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${details.color}, ${details.color}dd)` }}
                      >
                        Request Quote
                      </a>
                      <button
                        onClick={() => setSelectedType(null)}
                        className="flex-1 py-3 text-sm font-bold rounded-lg border transition-all hover:bg-gray-50"
                        style={{ borderColor: "#E2E8F0", color: "#1A365D" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Animation styles */}
          <style>{`
            @keyframes fadeUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
