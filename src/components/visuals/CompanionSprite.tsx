import React from 'react';

interface CompanionSpriteProps {
  petId: string;
  name?: string;
  isMoving?: boolean;
  scale?: number;
  className?: string;
}

export const CompanionSprite: React.FC<CompanionSpriteProps> = ({
  petId,
  isMoving = false,
  scale = 1,
  className = '',
}) => {
  if (petId === 'none' || !petId) {
    return null;
  }

  return (
    <div
      className={`relative inline-block select-none pointer-events-none transition-transform duration-200 ${className}`}
      style={{
        width: 38 * scale,
        height: 38 * scale,
      }}
    >
      {/* Companion Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-black/60 blur-[1px]"
        style={{ width: 28 * scale, height: 8 * scale }}
      />

      <svg
        viewBox="0 0 48 48"
        className={`w-full h-full overflow-visible ${isMoving ? 'animate-bounce' : ''}`}
        style={{
          filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.6))',
        }}
      >
        <defs>
          <linearGradient id="dogFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="catFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#71717a" />
            <stop offset="50%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#27272a" />
          </linearGradient>

          <linearGradient id="crowFeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="ferretFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <linearGradient id="boarHideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#57534e" />
            <stop offset="60%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
        </defs>

        {/* --- 1. BAIKAL: HOUND / SIBERIAN SHEPHERD --- */}
        {petId === 'hound' && (
          <g transform="translate(4, 4)">
            {/* Wagging Tail */}
            <path d="M 6,24 Q 2,16 6,10" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="20" cy="24" rx="14" ry="10" fill="url(#dogFurGrad)" stroke="#451a03" strokeWidth="1.2" />
            {/* Saddlebag / Pouch */}
            <rect x="14" y="18" width="10" height="9" rx="1.5" fill="#3f3f46" stroke="#18181b" strokeWidth="1" />
            <line x1="14" y1="22" x2="24" y2="22" stroke="#eab308" strokeWidth="1" />
            {/* Legs */}
            <line x1="12" y1="30" x2="11" y2="40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="17" y1="30" x2="18" y2="40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="24" y1="30" x2="23" y2="40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="29" y1="30" x2="30" y2="40" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {/* Head */}
            <circle cx="28" cy="16" r="7" fill="url(#dogFurGrad)" stroke="#451a03" strokeWidth="1.2" />
            {/* Alert Ears */}
            <polygon points="24,10 27,4 30,10" fill="#451a03" />
            <polygon points="30,10 33,5 36,11" fill="#451a03" />
            {/* Snout */}
            <ellipse cx="33" cy="18" rx="4" ry="3" fill="#fef3c7" stroke="#451a03" strokeWidth="0.8" />
            <circle cx="36" cy="17" r="1.5" fill="#0f172a" />
            {/* Eye */}
            <circle cx="29" cy="14" r="1.5" fill="#1e1b4b" />
            <circle cx="29.4" cy="13.7" r="0.5" fill="#ffffff" />
            {/* Collar */}
            <rect x="22" y="19" width="6" height="3" rx="1" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
          </g>
        )}

        {/* --- 2. BARSIK: CAT --- */}
        {petId === 'cat' && (
          <g transform="translate(6, 6)">
            {/* Tail curling */}
            <path d="M 6,22 C 2,14 4,8 10,8" fill="none" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round" />
            {/* Sleek Body */}
            <ellipse cx="18" cy="22" rx="11" ry="8" fill="url(#catFurGrad)" stroke="#27272a" strokeWidth="1.2" />
            {/* Stripes */}
            <path d="M 14,16 L 15,22 M 19,15 L 20,23 M 23,16 L 24,22" stroke="#18181b" strokeWidth="1.2" />
            {/* Paws */}
            <line x1="11" y1="28" x2="10" y2="36" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="16" y1="28" x2="16" y2="36" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="28" x2="22" y2="36" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cat Head */}
            <circle cx="25" cy="16" r="6" fill="url(#catFurGrad)" stroke="#27272a" strokeWidth="1.2" />
            {/* Pointy Ears */}
            <polygon points="21,12 23,6 26,11" fill="#27272a" />
            <polygon points="26,11 29,7 31,12" fill="#27272a" />
            {/* Glowing amber eyes */}
            <ellipse cx="27" cy="15" rx="1.5" ry="1.2" fill="#f59e0b" />
            <line x1="27" y1="14" x2="27" y2="16" stroke="#000" strokeWidth="0.8" />
            {/* Whiskers */}
            <line x1="29" y1="18" x2="35" y2="16" stroke="#d4d4d8" strokeWidth="0.8" />
            <line x1="29" y1="19" x2="35" y2="20" stroke="#d4d4d8" strokeWidth="0.8" />
          </g>
        )}

        {/* --- 3. KARKUN: CROW / RAVEN --- */}
        {petId === 'crow' && (
          <g transform="translate(6, 4)">
            {/* Wings */}
            <path
              d="M 18,18 C 10,8 4,14 8,24 C 12,22 16,20 18,20 Z"
              fill="url(#crowFeatherGrad)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            {/* Body */}
            <ellipse cx="20" cy="20" rx="9" ry="7" fill="url(#crowFeatherGrad)" stroke="#0f172a" strokeWidth="1.2" />
            {/* Tail feathers */}
            <polygon points="12,24 6,32 10,34 14,26" fill="#090d16" />
            {/* Perched claws */}
            <line x1="18" y1="26" x2="17" y2="34" stroke="#d97706" strokeWidth="1.8" />
            <line x1="22" y1="26" x2="23" y2="34" stroke="#d97706" strokeWidth="1.8" />
            {/* Head */}
            <circle cx="26" cy="14" r="5.5" fill="url(#crowFeatherGrad)" stroke="#0f172a" strokeWidth="1" />
            {/* Sharp beak */}
            <polygon points="30,13 38,15 30,17" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
            {/* Eye */}
            <circle cx="27" cy="13" r="1.2" fill="#38bdf8" />
          </g>
        )}

        {/* --- 4. YERMAK: STEPPE FERRET --- */}
        {petId === 'ferret' && (
          <g transform="translate(4, 8)">
            {/* Long fluffy tail */}
            <path d="M 4,20 C 0,16 2,10 6,8" fill="none" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />
            {/* Elongated tubular body */}
            <path
              d="M 6,18 Q 16,14 26,16 Q 30,22 18,24 Z"
              fill="url(#ferretFurGrad)"
              stroke="#451a03"
              strokeWidth="1.2"
            />
            {/* Short paws */}
            <circle cx="10" cy="24" r="2" fill="#451a03" />
            <circle cx="14" cy="24" r="2" fill="#451a03" />
            <circle cx="22" cy="24" r="2" fill="#451a03" />
            <circle cx="26" cy="24" r="2" fill="#451a03" />
            {/* Ferret Mask & Head */}
            <ellipse cx="28" cy="15" rx="5" ry="4" fill="#fef08a" stroke="#713f12" strokeWidth="1" />
            {/* Bandit mask band */}
            <rect x="25" y="13" width="6" height="3" rx="1.5" fill="#451a03" />
            <circle cx="28" cy="14.5" r="1" fill="#ffffff" />
            {/* Tiny round ears */}
            <circle cx="25" cy="11" r="2" fill="#ca8a04" stroke="#451a03" strokeWidth="0.6" />
          </g>
        )}

        {/* --- 5. BUYAN: WILD BOARLET --- */}
        {petId === 'boar' && (
          <g transform="translate(4, 6)">
            {/* Stubby curly tail */}
            <path d="M 6,20 Q 2,18 4,15" fill="none" stroke="#292524" strokeWidth="2" strokeLinecap="round" />
            {/* Stocky heavy body */}
            <ellipse cx="20" cy="22" rx="13" ry="11" fill="url(#boarHideGrad)" stroke="#1c1917" strokeWidth="1.4" />
            {/* Bristles along the back */}
            <path d="M 10,11 L 12,8 L 14,11 L 17,7 L 19,11 L 22,8 L 24,12" stroke="#1c1917" strokeWidth="1.5" />
            {/* Short sturdy legs & hooves */}
            <rect x="11" y="30" width="4" height="8" rx="1" fill="#292524" />
            <rect x="17" y="30" width="4" height="8" rx="1" fill="#292524" />
            <rect x="23" y="30" width="4" height="8" rx="1" fill="#292524" />
            {/* Heavy Snout and Head */}
            <polygon points="26,14 36,20 28,26" fill="url(#boarHideGrad)" stroke="#1c1917" strokeWidth="1.2" />
            {/* Disc snout */}
            <ellipse cx="35" cy="21" rx="2.5" ry="3.5" fill="#78716c" stroke="#44403c" strokeWidth="1" />
            {/* White Tusk */}
            <polygon points="32,23 35,18 31,21" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            {/* Eye */}
            <circle cx="28" cy="17" r="1.3" fill="#ef4444" />
            {/* Leather harness strap */}
            <line x1="16" y1="14" x2="21" y2="31" stroke="#854d0e" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
