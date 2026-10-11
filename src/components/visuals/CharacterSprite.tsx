import React from 'react';
import { Character } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';

interface CharacterSpriteProps {
  character: Character;
  direction?: 'north' | 'south' | 'east' | 'west';
  isMoving?: boolean;
  isSelected?: boolean;
  scale?: number;
  showShadow?: boolean;
  className?: string;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  character,
  direction = 'south',
  isMoving = false,
  isSelected = true,
  scale = 1,
  showShadow = true,
  className = '',
}) => {
  const isFemale = character.gender === 'female';
  const equippedWeapon = character.equippedWeaponId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId)
    : null;
  const hasRangedWeapon = equippedWeapon?.weaponData?.range && equippedWeapon.weaponData.range !== 'melee';
  const hasMeleeWeapon = equippedWeapon?.weaponData?.range === 'melee';

  // Flip horizontally if facing west
  const flipX = direction === 'west';

  return (
    <div
      className={`relative inline-block select-none pointer-events-none transition-transform duration-200 ${className}`}
      style={{
        width: 48 * scale,
        height: 60 * scale,
      }}
    >
      {/* Tactical Selection Ring */}
      {isSelected && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-4 rounded-full border border-amber-400/80 bg-amber-400/10 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"
          style={{ width: 40 * scale, height: 16 * scale }}
        />
      )}

      {/* Shadow */}
      {showShadow && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-3 rounded-full bg-black/60 blur-[1px]"
          style={{ width: 36 * scale, height: 12 * scale }}
        />
      )}

      {/* SVG Stylized 2D Sprite */}
      <svg
        viewBox="0 0 64 80"
        className={`w-full h-full overflow-visible transition-transform duration-150 ${flipX ? '-scale-x-100' : ''} ${
          isMoving ? 'animate-bounce' : ''
        }`}
        style={{
          filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.7))',
        }}
      >
        <defs>
          {/* Gradients for survivor clothing */}
          <linearGradient id="charJacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5542" />
            <stop offset="50%" stopColor="#374130" />
            <stop offset="100%" stopColor="#252c20" />
          </linearGradient>

          <linearGradient id="charPantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d372e" />
            <stop offset="100%" stopColor="#221e19" />
          </linearGradient>

          <linearGradient id="charSkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2b998" />
            <stop offset="100%" stopColor="#bc8a64" />
          </linearGradient>

          <linearGradient id="metalGunGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="woodStockGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#543007" />
          </linearGradient>
        </defs>

        {/* --- BACKPACK (Behind torso) --- */}
        <path
          d="M 18,28 C 16,22 20,18 26,18 L 38,18 C 44,18 48,22 46,28 L 45,46 C 45,50 40,52 32,52 C 24,52 19,50 19,46 Z"
          fill="#5c4033"
          stroke="#261b14"
          strokeWidth="1.5"
        />
        {/* Sleeping bag strapped to backpack */}
        <rect x="20" y="14" width="24" height="6" rx="3" fill="#3b4231" stroke="#1f231a" strokeWidth="1" />
        <line x1="26" y1="14" x2="26" y2="20" stroke="#1f231a" strokeWidth="1" />
        <line x1="38" y1="14" x2="38" y2="20" stroke="#1f231a" strokeWidth="1" />

        {/* --- LEGS / BOOTS --- */}
        {/* Left leg */}
        <path d="M 23,50 L 21,68 L 29,68 L 29,50 Z" fill="url(#charPantsGrad)" stroke="#171512" strokeWidth="1.2" />
        {/* Right leg */}
        <path d="M 35,50 L 35,68 L 43,68 L 41,50 Z" fill="url(#charPantsGrad)" stroke="#171512" strokeWidth="1.2" />
        {/* Kneepads */}
        <rect x="20" y="56" width="9" height="7" rx="2" fill="#52525b" stroke="#27272a" strokeWidth="1" />
        <rect x="35" y="56" width="9" height="7" rx="2" fill="#52525b" stroke="#27272a" strokeWidth="1" />
        {/* Heavy boots */}
        <path d="M 19,67 L 29,67 L 30,74 L 17,74 Z" fill="#1c1917" stroke="#0c0a09" strokeWidth="1.2" />
        <path d="M 35,67 L 45,67 L 47,74 L 34,74 Z" fill="#1c1917" stroke="#0c0a09" strokeWidth="1.2" />

        {/* --- TORSO & JACKET --- */}
        {/* Body jacket */}
        <path
          d="M 20,26 L 44,26 L 46,52 C 46,54 42,55 32,55 C 22,55 18,54 18,52 Z"
          fill="url(#charJacketGrad)"
          stroke="#1c2117"
          strokeWidth="1.5"
        />

        {/* Tactical vest / Straps */}
        <line x1="24" y1="26" x2="26" y2="52" stroke="#262626" strokeWidth="2.5" />
        <line x1="40" y1="26" x2="38" y2="52" stroke="#262626" strokeWidth="2.5" />
        <rect x="28" y="38" width="8" height="6" rx="1" fill="#713f12" stroke="#3c1e05" strokeWidth="1" />
        {/* Pip-Boy / Arm computer on left wrist */}
        <rect x="14" y="42" width="6" height="8" rx="2" fill="#292524" stroke="#0c0a09" strokeWidth="1" />
        <rect x="15" y="44" width="4" height="4" rx="0.5" fill="#22c55e" />

        {/* Belt & Buckle */}
        <rect x="19" y="48" width="26" height="4" fill="#18181b" />
        <rect x="30" y="47.5" width="4" height="5" rx="0.5" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />

        {/* --- HEAD & FACE --- */}
        {/* Neck */}
        <rect x="28" y="22" width="8" height="6" fill="url(#charSkinGrad)" />
        {/* Head */}
        <circle cx="32" cy="18" r="8.5" fill="url(#charSkinGrad)" stroke="#78350f" strokeWidth="1" />

        {/* Scarf / Gas mask / Bandana over lower face */}
        <path
          d="M 25,18 C 25,24 39,24 39,18 C 39,22 36,26 32,26 C 28,26 25,22 25,18 Z"
          fill="#3f3f46"
          stroke="#18181b"
          strokeWidth="1"
        />
        {/* Filter canister on mask */}
        <circle cx="32" cy="22" r="2.5" fill="#71717a" stroke="#27272a" strokeWidth="0.8" />

        {/* Eyes / Goggles */}
        {direction !== 'north' ? (
          <g>
            <rect x="26" y="14" width="5" height="3" rx="1.5" fill="#0284c7" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="33" y="14" width="5" height="3" rx="1.5" fill="#0284c7" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="31" y1="15.5" x2="33" y2="15.5" stroke="#0f172a" strokeWidth="1" />
          </g>
        ) : null}

        {/* Hair / Ushanka or Cap */}
        <path
          d="M 23,17 C 23,10 41,10 41,17 C 41,13 38,10 32,10 C 26,10 23,13 23,17 Z"
          fill={isFemale ? '#7c2d12' : '#27272a'}
          stroke="#09090b"
          strokeWidth="1"
        />
        {/* Warm cap with earflaps */}
        <path d="M 22,12 C 24,7 40,7 42,12 L 43,15 L 21,15 Z" fill="#44403c" stroke="#1c1917" strokeWidth="1" />

        {/* --- WEAPONS LAYER --- */}
        {hasRangedWeapon ? (
          // Rifle / Carbine slung across or held ready
          <g transform="translate(34, 30) rotate(-25)">
            {/* Wooden stock */}
            <rect x="0" y="4" width="16" height="5" rx="1" fill="url(#woodStockGrad)" stroke="#271804" strokeWidth="0.8" />
            {/* Metal receiver & barrel */}
            <rect x="12" y="3" width="24" height="4" rx="0.5" fill="url(#metalGunGrad)" stroke="#090d16" strokeWidth="0.8" />
            {/* Sight */}
            <rect x="32" y="1" width="2" height="2" fill="#94a3b8" />
            {/* Magazine */}
            <rect x="17" y="7" width="4" height="6" rx="0.5" fill="#1e293b" />
          </g>
        ) : hasMeleeWeapon ? (
          // Hunting Knife or Melee weapon in hand
          <g transform="translate(42, 36) rotate(35)">
            <rect x="0" y="0" width="4" height="7" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
            <rect x="-1" y="6" width="6" height="2" fill="#71717a" />
            <path d="M 0,8 L 4,8 L 3,20 L 0,16 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
          </g>
        ) : (
          // Fist / knuckles
          <circle cx="43" cy="40" r="3" fill="url(#charSkinGrad)" stroke="#78350f" strokeWidth="0.8" />
        )}

        {/* Left hand holding sling / compass */}
        <circle cx="21" cy="40" r="3" fill="url(#charSkinGrad)" stroke="#78350f" strokeWidth="0.8" />
      </svg>
    </div>
  );
};
