import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CUISINES = [
  "איטלקי", "אסייתי", "ים תיכוני", "מקסיקני",
  "יפני", "הודי", "צרפתי", "מזרח תיכוני",
];

const FOOD_TYPES = [
  "בשרי", "עופות", "דגים", "צמחוני",
  "טבעוני", "פסטה", "סלטים", "מרקים",
];

const DIETARY = [
  "ללא גלוטן", "ללא לקטוז", "טבעוני", "צמחוני",
  "ללא אגוזים", "ללא ביצים", "הלכה / כשר", "ללא סוכר",
];

function ToggleChip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
      style={{
        background: selected ? teal : "white",
        borderColor: selected ? teal : "#e0d5c5",
        color: selected ? "white" : "#5a7a75",
      }}
    >
      {label}
    </button>
  );
}

function Section({ title, emoji, items, selected, onToggle }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-4" style={{ color: "#1a2e2b" }}>
        {emoji} {title}
      </h3>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <ToggleChip
            key={item}
            label={item}
            selected={selected.includes(item)}
            onToggle={() => onToggle(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedCuisines, setLikedCuisines] = useState([]);
  const [favoriteFoodTypes, setFavoriteFoodTypes] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  // טען העדפות קיימות
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch(`${API_URL}/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLikedCuisines(data.preferences?.likedCuisines || []);
          setFavoriteFoodTypes(data.preferences?.favoriteFoodTypes || []);
          setDietaryRestrictions(data.preferences?.dietaryRestrictions || []);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, [token]);

  const toggle = (setter) => (item) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          likedCuisines,
          favoriteFoodTypes,
          dietaryRestrictions,
          dislikedIngredients: [],
          preferredCookingTime: "any",
        }),
      });

      if (!response.ok) throw new Error("Failed to save preferences");
      navigate("/account", { replace: true });
    } catch {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: cream }}>
        <p style={{ color: "#5a7a75" }}>טוען העדפות...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12" style={{ background: cream }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: gold }}>
            ההעדפות שלך
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
            מה הטעם שלך?
          </h1>
          <p className="text-sm" style={{ color: "#5a7a75" }}>
            בחר או עדכן את ההעדפות שלך — נשתמש בהן להמלצות מתכונים
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: `1px solid #e8f0ef` }}>
          <Section
            title="מטבחים אהובים"
            emoji="🌍"
            items={CUISINES}
            selected={likedCuisines}
            onToggle={toggle(setLikedCuisines)}
          />
          <Section
            title="סוגי אוכל"
            emoji="🍽️"
            items={FOOD_TYPES}
            selected={favoriteFoodTypes}
            onToggle={toggle(setFavoriteFoodTypes)}
          />
          <Section
            title="מגבלות תזונה"
            emoji="🥗"
            items={DIETARY}
            selected={dietaryRestrictions}
            onToggle={toggle(setDietaryRestrictions)}
          />

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate("/account", { replace: true })}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
              style={{ borderColor: "#e0d5c5", color: "#5a7a75" }}>
              ביטול
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: teal }}>
              {isSubmitting ? "שומר..." : "שמור העדפות ←"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
