import React from 'react';
import { Character } from '../../types/game';
import { ITEM_DATABASE } from '../../data/items';

export type SpriteDirection = 'south' | 'north' | 'east' | 'west' | 'se' | 'sw' | 'ne' | 'nw';

interface CharacterSpriteProps {
  character: Character;
  direction?: SpriteDirection;
  isMoving?: boolean;
  isSelected?: boolean;
  scale?: number;
  showShadow?: boolean;
  flashlightOn?: boolean;
  className?: string;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  character,
  direction = 'south',
  isMoving = false,
  isSelected = true,
  scale = 1,
  showShadow = true,
  flashlightOn = false,
  className = '',
}) => {
  const isFemale = character.gender === 'female';
  const weapon = character.equippedWeaponId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedWeaponId)
    : null;
  const armor = character.equippedArmorId
    ? ITEM_DATABASE.find((i) => i.id === character.equippedArmorId)
    : null;

  const armorId = armor?.id || 'default';
  const weaponId = weapon?.id || 'unarmed';

  // Normalize direction to flipX and isBackFacing
  const flipX = direction === 'west' || direction === 'sw' || direction === 'nw';
  const isBack = direction === 'north' || direction === 'ne' || direction === 'nw';

  return (
    <div
      className={`relative inline-block select-none pointer-events-none transition-transform duration-200 ${className}`}
      style={{
        width: 52 * scale,
        height: 64 * scale,
      }}
    >
      {/* Flashlight Beam */}
      {flashlightOn && (
        <div
          className={`absolute top-1/2 ${
            flipX ? 'right-1/2 origin-right -rotate-15' : 'left-1/2 origin-left rotate-15'
          } -translate-y-1/2 w-32 h-16 pointer-events-none z-0`}
          style={{
            background: flipX
              ? 'radial-gradient(ellipse at 100% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 80%)'
              : 'radial-gradient(ellipse at 0% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 80%)',
            clipPath: flipX
              ? 'polygon(100% 45%, 0% 0%, 0% 100%, 100% 55%)'
              : 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)',
          }}
        />
      )}

      {/* Tactical Selection Ring */}
      {isSelected && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-4 rounded-full border border-amber-400/80 bg-amber-400/10 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"
          style={{ width: 44 * scale, height: 16 * scale }}
        />
      )}

      {/* Shadow */}
      {showShadow && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full bg-black/70 blur-[1px]"
          style={{ width: 40 * scale, height: 12 * scale }}
        />
      )}

      {/* SVG Stylized 2D Isometric Sprite */}
      <svg
        viewBox="0 0 64 80"
        className={`w-full h-full overflow-visible transition-transform duration-150 ${flipX ? '-scale-x-100' : ''} ${
          isMoving ? 'animate-bounce' : ''
        }`}
        style={{
          filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.8))',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="charSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2b998" />
            <stop offset="100%" stopColor="#bc8a64" />
          </linearGradient>

          {/* Armor Gradients */}
          <linearGradient id="survivorJacket" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5542" />
            <stop offset="50%" stopColor="#374130" />
            <stop offset="100%" stopColor="#252c20" />
          </linearGradient>

          <linearGradient id="vaultSuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="60%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <linearGradient id="metalPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="raiderLeather" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f2e24" />
            <stop offset="50%" stopColor="#271c16" />
            <stop offset="100%" stopColor="#17120e" />
          </linearGradient>

          <linearGradient id="tactical6b2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334139" />
            <stop offset="50%" stopColor="#222e27" />
            <stop offset="100%" stopColor="#131c17" />
          </linearGradient>

          {/* Weapons */}
          <linearGradient id="steelBlade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="laserGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* --- LAYER 1: BACKPACK (Visible behind torso) --- */}
        <path
          d="M 18,28 C 16,22 20,18 26,18 L 38,18 C 44,18 48,22 46,28 L 45,46 C 45,50 40,52 32,52 C 24,52 19,50 19,46 Z"
          fill="#3b3323"
          stroke="#1e180f"
          strokeWidth="1.5"
        />
        {/* Backpack straps/pockets */}
        <path d="M 22,28 L 42,28 L 41,38 L 23,38 Z" fill="#2d261a" stroke="#1a150c" strokeWidth="1" />
        <rect x="25" y="40" width="14" height="8" rx="2" fill="#2d261a" stroke="#1a150c" strokeWidth="1" />
        <line x1="22" y1="22" x2="22" y2="46" stroke="#524430" strokeWidth="1" />
        <line x1="42" y1="22" x2="42" y2="46" stroke="#524430" strokeWidth="1" />

        {/* --- LAYER 2: LEGS & PANTS --- */}
        <g id="legs">
          {/* Left Leg */}
          <path
            d="M 23,48 L 21,68 L 27,69 L 29,48 Z"
            fill={armorId === 'vault_suit' ? '#172554' : '#27231c'}
            stroke="#12100d"
            strokeWidth="1.2"
          />
          {/* Right Leg */}
          <path
            d="M 35,48 L 37,68 L 43,67 L 41,48 Z"
            fill={armorId === 'vault_suit' ? '#1e3a8a' : '#332d24'}
            stroke="#12100d"
            strokeWidth="1.2"
          />

          {/* Heavy Boots */}
          <path d="M 18,67 L 27,67 L 28,73 L 16,73 Z" fill="#181512" stroke="#0a0807" strokeWidth="1.2" />
          <path d="M 37,67 L 46,67 L 48,73 L 36,73 Z" fill="#181512" stroke="#0a0807" strokeWidth="1.2" />

          {/* Knee guards for heavy armor */}
          {(armorId === 'metal_armor' || armorId === 'tactical_vest_6b2') && (
            <>
              <rect x="20" y="56" width="8" height="6" rx="1.5" fill="#475569" stroke="#0f172a" strokeWidth="1" />
              <rect x="36" y="56" width="8" height="6" rx="1.5" fill="#475569" stroke="#0f172a" strokeWidth="1" />
            </>
          )}
        </g>

        {/* --- LAYER 3: TORSO & MODULAR ARMOR --- */}
        <g id="torso">
          {armorId === 'vault_suit' ? (
            /* Vault 101 Suit */
            <>
              <path
                d="M 20,27 L 44,27 L 42,50 L 22,50 Z"
                fill="url(#vaultSuit)"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* Yellow stripes */}
              <line x1="32" y1="28" x2="32" y2="50" stroke="#eab308" strokeWidth="2" />
              <line x1="22" y1="34" x2="42" y2="34" stroke="#eab308" strokeWidth="1" />
              <circle cx="32" cy="40" r="3.5" fill="#eab308" />
              <text x="32" y="42" fontSize="4" textAnchor="middle" fill="#1e3a8a" fontWeight="bold">101</text>
            </>
          ) : armorId === 'metal_armor' ? (
            /* Welded Metal Plating */
            <>
              <path
                d="M 19,26 L 45,26 L 43,50 L 21,50 Z"
                fill="url(#metalPlate)"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* Riveted steel plates */}
              <line x1="20" y1="36" x2="44" y2="36" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="23" cy="30" r="1" fill="#cbd5e1" />
              <circle cx="41" cy="30" r="1" fill="#cbd5e1" />
              <circle cx="23" cy="44" r="1" fill="#cbd5e1" />
              <circle cx="41" cy="44" r="1" fill="#cbd5e1" />
              {/* Pauldron */}
              <path d="M 16,24 L 24,24 L 23,34 L 15,30 Z" fill="#64748b" stroke="#0f172a" strokeWidth="1.2" />
            </>
          ) : armorId === 'raider_leathers' ? (
            /* Raider Leathers with tire shoulder pad */
            <>
              <path
                d="M 20,27 L 44,27 L 42,50 L 22,50 Z"
                fill="url(#raiderLeather)"
                stroke="#12100d"
                strokeWidth="1.5"
              />
              <path d="M 15,24 L 23,24 L 21,33 L 14,30 Z" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
              <line x1="16" y1="26" x2="19" y2="21" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="20" y1="26" x2="23" y2="21" stroke="#a1a1aa" strokeWidth="1.5" />
              <path d="M 22,46 L 42,46 L 41,50 L 23,50 Z" fill="#713f12" stroke="#451a03" strokeWidth="1" />
            </>
          ) : armorId === 'tactical_vest_6b2' ? (
            /* Soviet 6B2 Vest */
            <>
              <path
                d="M 19,26 L 45,26 L 43,50 L 21,50 Z"
                fill="url(#tactical6b2)"
                stroke="#09110d"
                strokeWidth="1.5"
              />
              {/* Pouches */}
              <rect x="23" y="38" width="8" height="9" rx="1.5" fill="#1c2720" stroke="#09110d" strokeWidth="1" />
              <rect x="33" y="38" width="8" height="9" rx="1.5" fill="#1c2720" stroke="#09110d" strokeWidth="1" />
              <line x1="22" y1="32" x2="42" y2="32" stroke="#09110d" strokeWidth="1.2" />
            </>
          ) : (
            /* Standard Survivor Jacket */
            <>
              <path
                d="M 20,27 L 44,27 L 42,50 L 22,50 Z"
                fill="url(#survivorJacket)"
                stroke="#151b12"
                strokeWidth="1.5"
              />
              {/* Collar */}
              <path d="M 24,26 L 32,34 L 40,26 Z" fill="#451a03" stroke="#1f0a00" strokeWidth="1" />
              <line x1="32" y1="34" x2="32" y2="50" stroke="#1f291e" strokeWidth="1.5" />
              {/* Belt */}
              <rect x="21" y="46" width="22" height="4" fill="#3f2e24" stroke="#1c130d" strokeWidth="1" />
              <rect x="30" y="45" width="4" height="6" fill="#ca8a04" stroke="#713f12" strokeWidth="0.8" />
            </>
          )}
        </g>

        {/* --- LAYER 4: HEAD, FACE & HEADGEAR --- */}
        <g id="head">
          {/* Neck */}
          <rect x="29" y="22" width="6" height="6" fill="url(#charSkin)" stroke="#7c4a27" strokeWidth="0.8" />

          {/* Head Base */}
          <ellipse
            cx="32"
            cy="17"
            rx={isFemale ? 6.5 : 7.2}
            ry={isFemale ? 7.5 : 8}
            fill="url(#charSkin)"
            stroke="#63391d"
            strokeWidth="1"
          />

          {!isBack ? (
            /* Front Face Features */
            <>
              {/* Hair */}
              <path
                d={
                  isFemale
                    ? 'M 24,14 C 24,8 40,8 40,14 C 40,18 39,21 39,21 L 37,17 L 27,17 L 25,21 Z'
                    : 'M 24,14 C 24,9 40,9 40,14 C 38,13 36,12 32,12 C 28,12 26,13 24,14 Z'
                }
                fill={isFemale ? '#7c2d12' : '#27201c'}
                stroke="#181310"
                strokeWidth="0.8"
              />

              {/* Eyes */}
              <circle cx="29" cy="16" r="1.1" fill="#1e293b" />
              <circle cx="35" cy="16" r="1.1" fill="#1e293b" />
              <line x1="27.5" y1="14" x2="30.5" y2="14.5" stroke="#372f2a" strokeWidth="0.8" />
              <line x1="33.5" y1="14.5" x2="36.5" y2="14" stroke="#372f2a" strokeWidth="0.8" />

              {/* Stubble / Mouth */}
              {!isFemale && <path d="M 28,20 Q 32,23 36,20" stroke="#8c6246" strokeWidth="0.8" fill="none" />}
              <line x1="30" y1="21" x2="34" y2="21" stroke="#5c3822" strokeWidth="0.8" />

              {/* Headgear: GP-5 Gas Mask if wearing gas mask or metal helmet */}
              {armorId === 'metal_armor' ? (
                /* Combat Helmet SSh-68 */
                <path
                  d="M 23,15 C 23,7 41,7 41,15 L 43,17 L 21,17 Z"
                  fill="#334139"
                  stroke="#0f172a"
                  strokeWidth="1.2"
                />
              ) : null}
            </>
          ) : (
            /* Back of Head */
            <path
              d="M 24,16 C 24,8 40,8 40,16 C 40,22 38,24 32,24 C 26,24 24,22 24,16 Z"
              fill="#27201c"
              stroke="#12100d"
              strokeWidth="1"
            />
          )}
        </g>

        {/* --- LAYER 5: ARMS & MODULAR WEAPON --- */}
        <g id="weapon_and_arms">
          {/* Left Arm (Support) */}
          <path
            d="M 20,29 L 14,40 L 19,43 L 23,34 Z"
            fill={armorId === 'vault_suit' ? '#1e3a8a' : '#374130'}
            stroke="#151b12"
            strokeWidth="1"
          />

          {/* Right Arm (Wielding) */}
          <path
            d="M 44,29 L 52,38 L 47,43 L 41,33 Z"
            fill={armorId === 'vault_suit' ? '#1e3a8a' : '#374130'}
            stroke="#151b12"
            strokeWidth="1"
          />

          {/* Dynamic Weapon in hands */}
          {weaponId === 'pipe_rifle' || weaponId === 'sks_carbine' ? (
            /* Long rifle / carbine */
            <g transform="translate(18, 22) rotate(18)">
              {/* Wooden Stock */}
              <path d="M -2,12 L 10,10 L 10,13 L 0,16 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
              {/* Receiver & Long Barrel */}
              <rect x="10" y="9" width="30" height="3" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
              {/* Magazine */}
              <path d="M 16,12 L 20,12 L 18,17 L 15,16 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="0.6" />
              {/* Muzzle */}
              <rect x="40" y="9.5" width="2" height="2" fill="#64748b" />
            </g>
          ) : weaponId === 'hunting_shotgun' ? (
            /* Shotgun */
            <g transform="translate(18, 24) rotate(16)">
              <path d="M 0,10 L 8,9 L 8,13 L 2,15 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
              <rect x="8" y="8" width="24" height="4" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
              <line x1="8" y1="10" x2="32" y2="10" stroke="#475569" strokeWidth="0.6" />
            </g>
          ) : weaponId === 'laser_pistol' ? (
            /* Wattz 1000 Laser Pistol */
            <g transform="translate(36, 32) rotate(10)">
              <rect x="0" y="0" width="14" height="6" rx="1" fill="#475569" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="14" y="1.5" width="4" height="3" fill="url(#laserGlow)" stroke="#ef4444" strokeWidth="0.6" />
              <line x1="2" y1="3" x2="12" y2="3" stroke="#ef4444" strokeWidth="1" />
            </g>
          ) : weaponId === 'combat_knife' || weaponId === 'hunting_knife' ? (
            /* Blade */
            <g transform="translate(46, 34) rotate(-35)">
              <rect x="0" y="0" width="4" height="7" fill="#451a03" stroke="#1f0a00" strokeWidth="0.6" />
              <path d="M 1,7 L 4,7 L 3,19 L 0,16 Z" fill="url(#steelBlade)" stroke="#334155" strokeWidth="0.8" />
            </g>
          ) : weaponId === 'sledgehammer' ? (
            /* Sledgehammer */
            <g transform="translate(40, 16) rotate(25)">
              <rect x="2" y="0" width="3" height="32" fill="#64748b" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="-4" y="0" width="15" height="9" rx="1.5" fill="#334155" stroke="#0f172a" strokeWidth="1" />
            </g>
          ) : (
            /* Unarmed fists */
            <>
              <circle cx="21" cy="42" r="3" fill="url(#charSkin)" stroke="#7c4a27" strokeWidth="0.8" />
              <circle cx="48" cy="41" r="3" fill="url(#charSkin)" stroke="#7c4a27" strokeWidth="0.8" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
