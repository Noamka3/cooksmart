import { useAuth } from "../../hooks/useAuth";
import { IMG, ORANGE, TEAL, GOLD, DARK, TEXT } from "../../constants/theme";

const FLOATING_CARDS = [
  { src: IMG.bowl,    label: "קערת בריאות", time: "15 דק'", accent: ORANGE },
  { src: IMG.pasta,   label: "פסטה מושלמת", time: "25 דק'", accent: TEAL   },
  { src: IMG.berries, label: "פירות טריים",  time: "5 דק'",  accent: GOLD   },
];

const STATS = [
  { num: "500+", label: "מתכונים",       color: ORANGE },
  { num: "AI",   label: "המלצות חכמות",  color: TEAL   },
  { num: "100%", label: "בחינם",          color: GOLD   },
];

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "flex-end" }}
    >
      {/* Background photo */}
      <img
        src={IMG.hero}
        alt=""
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `
          linear-gradient(to top, rgba(7,15,14,1) 0%, rgba(7,15,14,0.8) 35%, rgba(7,15,14,0.3) 65%, rgba(7,15,14,0.55) 100%),
          linear-gradient(100deg, rgba(7,15,14,0.7) 0%, transparent 55%)
        `,
      }} />

      {/* Main content */}
      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-14 pb-20 pt-36 md:pt-48" style={{ zIndex: 2 }}>
        <div style={{ maxWidth: 640 }}>

          {/* Badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 999,
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.35)",
            color: ORANGE, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.09em", marginBottom: 28,
            backdropFilter: "blur(10px)",
            animation: "fadeUp .7s ease both",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, display: "inline-block", animation: "pulseOrange 2s infinite" }} />
            מונע בינה מלאכותית · מותאם לך
          </span>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(3.2rem, 8vw, 6.5rem)",
            fontWeight: 900, lineHeight: 1.04, color: TEXT,
            textShadow: "0 4px 50px rgba(0,0,0,0.8)",
            marginBottom: 22,
            animation: "fadeUp .7s ease .1s both",
          }}>
            מה מבשלים<br />
            <span style={{
              background: "linear-gradient(90deg, #fbbf24, #f97316, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              היום?
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 36,
            color: "rgba(220,245,240,0.72)",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            maxWidth: 500,
            animation: "fadeUp .7s ease .2s both",
          }}>
            תן לנו את המרכיבים שיש לך — ואנחנו נמצא לך מתכון מושלם,
            מותאם אישית תוך שניות עם המלצות AI חכמות.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52, animation: "fadeUp .7s ease .3s both" }}>
            {isAuthenticated ? (
              <a href="/recipes" className="btn-primary" style={{ padding: "15px 40px", borderRadius: 14, fontWeight: 800, fontSize: "1rem" }}>
                לחיפוש מתכונים ←
              </a>
            ) : (
              <>
                <a href="/register" className="btn-primary" style={{ padding: "15px 40px", borderRadius: 14, fontWeight: 800, fontSize: "1rem" }}>
                  התחל עכשיו בחינם
                </a>
                <a href="/login" className="btn-outline" style={{ padding: "15px 40px", borderRadius: 14, fontWeight: 700, fontSize: "1rem" }}>
                  כניסה
                </a>
              </>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 44, animation: "fadeUp .7s ease .4s both" }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, marginBottom: 3, textShadow: `0 0 20px ${s.color}55` }}>
                  {s.num}
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(250,250,249,0.45)", letterSpacing: "0.05em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating recipe cards (desktop only) */}
      <div
        style={{ position: "absolute", left: 48, top: "50%", transform: "translateY(-50%)", zIndex: 2, display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .8s ease .5s both" }}
        className="hidden lg:flex"
      >
        {FLOATING_CARDS.map((card, i) => (
          <div
            key={i}
            className="glass-badge"
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
              animation: `floatB ${4 + i * 0.9}s ease-in-out ${i * 0.35}s infinite`,
              boxShadow: "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
              minWidth: 190,
            }}
          >
            <img src={card.src} alt={card.label} style={{ width: 50, height: 50, borderRadius: 12, objectFit: "cover", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }} />
            <div>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: "0.88rem", marginBottom: 3 }}>{card.label}</p>
              <p style={{ color: card.accent, fontSize: "0.72rem", fontWeight: 600 }}>⏱ {card.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
