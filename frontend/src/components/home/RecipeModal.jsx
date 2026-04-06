import { useEffect } from "react";
import CommentsSection from "../CommentsSection";
import { TEAL, GOLD } from "../../constants/theme";

function parseSteps(instructions) {
  const text = (instructions || "").replace(/\\n/g, "\n");
  const byNewline = text.split(/\n+/).filter(s => s.trim());
  return byNewline.length > 1
    ? byNewline
    : text.split(/(?=\d+\.\s)/).filter(s => s.trim());
}

export default function RecipeModal({ recipe, onClose }) {
  useEffect(() => {
    if (!recipe) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [recipe, onClose]);

  if (!recipe) return null;

  const stars = Math.round(recipe.avgRating);
  const steps = parseSteps(recipe.instructions);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        style={{
          width: "100%", maxWidth: 640, maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          borderRadius: "2rem", overflow: "hidden",
          background: "rgba(8,18,17,0.97)",
          border: "1px solid rgba(0,201,167,0.15)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,201,167,0.08)",
          backdropFilter: "blur(20px)",
          animation: "scaleIn .2s ease",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(135deg,rgba(0,201,167,0.08),transparent 60%)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ color: s <= stars ? GOLD : "rgba(255,255,255,0.15)", fontSize: "1rem" }}>★</span>
                ))}
                <span style={{ color: "rgba(250,250,249,0.35)", fontSize: "0.75rem", marginRight: 4 }}>({recipe.ratingCount} דירוגים)</span>
              </div>
              <h2 style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.4rem" }}>{recipe.title}</h2>
            </div>
            <button onClick={onClose} style={{ color: "rgba(250,250,249,0.35)", fontSize: "1.4rem", background: "none", border: "none", cursor: "pointer", paddingTop: 4 }}>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="scroll-none" style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {recipe.ingredients?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: TEAL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>מרכיבים</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="tag-pill" style={{ borderRadius: 999, padding: "4px 12px", fontSize: "0.85rem", color: "rgba(250,250,249,0.78)" }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.instructions && (
            <div>
              <p style={{ color: TEAL, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>הוראות הכנה</p>
              <div style={{ background: "rgba(0,201,167,0.04)", border: "1px solid rgba(0,201,167,0.1)", borderRadius: 16, padding: 16 }}>
                {steps.map((step, i) => {
                  const match = step.trim().match(/^(\d+)\.\s*(.*)/s);
                  if (match) return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: TEAL, color: "#fff", fontSize: "0.72rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        {match[1]}
                      </span>
                      <p style={{ color: "rgba(250,250,249,0.7)", fontSize: "0.88rem", lineHeight: 1.75 }}>{match[2]}</p>
                    </div>
                  );
                  return <p key={i} style={{ color: "rgba(250,250,249,0.7)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: 8 }}>{step.trim()}</p>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <CommentsSection signature={recipe._id} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, color: "rgba(250,250,249,0.55)", border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer" }}>
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
