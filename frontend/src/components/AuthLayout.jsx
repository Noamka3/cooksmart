import { Link } from "react-router-dom";

import heroImage from "../assets/hero.png";
import logo from "../assets/logo2.png";
import Footer from "./Footer";
import Navbar from "./Navbar";

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
      <main className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#D08A2A]/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#2E7273]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#f5ead0] blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-13rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="order-2 rounded-[2rem] border border-white/50 bg-white/75 p-6 shadow-[0_30px_80px_rgba(58,44,16,0.12)] backdrop-blur lg:order-1 lg:p-8">
            <div className="mb-6 inline-flex rounded-full bg-[#2E7273]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#2E7273]">
              {eyebrow}
            </div>
            <h1
              className="max-w-xl text-4xl font-bold leading-tight text-[#17322f] md:text-5xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#58736d]">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-6 text-sm text-[#58736d]">
              {alternateText}{" "}
              <Link className="font-semibold text-[#2E7273] transition hover:text-[#1d5c5d]" to={alternateLink}>
                {alternateLabel}
              </Link>
            </p>
          </section>

          <aside className="order-1 flex h-full min-h-[320px] flex-col justify-between rounded-[2.5rem] bg-[#245C5D] p-6 text-white shadow-[0_30px_90px_rgba(36,92,93,0.28)] lg:order-2 lg:p-8">
            <div>
              <img src={logo} alt="CookSmart" className="h-16" />
              <p className="mt-6 max-w-sm text-sm uppercase tracking-[0.3em] text-[#f7d9a5]">
                Smart cooking starts with what you already have
              </p>
            </div>

            <div className="my-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <img
                src={heroImage}
                alt="CookSmart ingredients collage"
                className="h-full w-full rounded-[1.5rem] object-cover shadow-2xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { value: "AI", label: "smart meal matching" },
                { value: "Fast", label: "sign in and start cooking" },
                { value: "Fresh", label: "built around your kitchen" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xl font-bold text-[#f7d9a5]">{item.value}</div>
                  <div className="mt-1 text-sm text-white/80">{item.label}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
