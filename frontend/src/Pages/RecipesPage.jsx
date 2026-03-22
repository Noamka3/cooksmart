import { useState } from "react";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RecipesPage() {
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        throw new Error(data.message || "Failed to generate recipe");
      }

      setRecipe(data.recipe || null);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong while generating the recipe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-10 sm:px-6" style={{ background: cream }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: gold }}>
              Recipe Assistant
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              Your Recipe
            </h1>
            <p className="text-sm mt-2" style={{ color: "#5a7a75" }}>
              Get a warm recipe suggestion based on your pantry and food preferences.
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
                Generate Recipe
              </button>
              {recipe ? (
                <button
                  type="button"
                  onClick={handleGenerateRecipe}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: "#f0faf8", color: teal, border: "1px solid #c8e8e4" }}
                >
                  Generate Another Recipe
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-4 flex items-center gap-3 text-sm" style={{ color: "#5a7a75" }}>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a9c8a]/20 border-t-[#1a9c8a]" />
                <span>Cooking up a recipe for you...</span>
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
              Recipe Card
            </p>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}
            >
              {recipe?.title || "Quick Pantry Meal"}
            </h2>
            <p className="text-sm leading-7 whitespace-pre-line" style={{ color: "#5a7a75" }}>
              {recipe?.content || "Based on what you have at home, here is a simple and tasty recipe you can try today."}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
