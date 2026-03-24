import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
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

const teal = "#1a9c8a";
const gold = "#c9a84c";
const cream = "#f5ead0";

const INGREDIENT_ICONS = {
  tomato: "🍅",
  carrot: "🥕",
  cucumber: "🥒",
  pepper: "🫑",
  potato: "🥔",
  onion: "🧅",
  garlic: "🧄",
  lettuce: "🥬",
  cabbage: "🥬",
  broccoli: "🥦",
  corn: "🌽",
  avocado: "🥑",
  mushroom: "🍄",
  radish: "🌱",
  spinach: "🥬",
  asparagus: "🌱",
  apple: "🍎",
  banana: "🍌",
  lemon: "🍋",
  orange: "🍊",
  grape: "🍇",
  strawberry: "🍓",
  watermelon: "🍉",
  melon: "🍈",
  pineapple: "🍍",
  mango: "🥭",
  egg: "🥚",
  chicken: "🍗",
  meat: "🥩",
  fish: "🐟",
  sausage: "🌭",
  cheese: "🧀",
  milk: "🥛",
  yogurt: "🥛",
  butter: "🧈",
  bread: "🍞",
  pita: "🫓",
  rice: "🍚",
  pasta: "🍝",
  flour: "🌾",
  oats: "🌾",
  oil: "🫗",
  olive: "🫒",
  salt: "🧂",
  sugar: "🍚",
  honey: "🍯",
  ketchup: "🍅",
  mayonnaise: "🫗",
  hummus: "🫘",
  tahini: "🫗",
  lentils: "🫘",
  beans: "🫘",
  chickpeas: "🫘",
  peas: "🫛",
};

const UNITS = ["יח'", "גרם", "ק\"ג", "מ\"ל", "ליטר", "כוס", "כף", "כפית", "חבילה"];

const getIcon = (name = "") => {
  const lower = name.toLowerCase();
  const matched = Object.entries(INGREDIENT_ICONS).find(([key]) => lower.includes(key));
  return matched ? matched[1] : "🥣";
};

const getErrorMessage = (error, fallback) => {
  if (!error) {
    return fallback;
  }

  if (error.code === "NETWORK_ERROR") {
    return "Network error. Please check your connection and try again.";
  }

  return error.message || fallback;
};

function AddItemModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ ingredientName: "", quantity: "", unit: "יח'" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.ingredientName.trim()) {
      setError("Ingredient name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onAdd(form);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to add item."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.42)" }}>
      <div className="premium-panel modal-pop w-full max-w-md rounded-[2rem] p-6" dir="rtl">
        <h2 className="text-xl font-bold mb-5" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          הוסף מרכיב
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
              שם המרכיב
            </label>
            <input
              type="text"
              placeholder="למשל: עגבניות"
              value={form.ingredientName}
              onChange={(event) => setForm((current) => ({ ...current, ingredientName: event.target.value }))}
              className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                כמות
              </label>
              <input
                type="text"
                placeholder="5"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                יחידה
              </label>
              <select
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#f3cbc0", background: "#fff5f1", color: "#b45d43" }}>
              {error}
            </div>
          ) : null}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="ghost-button flex-1 rounded-xl py-3 text-sm font-semibold"
              disabled={loading}
            >
              ביטול
            </button>
            <button type="submit" disabled={loading} className="primary-button flex-1 rounded-xl py-3 text-sm font-semibold">
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
    imageUrl: item.imageUrl || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.ingredientName.trim()) {
      setError("Ingredient name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSave(item._id, form);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to update item."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.42)" }}>
      <div className="premium-panel modal-pop w-full max-w-md rounded-[2rem] p-6" dir="rtl">
        <h2 className="text-xl font-bold mb-5" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          עריכת מרכיב
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
              שם המרכיב
            </label>
            <input
              type="text"
              value={form.ingredientName}
              onChange={(event) => setForm((current) => ({ ...current, ingredientName: event.target.value }))}
              className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                כמות
              </label>
              <input
                type="text"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                יחידה
              </label>
              <select
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#f3cbc0", background: "#fff5f1", color: "#b45d43" }}>
              {error}
            </div>
          ) : null}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="ghost-button flex-1 rounded-xl py-3 text-sm font-semibold"
              disabled={loading}
            >
              ביטול
            </button>
            <button type="submit" disabled={loading} className="primary-button flex-1 rounded-xl py-3 text-sm font-semibold">
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
    imageUrl: identified.imageUrl || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.ingredientName.trim()) {
      setError("Ingredient name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onAdd(form);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to add identified item."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.42)" }}>
      <div className="premium-panel modal-pop w-full max-w-md rounded-[2rem] p-6" dir="rtl">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
          זיהוי מתמונה
        </p>
        <h2 className="mb-5 text-xl font-bold" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          אשר/י והוסף/י למזווה
        </h2>

        {identified.imageUrl ? (
          <img src={identified.imageUrl} alt={identified.ingredientName} className="mb-5 h-32 w-full rounded-2xl object-cover" />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
              שם המרכיב
            </label>
            <input
              type="text"
              value={form.ingredientName}
              onChange={(event) => setForm((current) => ({ ...current, ingredientName: event.target.value }))}
              className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
              style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                כמות
              </label>
              <input
                type="text"
                placeholder="5"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
                יחידה
              </label>
              <select
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
              >
                {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#f3cbc0", background: "#fff5f1", color: "#b45d43" }}>
              {error}
            </div>
          ) : null}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="ghost-button flex-1 rounded-xl py-3 text-sm font-semibold"
              disabled={loading}
            >
              ביטול
            </button>
            <button type="submit" disabled={loading} className="primary-button flex-1 rounded-xl py-3 text-sm font-semibold">
              {loading ? "מוסיף..." : "הוסף"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ item, onClose, onConfirm, loading }) {
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setError("");
      await onConfirm(item);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to delete item."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.42)" }}>
      <div className="premium-panel modal-pop w-full max-w-md rounded-[2rem] p-6" dir="rtl">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: gold }}>
          מחיקת מרכיב
        </p>
        <h2 className="text-xl font-bold" style={{ color: "#1a2e2b", fontFamily: "'Playfair Display', serif" }}>
          למחוק את {item.ingredientName}?
        </h2>
        <p className="mt-3 text-sm leading-7" style={{ color: "#58736d" }}>
          הפעולה תסיר את המרכיב מהמזווה שלך. אפשר להוסיף אותו שוב בהמשך אם צריך.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#f3cbc0", background: "#fff5f1", color: "#b45d43" }}>
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="ghost-button flex-1 rounded-xl py-3 text-sm font-semibold">
            ביטול
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #d85b52, #b94841)" }}
          >
            {loading ? "מוחק..." : "מחק"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PantryPage() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [identifiedItem, setIdentifiedItem] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const handleAuthFailure = useCallback(() => {
    showToast({
      type: "error",
      title: "Session expired",
      message: "Please log in again to continue using your pantry.",
    });
    logout();
    navigate("/login", { replace: true, state: { from: "/pantry" } });
  }, [logout, navigate, showToast]);

  const handlePantryError = useCallback((error, fallbackTitle, fallbackMessage) => {
    if (error?.status === 401) {
      handleAuthFailure();
      return;
    }

    showToast({
      type: "error",
      title: fallbackTitle,
      message: getErrorMessage(error, fallbackMessage),
    });
  }, [handleAuthFailure, showToast]);

  const fetchItems = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const data = await getPantryItems(token);
      setItems(data.items || []);
    } catch (error) {
      handlePantryError(error, "Failed to load pantry", "Could not load pantry items.");
      throw error;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [handlePantryError, token]);

  useEffect(() => {
    fetchItems().catch(() => {});
  }, [fetchItems]);

  const handleAdd = async (form) => {
    try {
      await createPantryItem(token, form);
      await fetchItems({ silent: true });
      showToast({
        type: "success",
        title: "Item added",
        message: `${form.ingredientName.trim()} was added to your pantry.`,
      });
    } catch (error) {
      handlePantryError(error, "Failed to add item", "Could not add the pantry item.");
      throw error;
    }
  };

  const handleSave = async (id, form) => {
    try {
      await updatePantryItem(token, id, form);
      await fetchItems({ silent: true });
      showToast({
        type: "success",
        title: "Item updated",
        message: `${form.ingredientName.trim()} was updated successfully.`,
      });
    } catch (error) {
      handlePantryError(error, "Failed to update item", "Could not update the pantry item.");
      throw error;
    }
  };

  const handleDelete = async (item) => {
    try {
      setDeleteLoadingId(item._id);
      await deletePantryItem(token, item._id);
      await fetchItems({ silent: true });
      showToast({
        type: "info",
        title: "Item removed",
        message: `${item.ingredientName} was removed from your pantry.`,
      });
    } catch (error) {
      handlePantryError(error, "Failed to delete item", "Could not remove the pantry item.");
      throw error;
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = "";
    setImageLoading(true);
    setImageStatus(null);

    try {
      const data = await identifyPantryImage(token, file);

      if (!data.ingredientName || data.ingredientName === "לא זוהה") {
        const message = "Couldn't identify a food item in this image.";
        setImageStatus({ ok: false, message });
        showToast({
          type: "error",
          title: "Image identification failed",
          message,
        });
        return;
      }

      setIdentifiedItem(data);
      setImageStatus({
        ok: true,
        message: `Detected item: ${data.ingredientName}`,
      });
      showToast({
        type: "success",
        title: "Image identified",
        message: `${data.ingredientName} is ready to be added to your pantry.`,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Could not identify the uploaded image.");
      setImageStatus({ ok: false, message });
      handlePantryError(error, "Image identification failed", "Could not identify the uploaded image.");
    } finally {
      setImageLoading(false);
    }
  };

  const filtered = useMemo(
    () => items.filter((item) => item.ingredientName?.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  return (
    <>
      <Navbar />
      {showAdd ? <AddItemModal onClose={() => setShowAdd(false)} onAdd={handleAdd} /> : null}
      {editItem ? <EditItemModal item={editItem} onClose={() => setEditItem(null)} onSave={handleSave} /> : null}
      {identifiedItem ? (
        <ImageIdentifyModal
          identified={identifiedItem}
          onClose={() => setIdentifiedItem(null)}
          onAdd={async (form) => {
            await handleAdd(form);
            setIdentifiedItem(null);
          }}
        />
      ) : null}
      {deleteItemTarget ? (
        <DeleteConfirmModal
          item={deleteItemTarget}
          onClose={() => setDeleteItemTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoadingId === deleteItemTarget._id}
        />
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <main className="page-shell min-h-screen px-4 pb-14 pt-8 sm:px-6 sm:pt-10" style={{ background: cream }}>
        <div className="mx-auto max-w-4xl">
          <section
            className="premium-panel rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-9"
            style={{ background: "linear-gradient(135deg, rgba(255,250,244,0.97), rgba(240,250,248,0.92))" }}
            dir="rtl"
          >
            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em]" style={{ color: gold }}>
                  המזווה שלי
                </p>
                <h1 className="text-4xl font-bold sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
                  Pantry
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 sm:text-base" style={{ color: "#58736d" }}>
                  Manage what you already have, add new ingredients quickly, and identify pantry items from images without guessing.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="premium-card rounded-[1.6rem] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>Items</p>
                  <p className="mt-2 text-3xl font-bold" style={{ color: teal }}>{items.length}</p>
                  <p className="mt-1 text-sm" style={{ color: "#58736d" }}>currently in your pantry</p>
                </div>
                <div className="premium-card rounded-[1.6rem] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>Status</p>
                  <p className="mt-2 text-sm font-semibold" style={{ color: "#1a2e2b" }}>
                    {imageLoading ? "Analyzing image..." : loading ? "Loading pantry..." : "Ready"}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "#58736d" }}>clear feedback for every action</p>
                </div>
              </div>
            </div>
          </section>

          <section className="premium-panel mt-8 rounded-[2.2rem] p-6 sm:p-7" dir="rtl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: gold }}>
                  חיפוש
                </label>
                <input
                  type="text"
                  placeholder="חפש מרכיב..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border-2 bg-white px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setShowAdd(true)} className="primary-button rounded-2xl px-5 py-3 text-sm font-semibold">
                  + הוסף מרכיב חדש
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageStatus(null);
                    fileInputRef.current?.click();
                  }}
                  disabled={imageLoading}
                  className="ghost-button rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  title="Identify ingredient from image"
                >
                  {imageLoading ? "מזהה תמונה..." : "הוסף מתמונה"}
                </button>
              </div>
            </div>

            {imageStatus ? (
              <div
                className="mt-4 rounded-[1.35rem] border px-4 py-3 text-sm"
                style={{
                  borderColor: imageStatus.ok ? "#c8e8e4" : "#f3cbc0",
                  background: imageStatus.ok ? "#f2fbf9" : "#fff5f1",
                  color: imageStatus.ok ? teal : "#b45d43",
                }}
              >
                {imageStatus.message}
              </div>
            ) : null}
          </section>

          {loading ? (
            <div className="premium-panel mt-8 rounded-[2.2rem] px-6 py-16 text-center" dir="rtl">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#1a9c8a]/15 border-t-[#1a9c8a]" />
              <p className="text-base font-medium" style={{ color: "#4f6c66" }}>טוען את המזווה שלך...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="premium-panel mt-8 rounded-[2.2rem] px-6 py-16 text-center" dir="rtl">
              <div className="mb-4 text-5xl">{search ? "🔎" : "🥕"}</div>
              <p className="text-xl font-semibold" style={{ color: "#1a2e2b" }}>
                {search ? "לא נמצאו מרכיבים" : "המזווה שלך עדיין ריק"}
              </p>
              <p className="mt-2 text-sm leading-7" style={{ color: "#5a7a75" }}>
                {search ? "נסו חיפוש אחר או נקו את הסינון." : "הוסיפו כמה פריטים כדי להתחיל לקבל מתכונים לפי מה שכבר יש בבית."}
              </p>
            </div>
          ) : (
            <section className="mt-8 space-y-4" dir="rtl">
              {filtered.map((item) => {
                const isDeleting = deleteLoadingId === item._id;

                return (
                  <div key={item._id} className="premium-card card-lift rounded-[1.8rem] px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.ingredientName} className="h-12 w-12 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7fbfa] text-2xl">
                            {getIcon(item.ingredientName)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold sm:text-base" style={{ color: "#1a2e2b" }}>
                            {item.ingredientName}
                          </p>
                          {(item.quantity || item.unit) ? (
                            <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "#5a7a75" }}>
                              {item.quantity} {item.unit}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "#8aa09b" }}>
                              No quantity added yet
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditItem(item)}
                          className="ghost-button rounded-xl px-3 py-2 text-sm font-semibold"
                          disabled={isDeleting}
                        >
                          עריכה
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteItemTarget(item)}
                          className="rounded-xl px-3 py-2 text-sm font-semibold"
                          style={{ background: "#fff3e3", color: "#9a5d13", border: "1px solid #f5c28b" }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "מוחק..." : "מחק"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {items.length > 0 ? (
            <div className="mt-8 text-center" dir="rtl">
              <button
                type="button"
                onClick={() => navigate("/recipes")}
                className="primary-button rounded-2xl px-8 py-4 text-sm font-semibold"
              >
                מצא מתכונים לפי המלאי שלי ({items.length} מרכיבים)
              </button>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
