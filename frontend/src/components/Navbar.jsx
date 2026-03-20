import { useState } from "react";
import logo from "../assets/logo2.png";

const teal = "#1a9c8a";
const cream = "#f5ead0";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="w-full px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm"
      style={{ background: cream, borderBottom: `1px solid rgba(201,168,76,0.2)` }}
    >
      {/* Logo */}
      <a href="/">
        <img src={logo} alt="CookSmart" className="h-12" />
      </a>

      {/* Desktop buttons */}
      <div className="hidden md:flex items-center gap-3">
        <a href="/login"
          className="px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all hover:opacity-80"
          style={{ borderColor: teal, color: teal }}>
          כניסה
        </a>
        <a href="/register"
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: teal }}>
          הרשמה
        </a>
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}>
        <span className="w-6 h-0.5 block transition-all"
          style={{ background: teal, transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }} />
        <span className="w-6 h-0.5 block transition-all"
          style={{ background: teal, opacity: menuOpen ? 0 : 1 }} />
        <span className="w-6 h-0.5 block transition-all"
          style={{ background: teal, transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full flex flex-col items-center gap-4 py-6 md:hidden shadow-md"
          style={{ background: cream, borderBottom: `1px solid rgba(201,168,76,0.2)` }}>
          <div className="flex gap-3">
            <a href="/login"
              className="px-5 py-2 rounded-lg text-sm font-semibold border-2"
              style={{ borderColor: teal, color: teal }}>כניסה</a>
            <a href="/register"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: teal }}>הרשמה</a>
          </div>
        </div>
      )}
    </nav>
  );
}