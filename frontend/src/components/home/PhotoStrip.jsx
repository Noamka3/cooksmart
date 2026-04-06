import { IMG, DARK, TEAL } from "../../constants/theme";

const PHOTOS = [
  { src: IMG.cooking, alt: "בישול",    label: "בישול ביתי", sub: "טעים ובריא", large: true },
  { src: IMG.salad,   alt: "סלט",     label: "סלטים טריים" },
  { src: IMG.veggies, alt: "ירקות",   label: "ירקות טריים" },
];

export default function PhotoStrip() {
  return (
    <section style={{ background: DARK, padding: "0 24px 80px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, height: 320 }}>
        {PHOTOS.map((photo) => (
          <div key={photo.alt} className="img-card" style={{ height: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <img src={photo.src} alt={photo.alt} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(7,15,14,0.7) 0%,transparent 50%)" }} />
            <div style={{ position: "absolute", bottom: photo.large ? 20 : 16, right: photo.large ? 20 : 16 }}>
              <p style={{ color: "#fff", fontWeight: photo.large ? 800 : 700, fontSize: photo.large ? "1.15rem" : "0.9rem", fontFamily: photo.large ? "'Playfair Display',serif" : "inherit" }}>
                {photo.label}
              </p>
              {photo.sub && (
                <p style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 600 }}>{photo.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
