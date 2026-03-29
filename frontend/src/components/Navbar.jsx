import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "../assets/logo2.png";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const cream = "#f5ead0";
const gold = "#D08A2A";

const NAV_ITEMS = [
  { to: "/saved-recipes", label: "מתכונים שמורים" },
  { to: "/recipes", label: "מתכונים" },
  { to: "/pantry", label: "מקרר" },
  { to: "/", label: "דף ראשי" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      className="w-full sticky top-0 z-50"
      style={{ background: cream, borderBottom: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 2px 12px rgba(26,46,43,0.06)" }}
    >
      <div className="flex h-16 w-full items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="shrink-0">
          <img src={logo} alt="CookSmart" className="h-11" />
        </Link>

        {/* Desktop nav + actions (right side) */}
        <div className="hidden md:flex items-center gap-1">
          {user
            ? NAV_ITEMS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="relative px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    color: isActive(to) ? teal : "#4a6661",
                    background: isActive(to) ? "rgba(26,156,138,0.1)" : "transparent",
                    fontWeight: isActive(to) ? 600 : 500,
                  }}
                >
                  {label}
                  {isActive(to) && (
                    <span
                      className="absolute bottom-0 right-3 left-3 h-0.5 rounded-full"
                      style={{ background: teal }}
                    />
                  )}
                </Link>
              ))
            : null}

          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="relative px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    color: isActive("/admin") ? "#92400e" : "#4a6661",
                    background: isActive("/admin") ? "rgba(251,191,36,0.15)" : "transparent",
                    fontWeight: isActive("/admin") ? 600 : 500,
                  }}
                >
                  👑 ניהול
                </Link>
              )}
              <div
                className="h-5 w-px mx-2"
                style={{ background: "rgba(201,168,76,0.35)" }}
              />
              <Link
                to="/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[rgba(26,156,138,0.08)]"
                style={{ color: teal }}
              >
                {user?.name?.split(" ")[0] || "החשבון שלי"}
                {user?.role === "admin" && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">
                    ADMIN
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[rgba(208,138,42,0.1)]"
                style={{ borderColor: "rgba(208,138,42,0.5)", color: "#73511a" }}
              >
                התנתקות
              </button>
            </>
          ) : (
            <>
              <div
                className="h-5 w-px mx-2"
                style={{ background: "rgba(201,168,76,0.35)" }}
              />
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-[rgba(26,156,138,0.06)]"
                style={{ borderColor: teal, color: teal }}
              >
                התחברות
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: teal }}
              >
                הרשמה
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="תפריט"
        >
          <span
            className="w-6 h-0.5 block rounded-full transition-all duration-200"
            style={{ background: teal, transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }}
          />
          <span
            className="w-6 h-0.5 block rounded-full transition-all duration-200"
            style={{ background: teal, opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="w-6 h-0.5 block rounded-full transition-all duration-200"
            style={{ background: teal, transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-1"
          style={{ background: cream, borderTop: "1px solid rgba(201,168,76,0.2)" }}
          dir="rtl"
        >
          {user
            ? NAV_ITEMS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: isActive(to) ? teal : "#4a6661",
                    background: isActive(to) ? "rgba(26,156,138,0.1)" : "transparent",
                    fontWeight: isActive(to) ? 600 : 500,
                  }}
                >
                  {label}
                </Link>
              ))
            : null}

          <div
            className="my-2 h-px"
            style={{ background: "rgba(201,168,76,0.25)" }}
          />

          {user ? (
            <div className="flex flex-col gap-2">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#92400e" }}
                >
                  👑 לוח ניהול
                </Link>
              )}
              <div className="flex gap-2">
              <Link
                to="/account"
                onClick={closeMenu}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                style={{ background: "rgba(26,156,138,0.1)", color: teal }}
              >
                {user?.name?.split(" ")[0] || "החשבון שלי"}
              </Link>
              <button
                type="button"
                onClick={() => { logout(); closeMenu(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: "rgba(208,138,42,0.5)", color: "#73511a" }}
              >
                התנתקות
              </button>
            </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-center border-2 transition-all"
                style={{ borderColor: teal, color: teal }}
              >
                התחברות
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-center text-white transition-all"
                style={{ background: teal }}
              >
                הרשמה
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
