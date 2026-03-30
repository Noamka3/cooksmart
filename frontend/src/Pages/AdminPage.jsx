import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { deleteUser, getAdminStats, getAdminUsers, getUserPantry, getUserSavedRecipes, updateUserRole } from "../services/adminService";

export default function AdminPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recipesModal, setRecipesModal] = useState(null); // { user, recipes, loading }
  const [pantryModal, setPantryModal] = useState(null); // { user, items, loading }

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          getAdminStats(token),
          getAdminUsers(token),
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        showToast(err.message || "Failed to load admin data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, showToast]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const updated = await updateUserRole(token, userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
      showToast(`Role updated to ${newRole}`, "success");
    } catch (err) {
      showToast(err.message || "Failed to update role", "error");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(token, userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setStats((prev) => prev && { ...prev, totalUsers: prev.totalUsers - 1 });
      setConfirmDelete(null);
      showToast("User deleted", "success");
    } catch (err) {
      showToast(err.message || "Failed to delete user", "error");
    }
  };

  const handleViewPantry = async (targetUser) => {
    setPantryModal({ user: targetUser, items: [], loading: true });
    try {
      const items = await getUserPantry(token, targetUser._id);
      setPantryModal({ user: targetUser, items, loading: false });
    } catch (err) {
      showToast(err.message || "Failed to load pantry", "error");
      setPantryModal(null);
    }
  };

  const handleViewRecipes = async (targetUser) => {
    setRecipesModal({ user: targetUser, recipes: [], loading: true });
    try {
      const recipes = await getUserSavedRecipes(token, targetUser._id);
      setRecipesModal({ user: targetUser, recipes, loading: false });
    } catch (err) {
      showToast(err.message || "Failed to load recipes", "error");
      setRecipesModal(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2E7273]/20 border-t-[#2E7273]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8" dir="rtl">
        {/* Header */}
        <div className="premium-panel rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white">לוח ניהול</h1>
          <p className="text-white/70 text-sm mt-1">ניהול משתמשים וסטטיסטיקות המערכת</p>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="משתמשים" value={stats.totalUsers} icon="👥" />
              <StatCard label="פריטי מקרר" value={stats.totalPantryItems} icon="🧊" />
              <StatCard label="מתכונים שמורים" value={stats.totalSavedRecipes} icon="📋" />
              <StatCard label="תגובות" value={stats.totalComments} icon="💬" />
              <StatCard
                label="ממוצע דירוג"
                value={stats.avgRating ? `${stats.avgRating.toFixed(1)} ⭐` : "אין"}
                icon="📊"
                sub={stats.ratedRecipesCount ? `מתוך ${stats.ratedRecipesCount} דירוגים` : null}
              />
            </div>

            {/* Analytics Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Rated */}
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <span>⭐</span>
                  <h2 className="font-bold text-slate-800">מתכונים מובילים</h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {stats.topRatedRecipes?.length === 0 && (
                    <li className="px-5 py-4 text-sm text-slate-400 text-center">אין עדיין דירוגים</li>
                  )}
                  {stats.topRatedRecipes?.map((r, i) => (
                    <li key={r._id} className="px-5 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-bold text-amber-500">{r.avgRating.toFixed(1)}</span>
                        <span className="text-amber-400">⭐</span>
                        <span className="text-xs text-slate-400">({r.ratingCount})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Most Commented */}
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <span>💬</span>
                  <h2 className="font-bold text-slate-800">הכי מדוברים</h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {stats.mostCommented?.length === 0 && (
                    <li className="px-5 py-4 text-sm text-slate-400 text-center">אין עדיין תגובות</li>
                  )}
                  {stats.mostCommented?.map((r, i) => (
                    <li key={r._id} className="px-5 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{r.title || "מתכון לא ידוע"}</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#f0faf8", color: "#2E7273" }}>
                        {r.commentCount} תגובות
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Most Active Users */}
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <span>🏆</span>
                  <h2 className="font-bold text-slate-800">משתמשים פעילים</h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {stats.mostActiveUsers?.length === 0 && (
                    <li className="px-5 py-4 text-sm text-slate-400 text-center">אין נתונים</li>
                  )}
                  {stats.mostActiveUsers?.map((u, i) => (
                    <li key={u._id} className="px-5 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#fff8ef", color: "#a06a1d" }}>
                        {u.count} מתכונים
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg">משתמשים ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-right px-6 py-3 font-semibold">שם</th>
                  <th className="text-right px-6 py-3 font-semibold">אימייל</th>
                  <th className="text-right px-6 py-3 font-semibold">תפקיד</th>
                  <th className="text-right px-6 py-3 font-semibold">הצטרפות</th>
                  <th className="text-right px-6 py-3 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #1a9c8a, #245C5D)" }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                        {u._id === user.id && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">אתה</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role === "admin" ? "👑 אדמין" : "משתמש"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewPantry(u)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          🧊 מקרר
                        </button>
                        <button
                          onClick={() => handleViewRecipes(u)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          📋 מתכונים
                        </button>
                        {u._id !== user.id && (
                          <>
                            <button
                              onClick={() => handleRoleToggle(u._id, u.role)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors"
                            >
                              {u.role === "admin" ? "הסר אדמין" : "הפוך לאדמין"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              מחק
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Recipes Modal */}
      {recipesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setRecipesModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  מתכונים שמורים של {recipesModal.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{recipesModal.user.email}</p>
              </div>
              <button
                onClick={() => setRecipesModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {recipesModal.loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2E7273]/20 border-t-[#2E7273]" />
                </div>
              ) : recipesModal.recipes.length === 0 ? (
                <p className="text-center text-slate-500 py-12">אין מתכונים שמורים</p>
              ) : (
                <ul className="space-y-3">
                  {recipesModal.recipes.map((recipe) => (
                    <RecipeRow key={recipe._id} recipe={recipe} />
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
              {!recipesModal.loading && `${recipesModal.recipes.length} מתכונים`}
            </div>
          </div>
        </div>
      )}

      {/* Pantry Modal */}
      {pantryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setPantryModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  מקרר של {pantryModal.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{pantryModal.user.email}</p>
              </div>
              <button
                onClick={() => setPantryModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {pantryModal.loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2E7273]/20 border-t-[#2E7273]" />
                </div>
              ) : pantryModal.items.length === 0 ? (
                <p className="text-center text-slate-500 py-12">המקרר ריק</p>
              ) : (
                <ul className="space-y-2">
                  {pantryModal.items.map((item) => (
                    <li key={item._id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                      <span className="font-medium text-slate-800 text-sm">{item.ingredientName}</span>
                      <div className="flex gap-2 text-xs text-slate-500">
                        {item.quantity && <span>{item.quantity} {item.unit || ""}</span>}
                        {item.expiryDate && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            תפוגה: {new Date(item.expiryDate).toLocaleDateString("he-IL")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
              {!pantryModal.loading && `${pantryModal.items.length} פריטים`}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">מחיקת משתמש</h3>
            <p className="text-slate-600 text-sm mb-1">
              האם למחוק את <strong>{confirmDelete.name}</strong>?
            </p>
            <p className="text-red-500 text-xs mb-6">
              פעולה זו תמחק את כל הנתונים שלו כולל פריטי מקרר ומתכונים שמורים.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeRow({ recipe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-right"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-medium text-slate-800 text-sm">{recipe.title}</span>
        <span className="text-slate-400 text-xs mr-2">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {recipe.ingredients?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">מצרכים</p>
              <ul className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.instructions && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">הוראות הכנה</p>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {recipe.instructions.replace(/\\n/g, "\n")}
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function StatCard({ label, value, icon, sub }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-white/50 p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
