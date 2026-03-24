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

  const buildSavableRecipe = (currentRecipe) => {
    if (!currentRecipe) {
      return null;
    }

    return {
      title: currentRecipe.title,
      ingredients: currentRecipe.ingredients || [],
      instructions: currentRecipe.content || "",
      bonusRecipes: currentRecipe.bonusRecipes || [],
    };
  };

  const refreshSavedState = async (nextRecipe) => {
    const savableRecipe = buildSavableRecipe(nextRecipe);

    if (!savableRecipe) {
      setIsSaved(false);
      setSavedRecipeId(null);
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" dir="rtl" style={{ background: cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] font-bold mb-1" style={{ color: gold }}>
              עוזר המתכונים
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              המתכון שלך
            </h1>
            <p className="text-sm mt-2 max-w-2xl leading-7" style={{ color: "#5a7a75" }}>
              קבל/י הצעת מתכון מותאמת אישית לפי מה שיש לך במזווה ובהעדפות האוכל שלך.
            </p>
          </div>

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
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "#e6edea", color: "#58736d", background: "#fbfdfa" }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: isSaved ? teal : "#d5e3df" }} />
                    {isSaved ? "שמור במועדפים" : "מוכן לשמירה"}
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
                        <p className="text-sm font-semibold" style={{ color: "#1a2e2b" }}>{bonus.title}</p>
                        {bonus.missingIngredients.length > 0 ? (
                          <p className="text-xs mt-1" style={{ color: "#d14d4d" }}>
                            חסר/ים: {bonus.missingIngredients.join(", ")}
                          </p>
                        ) : null}
                      </div>
                      <span className="mr-3 text-sm font-semibold" style={{ color: teal }}>
                        {openBonus === i ? "⌃" : "+"}
                      </span>
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
