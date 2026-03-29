import { useState } from "react";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { checkSavedRecipe, removeSavedRecipe, saveRecipe } from "../services/savedRecipesService";

function RecipeContent({ text }) {
  const parts = text.split(/(?=\d+\.)/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <p className="text-sm leading-7" style={{ color: "#5a7a75" }}>{text}</p>;
  }
  return (
    <div className="space-y-2">
      {parts.map((part, i) => (
        <p key={i} className="text-sm leading-7" style={{ color: "#5a7a75" }}>{part}</p>
      ))}
    </div>
  );
}

function HeartIcon({ filled, spinning, animated }) {
  if (spinning) {
    return (
      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-current/25 border-t-current" />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition-transform duration-300 ${animated ? "save-pop" : ""}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25s-6.716-4.337-9.117-8.129C.916 9.01 2.085 4.75 6.085 4.75c2.03 0 3.173 1.177 3.915 2.28.742-1.103 1.885-2.28 3.915-2.28 4 0 5.169 4.26 3.202 7.371C18.716 15.913 12 20.25 12 20.25Z"
      />
    </svg>
  );
}

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const buildSavableRecipe = (currentRecipe) => {
    if (!currentRecipe) {
      return null;
    }

    return {
      title: currentRecipe.title,
      ingredients: currentRecipe.ingredients || [],
      instructions: currentRecipe.content || "",
    };
  };

  const buildSavableBonus = (bonus) => ({
    title: bonus.title,
    ingredients: bonus.missingIngredients || [],
    instructions: bonus.content || "",
  });


  const refreshSavedState = async (nextRecipe) => {
    const savableRecipe = buildSavableRecipe(nextRecipe);

    if (!savableRecipe) {
      setIsSaved(false);
      setSavedRecipeId(null);
      setBonusSavedStates({});
      return;
    }

    try {
      const response = await checkSavedRecipe(token, savableRecipe);
      setIsSaved(response.isSaved);
      setSavedRecipeId(response.savedRecipeId);
    } catch {
      setIsSaved(false);
      setSavedRecipeId(null);
    }

    const bonuses = nextRecipe.bonusRecipes || [];
    const bonusChecks = await Promise.allSettled(
      bonuses.map((bonus) => checkSavedRecipe(token, buildSavableBonus(bonus)))
    );
    const newBonusStates = {};
    bonusChecks.forEach((result, i) => {
      newBonusStates[i] = {
        isSaved: result.status === "fulfilled" ? result.value.isSaved : false,
        savedRecipeId: result.status === "fulfilled" ? result.value.savedRecipeId : null,
        isSaving: false,
        animationKey: 0,
      };
    });
    setBonusSavedStates(newBonusStates);
  };

  const handleGenerateRecipe = async () => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setIsSaved(false);
      setSavedRecipeId(null);

      const response = await fetch(`${API_URL}/recipes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "שגיאה ביצירת המתכון");
      }

      const nextRecipe = data.recipe || null;
      setRecipe(nextRecipe);
      await refreshSavedState(nextRecipe);
    } catch (requestError) {
      const message = requestError.message || "משהו השתבש בעת יצירת המתכון";
      setError(message);
      showToast({
        type: "error",
        title: "לא הצלחתי ליצור מתכון",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    const savableRecipe = buildSavableRecipe(recipe);
    if (!savableRecipe || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      if (isSaved && savedRecipeId) {
        await removeSavedRecipe(token, savedRecipeId);
        setIsSaved(false);
        setSavedRecipeId(null);
        showToast({
          type: "info",
          title: "המתכון הוסר מהמועדפים",
          message: "אפשר תמיד לשמור אותו שוב כשתרצה/י.",
        });
        return;
      }

      const response = await saveRecipe(token, savableRecipe);
      setIsSaved(true);
      setSavedRecipeId(response.savedRecipe?._id || null);
      setSaveAnimationKey((current) => current + 1);
      showToast({
        type: "success",
        title: response.alreadySaved ? "המתכון כבר שמור" : "המתכון נשמר",
        message: response.alreadySaved
          ? "אפשר למצוא אותו בעמוד המתכונים השמורים."
          : "הוספנו אותו למתכונים השמורים שלך.",
      });
    } catch (requestError) {
      showToast({
        type: "error",
        title: "שמירת המתכון נכשלה",
        message: requestError.message || "לא הצלחתי לשמור את המתכון",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBonusSaveToggle = async (bonus, index) => {
    const state = bonusSavedStates[index] || {};
    if (state.isSaving) return;

    setBonusSavedStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], isSaving: true },
    }));

    try {
      const savableBonus = buildSavableBonus(bonus);
      if (state.isSaved && state.savedRecipeId) {
        await removeSavedRecipe(token, state.savedRecipeId);
        setBonusSavedStates((prev) => ({
          ...prev,
          [index]: { isSaved: false, savedRecipeId: null, isSaving: false, animationKey: prev[index]?.animationKey || 0 },
        }));
        showToast({ type: "info", title: "המתכון הוסר מהמועדפים", message: "אפשר תמיד לשמור אותו שוב כשתרצה/י." });
      } else {
        const response = await saveRecipe(token, savableBonus);
        setBonusSavedStates((prev) => ({
          ...prev,
          [index]: {
            isSaved: true,
            savedRecipeId: response.savedRecipe?._id || null,
            isSaving: false,
            animationKey: (prev[index]?.animationKey || 0) + 1,
          },
        }));
        showToast({
          type: "success",
          title: response.alreadySaved ? "המתכון כבר שמור" : "המתכון נשמר",
          message: response.alreadySaved ? "אפשר למצוא אותו בעמוד המתכונים השמורים." : "הוספנו אותו למתכונים השמורים שלך.",
        });
      }
    } catch (err) {
      setBonusSavedStates((prev) => ({
        ...prev,
        [index]: { ...prev[index], isSaving: false },
      }));
      showToast({ type: "error", title: "שמירת המתכון נכשלה", message: err.message || "לא הצלחתי לשמור את המתכון" });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" dir="rtl" style={{ background: cream }}>
        <div className="max-w-3xl mx-auto">
            <section
            className="premium-panel mb-8 rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-9"
            style={{ background: "linear-gradient(135deg, rgba(255,250,244,0.97), rgba(240,250,248,0.92))" }}
          >
            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em]" style={{ color: gold }}>
                  עוזר המתכונים
                </p>
                <h1
                  className="text-4xl font-bold sm:text-5xl"
                  style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
                >
                  👨‍🍳 המתכון שלך
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 sm:text-base" style={{ color: "#58736d" }}>
                  קבל/י הצעת מתכון מותאמת אישית לפי מה שיש לך במקרר ובהעדפות האוכל שלך.
                </p>
              </div>

              <div className="premium-card rounded-[1.6rem] p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>מתכון מותאם</p>
                <p className="mt-2 text-3xl">🍽️</p>
              </div>
            </div>
          </section>

          <div
            className="mb-6 overflow-hidden rounded-[2rem] bg-white/90 p-6 shadow-[0_24px_65px_rgba(33,53,49,0.08)] backdrop-blur"
            style={{ border: "1px solid #e8f0ef" }}
          >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: teal }}
              >
                צור מתכון
              </button>
              {recipe ? (
                <button
                  type="button"
                  onClick={handleGenerateRecipe}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: "#f0faf8", color: teal, border: "1px solid #c8e8e4" }}
                >
                  צור מתכון אחר
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-4 flex items-center gap-3 text-sm" style={{ color: "#5a7a75" }}>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a9c8a]/20 border-t-[#1a9c8a]" />
                <span>מכין את המתכון שלך...</span>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm" style={{ color: "#d14d4d" }}>
                {error}
              </p>
            ) : null}
          </div>

          <div
            className="overflow-hidden rounded-[2rem] bg-white/90 p-8 shadow-[0_28px_70px_rgba(33,53,49,0.09)] backdrop-blur"
            style={{ border: "1px solid #e8f0ef" }}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] font-bold mb-2" style={{ color: gold }}>
                  כרטיס מתכון
                </p>
                {recipe ? (
                  <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "#e6edea", color: "#58736d", background: "#fbfdfa" }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: isSaved ? teal : "#d5e3df" }} />
                    {isSaved ? "שמור במועדפים" : "מוכן לשמירה"}
                  </div>
                  {recipe.matchPercentage != null ? (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: recipe.matchPercentage === 100 ? "rgba(26,156,138,0.12)" : "rgba(201,168,76,0.15)",
                        color: recipe.matchPercentage === 100 ? teal : "#8c6a1a",
                        border: `1px solid ${recipe.matchPercentage === 100 ? "#c8e8e4" : "#e8d49a"}`,
                      }}
                    >
                      <span>{recipe.matchPercentage}% התאמה</span>
                    </div>
                  ) : null}
                </div>
                ) : null}
              </div>

              {recipe ? (
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                  className="group inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: isSaved
                      ? "linear-gradient(135deg, rgba(208,138,42,0.16), rgba(255,243,227,0.92))"
                      : "linear-gradient(135deg, rgba(26,156,138,0.12), rgba(240,250,248,0.95))",
                    color: isSaved ? "#8c5a13" : teal,
                    border: `1px solid ${isSaved ? "#f3cc95" : "#c8e8e4"}`,
                    boxShadow: isSaved
                      ? "0 12px 28px rgba(208,138,42,0.12)"
                      : "0 12px 28px rgba(26,156,138,0.10)",
                  }}
                >
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background: isSaved ? "rgba(208,138,42,0.18)" : "rgba(26,156,138,0.12)",
                    }}
                  >
                    <HeartIcon
                      key={saveAnimationKey}
                      filled={isSaved}
                      spinning={isSaving}
                      animated={isSaved && !isSaving}
                    />
                  </span>
                  <span>{isSaving ? "שומר..." : isSaved ? "נשמר במועדפים" : "שמור למועדפים"}</span>
                </button>
              ) : null}
            </div>

            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              {recipe?.title || "ארוחה מהירה מהמזווה"}
            </h2>

            {recipe?.ingredients?.length > 0 ? (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] mb-3" style={{ color: teal }}>
                  מרכיבים
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-full px-3 py-1.5 text-sm"
                      style={{ background: "#f7fbfa", color: "#31524d", border: "1px solid #e1ece8" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.6rem] p-5" style={{ background: "linear-gradient(180deg, #fffdf9 0%, #f8fbfa 100%)", border: "1px solid #edf3f0" }}>
              <p className="text-xs font-bold uppercase tracking-[0.24em] mb-3" style={{ color: teal }}>
                הוראות
              </p>
              <RecipeContent text={recipe?.content || "לפי מה שיש לך בבית, כאן תמצא/י מתכון פשוט וטעים שתוכל/י להכין היום."} />
            </div>
          </div>

          {recipe?.bonusRecipes?.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.26em] font-bold mb-3" style={{ color: gold }}>
                רעיונות נוספים, אם תוסיף/י עוד מרכיבים
              </p>
              <div className="space-y-3">
                {recipe.bonusRecipes.map((bonus, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl bg-white/90 shadow-sm backdrop-blur" style={{ border: "1px solid #e8f0ef" }}>
                    <button
                      type="button"
                      onClick={() => setOpenBonus(openBonus === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-right transition-colors hover:bg-[#fbfdfc]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold" style={{ color: "#1a2e2b" }}>{bonus.title}</p>
                          {bonus.matchPercentage != null ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={{
                                background: bonus.matchPercentage >= 80 ? "rgba(26,156,138,0.12)" : "rgba(201,168,76,0.15)",
                                color: bonus.matchPercentage >= 80 ? teal : "#8c6a1a",
                                border: `1px solid ${bonus.matchPercentage >= 80 ? "#c8e8e4" : "#e8d49a"}`,
                              }}
                            >
                              {bonus.matchPercentage}%
                            </span>
                          ) : null}
                        </div>
                        {bonus.missingIngredients.length > 0 ? (
                          <p className="text-xs mt-1" style={{ color: "#d14d4d" }}>
                            חסר/ים: {bonus.missingIngredients.join(", ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mr-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleBonusSaveToggle(bonus, i); }}
                          disabled={bonusSavedStates[i]?.isSaving}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full transition-all hover:scale-110 disabled:opacity-60"
                          style={{
                            background: bonusSavedStates[i]?.isSaved ? "rgba(208,138,42,0.18)" : "rgba(26,156,138,0.12)",
                            color: bonusSavedStates[i]?.isSaved ? "#8c5a13" : teal,
                          }}
                        >
                          <HeartIcon
                            key={bonusSavedStates[i]?.animationKey}
                            filled={bonusSavedStates[i]?.isSaved}
                            spinning={bonusSavedStates[i]?.isSaving}
                            animated={bonusSavedStates[i]?.isSaved && !bonusSavedStates[i]?.isSaving}
                          />
                        </button>
                        <span className="text-sm font-semibold" style={{ color: teal }}>
                          {openBonus === i ? "⌃" : "+"}
                        </span>
                      </div>

                    </button>
                    {openBonus === i ? (
                      <div className="px-6 pb-5 text-sm leading-7 whitespace-pre-line" style={{ color: "#5a7a75", borderTop: "1px solid #e8f0ef" }}>
                        <div className="pt-4"><RecipeContent text={bonus.content} /></div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
