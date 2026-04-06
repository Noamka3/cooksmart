import { useState } from "react";

import DarkFooter from "../components/home/DarkFooter";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { checkSavedRecipe, removeSavedRecipe, saveRecipe } from "../services/savedRecipesService";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rc-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.5rem;
    transition: border-color .25s;
    animation: fadeUp .5s ease both;
  }
  .rc-tag {
    border-radius: 999px; padding: 5px 14px; font-size: 0.78rem;
    background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.2); color: #2dd4bf;
  }
  .rc-ingredient-tag {
    border-radius: 999px; padding: 6px 14px; font-size: 0.82rem;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(250,250,249,0.75);
    transition: all .15s;
  }
  .rc-bonus-item {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1rem; overflow: hidden; transition: border-color .2s;
  }
  .rc-bonus-item:hover { border-color: rgba(255,255,255,0.12); }
  .rc-bonus-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: none; border: none; cursor: pointer; text-align: right; font-family: inherit; }
  .rc-bonus-btn:hover { background: rgba(255,255,255,0.03); }
  .rc-match-high {
    border-radius: 999px; padding: 4px 12px; font-size: 0.72rem; font-weight: 700;
    background: rgba(20,184,166,0.12); border: 1px solid rgba(20,184,166,0.22); color: #2dd4bf;
  }
  .rc-match-mid {
    border-radius: 999px; padding: 4px 12px; font-size: 0.72rem; font-weight: 700;
    background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.22); color: #fbbf24;
  }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function RecipeContent({ text }) {
  const parts = text.split(/(?=\d+\.)/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "rgba(250,250,249,0.55)" }}>{text}</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((part, i) => (
        <p key={i} style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "rgba(250,250,249,0.55)" }}>{part}</p>
      ))}
    </div>
  );
}

