import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2C1810] text-white/60 relative overflow-hidden">
      <div className="absolute inset-0 pattern-tibeb opacity-15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Top row — brand + nav links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img src="/logo.jpg" alt="gebeya-B"
              className="h-9 w-9 object-contain rounded-full group-hover:scale-105 transition-transform"
              style={{ filter: 'drop-shadow(0 0 6px rgba(241,154,14,0.4))' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="leading-none">
              <p className="font-black text-white text-sm">gebeya-B</p>
              <p className="text-[10px] text-white/40 mt-0.5">Ethiopian Cultural Marketplace</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium">
            {[
              ['/', 'Home'],
              ['/products', 'Shop'],
              ['/products?category=clothing', 'Clothing'],
              ['/products?category=crafts', 'Crafts'],
              ['/products?category=music', 'Music'],
              ['/about', 'About'],
            ].map(([to, label]) => (
              <Link key={to + label} to={to}
                className="hover:text-[#F19A0E] transition-colors whitespace-nowrap">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-4" />

        {/* Bottom row — copyright + developer + socials */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs">

          {/* Copyright */}
          <p className="text-white/30">
            © {new Date().getFullYear()} gebeya-B · Built by{' '}
            <a href="mailto:bamites1@gmail.com" className="text-[#F19A0E]/70 hover:text-[#F19A0E] transition-colors">
              Beamlak Tesfahun
            </a>
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a href="mailto:bamites1@gmail.com"
              className="flex items-center gap-1 hover:text-[#F19A0E] transition-colors"
              title="Email">
              📧 <span className="hidden sm:inline">Email</span>
            </a>
            <a href="https://github.com/bamites1-sketch" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#F19A0E] transition-colors"
              title="GitHub">
              🐙 <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="https://t.me/BAM3_6" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#F19A0E] transition-colors"
              title="Telegram">
              ✈️ <span className="hidden sm:inline">Telegram</span>
            </a>
            <span className="flex items-center gap-1 text-[#FCDD09]/70">
              🇪🇹 <span className="hidden sm:inline">Made in Ethiopia</span>
            </span>
          </div>
        </div>
      </div>

      {/* Ethiopian flag stripe */}
      <div className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
    </footer>
  );
}
