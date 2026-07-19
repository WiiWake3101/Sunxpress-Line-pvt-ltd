"use client";
import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 px-4">
          <Image 
            src="/logo/logo.svg" 
            alt="Sun Xpress Line" 
            width={400}
            height={80}
            className="w-[280px] sm:w-[350px] md:w-[400px] h-auto"
            priority
          />
        </div>

        {/* Simple Loading Spinner */}
        <div className="flex items-center space-x-2">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* Loading Dots */
        .loading-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 10px;
          height: 10px;
          background: #319795;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }

        .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
