import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import DarkFooter from "../components/home/DarkFooter";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  createPantryItem,
  deletePantryItem,
  getPantryItems,
  identifyPantryImage,
  updatePantryItem,
} from "../services/pantryService";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pt-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    transition: all .25s ease;
  }
  .pt-card-hover:hover {
    border-color: rgba(249,115,22,0.22);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }
  .pt-input {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    color: #fafaf9;
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 0.875rem;
    outline: none;
    width: 100%;
    transition: border-color .2s;
    font-family: inherit;
  }
  .pt-input::placeholder { color: rgba(250,250,249,0.25); }
  .pt-input:focus { border-color: rgba(249,115,22,0.45); }
  select.pt-input option { background: #1a1a1e; color: #fafaf9; }
  input[type="date"].pt-input::-webkit-calendar-picker-indicator { filter: invert(0.6); }
  .pt-label {
    display: block;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(250,250,249,0.35);
    margin-bottom: 6px;
  }
  .pt-btn-primary {
    background: linear-gradient(135deg,#f97316,#ea580c);
    color: white; border: none; border-radius: 12px;
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    transition: all .2s ease; font-family: inherit;
  }
  .pt-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .pt-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .pt-btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fafaf9; border-radius: 12px;
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    transition: all .2s ease; font-family: inherit;
  }
  .pt-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.09); }
  .pt-btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
  .pt-btn-danger {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171; border-radius: 12px;
    font-size: 0.875rem; font-weight: 700; cursor: pointer;
    transition: all .2s ease; font-family: inherit;
  }
  .pt-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
  .pt-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }
  .pt-modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
  }
  .pt-modal {
    background: #111113;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem;
    width: 100%; max-width: 460px; padding: 28px;
  }
  .pt-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 3px solid rgba(20,184,166,0.15);
    border-top-color: #14b8a6;
    animation: spin .8s linear infinite;
    margin: 0 auto;
  }
