"use client";

/**
 * Success Modal Component
 * Animated submission confirmation
 */

import { useEffect, useState } from "react";

export default function SuccessModal({ isOpen, onClose, message, email }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
        style={{
          animation: isOpen ? "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
      >
        <div
          className="rounded-3xl p-8 text-center shadow-2xl"
          style={{
            background: "white",
            border: "2px solid #A0E9E5",
            boxShadow: "0 20px 60px rgba(160, 233, 229, 0.3)",
          }}
        >
          {/* Success Checkmark Animation */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse"
            style={{
              background: "linear-gradient(135deg, #A0E9E5, #71D5D0)",
              animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
            }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: "24",
                  strokeDashoffset: 0,
                  animation: "drawCheck 0.6s ease-out 0.8s both",
                }}
              />
            </svg>
          </div>

          {/* Heading */}
          <h2
            className="text-2xl font-black mb-2"
            style={{ color: "#0D1F3C", fontFamily: "'Georgia', serif" }}
          >
            Quote Request Sent!
          </h2>

          {/* Message */}
          <p
            className="text-sm mb-4"
            style={{ color: "#4A5568", lineHeight: "1.6" }}
          >
            {message || "Your quote request has been successfully submitted."}
          </p>

          {/* Email confirmation */}
          {email && (
            <div
              className="rounded-xl p-3 mb-6 text-sm"
              style={{
                background: "#EBF8FF",
                border: "1px solid #BEE3F8",
                color: "#1A365D",
              }}
            >
              ✉️ Confirmation sent to <strong>{email}</strong>
            </div>
          )}

          {/* Additional info */}
          <p
            className="text-xs mb-6"
            style={{ color: "#A0AEC0" }}
          >
            We'll respond within <strong>24 hours</strong> with a competitive quote.
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, #A0E9E5, #71D5D0)",
              color: "#1A365D",
              boxShadow: "0 4px 15px rgba(160, 233, 229, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = "0 6px 20px rgba(160, 233, 229, 0.4)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = "0 4px 15px rgba(160, 233, 229, 0.3)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Got it, thanks! →
          </button>

          {/* Confetti canvas */}
          {showConfetti && <Confetti />}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drawCheck {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Confetti Component
 * Animated falling confetti on success
 */
function Confetti() {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Generate random confetti pieces
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: ["#A0E9E5", "#71D5D0", "#319795", "#437A96"][
        Math.floor(Math.random() * 4)
      ],
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            background: piece.color,
            animation: `float ${piece.duration}s ease-out ${piece.delay}s forwards`,
            top: "-10px",
          }}
        />
      ))}
    </div>
  );
}
