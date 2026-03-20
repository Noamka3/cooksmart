import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="py-2 px-6 text-center" style={{ background: "#0d2e2a" }}>
      <img src={logo} alt="CookSmart" className="w-14 mx-auto mb-3 opacity-90" />
      <p className="text-xs" style={{ color: "#4a7a72" }}>
        © 2025 CookSmart — Noam Kadosh & Maor Tal
      </p>
    </footer>
  );
}
