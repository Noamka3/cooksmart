import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo2 from "../assets/logo2.png";
import { useAuth } from "../hooks/useAuth";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";

const NAV_ITEMS = [
  { to: "/",             label: "דף ראשי" },
  { to: "/pantry",       label: "מקרר" },
  { to: "/recipes",      label: "מתכונים" },
  { to: "/saved-recipes",label: "מתכונים שמורים" },
];

const NAVBAR_STYLES = `
  .nb-link {
    position: relative;
    padding: 7px 14px;
    border-radius: 10px;
    font-size: 0.88rem;
    text-decoration: none;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .nb-link:hover { background: rgba(20,184,166,0.08); }
  .nb-btn-ghost {
    padding: 9px 22px;
    border-radius: 12px;
    border: 1px solid rgba(250,250,249,0.14);
    background: transparent;
    color: rgba(250,250,249,0.8);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .nb-btn-ghost:hover {
    border-color: rgba(250,250,249,0.3);
    color: #fafaf9;
    background: rgba(255,255,255,0.04);
  }
  .nb-btn-orange {
    padding: 9px 22px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 4px 20px rgba(249,115,22,0.38);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: all .25s ease;
    white-space: nowrap;
    border: none;
  }
  .nb-btn-orange:hover {
    box-shadow: 0 6px 30px rgba(249,115,22,0.6);
    transform: translateY(-1px);
  }
  .nb-logo-img {
    height: 52px;
    position: relative;
    filter: drop-shadow(0 2px 14px rgba(249,115,22,0.35));
    transition: filter .3s ease, transform .3s ease;
  }
  .nb-logo-img:hover {
    filter: drop-shadow(0 4px 22px rgba(249,115,22,0.65));
    transform: scale(1.05);
  }
  @media (max-width: 768px) {
    .nb-desktop { display: none !important; }
    .nb-hamburger { display: flex !important; }
  }
  @media (min-width: 769px) {
    .nb-hamburger { display: none !important; }
  }
`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{NAVBAR_STYLES}</style>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, width: "100%",
        background: "rgba(9,9,11,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        <div style={{
          width: "100%",
          height: 70,
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>

          {/* ── LEFT: Logo ── */}
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              {/* Orange glow behind logo */}
              <div style={{
                position: "absolute", inset: -8, borderRadius: 18,
                background: "radial-gradient(ellipse, rgba(249,115,22,0.22) 0%, transparent 70%)",
                filter: "blur(10px)", pointerEvents: "none",
              }} />
              <img src={logo2} alt="CookSmart" className="nb-logo-img" />
            </div>
            {/* Brand name next to logo */}
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: "1.25rem",
              background: "linear-gradient(90deg, #fbbf24, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}>
              CookSmart
            </span>
          </Link>

          {/* ── RIGHT: Nav links + Auth buttons together ── */}
          <div className="nb-desktop" dir="rtl" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" style={{
                    padding: "7px 14px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
                    color: GOLD, background: isActive("/admin") ? "rgba(234,179,8,0.1)" : "transparent",
                    textDecoration: "none",
                  }}>
                    👑 ניהול
                  </Link>
                )}

                <Link to="/account" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 14px", borderRadius: 12,
                  background: "rgba(20,184,166,0.08)",
                  border: "1px solid rgba(20,184,166,0.2)",
                  color: TEAL, fontSize: "0.85rem", fontWeight: 600,
                  textDecoration: "none", transition: "all .2s ease",
                }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(20,184,166,0.16)"}
                  onMouseOut={e => e.currentTarget.style.background = "rgba(20,184,166,0.08)"}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(20,184,166,0.35),rgba(20,184,166,0.1))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 800, color: TEAL, flexShrink: 0,
                  }}>
                    {(user?.name?.[0] || "?").toUpperCase()}
                  </span>
                  {user?.name?.split(" ")[0] || "החשבון שלי"}
                  {user?.role === "admin" && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "#ef4444", color: "#fff" }}>
                      ADMIN
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: "7px 14px", borderRadius: 12,
                    border: "1px solid rgba(234,179,8,0.25)",
                    background: "transparent", color: GOLD,
                    fontSize: "0.85rem", fontWeight: 600,
                    cursor: "pointer", transition: "all .2s ease",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(234,179,8,0.08)"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  התנתקות
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nb-btn-ghost">התחברות</Link>
                <Link to="/register" className="nb-btn-orange">הרשמה חינמית</Link>
              </>
            )}

            {/* Nav links — after user buttons */}
            {user && <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />}
            {user && NAV_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="nb-link"
                style={{
                  color: isActive(to) ? TEAL : "rgba(250,250,249,0.55)",
                  background: isActive(to) ? "rgba(20,184,166,0.1)" : undefined,
                  fontWeight: isActive(to) ? 600 : 400,
                }}
              >
                {label}
                {isActive(to) && (
                  <span style={{
                    position: "absolute", bottom: 2, right: 10, left: 10,
                    height: 2, borderRadius: 2,
                    background: `linear-gradient(90deg,${TEAL},rgba(20,184,166,0.1))`,
                  }} />
                )}
              </Link>
            ))}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="nb-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="תפריט"
            style={{
              display: "none", flexDirection: "column", justifyContent: "center",
              gap: 5, padding: 8, background: "none", border: "none", cursor: "pointer",
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 24, height: 2, borderRadius: 2,
                background: ORANGE, transition: "all .3s ease",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translateY(7px)"
                  : i === 2 ? "rotate(-45deg) translateY(-7px)"
                  : "scaleX(0)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div dir="rtl" style={{
            padding: "12px 20px 20px",
            background: "rgba(9,9,11,0.98)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {user && NAV_ITEMS.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                padding: "11px 14px", borderRadius: 10,
                color: isActive(to) ? TEAL : "rgba(250,250,249,0.65)",
                background: isActive(to) ? "rgba(20,184,166,0.1)" : "transparent",
                fontWeight: isActive(to) ? 600 : 400,
                fontSize: "0.9rem", textDecoration: "none", display: "block",
              }}>
                {label}
              </Link>
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 0" }} />

            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                    padding: "11px 14px", borderRadius: 10, textAlign: "center",
                    background: "rgba(234,179,8,0.1)", color: GOLD,
                    fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                  }}>
                    👑 לוח ניהול
                  </Link>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to="/account" onClick={() => setMenuOpen(false)} style={{
                    flex: 1, padding: "11px 14px", borderRadius: 10, textAlign: "center",
                    background: "rgba(20,184,166,0.1)", color: TEAL,
                    fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                  }}>
                    {user?.name?.split(" ")[0] || "החשבון שלי"}
                  </Link>
                  <button type="button" onClick={() => { logout(); setMenuOpen(false); }} style={{
                    flex: 1, padding: "11px 14px", borderRadius: 10,
                    border: "1px solid rgba(234,179,8,0.3)", color: GOLD,
                    background: "transparent", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  }}>
                    התנתקות
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="nb-btn-ghost" style={{ flex: 1, textAlign: "center" }}>
                  התחברות
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="nb-btn-orange" style={{ flex: 1, textAlign: "center" }}>
                  הרשמה
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
