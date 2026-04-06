import { IMG, ORANGE, DARK, TEXT } from "../../constants/theme";

const FEATURES = [
  { icon: "🥦", img: IMG.veggies, title: "ניהול מלאי חכם",            desc: "נהל בקלות את המרכיבים שיש לך בבית — הוסף, עדכן והסר פריטים.", glow: "0,201,167"   },
  { icon: "🍽️", img: IMG.bowl,    title: "מתכונים לפי מה שיש בבית",  desc: "מתכונים המבוססים על המרכיבים שלך, עם אחוז התאמה וזמן הכנה.",  glow: "125,211,200" },
  { icon: "🤖", img: IMG.cooking, title: "המלצות מותאמות עם AI",       desc: "המלצות חכמות לפי העדפותיך, סוג מטבח, מגבלות תזונה ורמת קושי.", glow: "232,160,32"  },
];

function applyTilt(e) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width  - 0.5;
  const y = (e.clientY - r.top)  / r.height - 0.5;
  e.currentTarget.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(6px)`;
}

function resetTilt(e) {
  e.currentTarget.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
}

export default function Features() {
  return (
    <section dir="rtl" style={{ background: DARK, padding: "112px 24px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>
        <p className="section-label" style={{ textAlign: "center", color: ORANGE, justifyContent: "center" }}>
          <span style={{ background: ORANGE, height: 1 }} />
          למה CookSmart
          <span style={{ background: ORANGE, height: 1 }} />
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3rem)", color: TEXT, marginBottom: 72, letterSpacing: "-0.01em" }}>
          יותר מסתם מתכונים
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="feat-card"
              onMouseMove={applyTilt}
              onMouseLeave={resetTilt}
              style={{ willChange: "transform", cursor: "default" }}
            >
              {/* Photo header */}
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img
                  src={feature.img}
                  alt={feature.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
                  onMouseOver={e => e.target.style.transform = "scale(1.08)"}
                  onMouseOut={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(7,15,14,0.8) 0%,transparent 60%)" }} />
                <div style={{
                  position: "absolute", bottom: 16, right: 16,
                  width: 48, height: 48, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem",
                  background: `rgba(${feature.glow},0.18)`,
                  border: `1px solid rgba(${feature.glow},0.35)`,
                  boxShadow: `0 0 20px rgba(${feature.glow},0.2)`,
                  backdropFilter: "blur(8px)",
                }}>
                  {feature.icon}
                </div>
              </div>

              {/* Text */}
              <div style={{ padding: "24px 24px 28px", textAlign: "right" }}>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", marginBottom: 10 }}>{feature.title}</h3>
                <p style={{ color: "rgba(250,250,249,0.5)", fontSize: "0.88rem", lineHeight: 1.7 }}>{feature.desc}</p>
                <div style={{ marginTop: 20, height: 2, width: 40, borderRadius: 4, background: `rgba(${feature.glow},0.5)`, marginRight: "auto" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
