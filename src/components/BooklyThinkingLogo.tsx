import React from 'react';

interface BooklyThinkingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  className?: string;
  showText?: boolean;
  text?: string;
  animatedAlways?: boolean;
}

export const BooklyThinkingLogo: React.FC<BooklyThinkingLogoProps> = ({
  size = 'md',
  isThinking = false,
  className = '',
  showText = false,
  text = 'Bookly IA réfléchit...',
  animatedAlways = false
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-[11px]', halo: '-inset-1' },
    md: { box: 'w-9 h-9', text: 'text-xs', halo: '-inset-1.5' },
    lg: { box: 'w-12 h-12', text: 'text-sm', halo: '-inset-2' },
    xl: { box: 'w-16 h-16', text: 'text-base', halo: '-inset-2.5' }
  };

  const currentSize = sizeMap[size];
  const activeMotion = isThinking || animatedAlways;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${activeMotion ? 'animate-bookly-sway' : ''}`}>
        
        {/* Dynamic Multi-Color Orbiting Halo when Thinking */}
        {activeMotion && (
          <>
            {/* Ambient Multi-color Pulse Glow */}
            <div className={`absolute ${currentSize.halo} rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-md animate-pulse`} />

            {/* Orbiting Conic Energy Ring */}
            <div
              className={`absolute ${currentSize.halo} rounded-2xl opacity-75 animate-bookly-conic`}
              style={{
                background: 'conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #38bdf8, #6366f1)',
                padding: '2px'
              }}
            />
          </>
        )}

        {/* Site Official Brand Logo Container */}
        <div
          className={`${currentSize.box} relative rounded-xl overflow-hidden shadow-md shadow-indigo-500/25 flex items-center justify-center transition-transform duration-300 ${
            activeMotion ? 'scale-95' : ''
          }`}
        >
          {/* Official Bookly SVG Logo with Alive Internal Components */}
          <svg
            className="w-full h-full"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient Background */}
            <rect width="48" height="48" rx="12" fill="url(#bookly-dynamic-grad)" />
            <rect width="48" height="48" rx="12" fill="black" fillOpacity="0.08" />

            {/* Inner Book / Capsule Element (Breathing) */}
            <path
              d="M14 16C14 13.7909 15.7909 12 18 12H30C32.2091 12 34 13.7909 34 16V26C34 28.2091 32.2091 30 30 30H24L18 34V30H18C15.7909 30 14 28.2091 14 26V16Z"
              fill="white"
              fillOpacity="0.25"
              className={activeMotion ? 'animate-bookly-capsule' : ''}
            />

            {/* Central Spark / Star Motif (Twirling & Scaling) */}
            <path
              d="M24 15L25.6 20.4L31 22L25.6 23.6L24 29L22.4 23.6L17 22L22.4 20.4L24 15Z"
              fill="white"
              className={activeMotion ? 'animate-bookly-star-spin' : ''}
            />

            {/* Satellite Dot (Orbiting in loop) */}
            <circle
              cx="24"
              cy="22"
              r="1.8"
              fill="#E0E7FF"
              className={activeMotion ? 'animate-bookly-satellite' : ''}
            />

            <defs>
              <linearGradient id="bookly-dynamic-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818CF8" />
                <stop offset="0.5" stopColor="#6366F1" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Shimmer Light Reflection Sweep */}
          {activeMotion && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-bookly-shimmer"
            />
          )}
        </div>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${currentSize.text} ${activeMotion ? 'animate-pulse' : ''}`}>
            {text}
          </span>
          {activeMotion && (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
