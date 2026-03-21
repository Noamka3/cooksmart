import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-9rem)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_30px_80px_rgba(58,44,16,0.12)] backdrop-blur">
            <div className="inline-flex rounded-full bg-[#2E7273]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#2E7273]">
              Protected account area
            </div>
            <h1
              className="mt-5 text-4xl font-bold text-[#17322f]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome back, {user?.name}.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#58736d]">
              This page is loaded only after CookSmart validates your JWT with the backend and fetches your current user profile from the protected <code>/auth/me</code> endpoint.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-[#efe4d0] bg-[#fffaf4] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D08A2A]">Profile</div>
                <div className="mt-4 space-y-3 text-sm text-[#17322f]">
                  <p><span className="font-semibold">Full name:</span> {user?.name}</p>
                  <p><span className="font-semibold">Email:</span> {user?.email}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#d5ebe7] bg-[#f3fbf9] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2E7273]">Next step</div>
                <p className="mt-4 text-sm leading-7 text-[#40645d]">
                  This is the natural place to connect future preference storage, pantry management, and personalized recipe recommendations.
                </p>
              </div>
            </div>

            <Link
              className="mt-8 inline-flex rounded-2xl bg-[#2E7273] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245C5D]"
              to="/"
            >
              Return to homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
