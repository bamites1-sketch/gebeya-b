import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import MiniCart from "../ui/MiniCart";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "am", label: "አማ", name: "አማርኛ" },
  { code: "ti", label: "ትግ", name: "ትግርኛ" },
  { code: "om", label: "OM", name: "Afan Oromo" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setUserOpen(false); setMobileOpen(false); };
  const changeLang = (code) => { i18n.changeLanguage(code); localStorage.setItem("lang", code); setLangOpen(false); };
  const isActive = (p) => location.pathname === p;

  const NavLink = ({ to, children }) => (
    <Link to={to} onClick={() => setMobileOpen(false)}
      className={"text-sm font-semibold transition-colors duration-200 " + (isActive(to) ? "text-[#F19A0E]" : "text-gray-700 dark:text-gray-200 hover:text-[#F19A0E]")}>
      {children}
    </Link>
  );

  return (
    <>
      <nav className={"sticky top-0 z-50 transition-all duration-300 " + (scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg" : "bg-white dark:bg-gray-900")}
        style={{ borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%) 1" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          <Link to="/" className="shrink-0 group" aria-label="Gebeya-B Home">
            <img
              src="/logo.jpg"
              alt="በኢትዮጵያ የተመረተ | Made in Ethiopia - gebeya-B"
              className="h-12 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(241,154,14,0.65)]"
              onError={(e) => { e.currentTarget.style.display="none"; e.currentTarget.nextElementSibling.style.display="block"; }}
            />
            <span style={{display:"none"}} className="font-black text-[#F19A0E] text-lg">
              በኢትዮጵያ የተመረተ | Made in Ethiopia
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">{t("nav.home")}</NavLink>
            <NavLink to="/products">{t("nav.products")}</NavLink>
            {user && <NavLink to="/wishlist">{t("nav.wishlist")}</NavLink>}
            {isAdmin && <Link to="/admin" className="text-sm font-bold text-[#F19A0E] hover:text-[#d97b08] transition-colors">{t("nav.admin")}</Link>}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button onClick={() => { setLangOpen(!langOpen); setUserOpen(false); }}
                className="px-2.5 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-600 rounded-lg dark:text-gray-200 hover:border-[#F19A0E] hover:text-[#F19A0E] transition-colors">
                {LANGUAGES.find(l => l.code === i18n.language)?.label || "EN"}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => changeLang(l.code)}
                      className={"w-full text-left px-4 py-2.5 text-sm transition-colors " + (i18n.language === l.code ? "bg-[#FEF3E2] text-[#F19A0E] font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200")}>
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggle} aria-label="Toggle theme" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base">
              {dark ? "☀️" : "🌙"}
            </button>

            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base">
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F19A0E] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => { setUserOpen(!userOpen); setLangOpen(false); }}
                  className="w-9 h-9 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-full flex items-center justify-center font-black text-sm transition-colors">
                  {user.name[0].toUpperCase()}
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b dark:border-gray-700 bg-[#FEF3E2] dark:bg-gray-700/50">
                      <p className="text-sm font-bold text-[#2C1810] dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors">
                      👤 {t("nav.profile")}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F19A0E] hover:bg-[#FEF3E2] transition-colors">
                        ⚙️ {t("nav.admin")}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t dark:border-gray-700">
                      🚪 {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center bg-[#F19A0E] hover:bg-[#d97b08] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                {t("nav.login")}
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Menu">
              <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 px-4 py-4 space-y-3">
            <NavLink to="/">{t("nav.home")}</NavLink>
            <NavLink to="/products">{t("nav.products")}</NavLink>
            {user && <NavLink to="/wishlist">{t("nav.wishlist")}</NavLink>}
            {user && <NavLink to="/profile">{t("nav.profile")}</NavLink>}
            {isAdmin && <NavLink to="/admin">{t("nav.admin")}</NavLink>}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-[#F19A0E] text-white py-2.5 rounded-xl text-sm font-bold">{t("nav.login")}</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center border-2 border-[#F19A0E] text-[#F19A0E] py-2.5 rounded-xl text-sm font-bold">{t("auth.register")}</Link>
              </div>
            )}
            {user && <button onClick={handleLogout} className="w-full text-left text-red-600 text-sm font-semibold py-1">🚪 {t("nav.logout")}</button>}
          </div>
        )}
      </nav>
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}