`;

const INGREDIENT_ICONS = {
  tomato: "🍅", carrot: "🥕", cucumber: "🥒", pepper: "🫑", potato: "🥔",
  onion: "🧅", garlic: "🧄", lettuce: "🥬", cabbage: "🥬", broccoli: "🥦",
  corn: "🌽", avocado: "🥑", mushroom: "🍄", radish: "🌱", spinach: "🥬",
  asparagus: "🌱", apple: "🍎", banana: "🍌", lemon: "🍋", orange: "🍊",
  grape: "🍇", strawberry: "🍓", watermelon: "🍉", melon: "🍈", pineapple: "🍍",
  mango: "🥭", egg: "🥚", chicken: "🍗", meat: "🥩", fish: "🐟",
  sausage: "🌭", cheese: "🧀", milk: "🥛", yogurt: "🥛", butter: "🧈",
  bread: "🍞", pita: "🫓", rice: "🍚", pasta: "🍝", flour: "🌾",
  oats: "🌾", oil: "🫗", olive: "🫒", salt: "🧂", sugar: "🍚",
  honey: "🍯", ketchup: "🍅", mayonnaise: "🫗", hummus: "🫘", tahini: "🫗",
  lentils: "🫘", beans: "🫘", chickpeas: "🫘", peas: "🫛",
};

const UNITS = ["יח'", "גרם", "ק\"ג", "מ\"ל", "ליטר", "כוס", "כף", "כפית", "חבילה"];

const getIcon = (name = "") => {
  const lower = name.toLowerCase();
  const matched = Object.entries(INGREDIENT_ICONS).find(([key]) => lower.includes(key));
  return matched ? matched[1] : "🥣";
};

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (error.code === "NETWORK_ERROR") return "שגיאת רשת. בדוק את החיבור לאינטרנט ונסה שוב.";
  return error.message || fallback;
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

function useEscapeKey(onClose) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
}

// ─── Shared form fields ────────────────────────────────────────────────────────

function ItemFormFields({ form, set }) {
  return (
    <>
      <div>
        <label className="pt-label">שם המרכיב *</label>
        <input
          type="text"
          placeholder="למשל: עגבניות"
          value={form.ingredientName}
          onChange={set("ingredientName")}
          className="pt-input"
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="pt-label">כמות</label>
          <input type="text" placeholder="5" value={form.quantity} onChange={set("quantity")} className="pt-input" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="pt-label">יחידה</label>
          <select value={form.unit} onChange={set("unit")} className="pt-input">
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="pt-label">תאריך תפוגה (אופציונלי)</label>
        <input type="date" value={form.expiryDate} onChange={set("expiryDate")} className="pt-input" />
      </div>
    </>
  );
}

// ─── Modals ────────────────────────────────────────────────────────────────────

function ItemModal({ item = null, onClose, onAdd, onSave }) {
  const isEdit = !!item;
  const [form, setForm] = useState(() => ({
    ingredientName: item?.ingredientName ?? "",
    quantity:       item?.quantity ?? "",
    unit:           item?.unit ?? "יח'",
    expiryDate:     item?.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    imageUrl:       item?.imageUrl ?? null,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEscapeKey(onClose);

  const set = (key) => (e) => setForm((cur) => ({ ...cur, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ingredientName.trim()) { setError("שם המרכיב הוא שדה חובה."); return; }
    try {
      setLoading(true); setError("");
      await (isEdit ? onSave(item._id, form) : onAdd(form));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? "לא ניתן היה לעדכן את הפריט." : "לא ניתן היה להוסיף את הפריט."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pt-modal" dir="rtl">
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, marginBottom: 6 }}>
          {isEdit ? "עריכת פריט" : "מרכיב חדש"}
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.35rem", color: "#fafaf9", marginBottom: 20 }}>
          {isEdit ? `עריכת ${item.ingredientName}` : "הוסף למזווה"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ItemFormFields form={form} set={set} />

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="pt-btn-ghost" style={{ flex: 1, padding: "12px" }} disabled={loading}>ביטול</button>
            <button type="submit" className="pt-btn-primary" style={{ flex: 1, padding: "12px" }} disabled={loading}>
              {loading ? (isEdit ? "שומר..." : "מוסיף...") : (isEdit ? "שמור שינויים" : "הוסף למזווה")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageIdentifyModal({ identified, onClose, onAdd }) {
  const [form, setForm] = useState({
    ingredientName: identified.ingredientName || "",
    quantity:       "",
    unit:           identified.suggestedUnit || "יח'",
    expiryDate:     "",
    imageUrl:       identified.imageUrl || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEscapeKey(onClose);

  const set = (key) => (e) => setForm((cur) => ({ ...cur, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ingredientName.trim()) { setError("שם המרכיב הוא שדה חובה."); return; }
    try {
      setLoading(true); setError("");
      await onAdd(form);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "לא ניתן היה להוסיף את הפריט שזוהה."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pt-modal" dir="rtl">
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 6 }}>
          זיהוי מתמונה
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.35rem", color: "#fafaf9", marginBottom: 16 }}>
          אשר/י והוסף/י למזווה
        </h2>

        {identified.imageUrl && (
          <img
            src={identified.imageUrl}
            alt={identified.ingredientName}
            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, marginBottom: 16 }}
          />
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ItemFormFields form={form} set={set} />

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="pt-btn-ghost" style={{ flex: 1, padding: "12px" }} disabled={loading}>ביטול</button>
            <button type="submit" className="pt-btn-primary" style={{ flex: 1, padding: "12px" }} disabled={loading}>
              {loading ? "מוסיף..." : "הוסף למזווה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ item, onClose, onConfirm, loading }) {
  const [error, setError] = useState("");

  useEscapeKey(onClose);

  const handleConfirm = async () => {
    try {
      setError("");
      await onConfirm(item);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "לא ניתן היה למחוק את הפריט."));
    }
  };

  return (
    <div className="pt-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pt-modal" dir="rtl">
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f87171", marginBottom: 6 }}>
          מחיקת מרכיב
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.35rem", color: "#fafaf9", marginBottom: 10 }}>
          למחוק את {item.ingredientName}?
        </h2>
        <p style={{ fontSize: "0.875rem", color: "rgba(250,250,249,0.45)", lineHeight: 1.75, marginBottom: 20 }}>
          הפעולה תסיר את המרכיב מהמזווה שלך. אפשר להוסיף אותו שוב בהמשך אם צריך.
        </p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} className="pt-btn-ghost" style={{ flex: 1, padding: "12px" }} disabled={loading}>ביטול</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: 12,
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, fontFamily: "inherit",
            }}
          >
            {loading ? "מוחק..." : "מחק"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({ item, isDeleting, onEdit, onDelete }) {
  const expiryDate    = item.expiryDate ? new Date(item.expiryDate) : null;
  const isExpired     = expiryDate && expiryDate < Date.now();
  const isExpiringSoon = expiryDate && !isExpired && (expiryDate - Date.now()) < 3 * 24 * 60 * 60 * 1000;

  const borderLeft = isExpired ? "3px solid #f87171" : isExpiringSoon ? "3px solid #fbbf24" : "3px solid transparent";
  const expiryColor = isExpired ? "#f87171" : isExpiringSoon ? "#fbbf24" : "rgba(250,250,249,0.3)";
  const expiryLabel = isExpired
    ? "⚠️ פג תוקף"
    : isExpiringSoon
    ? `⏳ פג תוקף ב־${expiryDate.toLocaleDateString("he-IL")}`
    : `תוקף: ${expiryDate.toLocaleDateString("he-IL")}`;

  return (
    <div
      className="pt-card pt-card-hover"
      style={{ padding: "16px 20px", borderLeft }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.ingredientName} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
              {getIcon(item.ingredientName)}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: "#fafaf9", fontSize: "0.95rem", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.ingredientName}
            </p>
            {(item.quantity || item.unit) ? (
              <p style={{ fontSize: "0.8rem", color: "rgba(250,250,249,0.4)", marginBottom: 2 }}>{item.quantity} {item.unit}</p>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "rgba(250,250,249,0.25)", marginBottom: 2 }}>לא צוינה כמות</p>
            )}
            {expiryDate && (
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: expiryColor }}>{expiryLabel}</p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="pt-btn-ghost"
            style={{ padding: "8px 14px", fontSize: "0.8rem" }}
            disabled={isDeleting}
          >
            ✏️ עריכה
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="pt-btn-danger"
            style={{ padding: "8px 14px", fontSize: "0.8rem" }}
            disabled={isDeleting}
          >
            {isDeleting ? "מוחק..." : "🗑️ מחק"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PantryPage() {
  const { token, logout } = useAuth();
  const { showToast }     = useToast();
  const navigate          = useNavigate();
  const fileInputRef      = useRef(null);

  const [items,           setItems]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showAdd,         setShowAdd]         = useState(false);
  const [editItem,        setEditItem]        = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [search,          setSearch]          = useState("");
  const [sortBy,          setSortBy]          = useState("createdAt");
  const [identifiedItem,  setIdentifiedItem]  = useState(null);
  const [imageLoading,    setImageLoading]    = useState(false);
  const [imageStatus,     setImageStatus]     = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const handleAuthFailure = useCallback(() => {
    showToast({ type: "error", title: "פג תוקף ההתחברות", message: "אנא התחבר מחדש כדי להמשיך להשתמש במזווה שלך." });
    logout();
    navigate("/login", { replace: true, state: { from: "/pantry" } });
  }, [logout, navigate, showToast]);

  const handlePantryError = useCallback((error, fallbackTitle, fallbackMessage) => {
    if (error?.status === 401) { handleAuthFailure(); return; }
    showToast({ type: "error", title: fallbackTitle, message: getErrorMessage(error, fallbackMessage) });
  }, [handleAuthFailure, showToast]);

  const fetchItems = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await getPantryItems(token);
      setItems(data.items || []);
    } catch (error) {
      handlePantryError(error, "שגיאה בטעינת המזווה", "לא ניתן לטעון את פריטי המזווה.");
      throw error;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [handlePantryError, token]);

  useEffect(() => { fetchItems().catch(() => {}); }, [fetchItems]);

  const expiryAlerts = useMemo(() => {
    const today  = new Date(); today.setHours(0, 0, 0, 0);
    const in3Days = new Date(today); in3Days.setDate(today.getDate() + 3);
    const expired      = items.filter((i) => i.expiryDate && new Date(i.expiryDate) < today);
    const expiringSoon = items.filter((i) => {
      if (!i.expiryDate) return false;
      const d = new Date(i.expiryDate);
      return d >= today && d <= in3Days;
    });
    return { expired, expiringSoon };
  }, [items]);

  const handleAdd = async (form, imageFile = null) => {
    try {
      const result = await createPantryItem(token, form, imageFile);
      await fetchItems({ silent: true });
      showToast({
        type: "success",
        title: result.merged ? "כמות עודכנה" : "פריט נוסף",
        message: result.merged
          ? `${form.ingredientName.trim()} כבר קיים — הכמות עודכנה.`
          : `${form.ingredientName.trim()} נוסף למזווה שלך.`,
      });
    } catch (error) {
      handlePantryError(error, "שגיאה בהוספת פריט", "לא ניתן להוסיף את הפריט למזווה.");
      throw error;
    }
  };

  const handleSave = async (id, form) => {
    try {
      await updatePantryItem(token, id, form);
      await fetchItems({ silent: true });
      showToast({ type: "success", title: "פריט עודכן", message: `${form.ingredientName.trim()} עודכן בהצלחה.` });
    } catch (error) {
      handlePantryError(error, "שגיאה בעדכון פריט", "לא ניתן לעדכן את הפריט.");
      throw error;
    }
  };

  const handleDelete = async (item) => {
    try {
      setDeleteLoadingId(item._id);
      await deletePantryItem(token, item._id);
      await fetchItems({ silent: true });
      showToast({ type: "info", title: "פריט הוסר", message: `${item.ingredientName} הוסר מהמזווה שלך.` });
    } catch (error) {
      handlePantryError(error, "שגיאה במחיקת פריט", "לא ניתן להסיר את הפריט.");
      throw error;
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setImageLoading(true);
    setImageStatus(null);
    try {
      const data = await identifyPantryImage(token, file);
      if (!data.ingredientName || data.ingredientName === "לא זוהה") {
        const msg = "לא הצלחנו לזהות פריט מזון בתמונה זו.";
        setImageStatus({ ok: false, message: msg });
        showToast({ type: "error", title: "זיהוי תמונה נכשל", message: msg });
        return;
      }
      setIdentifiedItem({ ...data, file });
      setImageStatus({ ok: true, message: `זוהה פריט: ${data.ingredientName}` });
      showToast({ type: "success", title: "תמונה זוהתה", message: `${data.ingredientName} מוכן להוספה למזווה שלך.` });
    } catch (error) {
      const msg = getErrorMessage(error, "לא ניתן לזהות את התמונה שהועלתה.");
      setImageStatus({ ok: false, message: msg });
      handlePantryError(error, "זיהוי תמונה נכשל", "לא ניתן לזהות את התמונה שהועלתה.");
    } finally {
      setImageLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const list = items.filter((item) => item.ingredientName?.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sortBy === "name")   return a.ingredientName.localeCompare(b.ingredientName, "he");
      if (sortBy === "expiry") {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [items, search, sortBy]);

  const closeItemModal = () => { setShowAdd(false); setEditItem(null); };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.06),transparent 65%)" }} />
      </div>

      <Navbar />

      {/* Modals */}
      {(showAdd || editItem) && (
        <ItemModal item={editItem} onClose={closeItemModal} onAdd={handleAdd} onSave={handleSave} />
      )}
      {identifiedItem && (
        <ImageIdentifyModal
          identified={identifiedItem}
          onClose={() => setIdentifiedItem(null)}
          onAdd={async (form) => { await handleAdd(form, identifiedItem.file); setIdentifiedItem(null); }}
        />
      )}
      {deleteItemTarget && (
        <DeleteConfirmModal
          item={deleteItemTarget}
          onClose={() => setDeleteItemTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoadingId === deleteItemTarget._id}
        />
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

      <main
        dir="rtl"
        style={{ position: "relative", zIndex: 1, padding: "40px 24px 80px", maxWidth: 880, margin: "0 auto" }}
      >
        {/* Header */}
        <section
          className="pt-card"
          style={{ padding: "32px 36px", marginBottom: 24, animation: "fadeUp .5s ease both" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: ORANGE, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "block", width: 20, height: 1, background: ORANGE }} />
                המזווה שלי
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: "#fafaf9", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 12 }}>
                המטבח{" "}
                <span style={{ background: "linear-gradient(90deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  שלי
                </span>
              </h1>
              <p style={{ fontSize: "0.9rem", color: "rgba(250,250,249,0.4)", lineHeight: 1.75, maxWidth: 480 }}>
                נהל את מה שיש לך בבית, הוסף מרכיבים חדשים במהירות, וזהה פריטים ישירות מתמונות.
              </p>
            </div>

            {/* Stats bubble */}
            <div style={{ textAlign: "center", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: "1.25rem", padding: "16px 28px" }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(249,115,22,0.7)", marginBottom: 6 }}>פריטים במזווה</p>
              <p style={{ fontSize: "2.2rem", fontWeight: 900, color: ORANGE, lineHeight: 1 }}>{items.length}</p>
            </div>
          </div>
        </section>

        {/* Expiry alerts */}
        {(expiryAlerts.expired.length > 0 || expiryAlerts.expiringSoon.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, animation: "fadeUp .5s ease .08s both" }}>
            {expiryAlerts.expired.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: "1rem", padding: "14px 18px", fontSize: "0.875rem", color: "#f87171" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🚨</span>
                <span>
                  <strong>{expiryAlerts.expired.length} פריטים פגי תוקף: </strong>
                  {expiryAlerts.expired.map((i) => i.ingredientName).join(", ")}
                </span>
              </div>
            )}
            {expiryAlerts.expiringSoon.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.22)", borderRadius: "1rem", padding: "14px 18px", fontSize: "0.875rem", color: "#fbbf24" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>⚠️</span>
                <span>
                  <strong>{expiryAlerts.expiringSoon.length} פריטים עומדים לפוג ב-3 ימים: </strong>
                  {expiryAlerts.expiringSoon.map((i) => i.ingredientName).join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <section className="pt-card" style={{ padding: "22px 26px", marginBottom: 28, animation: "fadeUp .5s ease .12s both" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button type="button" onClick={() => setShowAdd(true)} className="pt-btn-primary" style={{ padding: "11px 20px" }}>
                ➕ הוסף מרכיב
              </button>
              <button
                type="button"
                onClick={() => { setImageStatus(null); fileInputRef.current?.click(); }}
                disabled={imageLoading}
                className="pt-btn-ghost"
                style={{ padding: "11px 20px" }}
              >
                {imageLoading ? "🔍 מזהה..." : "📷 זיהוי מתמונה"}
              </button>
            </div>

            {/* Search & sort */}
            <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-start", minWidth: 240 }}>
              <div style={{ flex: 1 }}>
                <label className="pt-label">חיפוש</label>
                <input
                  type="text"
                  placeholder="חפש מרכיב..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pt-input"
                />
              </div>
              <div style={{ width: 140, flexShrink: 0 }}>
                <label className="pt-label">מיון</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pt-input">
                  <option value="createdAt">תאריך הוספה</option>
                  <option value="name">שם א-ת</option>
                  <option value="expiry">תאריך תפוגה</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image status */}
          {imageStatus && (
            <div style={{
              marginTop: 14,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: "0.85rem",
              background: imageStatus.ok ? "rgba(20,184,166,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${imageStatus.ok ? "rgba(20,184,166,0.22)" : "rgba(239,68,68,0.22)"}`,
              color: imageStatus.ok ? TEAL : "#f87171",
            }}>
              {imageStatus.message}
            </div>
          )}
        </section>

        {/* Item list */}
        {loading ? (
          <div className="pt-card" style={{ padding: "64px 24px", textAlign: "center", animation: "fadeUp .5s ease .16s both" }}>
            <div className="pt-spinner" style={{ marginBottom: 20 }} />
            <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.95rem" }}>טוען את המזווה שלך...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pt-card" style={{ padding: "64px 24px", textAlign: "center", animation: "fadeUp .5s ease .16s both" }}>
            <p style={{ fontSize: "3.5rem", marginBottom: 16 }}>{search ? "🔎" : "🥕"}</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#fafaf9", marginBottom: 8 }}>
              {search ? "לא נמצאו מרכיבים" : "המזווה שלך עדיין ריק"}
            </p>
            <p style={{ fontSize: "0.875rem", color: "rgba(250,250,249,0.35)", lineHeight: 1.75, maxWidth: 380, margin: "0 auto" }}>
              {search ? "נסו חיפוש אחר או נקו את הסינון." : "הוסיפו כמה פריטים כדי להתחיל לקבל מתכונים לפי מה שכבר יש בבית."}
            </p>
          </div>
        ) : (
          <section style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp .5s ease .16s both" }}>
            {search && (
              <p style={{ fontSize: "0.75rem", color: "rgba(250,250,249,0.3)", marginBottom: 4 }}>
                מציג {filtered.length} מתוך {items.length} פריטים
              </p>
            )}
            {filtered.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                isDeleting={deleteLoadingId === item._id}
                onEdit={setEditItem}
                onDelete={setDeleteItemTarget}
              />
            ))}
          </section>
        )}

        {/* CTA */}
        {items.length > 0 && (
          <div style={{ marginTop: 36, textAlign: "center", animation: "fadeUp .5s ease .24s both" }}>
            <button
              type="button"
              onClick={() => navigate("/recipes")}
              className="pt-btn-primary"
              style={{ padding: "14px 32px", fontSize: "0.95rem", borderRadius: 14 }}
            >
              מצא מתכונים לפי המלאי שלי ({items.length} מרכיבים) ←
            </button>
          </div>
        )}
      </main>

      <DarkFooter />
    </div>
  );
}