function HeartIcon({ filled, spinning, animated }) {
  if (spinning) {
    return <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-current/25 border-t-current" />;
  }
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform duration-300 ${animated ? "save-pop" : ""}`}
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25s-6.716-4.337-9.117-8.129C.916 9.01 2.085 4.75 6.085 4.75c2.03 0 3.173 1.177 3.915 2.28.742-1.103 1.885-2.28 3.915-2.28 4 0 5.169 4.26 3.202 7.371C18.716 15.913 12 20.25 12 20.25Z" />
    </svg>
  );
}

function MatchBadge({ pct, highThreshold = 80 }) {
  if (pct == null) return null;
  return (
    <span className={pct >= highThreshold ? "rc-match-high" : "rc-match-mid"}>
      {pct}% התאמה
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RecipesPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openBonus, setOpenBonus] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAnimationKey, setSaveAnimationKey] = useState(0);
  const [bonusSavedStates, setBonusSavedStates] = useState({});

  const buildSavableRecipe = (r) =>
    r ? { title: r.title, ingredients: r.ingredients || [], instructions: r.content || "" } : null;

  const buildSavableBonus = (bonus) => ({
    title: bonus.title,
    ingredients: bonus.missingIngredients || [],
    instructions: bonus.content || "",
  });

  const refreshSavedState = async (nextRecipe) => {
    const savable = buildSavableRecipe(nextRecipe);
    if (!savable) { setIsSaved(false); setSavedRecipeId(null); setBonusSavedStates({}); return; }
    try {
      const res = await checkSavedRecipe(token, savable);
      setIsSaved(res.isSaved);
      setSavedRecipeId(res.savedRecipeId);
    } catch { setIsSaved(false); setSavedRecipeId(null); }

    const bonuses = nextRecipe.bonusRecipes || [];
    const checks = await Promise.allSettled(bonuses.map((b) => checkSavedRecipe(token, buildSavableBonus(b))));
    const states = {};
    checks.forEach((r, i) => {
      states[i] = {
        isSaved: r.status === "fulfilled" ? r.value.isSaved : false,
        savedRecipeId: r.status === "fulfilled" ? r.value.savedRecipeId : null,
        isSaving: false, animationKey: 0,
      };
    });
    setBonusSavedStates(states);
  };

  const handleGenerateRecipe = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true); setError(""); setIsSaved(false); setSavedRecipeId(null);
      const res = await fetch(`${API_URL}/recipes/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "שגיאה ביצירת המתכון");
      const nextRecipe = data.recipe || null;
      setRecipe(nextRecipe);
      await refreshSavedState(nextRecipe);
    } catch (err) {
      const message = err.message || "משהו השתבש";
      setError(message);
      showToast({ type: "error", title: "לא הצלחתי ליצור מתכון", message });
    } finally { setIsLoading(false); }
  };

  const handleSaveToggle = async () => {
    const savable = buildSavableRecipe(recipe);
    if (!savable || isSaving) return;
    try {
      setIsSaving(true);
      if (isSaved && savedRecipeId) {
        await removeSavedRecipe(token, savedRecipeId);
        setIsSaved(false); setSavedRecipeId(null);
        showToast({ type: "info", title: "המתכון הוסר מהמועדפים", message: "אפשר תמיד לשמור אותו שוב." });
        return;
      }
      const res = await saveRecipe(token, savable);
      setIsSaved(true); setSavedRecipeId(res.savedRecipe?._id || null);
      setSaveAnimationKey((k) => k + 1);
      showToast({ type: "success", title: res.alreadySaved ? "המתכון כבר שמור" : "המתכון נשמר", message: res.alreadySaved ? "אפשר למצוא אותו במתכונים השמורים." : "הוספנו אותו למועדפים שלך." });
    } catch (err) {
      showToast({ type: "error", title: "שמירה נכשלה", message: err.message || "לא הצלחתי לשמור" });
    } finally { setIsSaving(false); }
  };

  const handleBonusSaveToggle = async (bonus, index) => {
    const state = bonusSavedStates[index] || {};
    if (state.isSaving) return;
    setBonusSavedStates((prev) => ({ ...prev, [index]: { ...prev[index], isSaving: true } }));
    try {
      const savable = buildSavableBonus(bonus);
      if (state.isSaved && state.savedRecipeId) {
        await removeSavedRecipe(token, state.savedRecipeId);
        setBonusSavedStates((prev) => ({ ...prev, [index]: { isSaved: false, savedRecipeId: null, isSaving: false, animationKey: prev[index]?.animationKey || 0 } }));
        showToast({ type: "info", title: "המתכון הוסר מהמועדפים", message: "אפשר תמיד לשמור אותו שוב." });
      } else {
        const res = await saveRecipe(token, savable);
        setBonusSavedStates((prev) => ({ ...prev, [index]: { isSaved: true, savedRecipeId: res.savedRecipe?._id || null, isSaving: false, animationKey: (prev[index]?.animationKey || 0) + 1 } }));
        showToast({ type: "success", title: res.alreadySaved ? "המתכון כבר שמור" : "המתכון נשמר", message: res.alreadySaved ? "אפשר למצוא אותו במתכונים השמורים." : "הוספנו אותו למועדפים שלך." });
      }
    } catch (err) {
      setBonusSavedStates((prev) => ({ ...prev, [index]: { ...prev[index], isSaving: false } }));
      showToast({ type: "error", title: "שמירה נכשלה", message: err.message || "לא הצלחתי לשמור" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.05),transparent 65%)" }} />
      </div>

      <Navbar />

      <main dir="rtl" style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Header ── */}
        <div className="rc-card" style={{ padding: "32px 36px", marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 1, background: ORANGE, display: "block" }} />
                עוזר המתכונים
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "#fafaf9", marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                👨‍🍳 המתכון{" "}
                <span style={{ background: "linear-gradient(90deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  שלך
                </span>
              </h1>
              <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 460 }}>
                קבל/י הצעת מתכון מותאמת אישית לפי מה שיש לך במקרר ובהעדפות האוכל שלך.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.25rem", padding: "18px 24px", textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>מתכון מותאם</p>
              <p style={{ fontSize: "2.2rem" }}>🍽️</p>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="rc-card" style={{ padding: "24px 28px", marginBottom: 24, animationDelay: ".08s" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              onClick={handleGenerateRecipe}
              disabled={isLoading}
              style={{
                padding: "12px 28px", borderRadius: 12, fontSize: "0.875rem", fontWeight: 700,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                color: "#fff", border: "none", cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.65 : 1, transition: "all .2s", fontFamily: "inherit",
                boxShadow: "0 8px 24px rgba(249,115,22,0.22)",
              }}
            >
              {isLoading ? "מייצר..." : "✨ צור מתכון"}
            </button>
            {recipe && (
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                style={{
                  padding: "12px 28px", borderRadius: 12, fontSize: "0.875rem", fontWeight: 700,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(250,250,249,0.8)", cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.65 : 1, transition: "all .2s", fontFamily: "inherit",
                }}
              >
                🔄 צור מתכון אחר
              </button>
            )}
          </div>
          {isLoading && (
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, color: "rgba(250,250,249,0.4)", fontSize: "0.85rem" }}>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f97316]/20 border-t-[#f97316]" style={{ display: "inline-block" }} />
              מכין את המתכון שלך...
            </div>
          )}
          {error && (
            <p style={{ marginTop: 14, fontSize: "0.85rem", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px" }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Recipe card ── */}
        <div className="rc-card" style={{ padding: "28px 32px", animationDelay: ".14s" }}>
          {/* Card header */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,250,249,0.3)", marginBottom: 10 }}>
                כרטיס מתכון
              </p>
              {recipe && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", color: "rgba(250,250,249,0.5)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: isSaved ? TEAL : "rgba(255,255,255,0.2)", display: "inline-block", transition: "background .3s" }} />
                    {isSaved ? "שמור במועדפים" : "מוכן לשמירה"}
                  </div>
                  <MatchBadge pct={recipe.matchPercentage} highThreshold={100} />
                </div>
              )}
            </div>

            {recipe && (
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={isSaving}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px",
                  borderRadius: 14, fontSize: "0.85rem", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "all .3s", opacity: isSaving ? 0.7 : 1, fontFamily: "inherit",
                  background: isSaved ? "rgba(249,115,22,0.12)" : "rgba(20,184,166,0.1)",
                  border: `1px solid ${isSaved ? "rgba(249,115,22,0.28)" : "rgba(20,184,166,0.24)"}`,
                  color: isSaved ? ORANGE : TEAL,
                }}
              >
                <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: isSaved ? "rgba(249,115,22,0.15)" : "rgba(20,184,166,0.12)" }}>
                  <HeartIcon key={saveAnimationKey} filled={isSaved} spinning={isSaving} animated={isSaved && !isSaving} />
                </span>
                {isSaving ? "שומר..." : isSaved ? "נשמר ♥" : "שמור למועדפים"}
              </button>
            )}
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.6rem", color: "#fafaf9", marginBottom: 20, lineHeight: 1.3 }}>
            {recipe?.title || "ארוחה מהירה מהמזווה"}
          </h2>

          {/* Ingredients */}
          {recipe?.ingredients?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>מרכיבים</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recipe.ingredients.map((item, i) => (
                  <span key={i} className="rc-ingredient-tag">{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "20px 24px" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>הוראות</p>
            <RecipeContent text={recipe?.content || "לפי מה שיש לך בבית, כאן תמצא/י מתכון פשוט וטעים שתוכל/י להכין היום."} />
          </div>
        </div>

        {/* ── Bonus recipes ── */}
        {recipe?.bonusRecipes?.length > 0 && (
          <div style={{ marginTop: 24, animation: "fadeUp .5s ease .2s both" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 1, background: GOLD, display: "block" }} />
              רעיונות נוספים, אם תוסיף/י עוד מרכיבים
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recipe.bonusRecipes.map((bonus, i) => {
                const bs = bonusSavedStates[i] || {};
                return (
                  <div key={i} className="rc-bonus-item">
                    <button className="rc-bonus-btn" onClick={() => setOpenBonus(openBonus === i ? null : i)}>
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: bonus.missingIngredients?.length > 0 ? 4 : 0 }}>
                          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fafaf9" }}>{bonus.title}</p>
                          <MatchBadge pct={bonus.matchPercentage} />
                        </div>
                        {bonus.missingIngredients?.length > 0 && (
                          <p style={{ fontSize: "0.75rem", color: "#f87171" }}>חסר/ים: {bonus.missingIngredients.join(", ")}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 12 }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleBonusSaveToggle(bonus, i); }}
                          disabled={bs.isSaving}
                          style={{
                            width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            background: bs.isSaved ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${bs.isSaved ? "rgba(249,115,22,0.28)" : "rgba(255,255,255,0.1)"}`,
                            color: bs.isSaved ? ORANGE : "rgba(250,250,249,0.5)",
                            cursor: bs.isSaving ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <HeartIcon key={bs.animationKey} filled={bs.isSaved} spinning={bs.isSaving} animated={bs.isSaved && !bs.isSaving} />
                        </button>
                        <span style={{ fontSize: "0.8rem", color: "rgba(250,250,249,0.35)" }}>{openBonus === i ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {openBonus === i && (
                      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.875rem", lineHeight: 1.8, color: "rgba(250,250,249,0.5)", whiteSpace: "pre-line" }}>
                        <RecipeContent text={bonus.content} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <DarkFooter />
    </div>
  );
}
