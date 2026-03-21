import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccountPage() {
  const { user, token } = useAuth();
  const [pantryCount, setPantryCount] = useState(0);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pantryRes, prefsRes] = await Promise.all([
          fetch(`${API_URL}/pantry`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/preferences`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (pantryRes.ok) {
          const data = await pantryRes.json();
          setPantryCount(data.items.length);
        }

        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setPreferences(data.preferences);
        }
      } catch {
        // silent
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" style={{ background: cream }}>
        <div className="max-w-4xl mx-auto">

          {/* Welcome */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: gold }}>
              ברוך הבא
            </p>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
              שלום, {user?.name} 👋
            </h1>
            <p className="text-sm mt-2" style={{ color: "#5a7a75" }}>
              מה נבשל היום?
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: `1px solid #e8f0ef` }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: gold }}>מרכיבים</p>
              <p className="text-4xl font-bold" style={{ color: teal }}>{pantryCount}</p>
              <p className="text-xs mt-1" style={{ color: "#5a7a75" }}>במלאי שלך</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: `1px solid #e8f0ef` }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: gold }}>מטבחים</p>
              <p className="text-4xl font-bold" style={{ color: teal }}>
                {preferences?.likedCuisines?.length || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "#5a7a75" }}>נבחרו</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1" style={{ border: `1px solid #e8f0ef` }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: gold }}>פרופיל</p>
              <p className="text-sm font-semibold truncate" style={{ color: "#1a2e2b" }}>{user?.name}</p>
              <p className="text-xs truncate mt-1" style={{ color: "#5a7a75" }}>{user?.email}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/pantry"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              style={{ border: `1px solid #e8f0ef` }}
            >
              <div className="text-3xl mb-3">🥦</div>
              <h3 className="font-bold mb-1" style={{ color: "#1a2e2b" }}>המלאי שלי</h3>
              <p className="text-xs" style={{ color: "#5a7a75" }}>נהל את המרכיבים שיש לך בבית</p>
            </Link>

            <Link
              to="/recipes"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{ border: `1px solid #e8f0ef` }}
            >
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="font-bold mb-1" style={{ color: "#1a2e2b" }}>חפש מתכונים</h3>
              <p className="text-xs" style={{ color: "#5a7a75" }}>מצא מתכונים לפי מה שיש לך</p>
            </Link>

            <Link
              to="/onboarding"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{ border: `1px solid #e8f0ef` }}
            >
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="font-bold mb-1" style={{ color: "#1a2e2b" }}>העדפות</h3>
              <p className="text-xs" style={{ color: "#5a7a75" }}>עדכן את ההעדפות הקולינריות שלך</p>
            </Link>
          </div>

          {/* Preferences summary */}
          {preferences && (
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid #e8f0ef` }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: gold }}>
                ההעדפות שלך
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ...(preferences.likedCuisines || []),
                  ...(preferences.favoriteFoodTypes || []),
                  ...(preferences.dietaryRestrictions || []),
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#f0faf8", color: teal, border: `1px solid #c8e8e4` }}
                  >
                    {tag}
                  </span>
                ))}
                {!preferences.likedCuisines?.length && !preferences.favoriteFoodTypes?.length && (
                  <Link to="/onboarding" className="text-sm" style={{ color: teal }}>
                    הוסף העדפות →
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
