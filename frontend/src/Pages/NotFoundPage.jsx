import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DarkFooter from "../components/home/DarkFooter";

const ORANGE = "#f97316";

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0) rotate(var(--r)); }
    50%     { transform: translateY(-8px) rotate(var(--r)); }
  }
  .nf-deco { position: absolute; opacity: 0.06; animation: float 4s ease-in-out infinite; }
  .nf-link-primary {
    padding: 13px 34px; border-radius: 14px;
    background: linear-gradient(135deg,#f97316,#ea580c);
    color: #fff; font-weight: 700; font-size: 0.9rem; text-decoration: none;
    box-shadow: 0 12px 32px rgba(249,115,22,0.25);
    transition: all .2s ease; display: inline-block;
  }
  .nf-link-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(249,115,22,0.32); }
  .nf-link-ghost {
    padding: 13px 34px; border-radius: 14px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: #fafaf9; font-weight: 700; font-size: 0.9rem; text-decoration: none;
    transition: all .2s ease; display: inline-block;
  }
  .nf-link-ghost:hover { background: rgba(255,255,255,0.09); transform: translateY(-2px); }
  .nf-quick-link { text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 7px; transition: transform .2s; }
  .nf-quick-link:hover { transform: translateY(-3px); }
`;

const DECORATIONS = [
  { emoji: "🍽️", top: "12%", left: "7%",  "--r": "-15deg", animationDelay: "0s"    },
  { emoji: "🥄",  top: "18%", right: "9%", "--r": "12deg",  animationDelay: ".6s"   },
  { emoji: "🫙",  bottom: "22%", left: "9%",  "--r": "10deg",  animationDelay: "1.2s" },
  { emoji: "🍴", bottom: "14%", right: "7%", "--r": "-10deg", animationDelay: ".3s"  },
];

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.06),transparent 65%)" }} />
      </div>

      <Navbar />

      <main
        dir="rtl"
        style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}
      >
        {/* Floating decorations */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {DECORATIONS.map(({ emoji, ...style }) => (
            <span key={emoji} className="nf-deco" style={{ fontSize: "3.5rem", ...style }}>{emoji}</span>
          ))}
        </div>

        {/* Main content */}
        <p style={{ fontSize: "5.5rem", marginBottom: 8, animation: "fadeUp .5s ease both", lineHeight: 1 }}>🤷</p>

        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ORANGE, marginBottom: 16, display: "flex", alignItems: "center", gap: 10, animation: "fadeUp .5s ease .08s both" }}>
          <span style={{ display: "block", width: 24, height: 1, background: ORANGE }} />
          שגיאה 404
          <span style={{ display: "block", width: 24, height: 1, background: ORANGE }} />
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 900,
          fontSize: "clamp(2.2rem,6vw,3.8rem)", color: "#fafaf9",
          marginBottom: 20, letterSpacing: "-0.02em", lineHeight: 1.15,
          animation: "fadeUp .5s ease .14s both",
        }}>
          הדף לא{" "}
          <span style={{ background: "linear-gradient(90deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            נמצא
          </span>
        </h1>

        <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.95rem", maxWidth: 420, lineHeight: 1.75, marginBottom: 44, animation: "fadeUp .5s ease .2s both" }}>
          נראה שהדף שחיפשת לא קיים. אולי הכתובת שגויה?<br />בוא נחזיר אותך למטבח.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp .5s ease .26s both" }}>
          <Link to="/" className="nf-link-primary">חזרה לדף הראשי ←</Link>
          <Link to="/pantry" className="nf-link-ghost">למקרר שלי 🧊</Link>
        </div>

        {/* Quick links card */}
        <div style={{
          marginTop: 60,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "1.25rem",
          padding: "22px 36px",
          display: "flex",
          gap: 32,
          animation: "fadeUp .5s ease .34s both",
        }}>
          {[
            { to: "/recipes",      label: "מתכונים",  icon: "🍽️" },
            { to: "/saved-recipes", label: "מועדפים",  icon: "♥"  },
            { to: "/account",      label: "חשבון",    icon: "👤" },
          ].map(({ to, label, icon }) => (
            <Link key={to} to={to} className="nf-quick-link">
              <span style={{ fontSize: "1.6rem" }}>{icon}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(250,250,249,0.35)" }}>{label}</span>
            </Link>
          ))}
        </div>
      </main>

      <DarkFooter />
    </div>
  );
}
