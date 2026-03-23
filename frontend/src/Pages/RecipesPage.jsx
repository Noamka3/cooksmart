import { useState } from "react";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

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

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RecipesPage() {
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openBonus, setOpenBonus] = useState(null);

  const handleGenerateRecipe = async () => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

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

      setRecipe(data.recipe || null);
    } catch (requestError) {
      setError(requestError.message || "משהו השתבש בעת יצירת המתכון");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" dir="rtl" style={{ background: cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: gold }}>
              עוזר המתכונים
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              המתכון שלך
            </h1>
            <p className="text-sm mt-2" style={{ color: "#5a7a75" }}>
              קבל הצעת מתכון מותאמת אישית לפי מה שיש לך במזווה ובהעדפות האוכל שלך.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6" style={{ border: "1px solid #e8f0ef" }}>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: teal }}
              >
                צור מתכון
              </button>
              {recipe ? (
                <button
                  type="button"
                  onClick={handleGenerateRecipe}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
              <p className="text-sm mt-4" style={{ color: "#d14d4d" }}>
                {error}
              </p>
            ) : null}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #e8f0ef" }}>
            <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: gold }}>
              כרטיס מתכון
            </p>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              {recipe?.title || "ארוחה מהירה מהמזווה"}
            </h2>

            {recipe?.ingredients?.length > 0 ? (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: teal }}>
                  מרכיבים
                </p>
                <ul className="space-y-1">
                  {recipe.ingredients.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#3d5a57" }}>
                      <span style={{ color: gold }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <RecipeContent text={recipe?.content || "לפי מה שיש לך בבית, כאן תמצא מתכון פשוט וטעים שתוכל להכין היום."} />
          </div>

          {recipe?.bonusRecipes?.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: gold }}>
                רעיונות נוספים — אם תוסיף/י עוד מרכיבים
              </p>
              <div className="space-y-3">
                {recipe.bonusRecipes.map((bonus, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #e8f0ef" }}>
                    <button
                      type="button"
                      onClick={() => setOpenBonus(openBonus === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-right"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#1a2e2b" }}>{bonus.title}</p>
                        {bonus.missingIngredients.length > 0 ? (
                          <p className="text-xs mt-1" style={{ color: "#d14d4d" }}>
                            חסר/ים: {bonus.missingIngredients.join("، ")}
                          </p>
                        ) : null}
                      </div>
                      <span className="mr-3 text-sm" style={{ color: teal }}>
                        {openBonus === i ? "▲" : "▼"}
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
