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
              <div className="space-y-2">
                {(() => {
                  const text = recipe.instructions.replace(/\\n/g, "\n");
                  const parts = text.split(/\n+/).filter(s => s.trim());
                  const steps = parts.length > 1
                    ? parts
                    : text.split(/(?=\d+\.\s)/).filter(s => s.trim());
                  return steps.map((step, i) => {
                    const trimmed = step.trim();
                    const match = trimmed.match(/^(\d+)\.\s*(.*)/s);
                    if (match) {
                      return (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: teal }}>
                            {match[1]}
                          </span>
                          <p className="text-sm leading-7 sm:text-[0.96rem]" style={{ color: "#4f6c66" }}>
                            {match[2]}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-sm leading-7 sm:text-[0.96rem]" style={{ color: "#4f6c66" }}>
                        {trimmed}
                      </p>
                    );
                  });
                })()}
              </div>
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

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

          {savedRecipes.length > 0 && (
            <div className="mt-6">
              <input
                type="text"
                placeholder="חפש מתכון שמור..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border-2 bg-white px-5 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
          )}

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
          ) : (() => {
              const filtered = savedRecipes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
              const totalPages = Math.ceil(filtered.length / PER_PAGE);
              const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
              return (
                <>
                  <div className="mt-6 flex flex-col gap-2">
                    {paginated.map((recipe, index) => (
                      <article
                        key={recipe._id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                        style={{ border: "1px solid #e8f0ef" }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-sm font-bold shrink-0" style={{ color: "#c8d8d4", minWidth: "1.5rem" }}>
                            {(page - 1) * PER_PAGE + index + 1}
                          </span>
                          <div className="min-w-0">
                            <h2 className="font-bold text-base truncate" style={{ color: "#1a2e2b" }}>
                              {recipe.title}
                            </h2>
                            <p className="text-xs mt-0.5 truncate" style={{ color: "#8aaba5" }}>
                              {recipe.ingredients?.slice(0, 4).join(" · ")}
                              {recipe.ingredients?.length > 4 ? ` · +${recipe.ingredients.length - 4}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs hidden sm:block" style={{ color: "#a0b8b4" }}>
                            {new Date(recipe.createdAt).toLocaleDateString("he-IL")}
                          </span>
                          {recipe.bonusRecipes?.length > 0 && (
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold hidden sm:block"
                              style={{ background: "#fff8ef", color: "#a06a1d", border: "1px solid #f0d6ab" }}>
                              +{recipe.bonusRecipes.length}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemove(recipe._id, recipe.title); }}
                            disabled={removingId === recipe._id}
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
                            style={{ background: "#fff3e3", color: "#9a5d13", border: "1px solid #f5c28b" }}
                          >
                            {removingId === recipe._id ? "..." : "הסר"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80 disabled:opacity-30"
                        style={{ background: "white", border: "1px solid #e0d5c5", color: "#1a2e2b" }}
                      >
                        ← הקודם
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className="h-9 w-9 rounded-xl text-sm font-semibold transition"
                          style={{
                            background: p === page ? teal : "white",
                            color: p === page ? "white" : "#1a2e2b",
                            border: `1px solid ${p === page ? teal : "#e0d5c5"}`,
                          }}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80 disabled:opacity-30"
                        style={{ background: "white", border: "1px solid #e0d5c5", color: "#1a2e2b" }}
                      >
                        הבא →
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
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
