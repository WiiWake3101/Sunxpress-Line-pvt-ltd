"use client";
import { useState } from "react";

const PRIVACY_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "December 19, 2025",
  sections: [
    {
      heading: "1. Information We Collect",
      content:
        "We collect information you provide directly to us, such as your name, email address, phone number, company name, and shipping details when you request a quote, create an account, or contact us. We also collect information automatically when you use our website, including IP address, browser type, pages visited, and cookies.",
    },
    {
      heading: "2. How We Use Your Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and send you marketing communications (with your consent). We also use data to monitor and analyze usage trends.",
    },
    {
      heading: "3. Sharing of Information",
      content:
        "Sun Xpress Line Private Limited does not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential. We may also disclose information when required by law.",
    },
    {
      heading: "4. Data Security",
      content:
        "We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
    },
    {
      heading: "5. Cookies",
      content:
        "Our website uses cookies to enhance your browsing experience. You may choose to disable cookies through your browser settings, but doing so may affect the functionality of certain parts of our website.",
    },
    {
      heading: "6. Your Rights",
      content:
        "You have the right to access, correct, or delete your personal data held by us. To exercise these rights, please contact us at info@sunxpressline.com. We will respond to your request within 30 days.",
    },
    {
      heading: "7. Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website with a revised effective date. Your continued use of our services after changes constitutes acceptance of the updated policy.",
    },
    {
      heading: "8. Contact Us",
      content:
        "If you have any questions about this Privacy Policy, please contact us at: Sun Xpress Line Private Limited, 3/118H Main Road, Shanmugapuram Ayyanadaiap, Korampollam, Tuticorin, Tamil Nadu – 628101, India. Email: info@sunxpressline.com",
    },
  ],
};

const TERMS_OF_SERVICE = {
  title: "Terms of Service",
  lastUpdated: "December 19, 2025",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      content:
        "By accessing or using the services of Sun Xpress Line Private Limited, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services. These terms apply to all visitors, users, and others who access or use the service.",
    },
    {
      heading: "2. Description of Services",
      content:
        "Sun Xpress Line Private Limited provides maritime shipping and logistics services including ocean freight, bulk cargo handling, container shipping, port logistics, customs clearance, and cargo insurance. Services are subject to availability and applicable laws and regulations.",
    },
    {
      heading: "3. User Responsibilities",
      content:
        "You agree to provide accurate, current, and complete information when using our services. You are responsible for ensuring that all cargo declarations, documentation, and customs information are accurate and comply with applicable laws. Misrepresentation of cargo details may result in legal liability.",
    },
    {
      heading: "4. Pricing & Payment",
      content:
        "All quotes and pricing are subject to change based on fuel surcharges, port fees, currency fluctuations, and other variable factors. Final pricing will be confirmed in writing before shipment. Payment terms will be specified in your service agreement. Late payments may attract interest charges.",
    },
    {
      heading: "5. Liability Limitations",
      content:
        "Sun Xpress Line Private Limited's liability for any loss or damage to cargo shall be governed by applicable maritime law and the terms of the Bill of Lading. We are not liable for delays or losses caused by force majeure events, including but not limited to natural disasters, port strikes, or government actions.",
    },
    {
      heading: "6. Cargo Insurance",
      content:
        "We strongly recommend that all clients obtain adequate cargo insurance. While we offer cargo insurance services, it is the client's responsibility to ensure sufficient coverage. Sun Xpress Line is not liable for uninsured losses beyond the limits specified in the Bill of Lading.",
    },
    {
      heading: "7. Intellectual Property",
      content:
        "All content on our website, including text, graphics, logos, and images, is the property of Sun Xpress Line Private Limited and is protected by applicable intellectual property laws. You may not reproduce or distribute our content without prior written permission.",
    },
    {
      heading: "8. Governing Law",
      content:
        "These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Tuticorin, Tamil Nadu, India.",
    },
    {
      heading: "9. Modifications",
      content:
        "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes constitutes acceptance of the new terms.",
    },
  ],
};

