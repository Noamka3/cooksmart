import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";
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

const ONBOARD_STYLES = `
  @keyframes obFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes obPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.35); }
    50%     { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
  }
  .ob-chip {
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: rgba(250,250,249,0.55);
    transition: all .2s ease;
    outline: none;
  }
  .ob-chip:hover {
    border-color: rgba(249,115,22,0.4);
    color: rgba(250,250,249,0.85);
    background: rgba(249,115,22,0.06);
  }
  .ob-chip.active {
    background: rgba(249,115,22,0.15);
    border-color: rgba(249,115,22,0.6);
    color: #f97316;
    font-weight: 700;
    box-shadow: 0 0 0 1px rgba(249,115,22,0.2);
  }
  .ob-section {
    animation: obFadeUp .5s ease both;
  }
  .ob-save {
    flex: 1;
    padding: 14px;
    border-radius: 14px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #f97316, #ea580c);
    box-shadow: 0 4px 24px rgba(249,115,22,0.35);
    transition: all .25s ease;
  }
  .ob-save:hover:not(:disabled) {
    box-shadow: 0 8px 36px rgba(249,115,22,0.55);
    transform: translateY(-2px);
  }
  .ob-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .ob-cancel {
    flex: 1;
    padding: 14px;
    border-radius: 14px;
    font-size: 0.95rem;
    font-weight: 600;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(250,250,249,0.45);
    cursor: pointer;
    transition: all .2s ease;
  }
  .ob-cancel:hover {
    border-color: rgba(255,255,255,0.2);
    color: rgba(250,250,249,0.7);
    background: rgba(255,255,255,0.04);
  }
`;

const SECTIONS = [
  { key: "cuisines",  title: "מטבחים אהובים",  icon: "🌍", color: ORANGE, items: CUISINES   },
  { key: "foodTypes", title: "סוגי אוכל",       icon: "🍽️", color: TEAL,   items: FOOD_TYPES },
  { key: "dietary",   title: "מגבלות תזונה",    icon: "🥗", color: GOLD,   items: DIETARY    },
];

function SectionCard({ title, icon, color, items, selected, onToggle, delay }) {
  return (
    <div className="ob-section" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "1.5rem",
      padding: "28px 30px",
      animationDelay: delay,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{
          width: 38, height: 38, borderRadius: 12, fontSize: "1.1rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `rgba(${color === ORANGE ? "249,115,22" : color === TEAL ? "20,184,166" : "234,179,8"},0.12)`,
          border: `1px solid rgba(${color === ORANGE ? "249,115,22" : color === TEAL ? "20,184,166" : "234,179,8"},0.25)`,
        }}>
          {icon}
        </span>
        <h3 style={{ color: color, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.01em" }}>
          {title}
        </h3>
        {selected.length > 0 && (
          <span style={{
            marginRight: "auto", fontSize: "0.75rem", fontWeight: 700,
            padding: "2px 10px", borderRadius: 999,
            background: `rgba(${color === ORANGE ? "249,115,22" : color === TEAL ? "20,184,166" : "234,179,8"},0.12)`,
            color,
          }}>
            {selected.length} נבחרו
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`ob-chip${selected.includes(item) ? " active" : ""}`}
            onClick={() => onToggle(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState("");

  const [likedCuisines,       setLikedCuisines]       = useState([]);
  const [favoriteFoodTypes,   setFavoriteFoodTypes]   = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  useEffect(() => {
    (async () => {
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
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    })();
  }, [token]);

  const toggle = (setter) => (item) =>
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const res = await fetch(`${API_URL}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          likedCuisines, favoriteFoodTypes, dietaryRestrictions,
          dislikedIngredients: [], preferredCookingTime: "any",
        }),
      });
      if (!res.ok) throw new Error();
      navigate("/account", { replace: true });
    } catch {
      setError("משהו השתבש. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelected = likedCuisines.length + favoriteFoodTypes.length + dietaryRestrictions.length;

  const stateMap = {
    cuisines:  { selected: likedCuisines,       setter: setLikedCuisines       },
    foodTypes: { selected: favoriteFoodTypes,   setter: setFavoriteFoodTypes   },
    dietary:   { selected: dietaryRestrictions, setter: setDietaryRestrictions },
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(249,115,22,0.2)", borderTopColor: ORANGE, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.9rem" }}>טוען העדפות...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{ONBOARD_STYLES}</style>
      <Navbar />

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.06),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <main dir="rtl" style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: TEAL, marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ display: "block", width: 24, height: 1, background: TEAL }} />
            העדפות אישיות
            <span style={{ display: "block", width: 24, height: 1, background: TEAL }} />
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(2rem,5vw,3rem)",
            color: "#fafaf9",
            marginBottom: 14,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            מה הטעם שלך?
          </h1>

          <p style={{ color: "rgba(250,250,249,0.45)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
            בחר את ההעדפות שלך ונתאים לך המלצות מתכונים מושלמות
          </p>

          {/* Progress indicator */}
          {totalSelected > 0 && (
            <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, animation: "obPulse 2s infinite" }} />
              <span style={{ color: ORANGE, fontSize: "0.82rem", fontWeight: 700 }}>{totalSelected} העדפות נבחרו</span>
            </div>
          )}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          {SECTIONS.map((s, i) => (
            <SectionCard
              key={s.key}
              title={s.title}
              icon={s.icon}
              color={s.color}
              items={s.items}
              selected={stateMap[s.key].selected}
              onToggle={toggle(stateMap[s.key].setter)}
              delay={`${i * 0.1}s`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 16px", borderRadius: 12,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#fca5a5", fontSize: "0.85rem", textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="ob-cancel" onClick={() => navigate("/account", { replace: true })}>
            ביטול
          </button>
          <button className="ob-save" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "שומר..." : "שמור העדפות ←"}
          </button>
        </div>

      </main>
    </div>
  );
}
