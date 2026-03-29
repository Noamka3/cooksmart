import { Link } from "react-router-dom";

import logo from "../assets/logo2.png";
import Footer from "./Footer";
import Navbar from "./Navbar";

const FOOD_ITEMS = ["🍋", "🧄", "🥕", "🍅", "🫒", "🥦", "🧀", "🥚", "🍗", "🧅", "🫙", "🌿"];

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  alternateLabel,
  alternateLink,
  alternateText,
}) {
  return (
    <>
      <Navbar />
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10"
        style={{ background: "#f0e6d0" }}
      >
        <div
          className="relative flex w-full max-w-4xl overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(26,46,43,0.18)]"
          style={{ minHeight: "560px" }}
        >
          {/* Left decorative panel */}
          <div
            className="relative hidden w-64 flex-col justify-between p-8 lg:flex"
            style={{
              background: "linear-gradient(160deg, #1a9c8a 0%, #245C5D 50%, #17322f 100%)",
              minWidth: "220px",
            }}
          >
            {/* Floating food emojis */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {FOOD_ITEMS.map((emoji, i) => (
                <span
                  key={i}
                  className="absolute text-2xl opacity-20"
                  style={{
                    top: `${(i * 78) % 90 + 2}%`,
                    left: `${(i * 53) % 70 + 5}%`,
                    transform: `rotate(${(i * 37) % 60 - 30}deg)`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {/* Logo */}
            <div className="relative z-10">
              <img src={logo} alt="CookSmart" className="h-14" />
            </div>

            {/* Bottom text */}
            <div className="relative z-10" dir="rtl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f7d9a5] mb-2">
                CookSmart
              </p>
              <p className="text-white/70 text-sm leading-6">
                בשל חכם עם מה שיש לך בבית
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div
            className="flex flex-1 flex-col justify-center bg-white px-8 py-10 sm:px-12"
            dir="rtl"
          >
            <div className="max-w-sm w-full mx-auto">
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "#1a9c8a" }}>
                {eyebrow}
              </div>
              <h1
                className="mt-2 text-3xl font-bold text-[#17322f]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {title}
              </h1>
              <p className="mt-2 text-sm text-[#58736d] leading-6">{subtitle}</p>

              <div className="mt-8">{children}</div>

              <p className="mt-6 text-sm text-[#58736d]">
                {alternateText}{" "}
                <Link
                  className="font-semibold transition hover:opacity-80"
                  style={{ color: "#1a9c8a" }}
                  to={alternateLink}
                >
                  {alternateLabel}
                </Link>
              </p>

              <Link
                className="mt-3 inline-flex text-sm font-medium text-[#9a8060] underline-offset-2 hover:underline"
                to="/"
              >
                חזרה לדף הראשי
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
