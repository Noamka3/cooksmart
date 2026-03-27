import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getSavedRecipes, removeSavedRecipe } from "../services/savedRecipesService";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";

function RecipeContentPreview({ text }) {
  const preview = text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
  return <p className="text-sm leading-7 whitespace-pre-line" style={{ color: "#5a7a75" }}>{preview}</p>;
}

function RecipeSparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
    </svg>
  );
}

function FullRecipeModal({ recipe, removingId, onClose, onRemove }) {
  useEffect(() => {
    if (!recipe) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, recipe]);

  if (!recipe) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#17322f]/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-recipe-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_36px_90px_rgba(20,37,34,0.22)]"
        style={{ border: "1px solid #e7eeeb" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative overflow-hidden border-b px-5 py-5 sm:px-7"
          style={{
            borderColor: "#edf3f0",
            background: "linear-gradient(135deg, rgba(255,250,244,0.96), rgba(240,250,248,0.94))",
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#1a9c8a]/8 blur-3xl" />
            <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-[#d08a2a]/10 blur-3xl" />
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "#f7fbfa", color: teal, border: "1px solid #deebe7" }}>
                  נשמר ב-{new Date(recipe.createdAt).toLocaleDateString("he-IL")}
                </span>
                {recipe.bonusRecipes?.length > 0 ? (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "#fff8ef", color: "#a06a1d", border: "1px solid #f0d6ab" }}>
                    {recipe.bonusRecipes.length} רעיונות נוספים
                  </span>
                ) : null}
              </div>
              <h2
                id="saved-recipe-modal-title"
                className="text-2xl font-bold leading-tight sm:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
              >
                {recipe.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition hover:bg-black/5"
              style={{ color: "#5a7a75" }}
              aria-label="סגור חלון מתכון"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="space-y-6">
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: teal }}>
                מרכיבים מלאים
              </p>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((item, index) => (
                  <span
                    key={`${recipe._id}-full-${index}`}
                    className="rounded-full px-3 py-1.5 text-sm"
                    style={{ background: "#f9fbfa", color: "#355650", border: "1px solid #e3edea" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] p-5" style={{ background: "linear-gradient(180deg, #fffdf9 0%, #f8fbfa 100%)", border: "1px solid #edf3f0" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: teal }}>
                הוראות מלאות
              </p>
              <p className="text-sm leading-8 whitespace-pre-line sm:text-[0.96rem]" style={{ color: "#4f6c66" }}>
                {recipe.instructions}
              </p>
            </section>

            {recipe.bonusRecipes?.length > 0 ? (
              <section className="rounded-[1.5rem] p-5" style={{ background: "#fffcf6", border: "1px solid #f3e2c0" }}>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>
                  רעיונות נוספים / בונוס
                </p>
                <div className="space-y-4">
                  {recipe.bonusRecipes.map((bonus, index) => (
                    <div
                      key={`${recipe._id}-bonus-full-${index}`}
                      className="rounded-2xl bg-white/70 p-4"
                      style={{ border: "1px solid #f1e0bf" }}
                    >
                      <p className="text-sm font-semibold" style={{ color: "#1a2e2b" }}>{bonus.title}</p>
                      {bonus.missingIngredients?.length > 0 ? (
                        <p className="mt-1 text-xs" style={{ color: "#b66b31" }}>
                          חסר/ים: {bonus.missingIngredients.join(", ")}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm leading-7 whitespace-pre-line" style={{ color: "#5f726d" }}>
                        {bonus.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-7" style={{ borderColor: "#edf3f0", background: "#fcfdfa" }}>
          <button
            type="button"
            onClick={() => onRemove(recipe._id, recipe.title)}
            disabled={removingId === recipe._id}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "#fff3e3", color: "#9a5d13", border: "1px solid #f5c28b" }}
          >
            <span className="text-base">{removingId === recipe._id ? "..." : "×"}</span>
            {removingId === recipe._id ? "מסיר..." : "הסר מהמועדפים"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-95"
            style={{ background: "#f7fbfa", color: teal, border: "1px solid #dbeae5" }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavedRecipesPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await getSavedRecipes(token);
        setSavedRecipes(response.savedRecipes || []);
      } catch (requestError) {
        showToast({
          type: "error",
          title: "טעינת המתכונים נכשלה",
          message: requestError.message || "לא הצלחתי לטעון את המתכונים השמורים",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [showToast, token]);

  const handleRemove = async (savedRecipeId, title) => {
    try {
      setRemovingId(savedRecipeId);
      await removeSavedRecipe(token, savedRecipeId);
      setSavedRecipes((current) => current.filter((recipe) => recipe._id !== savedRecipeId));
      setSelectedRecipe((current) => (current?._id === savedRecipeId ? null : current));
      showToast({
        type: "info",
        title: "המתכון הוסר",
        message: `הסרנו את "${title}" מהמתכונים השמורים שלך.`,
      });
    } catch (requestError) {
      showToast({
        type: "error",
        title: "לא הצלחתי להסיר את המתכון",
        message: requestError.message || "נסה/י שוב בעוד רגע.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" dir="rtl" style={{ background: cream }}>
        <div className="max-w-5xl mx-auto">
          <section
            className="relative overflow-hidden rounded-[2.25rem] px-6 py-8 shadow-[0_28px_70px_rgba(33,53,49,0.10)] sm:px-8"
            style={{
              background: "linear-gradient(135deg, rgba(255,250,244,0.96), rgba(240,250,248,0.92))",
              border: "1px solid rgba(225,236,232,0.9)",
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#1a9c8a]/8 blur-3xl" />
              <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-[#d08a2a]/10 blur-3xl" />
            </div>

            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]" style={{ borderColor: "#e2ece8", color: gold, background: "rgba(255,255,255,0.72)" }}>
                  <RecipeSparkIcon />
                  המתכונים השמורים שלי
                </div>
                <h1
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
                >
                  אוסף המתכונים ששווה לחזור אליו
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: "#58736d" }}>
                  כל המתכונים שאהבת ושמרת מרוכזים כאן, מוכנים לבישול מהיר, להשוואה, או לסבב השראה חדש במטבח.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.72)", border: "1px solid #e2ece8" }}>
                  <div className="text-2xl font-bold" style={{ color: teal }}>{savedRecipes.length}</div>
                  <div className="text-xs" style={{ color: "#58736d" }}>מתכונים שמורים</div>
                </div>
                <Link
                  to="/recipes"
                  className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
                  style={{ background: teal }}
                >
                  צור מתכון חדש
                </Link>
              </div>
            </div>
          </section>

          {isLoading ? (
            <div className="mt-8 rounded-[2rem] bg-white/90 px-6 py-16 text-center shadow-sm backdrop-blur" style={{ border: "1px solid #e8f0ef" }}>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1a9c8a]/15 border-t-[#1a9c8a]" />
              <p style={{ color: "#5a7a75" }}>טוען את המתכונים השמורים...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div
              className="mt-8 overflow-hidden rounded-[2.25rem] px-6 py-16 text-center shadow-[0_28px_70px_rgba(33,53,49,0.08)]"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,250,0.98))",
                border: "1px solid #e8f0ef",
              }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-sm" style={{ background: "linear-gradient(135deg, rgba(26,156,138,0.12), rgba(208,138,42,0.10))", color: teal }}>
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25s-6.716-4.337-9.117-8.129C.916 9.01 2.085 4.75 6.085 4.75c2.03 0 3.173 1.177 3.915 2.28.742-1.103 1.885-2.28 3.915-2.28 4 0 5.169 4.26 3.202 7.371C18.716 15.913 12 20.25 12 20.25Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
                עדיין אין כאן מתכונים שמורים
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7" style={{ color: "#5a7a75" }}>
                כשתשמור/י מתכון שאהבת, הוא יופיע כאן עם כל הפרטים החשובים כדי שתוכל/י לחזור אליו בקלות בפעם הבאה שתרצה/י לבשל.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/recipes"
                  className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
                  style={{ background: teal }}
                >
                  עברו לעמוד המתכונים
                </Link>
                <Link
                  to="/account"
                  className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-95"
                  style={{ background: "#fffaf4", color: "#7a5832", border: "1px solid #ead9be" }}
                >
                  חזרה לאזור האישי
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {savedRecipes.map((recipe) => {
                const ingredientPreview = recipe.ingredients?.slice(0, 4) || [];
                const extraIngredientCount = Math.max((recipe.ingredients?.length || 0) - ingredientPreview.length, 0);

                return (
                  <article
                    key={recipe._id}
                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/92 p-6 shadow-[0_22px_60px_rgba(33,53,49,0.08)] backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(33,53,49,0.12)]"
                    style={{ border: "1px solid #e8f0ef" }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "#f7fbfa", color: teal, border: "1px solid #deebe7" }}>
                            נשמר ב-{new Date(recipe.createdAt).toLocaleDateString("he-IL")}
                          </span>
                          {recipe.bonusRecipes?.length > 0 ? (
                            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "#fff8ef", color: "#a06a1d", border: "1px solid #f0d6ab" }}>
                              {recipe.bonusRecipes.length} רעיונות נוספים
                            </span>
                          ) : null}
                        </div>
                        <h2
                          className="text-2xl font-bold leading-tight"
                          style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
                        >
                          {recipe.title}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(recipe._id, recipe.title)}
                        disabled={removingId === recipe._id}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: "#fff3e3", color: "#9a5d13", border: "1px solid #f5c28b" }}
                      >
                        <span className="text-base">{removingId === recipe._id ? "..." : "×"}</span>
                        {removingId === recipe._id ? "מסיר..." : "הסר"}
                      </button>
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: teal }}>
                        מרכיבים
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ingredientPreview.map((item, index) => (
                          <span
                            key={`${recipe._id}-${index}`}
                            className="rounded-full px-3 py-1.5 text-sm"
                            style={{ background: "#f9fbfa", color: "#355650", border: "1px solid #e3edea" }}
                          >
                            {item}
                          </span>
                        ))}
                        {extraIngredientCount > 0 ? (
                          <span
                            className="rounded-full px-3 py-1.5 text-sm font-medium"
                            style={{ background: "#fffaf4", color: "#7a5832", border: "1px solid #ead9be" }}
                          >
                            +{extraIngredientCount} נוספים
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] p-4" style={{ background: "linear-gradient(180deg, #fffdf9 0%, #f8fbfa 100%)", border: "1px solid #edf3f0" }}>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: teal }}>
                        תקציר הכנה
                      </p>
                      <RecipeContentPreview text={recipe.instructions} />
                    </div>

                    {recipe.bonusRecipes?.length > 0 ? (
                      <div className="mt-5 rounded-[1.5rem] p-4" style={{ background: "#fffcf6", border: "1px solid #f3e2c0" }}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>
                          נשמרו גם רעיונות נוספים
                        </p>
                        <div className="space-y-2">
                          {recipe.bonusRecipes.slice(0, 2).map((bonus, index) => (
                            <div key={`${recipe._id}-bonus-${index}`}>
                              <p className="text-sm font-semibold" style={{ color: "#1a2e2b" }}>{bonus.title}</p>
                              {bonus.missingIngredients?.length > 0 ? (
                                <p className="mt-1 text-xs" style={{ color: "#b66b31" }}>
                                  חסר/ים: {bonus.missingIngredients.join(", ")}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipe(recipe)}
                        className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-95"
                        style={{ background: "#f0faf8", color: teal, border: "1px solid #c8e8e4" }}
                      >
                        צפה במתכון
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FullRecipeModal
        recipe={selectedRecipe}
        removingId={removingId}
        onClose={() => setSelectedRecipe(null)}
        onRemove={handleRemove}
      />
    </>
  );
}
