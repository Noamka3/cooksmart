import { Link } from "react-router-dom";
import logo from "../../assets/logo2.png";
import Navbar from "../Navbar";
import { ORANGE, TEAL } from "../../constants/theme";

const FOOD_IMGS = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80&fit=crop",
];

const AUTH_STYLES = `
  @keyframes authFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes authFloat {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-8px); }
  }
  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 13px 16px;
    color: #fafaf9;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: rgba(250,250,249,0.3); }
  .auth-input:focus {
    border-color: #f97316;
    background: rgba(249,115,22,0.05);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
  .auth-input.error {
    border-color: #ef4444;
    background: rgba(239,68,68,0.05);
  }
  .auth-submit {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 4px 24px rgba(249,115,22,0.35);
    transition: all 0.25s ease;
  }
  .auth-submit:hover:not(:disabled) {
    box-shadow: 0 8px 36px rgba(249,115,22,0.55);
    transform: translateY(-2px);
  }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  alternateLabel,
  alternateLink,
  alternateText,
  imgIndex = 0,
}) {
  const bgImg = FOOD_IMGS[imgIndex % FOOD_IMGS.length];

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <Navbar />

      <main
        dir="rtl"
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "#09090b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.1),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.08),transparent 65%)", pointerEvents: "none" }} />

        {/* Card */}
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 920,
          minHeight: 580,
          borderRadius: "2rem",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.05)",
          animation: "authFadeUp .6s ease both",
        }}>

          {/* ── Left: food photo panel ── */}
          <div className="hidden lg:flex" style={{ position: "relative", width: 340, flexShrink: 0, overflow: "hidden" }}>
            <img src={bgImg} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(9,9,11,0.6) 0%,rgba(9,9,11,0.3) 50%,rgba(9,9,11,0.75) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: "linear-gradient(to top,rgba(9,9,11,0.95),transparent)" }} />

            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "36px 32px", height: "100%" }}>
              <img src={logo} alt="CookSmart" style={{ height: 44 }} />

              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 999,
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: ORANGE, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", marginBottom: 20,
                  backdropFilter: "blur(10px)",
                  animation: "authFloat 4s ease-in-out infinite",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: ORANGE }} />
                  מותאם אישית · AI חכם
                </div>

                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.7rem", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 12, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
                  בשל חכם עם<br />
                  <span style={{ background: "linear-gradient(90deg,#fbbf24,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    מה שיש לך בבית
                  </span>
                </h2>
                <p style={{ color: "rgba(250,250,249,0.55)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  500+ מתכונים · המלצות AI · 100% בחינם
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: form panel ── */}
          <div style={{ flex: 1, background: "#111113", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 44px" }}>
            <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "block", width: 20, height: 1, background: TEAL }} />
                {eyebrow}
              </p>

              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.6rem,3vw,2.1rem)", fontWeight: 900, color: "#fafaf9", marginBottom: 10, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                {title}
              </h1>

              <p style={{ fontSize: "0.88rem", color: "rgba(250,250,249,0.5)", lineHeight: 1.65, marginBottom: 32 }}>
                {subtitle}
              </p>

              {children}

              {alternateText && (
                <p style={{ marginTop: 24, fontSize: "0.88rem", color: "rgba(250,250,249,0.45)", textAlign: "center" }}>
                  {alternateText}{" "}
                  <Link
                    to={alternateLink}
                    style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}
                    onMouseOver={e => e.target.style.opacity = "0.8"}
                    onMouseOut={e => e.target.style.opacity = "1"}
                  >
                    {alternateLabel}
                  </Link>
                </p>
              )}

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Link
                  to="/"
                  style={{ fontSize: "0.82rem", color: "rgba(250,250,249,0.3)", textDecoration: "none", transition: "color .2s" }}
                  onMouseOver={e => e.target.style.color = "rgba(250,250,249,0.6)"}
                  onMouseOut={e => e.target.style.color = "rgba(250,250,249,0.3)"}
                >
                  ← חזרה לדף הראשי
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
