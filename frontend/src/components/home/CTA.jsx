import { useAuth } from "../../hooks/useAuth";
import { IMG, ORANGE, TEXT } from "../../constants/theme";

export default function CTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section dir="rtl" style={{ position: "relative", padding: "100px 24px", textAlign: "center", overflow: "hidden", background: "#060e0d" }}>
      {/* Background photo */}
      <img src={IMG.bowl} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(120,40,0,0.3),rgba(9,9,11,0.95))", zIndex: 1 }} />

      {/* Top border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)", zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <p className="section-label" style={{ color: ORANGE, justifyContent: "center" }}>
          <span style={{ background: ORANGE, height: 1 }} />
          מוכן להתחיל?
          <span style={{ background: ORANGE, height: 1 }} />
        </p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2.2rem,5vw,4rem)", color: TEXT, marginBottom: 22, letterSpacing: "-0.02em" }}>
          בוא נבשל ביחד
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(250,250,249,0.55)", maxWidth: 460, margin: "0 auto 44px" }}>
          {isAuthenticated
            ? "בחר מרכיבים וקבל המלצות מתכונים מותאמות אישית."
            : "הצטרף עכשיו בחינם ותתחיל לקבל המלצות מתכונים מותאמות אישית."}
        </p>
        {isAuthenticated ? (
          <a href="/recipes" className="btn-primary" style={{ padding: "17px 52px", borderRadius: 16, fontWeight: 800, fontSize: "1.1rem" }}>
            לחיפוש מתכונים ←
          </a>
        ) : (
          <a href="/register" className="btn-primary" style={{ padding: "17px 52px", borderRadius: 16, fontWeight: 800, fontSize: "1.1rem" }}>
            הרשמה חינמית
          </a>
        )}
      </div>

      {/* Bottom border */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)", zIndex: 2 }} />
    </section>
  );
}
