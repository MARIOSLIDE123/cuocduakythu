import React from 'react';

interface HorseProps {
  number: number;
  color: string;
  isRacing?: boolean;
  isWinner?: boolean;
  isLeader?: boolean;
  isSprinting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDust?: boolean;
}

export const Horse: React.FC<HorseProps> = ({
  number,
  color,
  isRacing = false,
  isWinner = false,
  isLeader = false,
  isSprinting = false,
  size = 'md',
  showDust = true,
}) => {
  // Dimensions based on size
  const sizeConfig = {
    sm: { width: 56, height: 42 },
    md: { width: 78, height: 56 },
    lg: { width: 104, height: 74 },
    xl: { width: 144, height: 104 },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isRacing ? 'animate-gallop' : ''
      } ${isWinner ? 'animate-winner' : ''}`}
    >
      {/* Dynamic dust trail particles during race */}
      {isRacing && showDust && (
        <div className="absolute -left-4 bottom-0 flex gap-1 pointer-events-none z-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70 animate-ping" />
          <span className="w-3 h-3 rounded-full bg-amber-600/50 -translate-x-1.5 animate-pulse" />
          {isSprinting && (
            <span className="w-3.5 h-2 rounded-full bg-orange-400/80 -translate-x-3 blur-xs animate-pulse" />
          )}
        </div>
      )}

      {/* Speed wind streaks when sprinting */}
      {isRacing && (isSprinting || isLeader) && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-85">
          <div className="w-7 h-0.5 bg-gradient-to-l from-amber-400 to-transparent rounded-full animate-pulse" />
          <div className="w-9 h-0.5 bg-gradient-to-l from-orange-400 to-transparent rounded-full -translate-x-1" />
          <div className="w-6 h-0.5 bg-gradient-to-l from-yellow-300 to-transparent rounded-full" />
        </div>
      )}

      {/* SVG Galloping Racehorse & Jockey */}
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 68 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg overflow-visible z-10"
      >
        {/* Back Leg (Far side) */}
        <g className={isRacing ? 'animate-back-leg' : ''}>
          <path
            d="M18 32 L11 43 L5 46"
            stroke="#4A2614"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Far Back Hoof */}
          <circle cx="5" cy="46" r="2.2" fill="#0F172A" />
        </g>

        {/* Front Leg (Far side) */}
        <g className={isRacing ? 'animate-front-leg' : ''}>
          <path
            d="M42 32 L47 42 L55 47"
            stroke="#4A2614"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Far Front Hoof */}
          <circle cx="55" cy="47" r="2.2" fill="#0F172A" />
        </g>

        {/* Flowing Horse Tail */}
        <path
          d="M8 25 C0 29, -2 37, 1 43"
          stroke="#2A140A"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Horse Muscular Body */}
        <ellipse cx="30" cy="27" rx="18" ry="11" fill="#8B4513" />
        {/* Muscle shadow */}
        <path
          d="M17 29 C23 37, 37 37, 43 29 Z"
          fill="#6D3209"
          opacity="0.6"
        />

        {/* Horse Neck & Head */}
        <path
          d="M39 25 L50 11 C51 9, 56 7, 60 9 C63 11, 62 15, 58 18 L46 28 Z"
          fill="#8B4513"
        />

        {/* Horse Ears */}
        <path d="M52 9 L54 3 L57 8 Z" fill="#6D3209" />

        {/* Horse Mane */}
        <path
          d="M49 10 C46 14, 42 19, 40 24"
          stroke="#2A140A"
          strokeWidth="3.8"
          strokeLinecap="round"
        />

        {/* Horse Eye */}
        <circle cx="57" cy="12" r="1.6" fill="#FFFFFF" />
        <circle cx="57.5" cy="12" r="0.9" fill="#0F172A" />

        {/* Bridle & Reins */}
        <path
          d="M59 14 L52 16 L48 23"
          stroke="#E2E8F0"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M52 16 L39 17"
          stroke="#F8FAFC"
          strokeWidth="1.2"
          strokeDasharray="3 1"
        />

        {/* Saddle Blanket with Team Silk Color */}
        <path
          d="M22 21 Q31 23 39 21 L37 31 Q31 33 24 31 Z"
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="1.4"
        />

        {/* Saddle Leather */}
        <ellipse cx="31" cy="22" rx="5.5" ry="3" fill="#1E1E1E" />

        {/* Jockey Torso with Silk Color */}
        <path
          d="M25 20 L32 10 L38 18 Z"
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* Jockey Head & Helmet */}
        <circle cx="33" cy="7.5" r="4.8" fill="#FBBF24" />
        <path
          d="M28 6.5 C28 3, 37 3, 37 6.5 L38 7.5 L27 7.5 Z"
          fill={color}
        />
        {/* Helmet Visor */}
        <path d="M36 7.5 L40 8.5 L37 9.5 Z" fill="#FFFFFF" />

        {/* Jockey Arm */}
        <path
          d="M32 13 L40 17 L52 16"
          stroke="#FBBF24"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Prominent Number Badge (High Contrast Online-Stopwatch Derby Style) */}
        <ellipse cx="30.5" cy="26" rx="6.8" ry="5.8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.1" />
        <text
          x="30.5"
          y="28.8"
          fontSize="7.8"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          fill="#0F172A"
        >
          {number}
        </text>

        {/* Back Leg (Near side) */}
        <g className={isRacing ? 'animate-back-leg' : ''}>
          <path
            d="M21 32 L16 43 L9 46"
            stroke="#8B4513"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Near Back Hoof */}
          <circle cx="9" cy="46" r="2.4" fill="#0F172A" />
        </g>

        {/* Front Leg (Near side) */}
        <g className={isRacing ? 'animate-front-leg' : ''}>
          <path
            d="M40 32 L44 41 L51 47"
            stroke="#8B4513"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Near Front Hoof */}
          <circle cx="51" cy="47" r="2.4" fill="#0F172A" />
        </g>
      </svg>

      {/* Leading Horse Crown */}
      {isWinner && (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xl drop-shadow-lg animate-bounce z-20">
          👑
        </span>
      )}
    </div>
  );
};
