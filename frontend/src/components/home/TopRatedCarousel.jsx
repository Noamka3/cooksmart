import { useEffect, useRef, useState } from "react";
import { getTopRatedRecipes } from "../../services/savedRecipesService";
import { IMG, GOLD, TEAL, DARK2, TEXT } from "../../constants/theme";
import RecipeModal from "./RecipeModal";

const RECIPE_IMGS = [IMG.bowl, IMG.pasta, IMG.salad, IMG.berries, IMG.veggies, IMG.cooking];

export default function TopRatedCarousel() {
  const [recipes, setRecipes]   = useState([]);
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getTopRatedRecipes()
      .then(d => setRecipes(d.topRated || []))
      .catch(() => {});
  }, []);

  if (recipes.length === 0) return null;

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 310, behavior: "smooth" });
  };

  return (
    <section dir="rtl" style={{ background: DARK2, padding: "112px 24px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>
        <p className="section-label" style={{ textAlign: "center", color: GOLD, justifyContent: "center" }}>
          <span style={{ background: GOLD, height: 1 }} />
          ⭐ הכי אהובים
          <span style={{ background: GOLD, height: 1 }} />
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3rem)", color: TEXT, marginBottom: 56, letterSpacing: "-0.01em" }}>
          מתכונים מומלצים
        </h2>

        <div style={{ position: "relative" }}>
          {/* Scroll buttons */}
          {[{ dir: 1, side: "right", arrow: "›" }, { dir: -1, side: "left", arrow: "‹" }].map(btn => (
            <button
              key={btn.side}
              onClick={() => scroll(btn.dir)}
              style={{
                position: "absolute", [btn.side]: -20, top: "50%", transform: "translateY(-50%)",
                zIndex: 10, width: 44, height: 44, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", background: "rgba(8,20,18,0.92)",
                border: "1px solid rgba(20,184,166,0.2)", color: TEAL,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)", cursor: "pointer",
                backdropFilter: "blur(8px)", transition: "transform .2s ease",
              }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
            >
              {btn.arrow}
            </button>
          ))}

          {/* Cards */}
          <div ref={scrollRef} className="scroll-none" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
            {recipes.map((recipe, idx) => {
              const stars  = Math.round(recipe.avgRating);
              const imgSrc = RECIPE_IMGS[idx % RECIPE_IMGS.length];
              return (
                <div
                  key={recipe._id}
                  className="recipe-card"
                  style={{ flexShrink: 0, width: 280 }}
                  onClick={() => setSelected(recipe)}
                >
                  {/* Photo */}
                  <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
                    <img
                      src={imgSrc}
                      alt={recipe.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }}
                      onMouseOver={e => e.target.style.transform = "scale(1.08)"}
                      onMouseOut={e => e.target.style.transform = "scale(1)"}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(7,15,14,0.7),transparent 60%)" }} />
                    <div style={{ position: "absolute", bottom: 10, right: 12, display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ color: s <= stars ? GOLD : "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>★</span>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px 16px", textAlign: "right" }}>
                    <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6, lineHeight: 1.4 }}>{recipe.title}</h3>
                    {recipe.ingredients?.length > 0 && (
                      <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.78rem", lineHeight: 1.5 }}>
                        {recipe.ingredients.slice(0, 3).join(" · ")}
                        {recipe.ingredients.length > 3 ? ` · +${recipe.ingredients.length - 3}` : ""}
                      </p>
                    )}
                    <p style={{ color: TEAL, fontSize: "0.78rem", fontWeight: 600, marginTop: 10 }}>לצפייה במתכון ←</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RecipeModal recipe={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
