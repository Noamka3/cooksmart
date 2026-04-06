import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommentsSection from "../components/CommentsSection";
import DarkFooter from "../components/home/DarkFooter";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getSavedRecipes, rateRecipe, removeSavedRecipe } from "../services/savedRecipesService";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";
const PER_PAGE = 10;

// inject star burst keyframe once
if (typeof document !== "undefined" && !document.getElementById("star-burst-style")) {
  const s = document.createElement("style");
  s.id = "star-burst-style";
  s.textContent = `
    @keyframes starfly {
      0%   { transform: translate(0,0) scale(1.4); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .sr-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    transition: all .25s ease;
    animation: fadeUp .5s ease both;
  }
  .sr-recipe-row {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1rem;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 14px 18px; cursor: pointer;
    transition: all .2s ease;
  }
  .sr-recipe-row:hover { border-color: rgba(249,115,22,0.2); background: rgba(249,115,22,0.03); transform: translateY(-1px); }
  .sr-input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
    color: #fafaf9; border-radius: 14px; padding: 13px 18px; font-size: 0.875rem;
    outline: none; transition: border-color .2s; font-family: inherit;
  }
  .sr-input::placeholder { color: rgba(250,250,249,0.25); }
  .sr-input:focus { border-color: rgba(249,115,22,0.4); }
  .sr-modal-backdrop {
    position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center;
    padding: 20px; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
  }
  .sr-modal {
    background: #111113; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.75rem; width: 100%; max-width: 720px; max-height: 90vh;
    display: flex; flex-direction: column;
    animation: modalIn .25s ease both;
  }
  .sr-section-label {
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; margin-bottom: 12px;
  }
  .sr-tag {
    border-radius: 999px; padding: 5px 14px; font-size: 0.78rem;
    background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.2); color: #2dd4bf;
  }
  .sr-page-btn {
    border-radius: 10px; padding: 8px 16px; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; transition: all .2s; font-family: inherit; border: none;
  }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarBurst({ x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * 360;
        const dist = 35 + Math.random() * 25;
        return (
          <div key={i} style={{
            position: "absolute", fontSize: `${0.8 + Math.random() * 0.8}rem`,
            color: i % 2 === 0 ? "#f97316" : "#fbbf24",
            animation: `starfly ${0.6 + Math.random() * 0.3}s ease-out ${i * 40}ms forwards`,
            "--dx": `${Math.cos((angle * Math.PI) / 180) * dist}px`,
            "--dy": `${Math.sin((angle * Math.PI) / 180) * dist}px`,
          }}>★</div>
        );
      })}
    </div>
  );
}

function StarRating({ value, onChange, size = "1.1rem" }) {
  const [hovered, setHovered] = useState(null);
  const [burst, setBurst] = useState(null);
  const display = hovered ?? value ?? 0;
  const handleClick = (star, e) => {
    if (!onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: Date.now() });
    onChange(star);
  };
  return (
    <>
      {burst && <StarBurst key={burst.id} x={burst.x} y={burst.y} onDone={() => setBurst(null)} />}
      <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button"
            style={{ fontSize: size, color: star <= display ? "#f97316" : "rgba(255,255,255,0.15)", background: "none", border: "none", padding: 0, cursor: onChange ? "pointer" : "default", transition: "transform .15s, color .15s", fontFamily: "inherit" }}
            onMouseEnter={() => onChange && setHovered(star)}
            onMouseLeave={() => onChange && setHovered(null)}
            onClick={(e) => handleClick(star, e)}
            aria-label={`דרג ${star} כוכבים`}
          >★</button>
        ))}
      </div>
    </>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
      <button className="sr-page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === 1 ? "rgba(250,250,249,0.2)" : "rgba(250,250,249,0.7)", cursor: page === 1 ? "not-allowed" : "pointer" }}>
        ← הקודם
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className="sr-page-btn" onClick={() => onPageChange(p)}
          style={{ width: 36, height: 36, padding: 0, background: p === page ? "linear-gradient(135deg,#f97316,#ea580c)" : "rgba(255,255,255,0.05)", border: p === page ? "none" : "1px solid rgba(255,255,255,0.1)", color: p === page ? "#fff" : "rgba(250,250,249,0.55)", boxShadow: p === page ? "0 4px 14px rgba(249,115,22,0.3)" : "none" }}>
          {p}
        </button>
      ))}
      <button className="sr-page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === totalPages ? "rgba(250,250,249,0.2)" : "rgba(250,250,249,0.7)", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
        הבא →
      </button>
    </div>
  );
}

function FullRecipeModal({ recipe, removingId, onClose, onRemove, onRate }) {
  useEffect(() => {
    if (!recipe) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose, recipe]);

  if (!recipe) return null;

  const parseInstructions = (raw) => {
    const text = raw.replace(/\\n/g, "\n");
    const parts = text.split(/\n+/).filter((s) => s.trim());
    return parts.length > 1 ? parts : text.split(/(?=\d+\.\s)/).filter((s) => s.trim());
  };

  return (
    <div className="sr-modal-backdrop" onClick={onClose}>
      <div className="sr-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(135deg,rgba(249,115,22,0.06),rgba(20,184,166,0.04))", borderRadius: "1.75rem 1.75rem 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.1),transparent 65%)" }} />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.22)", color: TEAL }}>
                  נשמר ב-{new Date(recipe.createdAt).toLocaleDateString("he-IL")}
                </span>
                {recipe.bonusRecipes?.length > 0 && (
                  <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#fbbf24" }}>
                    +{recipe.bonusRecipes.length} רעיונות
                  </span>
                )}
              </div>
              <h2 dir="rtl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(1.3rem,3vw,1.8rem)", color: "#fafaf9", lineHeight: 1.25 }}>
                {recipe.title}
              </h2>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(250,250,249,0.6)", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-label="סגור">×</button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }} dir="rtl">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Ingredients */}
            <section>
              <p className="sr-section-label" style={{ color: TEAL }}>מרכיבים מלאים</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recipe.ingredients.map((item, i) => (
                  <span key={i} style={{ padding: "6px 14px", borderRadius: 999, fontSize: "0.82rem", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)", color: "#2dd4bf" }}>{item}</span>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <section style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "20px 24px" }}>
              <p className="sr-section-label" style={{ color: ORANGE }}>הוראות מלאות</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {parseInstructions(recipe.instructions).map((step, i) => {
                  const trimmed = step.trim();
                  const match = trimmed.match(/^(\d+)\.\s*(.*)/s);
                  if (match) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)", color: ORANGE, fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          {match[1]}
                        </span>
                        <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(250,250,249,0.6)" }}>{match[2]}</p>
                      </div>
                    );
                  }
                  return <p key={i} style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(250,250,249,0.6)" }}>{trimmed}</p>;
                })}
              </div>
            </section>

            {/* Bonus recipes */}
            {recipe.bonusRecipes?.length > 0 && (
              <section style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: "1.25rem", padding: "20px 24px" }}>
                <p className="sr-section-label" style={{ color: GOLD }}>רעיונות נוספים / בונוס</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {recipe.bonusRecipes.map((bonus, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ fontWeight: 700, color: "#fafaf9", fontSize: "0.875rem", marginBottom: 4 }}>{bonus.title}</p>
                      {bonus.missingIngredients?.length > 0 && (
                        <p style={{ fontSize: "0.75rem", color: "#f87171", marginBottom: 8 }}>חסר/ים: {bonus.missingIngredients.join(", ")}</p>
                      )}
                      <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "rgba(250,250,249,0.5)", whiteSpace: "pre-line" }}>{bonus.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding: "18px 28px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 16 }} dir="rtl">
          <CommentsSection signature={recipe.recipeSignature} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <StarRating value={recipe.rating} onChange={(r) => onRate(recipe._id, r)} size="1.5rem" />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => onRemove(recipe._id, recipe.title)} disabled={removingId === recipe._id}
                style={{ padding: "9px 18px", borderRadius: 12, fontSize: "0.82rem", fontWeight: 700, cursor: removingId === recipe._id ? "not-allowed" : "pointer", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", fontFamily: "inherit", opacity: removingId === recipe._id ? 0.6 : 1, transition: "all .2s" }}>
                {removingId === recipe._id ? "מסיר..." : "× הסר מהמועדפים"}
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: "9px 18px", borderRadius: 12, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(250,250,249,0.7)", fontFamily: "inherit", transition: "all .2s" }}>
                סגור
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedRecipesPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await getSavedRecipes(token);
        setSavedRecipes(res.savedRecipes || []);
      } catch (err) {
        showToast({ type: "error", title: "טעינת המתכונים נכשלה", message: err.message || "לא הצלחתי לטעון את המתכונים השמורים" });
      } finally { setIsLoading(false); }
    };
    fetch();
  }, [showToast, token]);

  const handleRate = async (savedRecipeId, rating) => {
    try {
      const { savedRecipe } = await rateRecipe(token, savedRecipeId, rating);
      setSavedRecipes((prev) => prev.map((r) => (r._id === savedRecipeId ? { ...r, rating: savedRecipe.rating } : r)));
      setSelectedRecipe((prev) => (prev?._id === savedRecipeId ? { ...prev, rating: savedRecipe.rating } : prev));
    } catch (err) {
      showToast({ type: "error", title: "שגיאה", message: err.message || "לא הצלחתי לשמור את הדירוג" });
    }
  };

  const handleRemove = async (savedRecipeId, title) => {
    try {
      setRemovingId(savedRecipeId);
      await removeSavedRecipe(token, savedRecipeId);
      setSavedRecipes((cur) => cur.filter((r) => r._id !== savedRecipeId));
      setSelectedRecipe((cur) => (cur?._id === savedRecipeId ? null : cur));
      showToast({ type: "info", title: "המתכון הוסר", message: `הסרנו את "${title}" מהמתכונים השמורים.` });
    } catch (err) {
      showToast({ type: "error", title: "לא הצלחתי להסיר", message: err.message || "נסה/י שוב." });
    } finally { setRemovingId(null); }
  };

  const filtered = savedRecipes.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.05),transparent 65%)" }} />
      </div>

      <Navbar />

      <main dir="rtl" style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Header ── */}
        <div className="sr-card" style={{ padding: "32px 36px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.08),transparent 65%)" }} />
          </div>
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
            <div>
              <div style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD }}>
                ✨ המתכונים השמורים שלי
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.7rem,4vw,2.6rem)", color: "#fafaf9", marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                אוסף המתכונים{" "}
                <span style={{ background: "linear-gradient(90deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  ששווה לחזור אליו
                </span>
              </h1>
              <p style={{ color: "rgba(250,250,249,0.38)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 480 }}>
                כל המתכונים שאהבת ושמרת, מוכנים לבישול מהיר או לסבב השראה חדש במטבח.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: ORANGE, lineHeight: 1 }}>{savedRecipes.length}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(250,250,249,0.35)", marginTop: 4 }}>מתכונים שמורים</div>
              </div>
              <Link to="/recipes" style={{ padding: "12px 22px", borderRadius: 14, background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", boxShadow: "0 8px 24px rgba(249,115,22,0.22)", display: "inline-block" }}>
                + צור מתכון חדש
              </Link>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        {savedRecipes.length > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeUp .5s ease .1s both" }}>
            <input
              type="text"
              placeholder="🔍  חפש מתכון שמור..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="sr-input"
            />
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeUp .5s ease both" }}>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#f97316]/20 border-t-[#f97316]" style={{ margin: "0 auto 20px" }} />
            <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.875rem" }}>טוען את המתכונים השמורים...</p>
          </div>

        ) : savedRecipes.length === 0 ? (
          <div className="sr-card" style={{ padding: "64px 32px", textAlign: "center", animationDelay: ".1s" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,rgba(249,115,22,0.12),rgba(20,184,166,0.08))", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2rem" }}>
              ♥
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.6rem", color: "#fafaf9", marginBottom: 14 }}>
              עדיין אין מתכונים שמורים
            </h2>
            <p style={{ color: "rgba(250,250,249,0.38)", fontSize: "0.875rem", lineHeight: 1.75, maxWidth: 440, margin: "0 auto 32px" }}>
              כשתשמור/י מתכון שאהבת, הוא יופיע כאן עם כל הפרטים כדי שתוכל/י לחזור אליו בקלות.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <Link to="/recipes" style={{ padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                צא/י ליצור מתכון ←
              </Link>
              <Link to="/account" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(250,250,249,0.7)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                חזרה לחשבון
              </Link>
            </div>
          </div>

        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp .5s ease .15s both" }}>
              {paginated.map((recipe, index) => (
                <div key={recipe._id} className="sr-recipe-row" onClick={() => setSelectedRecipe(recipe)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(250,250,249,0.18)", minWidth: 22 }}>
                      {(page - 1) * PER_PAGE + index + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fafaf9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                        {recipe.title}
                      </h2>
                      <p style={{ fontSize: "0.75rem", color: "rgba(250,250,249,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {recipe.ingredients?.slice(0, 4).join(" · ")}{recipe.ingredients?.length > 4 ? ` · +${recipe.ingredients.length - 4}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <StarRating value={recipe.rating} onChange={(r) => handleRate(recipe._id, r)} />
                    <span style={{ fontSize: "0.72rem", color: "rgba(250,250,249,0.25)" }} className="hidden sm:block">
                      {new Date(recipe.createdAt).toLocaleDateString("he-IL")}
                    </span>
                    {recipe.bonusRecipes?.length > 0 && (
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#fbbf24" }} className="hidden sm:block">
                        +{recipe.bonusRecipes.length}
                      </span>
                    )}
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemove(recipe._id, recipe.title); }}
                      disabled={removingId === recipe._id}
                      style={{ padding: "5px 14px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, cursor: removingId === recipe._id ? "not-allowed" : "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", opacity: removingId === recipe._id ? 0.6 : 1, fontFamily: "inherit", transition: "all .2s" }}>
                      {removingId === recipe._id ? "..." : "הסר"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </main>

      <DarkFooter />

      <FullRecipeModal
        recipe={selectedRecipe}
        removingId={removingId}
        onClose={() => setSelectedRecipe(null)}
        onRemove={handleRemove}
        onRate={handleRate}
      />
    </div>
  );
}
