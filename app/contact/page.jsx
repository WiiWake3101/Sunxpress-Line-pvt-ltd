"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
      label: "Our Address",
      value: "3/118H Main Road, Shanmugapuram Ayyanadaiap,\nKorampollam, Tuticorin,\nTamil Nadu – 628101, India",
      href: "https://maps.google.com/?q=Korampollam,Tuticorin,Tamil+Nadu",
      isLink: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Email Us",
      value: "admin@sunxp.in",
      href: "mailto:admin@sunxp.in",
      isLink: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
      ),
      label: "Call Us",
      value: "+91 87544 00780",
      href: "tel:+918754400780",
      isLink: true,
    },
  ];

  const socials = [
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: "#",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/918754400780",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ];

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-white">

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{ background: "linear-gradient(135deg, #1A365D 0%, #2C5282 50%, #319795 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: "#A0E9E5" }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-10" style={{ background: "#71D5D0" }} />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5 tracking-widest uppercase" style={{ background: "rgba(160,233,229,0.15)", color: "#A0E9E5", border: "1px solid rgba(160,233,229,0.3)" }}>
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            Contact Us
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            We're here to help with all your maritime shipping and logistics needs. Reach out and our team will respond promptly.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: "#A0E9E5" }}>Contact</span>
          </div>
        </div>
      </section>

      {/* Top gradient accent */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #A0E9E5 0%, #319795 50%, #2C5282 100%)" }} />

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT: Contact Info + Socials ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A365D", fontFamily: "'Georgia', serif" }}>
                Let's Talk
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>
                Whether you have a question about our services, need a shipping quote, or want to discuss a logistics partnership — we'd love to hear from you.
              </p>
            </div>

            {/* Contact cards */}
            <div className="flex flex-col gap-4">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-px group"
                  style={{ borderColor: "#E2E8F0", background: "#FAFEFF" }}
                >
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#fff" }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#319795" }}>
                      {item.label}
                    </p>
                    <p className="text-sm whitespace-pre-line group-hover:text-[#1A365D] transition-colors" style={{ color: "#4A5568" }}>
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1A365D" }}>
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#fff" }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
              <iframe
                title="Sun Xpress Line Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.3!2d78.1198!3d8.7642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNDUnNTEuMSJOIDc4wrAwNycxMS4zIkU!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://maps.google.com/?q=Korampollam,Tuticorin,Tamil+Nadu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors hover:text-[#1A365D]"
                style={{ background: "#F0FAFA", color: "#437A96" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: "#E2E8F0" }}>

              {/* Form header */}
              <div
                className="px-8 py-6"
                style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)" }}
              >
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
                  Send Us a Message
                </h2>
                <p className="text-xs mt-1" style={{ color: "#A0E9E5" }}>
                  Fill in the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              <div className="h-1" style={{ background: "linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)" }} />

              {submitted ? (
                <div className="px-8 py-16 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg, #B2F5EA, #319795)" }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#1A365D", fontFamily: "'Georgia', serif" }}>
                    Message Sent!
                  </h3>
                  <p className="text-sm" style={{ color: "#4A5568" }}>
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    className="mt-6 px-6 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)" }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" style={{ background: "#FAFEFF" }}>
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Full Name <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 focus:ring-2"
                        style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff", focusRingColor: "#319795" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Email Address <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200"
                        style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  </div>

                  {/* Phone + Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200"
                        style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Subject <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 appearance-none"
                        style={{ borderColor: "#CBD5E0", color: formData.subject ? "#2D3748" : "#A0AEC0", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }}
                      >
                        <option value="" disabled>Select a topic</option>
                        <option value="Ocean Freight">Ocean Freight</option>
                        <option value="Bulk Cargo">Bulk Cargo</option>
                        <option value="Container Shipping">Container Shipping</option>
                        <option value="Port Logistics">Port Logistics</option>
                        <option value="Customs Clearance">Customs Clearance</option>
                        <option value="Cargo Insurance">Cargo Insurance</option>
                        <option value="Get a Quote">Get a Quote</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                      Message <span style={{ color: "#E53E3E" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your shipment or inquiry..."
                      className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 resize-none"
                      style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                      onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-px hover:shadow-lg flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)",
                      boxShadow: "0 4px 14px rgba(26,54,93,0.25)",
                      opacity: loading ? 0.8 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs" style={{ color: "#A0AEC0" }}>
                    By submitting this form, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-[#437A96]" style={{ color: "#437A96" }}>Privacy Policy</span>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}