function Modal({ data, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26, 54, 93, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex-shrink-0 px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)" }}
        >
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {data.title}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#A0E9E5" }}>
              Sun Xpress Line Private Limited · Last updated: {data.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/20 text-white flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Accent line */}
        <div
          className="h-1 flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)" }}
        />

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
          {data.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: "#1A365D" }}>
                {section.heading}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>
                {section.content}
              </p>
              {i < data.sections.length - 1 && (
                <div className="mt-4 h-px" style={{ background: "#EBF8FF" }} />
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div
          className="flex-shrink-0 px-6 py-4 flex justify-end border-t"
          style={{ borderColor: "#E2E8F0", background: "#F0FAFA" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState(null);

  const services = [
    "Ocean Freight",
    "Bulk Cargo",
    "Container Shipping",
    "Port Logistics",
    "Customs Clearance",
    "Cargo Insurance",
  ];

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
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
      {/* ── Modals ── */}
      {activeModal === "privacy" && (
        <Modal data={PRIVACY_POLICY} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "terms" && (
        <Modal data={TERMS_OF_SERVICE} onClose={() => setActiveModal(null)} />
      )}

      <footer className="w-full bg-white" style={{ borderTop: "1px solid #e2e8f0" }}>
        {/* Top wave accent */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #B2F5EA 0%, #319795 50%, #2C5282 100%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Col 1: Brand */}
            <div className="lg:col-span-1">
              <a href="#" className="flex items-center gap-3 mb-5">
                <img
                  src="/logo/logo.svg"
                  alt="Sun Xpress Line Logo"
                  className="h-14 w-auto object-contain"
                />
              </a>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#4A5568" }}>
                Navigating the seas of commerce with precision, trust, and an
                unwavering commitment to excellence since 2025.
              </p>
              <div className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: "#F0FAFA", color: "#437A96" }}>
                <p className="font-semibold mb-1" style={{ color: "#1A365D" }}>Company Info</p>
                <p>Incorporated: Dec 19, 2025</p>
                <p>ROC: Chennai, India</p>
              </div>
              <div className="flex items-center gap-2 mt-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: "linear-gradient(135deg, #437A96 0%, #1A365D 100%)", color: "#fff" }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-5 pb-2 border-b" style={{ color: "#1A365D", borderColor: "#A0E9E5" }}>
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="flex items-center gap-2 text-sm transition-all duration-200 group" style={{ color: "#4A5568" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-150" style={{ background: "#319795" }} />
                      <span className="group-hover:translate-x-1 transition-transform duration-200 group-hover:text-[#1A365D]">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Services */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-5 pb-2 border-b" style={{ color: "#1A365D", borderColor: "#A0E9E5" }}>
                Our Services
              </h3>
              <ul className="space-y-2.5">
                {services.map((s) => (
                  <li key={s}>
                    <a href="#" className="flex items-center gap-2 text-sm transition-all duration-200 group" style={{ color: "#4A5568" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-150" style={{ background: "#71D5D0" }} />
                      <span className="group-hover:translate-x-1 transition-transform duration-200 group-hover:text-[#1A365D]">{s}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-5 pb-2 border-b" style={{ color: "#1A365D", borderColor: "#A0E9E5" }}>
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EBF8FF" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#437A96" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: "#4A5568" }}>
                    3/118H Main Road, Shanmugapuram Ayyanadaiap,<br />
                    Korampollam, Tuticorin,<br />
                    Tamil Nadu – 628101, India
                  </p>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EBF8FF" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#437A96" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </span>
                  <a href="mailto:admin@sunxp.in" className="text-xs hover:underline" style={{ color: "#437A96" }}>
                    admin@sunxp.in
                  </a>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EBF8FF" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#437A96" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </span>
                  <a href="tel:+91+91 87544 00780" className="text-xs hover:underline" style={{ color: "#437A96" }}>
                    +91 87544 00780
                  </a>
                </li>
              </ul>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-px"
                style={{ borderColor: "#A0E9E5", color: "#1A365D", background: "linear-gradient(135deg, #F0FAFA, #EBF8FF)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                View on Map
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-xs" style={{ color: "#718096" }}>
              © {currentYear}{" "}
              <span style={{ color: "#437A96" }} className="font-semibold">Sun Xpress Line Private Limited</span>.
              {" "}All rights reserved.
            </p>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "#A0E9E5" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#319795" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#2C5282" }} />
            </div>

            {/* ── Modal Trigger Buttons ── */}
            <div className="flex items-center gap-4 text-xs" style={{ color: "#718096" }}>
              <button
                onClick={() => setActiveModal("privacy")}
                className="hover:text-[#437A96] transition-colors cursor-pointer hover:underline underline-offset-2"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveModal("terms")}
                className="hover:text-[#437A96] transition-colors cursor-pointer hover:underline underline-offset-2"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}