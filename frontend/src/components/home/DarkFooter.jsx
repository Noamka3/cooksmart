export default function DarkFooter() {
  return (
    <footer dir="rtl" style={{ background: "#040a09", borderTop: "1px solid rgba(249,115,22,0.08)", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 40, height: 2, margin: "0 auto 20px", borderRadius: 4, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />
      <p style={{ color: "rgba(250,250,249,0.28)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
        © 2025 CookSmart — Noam Kadosh &amp; Maor Tal
      </p>
    </footer>
  );
}
