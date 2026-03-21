import { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/logo2.png";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const cream = "#f5ead0";
const gold = "#D08A2A";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const guestLinks = (
    <>
      <Link
        to="/login"
        onClick={closeMenu}
        className="px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all hover:opacity-80"
        style={{ borderColor: teal, color: teal }}
      >
        התחברות
      </Link>
      <Link
        to="/register"
        onClick={closeMenu}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: teal }}
      >
        הרשמה
      </Link>
    </>
  );

  const userLinks = (
    <>
      <Link
        to="/account"
        onClick={closeMenu}
        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: "rgba(26,156,138,0.12)", color: teal }}
      >
        {user?.name?.split(" ")[0] || "החשבון שלי"}
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          closeMenu();
        }}
        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-80"
        style={{ borderColor: gold, color: "#73511a", background: "rgba(208,138,42,0.08)" }}
      >
        התנתקות
      </button>
    </>
  );

  return (
    <nav
      className="w-full px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm"
      style={{ background: cream, borderBottom: "1px solid rgba(201,168,76,0.2)" }}
    >
      <Link to="/" onClick={closeMenu}>
        <img src={logo} alt="CookSmart" className="h-12" />
      </Link>

      <div className="hidden md:flex items-center gap-3">
        {user ? userLinks : guestLinks}
      </div>

      <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
        <span
          className="w-6 h-0.5 block transition-all"
          style={{ background: teal, transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }}
        />
        <span
          className="w-6 h-0.5 block transition-all"
          style={{ background: teal, opacity: menuOpen ? 0 : 1 }}
        />
        <span
          className="w-6 h-0.5 block transition-all"
          style={{ background: teal, transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute top-full left-0 w-full flex flex-col items-center gap-4 py-6 md:hidden shadow-md"
          style={{ background: cream, borderBottom: "1px solid rgba(201,168,76,0.2)" }}
        >
          <div className="flex gap-3 flex-wrap justify-center">
            {user ? userLinks : guestLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
