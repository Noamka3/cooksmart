import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: cream }}
        dir="rtl"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute text-6xl opacity-20" style={{ top: "10%", left: "8%", transform: "rotate(-15deg)" }}>🍽️</span>
          <span className="absolute text-5xl opacity-20" style={{ top: "20%", right: "10%", transform: "rotate(12deg)" }}>🥄</span>
          <span className="absolute text-6xl opacity-20" style={{ bottom: "20%", left: "10%", transform: "rotate(10deg)" }}>🫙</span>
          <span className="absolute text-5xl opacity-20" style={{ bottom: "15%", right: "8%", transform: "rotate(-10deg)" }}>🍴</span>
        </div>

        <p className="text-8xl mb-4">🤷</p>

        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
          style={{ color: gold }}
        >
          שגיאה 404
        </p>

        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
        >
          הדף לא נמצא
        </h1>

        <p className="text-base max-w-md mb-8 leading-7" style={{ color: "#5a7a75" }}>
          נראה שהדף שחיפשת לא קיים. אולי הכתובת שגויה? בוא נחזיר אותך למטבח.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-md"
            style={{ background: teal }}
          >
            חזרה לדף הראשי
          </Link>
          <Link
            to="/pantry"
            className="px-8 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:opacity-80"
            style={{ borderColor: teal, color: teal }}
          >
            למקרר שלי
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
