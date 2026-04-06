import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DarkFooter from "../components/home/DarkFooter";
import { useAuth } from "../hooks/useAuth";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ACCOUNT_STYLES = `
  @keyframes acFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes acPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
    50%     { box-shadow: 0 0 0 10px rgba(249,115,22,0); }
  }
  .ac-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    transition: all .25s ease;
    animation: acFadeUp .5s ease both;
  }
  .ac-nav-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    padding: 24px;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all .25s ease;
    animation: acFadeUp .5s ease both;
  }
  .ac-nav-card:hover {
    border-color: rgba(249,115,22,0.3);
    background: rgba(249,115,22,0.05);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
  .ac-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    background: rgba(20,184,166,0.1);
    border: 1px solid rgba(20,184,166,0.25);
    color: #14b8a6;
  }
`;

const NAV_CARDS = [
  { to: "/pantry",        icon: "🥦", label: "המלאי שלי",        desc: "נהל את המרכיבים שיש לך בבית",            color: TEAL   },
  { to: "/recipes",       icon: "🍽️", label: "חפש מתכונים",      desc: "מצא מתכונים לפי מה שיש לך",              color: ORANGE },
  { to: "/saved-recipes", icon: "♥",  label: "מתכונים שמורים",   desc: "חזור במהירות למתכונים שאהבת",             color: "#f43f5e" },
  { to: "/onboarding",    icon: "⚙️", label: "העדפות",            desc: "עדכן את ההעדפות הקולינריות שלך",          color: GOLD   },
];

function colorRgb(c) {
  if (c === TEAL)      return "20,184,166";
  if (c === ORANGE)    return "249,115,22";
  if (c === GOLD)      return "234,179,8";
  if (c === "#f43f5e") return "244,63,94";
  return "249,115,22";
}

export default function AccountPage() {
  const { user, token } = useAuth();
  const [pantryCount,  setPantryCount]  = useState(0);
  const [preferences,  setPreferences]  = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [pantryRes, prefsRes] = await Promise.all([
          fetch(`${API_URL}/pantry`,       { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/preferences`,  { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (pantryRes.ok) { const d = await pantryRes.json(); setPantryCount(d.items.length); }
        if (prefsRes.ok)  { const d = await prefsRes.json();  setPreferences(d.preferences);  }
      } catch { /* silent */ }
    })();
  }, [token]);

  const allTags = [
    ...(preferences?.likedCuisines      || []),
    ...(preferences?.favoriteFoodTypes  || []),
    ...(preferences?.dietaryRestrictions|| []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{ACCOUNT_STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.06),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      <main dir="rtl" style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 48, animation: "acFadeUp .5s ease both" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "block", width: 24, height: 1, background: TEAL }} />
            ברוך הבא
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: "#fafaf9", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            שלום,{" "}
            <span style={{ background: "linear-gradient(90deg,#fbbf24,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {user?.name}
            </span>{" "}👋
          </h1>
          <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.95rem" }}>מה נבשל היום?</p>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>

          {/* Pantry count */}
          <div className="ac-card" style={{ padding: "24px 26px", animationDelay: "0s" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,249,0.3)", marginBottom: 10 }}>מרכיבים במלאי</p>
            <p style={{ fontSize: "2.8rem", fontWeight: 900, color: TEAL, lineHeight: 1, marginBottom: 4 }}>{pantryCount}</p>
            <p style={{ fontSize: "0.78rem", color: "rgba(250,250,249,0.35)" }}>פריטים ברשימה שלך</p>
          </div>

          {/* Cuisines */}
          <div className="ac-card" style={{ padding: "24px 26px", animationDelay: ".08s" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,249,0.3)", marginBottom: 10 }}>מטבחים אהובים</p>
            {preferences?.likedCuisines?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {preferences.likedCuisines.slice(0, 4).map(c => (
                  <span key={c} className="ac-tag">{c}</span>
                ))}
                {preferences.likedCuisines.length > 4 && (
                  <span className="ac-tag" style={{ background: "rgba(249,115,22,0.1)", borderColor: "rgba(249,115,22,0.25)", color: ORANGE }}>
                    +{preferences.likedCuisines.length - 4}
                  </span>
                )}
              </div>
            ) : (
              <Link to="/onboarding" style={{ fontSize: "0.82rem", color: ORANGE, textDecoration: "none" }}>הוסף העדפות ←</Link>
            )}
          </div>

          {/* Profile */}
          <div className="ac-card" style={{ padding: "24px 26px", animationDelay: ".16s" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,249,0.3)", marginBottom: 10 }}>פרופיל</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,rgba(249,115,22,0.35),rgba(249,115,22,0.1))",
                border: "2px solid rgba(249,115,22,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", fontWeight: 800, color: ORANGE,
              }}>
                {(user?.name?.[0] || "?").toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ color: "#fafaf9", fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</p>
                <p style={{ color: "rgba(250,250,249,0.35)", fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
          {NAV_CARDS.map(({ to, icon, label, desc, color }, i) => (
            <Link
              key={to}
              to={to}
              className="ac-nav-card"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <span style={{
                width: 44, height: 44, borderRadius: 14, fontSize: "1.3rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `rgba(${colorRgb(color)},0.1)`,
                border: `1px solid rgba(${colorRgb(color)},0.22)`,
              }}>
                {icon}
              </span>
              <p style={{ color: "#fafaf9", fontWeight: 700, fontSize: "0.92rem" }}>{label}</p>
              <p style={{ color: "rgba(250,250,249,0.38)", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</p>
              <p style={{ color, fontSize: "0.78rem", fontWeight: 600, marginTop: 4 }}>לחץ כאן ←</p>
            </Link>
          ))}
        </div>

        {/* ── All preferences ── */}
        {allTags.length > 0 && (
          <div className="ac-card" style={{ padding: "26px 28px", animationDelay: ".4s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,250,249,0.3)" }}>
                כל ההעדפות שלך
              </p>
              <Link to="/onboarding" style={{ fontSize: "0.8rem", color: ORANGE, textDecoration: "none", fontWeight: 600 }}>
                עדכן ←
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allTags.map(tag => (
                <span key={tag} className="ac-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {preferences && allTags.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1.25rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>🍴</p>
            <p style={{ color: "rgba(250,250,249,0.45)", marginBottom: 16 }}>עדיין לא הגדרת העדפות</p>
            <Link to="/onboarding" style={{
              padding: "10px 28px", borderRadius: 12,
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              color: "#fff", fontWeight: 700, fontSize: "0.9rem",
              textDecoration: "none",
            }}>
              הגדר העדפות ←
            </Link>
          </div>
        )}

      </main>

      <DarkFooter />
    </div>
  );
}
