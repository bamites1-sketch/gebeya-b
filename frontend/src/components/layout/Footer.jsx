import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2C1810] text-white/60 relative overflow-hidden">
      <div className="absolute inset-0 pattern-tibeb opacity-20 pointer-events-none" />

      {/* Main grid */}
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-4 group">
            <img src="/logo.jpg" alt="gebeya-B"
              className="h-14 w-14 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 0 8px rgba(241,154,14,0.4))' }}
              onError={(e) => { e.currentTarget.style.display='none'; }} />
            <div>
              <p className="font-black text-white text-lg leading-none">gebeya-B</p>
              <p className="text-xs text-white/40 mt-0.5">Ethiopian Cultural Marketplace</p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed mb-5">
            Connecting Ethiopian artisans with the world — one handmade treasure at a time.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span>🇪🇹</span>
            <span className="text-[#FCDD09] text-xs font-bold">Proudly Made in Ethiopia</span>
          </div>
          <div className="flex gap-1.5 mt-4">
            <span className="h-1 w-7 bg-[#078930] rounded-full" />
            <span className="h-1 w-7 bg-[#FCDD09] rounded-full" />
            <span className="h-1 w-7 bg-[#DA121A] rounded-full" />
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ['/', 'Home'],
              ['/products', 'All Products'],
              ['/products?category=clothing', 'Traditional Clothing'],
              ['/products?category=crafts', 'Handmade Crafts'],
              ['/products?category=music', 'Musical Instruments'],
              ['/about', 'About Us'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-[#F19A0E] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ['clothing', '👗 Traditional Clothing'],
              ['crafts',   '🏺 Handmade Crafts'],
              ['music',    '🎵 Musical Instruments'],
              ['art',      '🎨 Art & Paintings'],
              ['food',     '☕ Traditional Food'],
              ['accessories', '💍 Accessories'],
            ].map(([key, label]) => (
              <li key={key}>
                <Link to={`/products?category=${key}`} className="hover:text-[#F19A0E] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Developer */}
        <div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Developer</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">👨‍💻</span>
              <span className="text-white font-semibold">Beamlak Tesfahun</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">🎓</span>
              <span>3rd Year Software Engineering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">🏫</span>
              <span>Wollo University, Kombolcha</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">📍</span>
              <span>Kombolcha, Ethiopia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">📧</span>
              <a href="mailto:Beamlaktesfahunn@gmail.com" className="hover:text-[#F19A0E] transition-colors break-all">
                Beamlaktesfahunn@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">🐙</span>
              <a href="https://github.com/bamites1-sketch" target="_blank" rel="noopener noreferrer"
                className="hover:text-[#F19A0E] transition-colors">
                Beamlak (bamites1-sketch)
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">✈️</span>
              <a href="https://t.me/BAM3_6" target="_blank" rel="noopener noreferrer"
                className="hover:text-[#F19A0E] transition-colors">
                @BAM3_6
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" className="h-5 w-5 object-contain rounded-full opacity-40"
              onError={(e) => { e.currentTarget.style.display='none'; }} />
            <p>© {new Date().getFullYear()} gebeya-B. Built by <a href="mailto:Beamlaktesfahunn@gmail.com" className="text-[#F19A0E]/70 hover:text-[#F19A0E]">Beamlak Tesfahun</a>.</p>
          </div>
          <p>Made with ❤️ for Ethiopian artisans · <span className="text-[#F19A0E]/60">በኢትዮጵያ የተመረተ</span></p>
        </div>
      </div>

      {/* Flag stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
    </footer>
  );
}
