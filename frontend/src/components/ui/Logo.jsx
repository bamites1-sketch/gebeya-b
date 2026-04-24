import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Size → pixel height map
const HEIGHTS = { xs: 28, sm: 36, md: 44, lg: 60, xl: 80, '2xl': 108 };

// ─────────────────────────────────────────────────────────────────────────────
// LogoImg — the raw <img> with error fallback (no Link, no motion)
// ─────────────────────────────────────────────────────────────────────────────
function LogoImg({ h, className = '' }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div
        className="rounded-full bg-[#2C1810] border-[3px] border-[#F19A0E] flex flex-col items-center justify-center text-center shrink-0"
        style={{ width: h, height: h }}
      >
        <span className="text-[#F19A0E] font-black leading-none" style={{ fontSize: h * 0.19 }}>
          ገበያ
        </span>
        <span className="text-[#FCDD09] font-bold leading-none" style={{ fontSize: h * 0.14 }}>
          -B
        </span>
      </div>
    );
  }

  return (
    <img
      src="/logo.jpg"
      alt="Made in Ethiopia — gebeya-B"
      className={`object-contain shrink-0 ${className}`}
      style={{ height: h, width: 'auto' }}
      onError={() => setErr(true)}
      draggable={false}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GebeyaLogo — main reusable logo component
//
// Props:
//   size      xs | sm | md | lg | xl | 2xl   (default: md)
//   showText  bool — show "ገበያ-B / Made in Ethiopia" text beside logo
//   linkTo    string | null — wraps in <Link>; pass null to skip link
//   animate   bool — framer-motion fade+scale on mount + hover
//   className string — extra classes on the wrapper
//   glow      bool — gold drop-shadow glow (default true)
// ─────────────────────────────────────────────────────────────────────────────
export default function GebeyaLogo({
  size = 'md',
  showText = false,
  linkTo = '/',
  animate = false,
  className = '',
  glow = true,
}) {
  const h = HEIGHTS[size] || 44;

  const glowStyle = glow
    ? { filter: 'drop-shadow(0 0 8px rgba(241,154,14,0.45))' }
    : {};

  const hoverStyle = glow
    ? { filter: 'drop-shadow(0 0 16px rgba(241,154,14,0.75))' }
    : {};

  // Inner content
  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {animate ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.07 }}
          style={glowStyle}
          className="transition-all duration-300"
        >
          <LogoImg h={h} />
        </motion.div>
      ) : (
        <div
          className="transition-all duration-300 group-hover:scale-105"
          style={glowStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, glowStyle)}
        >
          <LogoImg h={h} />
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-black text-[#F19A0E] tracking-tight"
            style={{ fontSize: Math.max(14, h * 0.32) }}
          >
            ገበያ-B
          </span>
          <span
            className="font-semibold text-gray-400 uppercase tracking-widest"
            style={{ fontSize: Math.max(8, h * 0.15) }}
          >
            Made in Ethiopia
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo === null) return content;
  return <Link to={linkTo}>{content}</Link>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MadeInEthiopiaBadge — small overlay pill for product cards
// ─────────────────────────────────────────────────────────────────────────────
export function MadeInEthiopiaBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-[#2C1810]/80 backdrop-blur-sm
        text-[#FCDD09] text-[10px] font-bold px-2 py-0.5 rounded-full
        border border-[#F19A0E]/40 tracking-wide leading-none ${className}`}
    >
      <img
        src="/logo.jpg"
        alt=""
        className="w-4 h-4 object-cover rounded-full shrink-0"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      🇪🇹 Made in Ethiopia
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EthiopianFlagStripe — green / yellow / red stripe
// ─────────────────────────────────────────────────────────────────────────────
export function EthiopianFlagStripe({ height = 3, className = '' }) {
  return (
    <div
      className={`w-full ${className}`}
      style={{
        height,
        background: 'linear-gradient(90deg, #078930 33%, #FCDD09 33% 66%, #DA121A 66%)',
      }}
      aria-hidden="true"
    />
  );
}
