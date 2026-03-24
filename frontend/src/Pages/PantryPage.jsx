import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INGREDIENT_ICONS = {
  // ירקות
  עגבניה: "🍅", עגבניות: "🍅", עגבנייה: "🍅",
  גזר: "🥕", גזרים: "🥕",
  מלפפון: "🥒", מלפפונים: "🥒",
  פלפל: "🫑", פלפלים: "🫑",
  תפוח: "🥔", תפוחי: "🥔",
  בצל: "🧅", בצלים: "🧅",
  שום: "🧄",
  חסה: "🥬", חסה: "🥬",
  כרוב: "🥬", ברוקולי: "🥦",
  תירס: "🌽", תירסים: "🌽",
  אבוקדו: "🥑",
  פטריות: "🍄", פטרייה: "🍄",
  צנון: "🌱", כרובית: "🥦",
  תרד: "🥬", אספרגוס: "🌱",
  // פירות
  תפוח: "🍎", תפוחים: "🍎",
  בננה: "🍌", בננות: "🍌",
  לימון: "🍋", לימונים: "🍋",
  תפוז: "🍊", תפוזים: "🍊",
  ענב: "🍇", ענבים: "🍇",
  תות: "🍓", תותים: "🍓",
  אבטיח: "🍉", מלון: "🍈",
  אננס: "🍍", מנגו: "🥭",
  // חלבון
  ביצה: "🥚", ביצים: "🥚",
  עוף: "🍗", חזה: "🍗", כנפיים: "🍗",
  בשר: "🥩", סטייק: "🥩", טחון: "🥩",
  דג: "🐟", סלמון: "🐟", טונה: "🐟",
  נקניק: "🌭", שניצל: "🍗",
  // חלב
  גבינה: "🧀", גבינות: "🧀",
  חלב: "🥛",
  יוגורט: "🥛", שמנת: "🥛",
  חמאה: "🧈", מרגרינה: "🧈",
  // פחמימות
  לחם: "🍞", פיתה: "🫓", לחמניה: "🍞",
  אורז: "🍚",
  פסטה: "🍝", ספגטי: "🍝", מקרוני: "🍝",
  קמח: "🌾", שיבולת: "🌾",
  שיבולת: "🌾", קוואקר: "🌾",
  // תיבול ושמנים
  שמן: "🫙", זית: "🫒", זיתים: "🫒",
  מלח: "🧂",
  סוכר: "🍚", דבש: "🍯",
  קטשופ: "🍅", מיונז: "🫙",
  חומוס: "🫘", טחינה: "🫙",
  // קטניות ודגנים
  עדשים: "🫘", שעועית: "🫘", גרגרי: "🫘",
  אפונה: "🟢",
};

const getIcon = (name) => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
    if (lower.includes(key.toLowerCase())) return icon;
  }
  // fallback לפי קטגוריה כללית
  if (/ירק|עלים|סלט/.test(lower)) return "🥬";
  if (/פרי|מיץ/.test(lower)) return "🍑";
  if (/בשר|עוף|דג|סלמון|טונה/.test(lower)) return "🥩";
  if (/חלב|גבינ|יוגורט/.test(lower)) return "🥛";
  if (/לחם|קמח|פיתה|עוגה/.test(lower)) return "🍞";
  if (/שמן|רוטב|ממרח/.test(lower)) return "🫙";
  return "❓";
};

const UNITS = ["יח'", "גרם", "ק\"ג", "מ\"ל", "ליטר", "כוס", "כף", "כפית", "חבילה"];

function AddItemModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ ingredientName: "", quantity: "", unit: "יח'" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ingredientName.trim()) return;
    setLoading(true);
    await onAdd(form);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-5"
          style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          הוסף מרכיב
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
              שם המרכיב
            </label>
            <input
              type="text"
              placeholder="למשל: עגבניות"
              value={form.ingredientName}
              onChange={(e) => setForm({ ...form, ingredientName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
                כמות
              </label>
              <input
                type="text"
                placeholder="5"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
                יחידה
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border-2"
              style={{ borderColor: "#e0d5c5", color: "#5a7a75" }}>
              ביטול
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: teal }}>
              {loading ? "מוסיף..." : "הוסף"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    ingredientName: item.ingredientName,
    quantity: item.quantity || "",
    unit: item.unit || "יח'",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(item._id, form);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-5"
          style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          עריכת מרכיב
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
              שם המרכיב
            </label>
            <input
              type="text"
              value={form.ingredientName}
              onChange={(e) => setForm({ ...form, ingredientName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
                כמות
              </label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>
                יחידה
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border-2"
              style={{ borderColor: "#e0d5c5", color: "#5a7a75" }}>
              ביטול
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: teal }}>
              {loading ? "שומר..." : "שמור"}
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
    quantity: "",
    unit: identified.suggestedUnit || "יח'",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ingredientName.trim()) return;
    setLoading(true);
    await onAdd({ ...form, imageUrl: identified.imageUrl || null });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl" dir="rtl">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: gold }}>זוהה מהתמונה</p>
        <h2 className="text-xl font-bold mb-5" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          אשר/י והוסף/י למזווה
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>שם המרכיב</label>
            <input
              type="text"
              value={form.ingredientName}
              onChange={(e) => setForm({ ...form, ingredientName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>כמות</label>
              <input
                type="text"
                placeholder="5"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: gold }}>יחידה</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border-2"
              style={{ borderColor: "#e0d5c5", color: "#5a7a75" }}>
              ביטול
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: teal }}>
              {loading ? "מוסיף..." : "הוסף"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PantryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [identifiedItem, setIdentifiedItem] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState(null); // { ok: bool, message: string }
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/pantry`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (form) => {
    await fetch(`${API_URL}/pantry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    fetchItems();
  };

  const handleSave = async (id, form) => {
    await fetch(`${API_URL}/pantry/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm("למחוק את המרכיב?")) return;
    await fetch(`${API_URL}/pantry/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/pantry/identify-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.ingredientName || data.ingredientName === "לא זוהה") {
        setImageStatus({ ok: false, message: "לא הצלחתי לזהות מוצר מזון בתמונה" });
      } else {
        setImageStatus({ ok: true, message: `זוהה: ${data.ingredientName}` });
        setIdentifiedItem(data);
      }
    } catch {
      setImageStatus({ ok: false, message: "שגיאה בזיהוי התמונה" });
    } finally {
      setImageLoading(false);
    }
  };

  const filtered = items.filter((i) =>
    i.ingredientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} onSave={handleSave} />}

      {identifiedItem && (
        <ImageIdentifyModal
          identified={identifiedItem}
          onClose={() => setIdentifiedItem(null)}
          onAdd={async (form) => { await handleAdd(form); setIdentifiedItem(null); }}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <main className="min-h-screen px-4 py-10 sm:px-6" style={{ background: cream }}>
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: gold }}>
              המלאי שלי
            </p>
            <h1 className="text-3xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
              Pantry
            </h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="חפש מרכיב..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-xl border-2 outline-none text-sm bg-white"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              dir="rtl"
            />
          </div>

          {/* Add buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowAdd(true)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white shadow transition-all hover:opacity-90"
              style={{ background: teal }}
            >
              + הוסף מרכיב חדש
            </button>
            <button
              onClick={() => { setImageStatus(null); fileInputRef.current?.click(); }}
              disabled={imageLoading}
              className="px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: teal, color: teal, background: "#f0faf8" }}
              title="זהה מרכיב מתמונה"
            >
              {imageLoading ? <span className="text-xl">⏳</span> : <span className="text-xl">📷</span>}
            </button>
          </div>

          {imageStatus ? (
            <div className="flex items-center gap-2 mb-4 px-1 text-sm" dir="rtl">
              <span>{imageStatus.ok ? "✅" : "❌"}</span>
              <span style={{ color: imageStatus.ok ? teal : "#d14d4d" }}>{imageStatus.message}</span>
            </div>
          ) : null}

          {/* Items list */}
          {loading ? (
            <div className="text-center py-20" style={{ color: "#5a7a75" }}>טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-semibold" style={{ color: "#1a2e2b" }}>
                {search ? "לא נמצאו מרכיבים" : "המלאי שלך ריק"}
              </p>
              <p className="text-sm mt-1" style={{ color: "#5a7a75" }}>
                {!search && "הוסף מרכיבים כדי להתחיל"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item._id}
                  className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm"
                  style={{ border: `1px solid #e8f0ef` }}>
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.ingredientName}
                        className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <span className="text-2xl">{getIcon(item.ingredientName)}</span>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1a2e2b" }}>
                        {item.ingredientName}
                      </p>
                      {(item.quantity || item.unit) && (
                        <p className="text-xs mt-0.5" style={{ color: "#5a7a75" }}>
                          {item.quantity} {item.unit}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditItem(item)}
                      className="p-2 rounded-lg text-sm transition-all hover:opacity-70"
                      style={{ color: teal }}>✏️</button>
                    <button onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg text-sm transition-all hover:opacity-70"
                      style={{ color: "#e05555" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Find recipes button */}
          {items.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/recipes")}
                className="px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${teal}, #0d6e62)` }}>
                🍽️ מצא מתכונים לפי המלאי שלי ({items.length} מרכיבים)
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
