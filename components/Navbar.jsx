"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href) => pathname === href;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);




  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50 shadow-md">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #A0E9E5 0%, #319795 50%, #2C5282 100%)" }} />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">

            {/* Logo */}
            <a href="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo/logo.svg" alt="Sun Xpress Line Logo" className="h-14 w-auto object-contain" />
            </a>

            <div className="flex-1" />

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium rounded-md group"
                  style={{ color: isActive(link.href) ? "#1A365D" : "#437A96" }}
                >
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #319795, #1A365D)",
                      width: isActive(link.href) ? "70%" : "0%",
                      transitionProperty: "width",
                      transitionDuration: "300ms",
                      transitionTimingFunction: "ease",
                    }}
                  />
                  <span className="relative z-10 group-hover:text-[#1A365D]" style={{ transitionProperty: "color", transitionDuration: "200ms" }}>
                    {link.label}
                  </span>
                </a>
              ))}

              {/* ✅ Fixed: href="/contact" */}
              <a
                href="/contact"
                className="ml-3 px-5 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)",
                  boxShadow: "0 4px 14px rgba(26,54,93,0.25)",
                  transitionProperty: "opacity, transform",
                  transitionDuration: "200ms",
                  transitionTimingFunction: "ease",
                }}
              >
                Get a Quote
              </a>
            </div>

            {/* Hamburger */}
            <button
              className="lg:hidden z-[60] relative w-10 h-10 flex flex-col justify-center items-center gap-1.5"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="#1A365D" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="#1A365D" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <>
                  <span className="block h-0.5 w-6 rounded-full" style={{ background: "#1A365D" }} />
                  <span className="block h-0.5 w-6 rounded-full" style={{ background: "#1A365D" }} />
                  <span className="block h-0.5 w-6 rounded-full" style={{ background: "#1A365D" }} />
                </>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-40 lg:hidden flex flex-col bg-white"
        style={{
          transitionProperty: "transform, opacity",
          transitionDuration: "420ms",
          transitionTimingFunction: "cubic-bezier(0.77,0,0.175,1)",
          transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <div className="h-1 w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #A0E9E5 0%, #319795 50%, #2C5282 100%)" }} />

        <ul className="flex flex-col px-8 flex-1 mt-24">
          {navLinks.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => { setMenuOpen(false); }}
                className="flex items-center justify-between py-5"
                style={{
                  borderBottom: "1px solid #F0F4F8",
                  transitionProperty: "transform, opacity",
                  transitionDuration: "380ms",
                  transitionTimingFunction: "ease",
                  transitionDelay: menuOpen ? `${i * 55 + 60}ms` : "0ms",
                  transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
                  opacity: menuOpen ? 1 : 0,
                }}
              >
                <span className="text-2xl font-bold tracking-wide" style={{ color: isActive(link.href) ? "#319795" : "#1A365D", fontFamily: "'Georgia', serif" }}>
                  {link.label}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <polyline points="9 6 15 12 9 18" stroke={isActive(link.href) ? "#319795" : "#A0AEC0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <div
          className="px-8 pb-14 pt-6"
          style={{
            transitionProperty: "transform, opacity",
            transitionDuration: "380ms",
            transitionTimingFunction: "ease",
            transitionDelay: menuOpen ? "400ms" : "0ms",
            transform: menuOpen ? "translateY(0)" : "translateY(16px)",
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <a
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-full py-4 text-base font-bold rounded-xl"
            style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#ffffff", boxShadow: "0 8px 24px rgba(26,54,93,0.2)" }}
          >
            Get a Quote
          </a>
          <p className="text-center text-xs mt-4" style={{ color: "#A0AEC0" }}>
            Sun Xpress Line Private Limited · Tuticorin, India
          </p>
        </div>
      </div>
    </>
  );
}