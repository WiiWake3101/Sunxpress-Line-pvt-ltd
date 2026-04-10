"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import SuccessModal from "@/components/SuccessModal";
import Link from "next/link";

// ─── Move metadata to a separate layout.js (Server Component) ───
// Create: app/contact/layout.js
// export const metadata = {
//   title: "Contact Us - Sun Xpress Line",
//   description: "Get in touch with Sun Xpress Line for shipping inquiries...",
//   keywords: "contact sun xpress line, shipping inquiry, logistics support",
// };
// export default function ContactLayout({ children }) { return children; }

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    subject: "",
    pol: "",
    pod: "",
    container: "",
    serviceType: "",
    cargoType: "",
    shipmentDate: "",
    weight: "",
    shipper: "",
    consignee: "",
    specialRequirements: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, email: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Port dropdowns
  const [polSearch, setPolSearch] = useState("");
  const [podSearch, setPodSearch] = useState("");
  const [showPolDropdown, setShowPolDropdown] = useState(false);
  const [showPodDropdown, setShowPodDropdown] = useState(false);

  // Country code dropdown
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);
  const polDropdownRef = useRef(null);
  const podDropdownRef = useRef(null);

  // ─── Country Codes ───────────────────────────────────────────
  const countryCodes = [
    { code: "+1",   country: "USA / Canada",   flag: "🇺🇸" },
    { code: "+7",   country: "Russia",          flag: "🇷🇺" },
    { code: "+20",  country: "Egypt",           flag: "🇪🇬" },
    { code: "+27",  country: "South Africa",    flag: "🇿🇦" },
    { code: "+33",  country: "France",          flag: "🇫🇷" },
    { code: "+34",  country: "Spain",           flag: "🇪🇸" },
    { code: "+39",  country: "Italy",           flag: "🇮🇹" },
    { code: "+44",  country: "UK",              flag: "🇬🇧" },
    { code: "+49",  country: "Germany",         flag: "🇩🇪" },
    { code: "+60",  country: "Malaysia",        flag: "🇲🇾" },
    { code: "+61",  country: "Australia",       flag: "🇦🇺" },
    { code: "+62",  country: "Indonesia",       flag: "🇮🇩" },
    { code: "+63",  country: "Philippines",     flag: "🇵🇭" },
    { code: "+65",  country: "Singapore",       flag: "🇸🇬" },
    { code: "+66",  country: "Thailand",        flag: "🇹🇭" },
    { code: "+81",  country: "Japan",           flag: "🇯🇵" },
    { code: "+82",  country: "South Korea",     flag: "🇰🇷" },
    { code: "+84",  country: "Vietnam",         flag: "🇻🇳" },
    { code: "+86",  country: "China",           flag: "🇨🇳" },
    { code: "+90",  country: "Turkey",          flag: "🇹🇷" },
    { code: "+91",  country: "India",           flag: "🇮🇳" },
    { code: "+92",  country: "Pakistan",        flag: "🇵🇰" },
    { code: "+94",  country: "Sri Lanka",       flag: "🇱🇰" },
    { code: "+95",  country: "Myanmar",         flag: "🇲🇲" },
    { code: "+966", country: "Saudi Arabia",    flag: "🇸🇦" },
    { code: "+971", country: "UAE",             flag: "🇦🇪" },
    { code: "+972", country: "Israel",          flag: "🇮🇱" },
    { code: "+974", country: "Qatar",           flag: "🇶🇦" },
    { code: "+977", country: "Nepal",           flag: "🇳🇵" },
    { code: "+880", country: "Bangladesh",      flag: "🇧🇩" },
  ];

  const filteredCountryCodes = countryCodes.filter(
    (c) =>
      c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  // Selected country object
  const selectedCountry =
    countryCodes.find((c) => c.code === formData.countryCode) || countryCodes[20]; // default India

  // ─── Close dropdowns on outside click ───────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
      if (polDropdownRef.current && !polDropdownRef.current.contains(e.target)) {
        setShowPolDropdown(false);
      }
      if (podDropdownRef.current && !podDropdownRef.current.contains(e.target)) {
        setShowPodDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── reCAPTCHA ───────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // ─── Ports ──────────────────────────────────────────────────
  const majorPorts = [
    "Antwerp", "Bangkok", "Barcelona", "Busan", "Chennai",
    "Cochin", "Colombo", "Dalian", "Dubai", "Gdansk",
    "Gothenburg", "Hamburg", "Hong Kong", "Jeddah", "Kaohsiung",
    "Kandla", "Kolkata", "Long Beach", "Los Angeles", "Mumbai",
    "Ningbo", "Paradip", "Penang", "Port Klang", "Port Said",
    "Qingdao", "Rotterdam", "Shanghai", "Shenzhen", "Singapore",
    "Suez", "Tianjin", "Tokyo", "Tuticorin", "Valencia",
  ].sort();

  const filteredPorts = (searchTerm) =>
    majorPorts.filter((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

  // ─── Validation ──────────────────────────────────────────────
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => !phone || /^\d{7,15}$/.test(phone.replace(/\D/g, ""));
  const validateDate = (d) => {
    if (!d) return true;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(d) >= today;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim())          errors.name = "Name is required";
    if (!formData.email.trim())         errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email format";
    if (!validatePhone(formData.phone)) errors.phone = "Invalid phone number (7–15 digits)";
    if (!formData.subject)              errors.subject = "Please select a service";
    if (!formData.pol)                  errors.pol = "Port of Loading is required";
    if (!formData.pod)                  errors.pod = "Port of Discharge is required";
    if (!formData.container)            errors.container = "Container type is required";
    if (!formData.serviceType)          errors.serviceType = "Service type is required";
    if (!formData.cargoType)            errors.cargoType = "Cargo type is required";
    if (!formData.weight.trim())        errors.weight = "Weight / Quantity is required";
    if (!formData.message.trim())       errors.message = "Message is required";
    if (!validateDate(formData.shipmentDate)) errors.shipmentDate = "Date cannot be in the past";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Only allow digits, max 15
      const digits = value.replace(/\D/g, "").slice(0, 15);
      setFormData((prev) => ({ ...prev, phone: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectCountry = (c) => {
    setFormData((prev) => ({ ...prev, countryCode: c.code }));
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const handlePolInput = (e) => {
    setPolSearch(e.target.value);
    setFormData((prev) => ({ ...prev, pol: "" }));
    setShowPolDropdown(true);
  };

  const handlePodInput = (e) => {
    setPodSearch(e.target.value);
    setFormData((prev) => ({ ...prev, pod: "" }));
    setShowPodDropdown(true);
  };

  const selectPort = (port, type) => {
    if (type === "pol") {
      setFormData((prev) => ({ ...prev, pol: port }));
      setPolSearch("");
      setShowPolDropdown(false);
    } else {
      setFormData((prev) => ({ ...prev, pod: port }));
      setPodSearch("");
      setShowPodDropdown(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      setError("Please correct the errors above before submitting.");
      return;
    }
    setLoading(true);
    try {
      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action: "submit_contact" }
      );
      const fullPhone = formData.phone
        ? `${formData.countryCode} ${formData.phone}`
        : "";

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: fullPhone, recaptchaToken: token }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Failed to submit. Please try again.");
        setLoading(false);
        return;
      }
      setSuccessModal({ isOpen: true, email: formData.email });
      setFormData({
        name: "", email: "", countryCode: "+91", phone: "", subject: "",
        pol: "", pod: "", container: "", serviceType: "", cargoType: "",
        shipmentDate: "", weight: "", shipper: "", consignee: "",
        specialRequirements: "", message: "",
      });
      setFieldErrors({});
    } catch (err) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  // ─── Reusable field style helpers ───────────────────────────
  const inputStyle = (field) => ({
    borderColor: fieldErrors[field] ? "#E53E3E" : "#CBD5E0",
    color: "#2D3748",
    background: "#fff",
  });
  const focusHandlers = (field) => ({
    onFocus: (e) => {
      e.target.style.borderColor = fieldErrors[field] ? "#E53E3E" : "#319795";
      e.target.style.boxShadow = `0 0 0 3px rgba(${fieldErrors[field] ? "229,62,62" : "49,151,149"},0.12)`;
    },
    onBlur: (e) => {
      e.target.style.borderColor = fieldErrors[field] ? "#E53E3E" : "#CBD5E0";
      e.target.style.boxShadow = "none";
    },
  });

  const baseInputClass =
    "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200";
  const baseSelectClass =
    "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 appearance-none";

  // ─── Static data ─────────────────────────────────────────────
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
    },
  ];

  const socials = [
    {
      label: "LinkedIn", href: "#",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    },
    {
      label: "Facebook", href: "#",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      label: "Twitter / X", href: "#",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: "WhatsApp", href: "https://wa.me/918754400780",
      icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: "linear-gradient(135deg, #1A365D 0%, #2C5282 50%, #319795 100%)" }}
        >
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
            <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span style={{ color: "#A0E9E5" }}>Contact</span>
            </div>
          </div>
        </section>

        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #A0E9E5 0%, #319795 50%, #2C5282 100%)" }} />

        {/* Main */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Left panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A365D", fontFamily: "'Georgia', serif" }}>
                  Let's Talk
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>
                  Whether you have a question about our services, need a shipping quote, or want to discuss a logistics partnership — we'd love to hear from you.
                </p>
              </div>

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
                    <span className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#fff" }}>
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#319795" }}>{item.label}</p>
                      <p className="text-sm whitespace-pre-line group-hover:text-[#1A365D] transition-colors" style={{ color: "#4A5568" }}>{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1A365D" }}>Follow Us</p>
                <div className="flex items-center gap-3">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                      style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#fff" }}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E2E8F0" }}>
                <iframe
                  title="Sun Xpress Line Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.3!2d78.1198!3d8.7642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNDUnNTEuMSJOIDc4wrAwNycxMS4zIkU!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
                <a href="https://maps.google.com/?q=Korampollam,Tuticorin,Tamil+Nadu" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors hover:text-[#1A365D]"
                  style={{ background: "#F0FAFA", color: "#437A96" }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: "#E2E8F0" }}>
                <div className="px-8 py-6" style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)" }}>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>Send Us a Message</h2>
                  <p className="text-xs mt-1" style={{ color: "#A0E9E5" }}>Fill in the form below and we'll get back to you within 24 hours.</p>
                </div>
                <div className="h-1" style={{ background: "linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)" }} />

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" style={{ background: "#FAFEFF" }}>

                  {/* Global error */}
                  {error && (
                    <div className="p-4 rounded-lg border" style={{ background: "rgba(229,62,62,0.08)", borderColor: "#FC8181", color: "#C53030" }}>
                      <p className="text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Full Name <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="text" name="name" required
                        value={formData.name} onChange={handleChange}
                        placeholder="John Doe"
                        className={baseInputClass} style={inputStyle("name")}
                        {...focusHandlers("name")}
                      />
                      {fieldErrors.name && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Email Address <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="email" name="email" required
                        value={formData.email} onChange={handleChange}
                        placeholder="john@company.com"
                        className={baseInputClass} style={inputStyle("email")}
                        {...focusHandlers("email")}
                      />
                      {fieldErrors.email && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.email}</p>}
                    </div>
                  </div>

                  {/* ── Phone with Country Code ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Phone Number
                      </label>

                      <div className="flex gap-2">
                        {/* Country code picker */}
                        <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown((v) => !v)}
                            className="h-full px-3 py-3 rounded-lg border text-sm outline-none transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                            style={{
                              borderColor: showCountryDropdown ? "#319795" : "#CBD5E0",
                              background: "#fff",
                              color: "#2D3748",
                              boxShadow: showCountryDropdown ? "0 0 0 3px rgba(49,151,149,0.12)" : "none",
                              minWidth: "90px",
                            }}
                          >
                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                            <span className="font-semibold text-xs">{formData.countryCode}</span>
                            <svg
                              className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
                              style={{ transform: showCountryDropdown ? "rotate(180deg)" : "rotate(0deg)", color: "#718096" }}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Dropdown */}
                          {showCountryDropdown && (
                            <div
                              className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
                              style={{ borderColor: "#E2E8F0", border: "1px solid #E2E8F0", minWidth: "220px", maxHeight: "260px", display: "flex", flexDirection: "column" }}
                            >
                              {/* Search inside dropdown */}
                              <div className="p-2 border-b" style={{ borderColor: "#E2E8F0" }}>
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: "#F7FAFC" }}>
                                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A0AEC0" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                  <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="w-full text-xs outline-none bg-transparent"
                                    style={{ color: "#2D3748" }}
                                    autoFocus
                                  />
                                </div>
                              </div>
                              {/* List */}
                              <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                                {filteredCountryCodes.length === 0 ? (
                                  <p className="text-xs text-center py-4" style={{ color: "#A0AEC0" }}>No results found</p>
                                ) : (
                                  filteredCountryCodes.map((c) => (
                                    <button
                                      key={c.code}
                                      type="button"
                                      onClick={() => selectCountry(c)}
                                      className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-blue-50 transition-colors"
                                      style={{
                                        background: formData.countryCode === c.code ? "rgba(49,151,149,0.08)" : "transparent",
                                      }}
                                    >
                                      <span className="text-base leading-none">{c.flag}</span>
                                      <span className="text-xs font-semibold" style={{ color: "#2D3748", minWidth: "36px" }}>{c.code}</span>
                                      <span className="text-xs truncate" style={{ color: "#718096" }}>{c.country}</span>
                                      {formData.countryCode === c.code && (
                                        <svg className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: "#319795" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phone number input */}
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="98765 43210"
                          maxLength={15}
                          className={`flex-1 ${baseInputClass}`}
                          style={inputStyle("phone")}
                          {...focusHandlers("phone")}
                        />
                      </div>

                      {/* Live preview of full number */}
                      {formData.phone && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#319795" }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          Full number: {formData.countryCode} {formData.phone}
                        </p>
                      )}
                      {fieldErrors.phone && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.phone}</p>}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Subject <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <select
                        name="subject" required
                        value={formData.subject} onChange={handleChange}
                        className={baseSelectClass}
                        style={{ ...inputStyle("subject"), color: formData.subject ? "#2D3748" : "#A0AEC0" }}
                        {...focusHandlers("subject")}
                      >
                        <option value="" disabled>Select a service</option>
                        <option value="Ocean Freight Booking">Ocean Freight Booking (FCL/LCL)</option>
                        <option value="Bulk Cargo Shipment">Bulk Cargo Shipment</option>
                        <option value="Customs Clearance">Customs Clearance & Documentation</option>
                        <option value="Port Logistics">Port Logistics & Handling</option>
                        <option value="Cargo Consolidation">Cargo Consolidation Service</option>
                        <option value="Cargo Insurance">Cargo Insurance Inquiry</option>
                        <option value="Get a Quote">Get a Freight Quote</option>
                        <option value="Rate Negotiation">Rate Negotiation & Booking</option>
                        <option value="Other">Other Inquiry</option>
                      </select>
                      {fieldErrors.subject && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.subject}</p>}
                    </div>
                  </div>

                  {/* POL + POD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative" ref={polDropdownRef}>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Port of Loading (POL) <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pol || polSearch}
                        onChange={handlePolInput}
                        onFocus={(e) => {
                          setShowPolDropdown(true);
                          e.target.style.borderColor = fieldErrors.pol ? "#E53E3E" : "#319795";
                          e.target.style.boxShadow = `0 0 0 3px rgba(${fieldErrors.pol ? "229,62,62" : "49,151,149"},0.12)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = fieldErrors.pol ? "#E53E3E" : "#CBD5E0";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="Search port..."
                        className={baseInputClass}
                        style={inputStyle("pol")}
                      />
                      {fieldErrors.pol && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.pol}</p>}
                      {showPolDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 overflow-y-auto" style={{ borderColor: "#CBD5E0", border: "1px solid #CBD5E0", maxHeight: "200px" }}>
                          {filteredPorts(polSearch).length === 0
                            ? <p className="text-xs text-center py-3" style={{ color: "#A0AEC0" }}>No ports found</p>
                            : filteredPorts(polSearch).map((port) => (
                              <button key={port} type="button" onClick={() => selectPort(port, "pol")}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors"
                                style={{ color: "#2D3748" }}>
                                {port}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={podDropdownRef}>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Port of Discharge (POD) <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.pod || podSearch}
                        onChange={handlePodInput}
                        onFocus={(e) => {
                          setShowPodDropdown(true);
                          e.target.style.borderColor = fieldErrors.pod ? "#E53E3E" : "#319795";
                          e.target.style.boxShadow = `0 0 0 3px rgba(${fieldErrors.pod ? "229,62,62" : "49,151,149"},0.12)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = fieldErrors.pod ? "#E53E3E" : "#CBD5E0";
                          e.target.style.boxShadow = "none";
                        }}
                        placeholder="Search port..."
                        className={baseInputClass}
                        style={inputStyle("pod")}
                      />
                      {fieldErrors.pod && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.pod}</p>}
                      {showPodDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 overflow-y-auto" style={{ borderColor: "#CBD5E0", border: "1px solid #CBD5E0", maxHeight: "200px" }}>
                          {filteredPorts(podSearch).length === 0
                            ? <p className="text-xs text-center py-3" style={{ color: "#A0AEC0" }}>No ports found</p>
                            : filteredPorts(podSearch).map((port) => (
                              <button key={port} type="button" onClick={() => selectPort(port, "pod")}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors"
                                style={{ color: "#2D3748" }}>
                                {port}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Container + Service Type + Cargo Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Container Type <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <select name="container" required value={formData.container} onChange={handleChange}
                        className={baseSelectClass}
                        style={{ ...inputStyle("container"), color: formData.container ? "#2D3748" : "#A0AEC0" }}
                        {...focusHandlers("container")}>
                        <option value="">Select type</option>
                        <option value="20ft Standard">20ft Standard</option>
                        <option value="40ft Standard">40ft Standard</option>
                        <option value="40ft High Cube">40ft High Cube</option>
                        <option value="45ft High Cube">45ft High Cube</option>
                        <option value="Reefer">Reefer</option>
                        <option value="Flat Rack">Flat Rack</option>
                        <option value="Open Top">Open Top</option>
                        <option value="Bulk/Tank">Bulk / Tank</option>
                      </select>
                      {fieldErrors.container && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.container}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Service Type <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <select name="serviceType" required value={formData.serviceType} onChange={handleChange}
                        className={baseSelectClass}
                        style={{ ...inputStyle("serviceType"), color: formData.serviceType ? "#2D3748" : "#A0AEC0" }}
                        {...focusHandlers("serviceType")}>
                        <option value="">Select service</option>
                        <option value="FCL">FCL (Full Container Load)</option>
                        <option value="LCL">LCL (Less than Container Load)</option>
                        <option value="CFS">CFS (Container Freight Station)</option>
                        <option value="Consolidation">Consolidation Service</option>
                        <option value="Breakbulk">Breakbulk / General Cargo</option>
                      </select>
                      {fieldErrors.serviceType && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.serviceType}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Cargo Type <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <select name="cargoType" required value={formData.cargoType} onChange={handleChange}
                        className={baseSelectClass}
                        style={{ ...inputStyle("cargoType"), color: formData.cargoType ? "#2D3748" : "#A0AEC0" }}
                        {...focusHandlers("cargoType")}>
                        <option value="">Select cargo</option>
                        <option value="General Cargo">General Cargo</option>
                        <option value="Breakbulk">Breakbulk</option>
                        <option value="Heavy Lift">Heavy Lift</option>
                        <option value="Project Cargo">Project Cargo</option>
                        <option value="RoRo">RoRo (Roll-on/Roll-off)</option>
                        <option value="Perishable">Perishable</option>
                        <option value="Hazardous">Hazardous</option>
                        <option value="Dry Bulk">Dry Bulk</option>
                        <option value="Liquid Bulk">Liquid Bulk</option>
                      </select>
                      {fieldErrors.cargoType && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.cargoType}</p>}
                    </div>
                  </div>

                  {/* Date + Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        When Do You Need to Ship?
                      </label>
                      <input type="date" name="shipmentDate" value={formData.shipmentDate} onChange={handleChange}
                        className={baseInputClass} style={inputStyle("shipmentDate")}
                        {...focusHandlers("shipmentDate")} />
                      {fieldErrors.shipmentDate && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.shipmentDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Weight / Quantity <span style={{ color: "#E53E3E" }}>*</span>
                      </label>
                      <input type="text" name="weight" required value={formData.weight} onChange={handleChange}
                        placeholder="e.g., 50 MT or 100 boxes"
                        className={baseInputClass} style={inputStyle("weight")}
                        {...focusHandlers("weight")} />
                      {fieldErrors.weight && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.weight}</p>}
                    </div>
                  </div>

                  {/* Shipper + Consignee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Shipper Name / Company
                      </label>
                      <input type="text" name="shipper" value={formData.shipper} onChange={handleChange}
                        placeholder="e.g., ABC Manufacturing Co."
                        className={baseInputClass}
                        style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                        Consignee Name / Company
                      </label>
                      <input type="text" name="consignee" value={formData.consignee} onChange={handleChange}
                        placeholder="e.g., XYZ Imports Ltd."
                        className={baseInputClass}
                        style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                        onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }} />
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                      Special Requirements / Notes
                    </label>
                    <input type="text" name="specialRequirements" value={formData.specialRequirements} onChange={handleChange}
                      placeholder="e.g., DG cargo, temperature control, insurance needed, urgent delivery, etc."
                      className={baseInputClass}
                      style={{ borderColor: "#CBD5E0", color: "#2D3748", background: "#fff" }}
                      onFocus={(e) => { e.target.style.borderColor = "#319795"; e.target.style.boxShadow = "0 0 0 3px rgba(49,151,149,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#CBD5E0"; e.target.style.boxShadow = "none"; }} />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1A365D" }}>
                      Message <span style={{ color: "#E53E3E" }}>*</span>
                    </label>
                    <textarea name="message" required rows={5} value={formData.message} onChange={handleChange}
                      placeholder="Tell us about your shipment or inquiry..."
                      className={`${baseInputClass} resize-none`}
                      style={inputStyle("message")}
                      {...focusHandlers("message")} />
                    {fieldErrors.message && <p className="text-xs mt-1" style={{ color: "#E53E3E" }}>ℹ️ {fieldErrors.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit" disabled={loading}
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
              </div>
            </div>
          </div>
        </section>

        {/* Success Modal */}
        <SuccessModal
          isOpen={successModal.isOpen}
          email={successModal.email}
          onClose={() => {
            setSuccessModal({ isOpen: false, email: "" });
            setSubmitted(false);
          }}
        />
      </main>
      <Footer />
    </>
  );
}