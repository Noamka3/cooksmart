import { TEAL, GOLD, DARK2, TEXT } from "../../constants/theme";

const STEPS = [
  { num: "01", emoji: "🛒", title: "הוסף מרכיבים",         desc: "בחר או הזן את המרכיבים שיש לך בבית, פשוט ומהיר.",                              color: TEAL,      rgb: "20,184,166"  },
  { num: "02", emoji: "🔍", title: "קבל מתכונים מתאימים",  desc: "נגלה עבורך מתכונים לפי מה שיש לך, כולל אחוז התאמה ורשימת חוסרים.",            color: "#7dd3c8",  rgb: "125,211,200" },
  { num: "03", emoji: "👨‍🍳", title: "בשל כמו מקצוען",       desc: "קבל הנחיות ברורות, טיפים חכמים והמלצות AI לתוצאה מושלמת.",                   color: GOLD,       rgb: "234,179,8"   },
];

export default function HowItWorks() {
  return (
    <section dir="rtl" style={{ background: DARK2, padding: "112px 24px", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.08),transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1152, margin: "0 auto" }}>
        <p className="section-label" style={{ textAlign: "center", color: TEAL, justifyContent: "center" }}>
          <span style={{ background: TEAL, height: 1 }} />
          איך זה עובד
          <span style={{ background: TEAL, height: 1 }} />
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3rem)", color: TEXT, marginBottom: 72, letterSpacing: "-0.01em" }}>
          שלושה צעדים פשוטים
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <div key={step.num} className="step-card" style={{ padding: "40px 36px", textAlign: "right" }}>
              <p style={{
                fontSize: "5.5rem", fontWeight: 900, lineHeight: 1, marginBottom: 20,
                background: `linear-gradient(135deg, ${step.color} 0%, rgba(255,255,255,0.07) 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                fontFamily: "monospace", userSelect: "none",
              }}>
                {step.num}
              </p>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", marginBottom: 20, marginRight: "auto",
                background: `rgba(${step.rgb},0.1)`,
                border: `1px solid rgba(${step.rgb},0.2)`,
                boxShadow: `0 0 24px rgba(${step.rgb},0.12)`,
              }}>
                {step.emoji}
              </div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}>{step.title}</h3>
              <p style={{ color: "rgba(250,250,249,0.5)", fontSize: "0.88rem", lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
