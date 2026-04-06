import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DarkFooter from "../components/home/DarkFooter";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  deleteUser,
  getAdminStats,
  getAdminUsers,
  getUserPantry,
  getUserSavedRecipes,
  updateUserRole,
} from "../services/adminService";

const ORANGE = "#f97316";
const TEAL   = "#14b8a6";
const GOLD   = "#eab308";

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .adm-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    transition: all .25s ease;
    animation: fadeUp .5s ease both;
  }
  .adm-row:hover { background: rgba(255,255,255,0.025); }
  .adm-badge-admin {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25); color: #fbbf24;
  }
  .adm-badge-user {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(250,250,249,0.55);
  }
  .adm-btn {
    font-size: 0.72rem; padding: 5px 12px; border-radius: 8px; font-weight: 600;
    cursor: pointer; transition: all .2s ease; font-family: inherit; white-space: nowrap;
  }
  .adm-btn-neutral {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(250,250,249,0.75);
  }
  .adm-btn-neutral:hover { background: rgba(255,255,255,0.09); }
  .adm-btn-teal {
    background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.25); color: #2dd4bf;
  }
  .adm-btn-teal:hover { background: rgba(20,184,166,0.18); }
  .adm-btn-danger {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22); color: #f87171;
  }
  .adm-btn-danger:hover { background: rgba(239,68,68,0.18); }
  .adm-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); }
  .adm-modal-backdrop {
    position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center;
    padding: 16px; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
  }
  .adm-modal {
    background: #111113; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem; width: 100%; overflow: hidden;
  }
  .adm-recipe-row {
    border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden;
  }
  .adm-recipe-row button:hover { background: rgba(255,255,255,0.04); }
`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, sub, accent, delay }) {
  return (
    <div className="adm-card" style={{ padding: "20px 22px", animationDelay: delay }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem",
          background: `rgba(${accent},0.1)`,
          border: `1px solid rgba(${accent},0.18)`,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fafaf9", lineHeight: 1.1 }}>{value}</p>
          <p style={{ fontSize: "0.78rem", color: "rgba(250,250,249,0.4)", marginTop: 2 }}>{label}</p>
          {sub && <p style={{ fontSize: "0.68rem", color: "rgba(250,250,249,0.28)", marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function AnalyticsTable({ title, icon, accentColor, children }) {
  return (
    <div className="adm-card" style={{ overflow: "hidden", animationDelay: ".2s" }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1rem",
          background: `rgba(${accentColor},0.1)`, border: `1px solid rgba(${accentColor},0.18)`,
        }}>
          {icon}
        </span>
        <h2 style={{ fontWeight: 700, color: "#fafaf9", fontSize: "0.9rem" }}>{title}</h2>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{children}</ul>
    </div>
  );
}

function AnalyticsRow({ index, children }) {
  return (
    <li style={{
      padding: "12px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(250,250,249,0.2)", width: 16, flexShrink: 0 }}>
        {index + 1}
      </span>
      {children}
    </li>
  );
}

function EmptyRow({ label }) {
  return (
    <li style={{ padding: "24px 20px", textAlign: "center", color: "rgba(250,250,249,0.3)", fontSize: "0.85rem" }}>
      {label}
    </li>
  );
}

function RecipeRow({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="adm-recipe-row">
      <button
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "right" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span style={{ fontWeight: 600, color: "#fafaf9", fontSize: "0.85rem" }}>{recipe.title}</span>
        <span style={{ color: "rgba(250,250,249,0.35)", fontSize: "0.7rem", marginRight: 8 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {recipe.ingredients?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>מצרכים</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} style={{ fontSize: "0.72rem", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", color: TEAL, padding: "2px 10px", borderRadius: 999 }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recipe.instructions && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(250,250,249,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>הוראות הכנה</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(250,250,249,0.5)", whiteSpace: "pre-line", lineHeight: 1.7 }}>
                {recipe.instructions.replace(/\\n/g, "\n")}
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function UserDataModal({ title, subtitle, footerCount, loading, onClose, children }) {
  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 600, maxHeight: "82vh", display: "flex", flexDirection: "column" }} dir="rtl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h3 style={{ fontWeight: 700, color: "#fafaf9", fontSize: "1rem" }}>{title}</h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(250,250,249,0.4)", marginTop: 2 }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 32, height: 32, color: "rgba(250,250,249,0.6)", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f97316]/20 border-t-[#f97316]" />
            </div>
          ) : children}
        </div>
        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center", fontSize: "0.75rem", color: "rgba(250,250,249,0.3)" }}>
          {!loading && footerCount}
        </div>
      </div>
    </div>
  );
}

function UserTableRow({ u, currentUserId, onViewPantry, onViewRecipes, onRoleToggle, onDelete }) {
  return (
    <tr className="adm-row" style={{ transition: "background .15s" }}>
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,rgba(249,115,22,0.35),rgba(249,115,22,0.1))",
            border: "1.5px solid rgba(249,115,22,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 800, color: ORANGE,
          }}>
            {u.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: "#fafaf9", fontSize: "0.875rem" }}>{u.name}</span>
          {u._id === currentUserId && (
            <span style={{ fontSize: "0.65rem", background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.22)", color: TEAL, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>אתה</span>
          )}
        </div>
      </td>
      <td style={{ padding: "14px 20px", fontSize: "0.825rem", color: "rgba(250,250,249,0.45)" }}>{u.email}</td>
      <td style={{ padding: "14px 20px" }}>
        {u.role === "admin"
          ? <span className="adm-badge-admin">👑 אדמין</span>
          : <span className="adm-badge-user">משתמש</span>}
      </td>
      <td style={{ padding: "14px 20px", fontSize: "0.8rem", color: "rgba(250,250,249,0.35)" }}>{formatDate(u.createdAt)}</td>
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button className="adm-btn adm-btn-neutral" onClick={() => onViewPantry(u)}>🧊 מקרר</button>
          <button className="adm-btn adm-btn-neutral" onClick={() => onViewRecipes(u)}>📋 מתכונים</button>
          {u._id !== currentUserId && (
            <>
              <button className="adm-btn adm-btn-teal" onClick={() => onRoleToggle(u._id, u.role)}>
                {u.role === "admin" ? "הסר אדמין" : "הפוך לאדמין"}
              </button>
              <button className="adm-btn adm-btn-danger" onClick={() => onDelete(u)}>מחק</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recipesModal, setRecipesModal] = useState(null);
  const [pantryModal, setPantryModal] = useState(null);

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([getAdminStats(token), getAdminUsers(token)]);
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f97316]/20 border-t-[#f97316]" />
        </div>
        <DarkFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <style>{STYLES}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.06),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(20,184,166,0.05),transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      <main dir="rtl" style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 48, animation: "fadeUp .5s ease both" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "block", width: 24, height: 1, background: ORANGE }} />
            ניהול מערכת
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,2.8rem)", color: "#fafaf9", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            לוח{" "}
            <span style={{ background: "linear-gradient(90deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ניהול
            </span>
          </h1>
          <p style={{ color: "rgba(250,250,249,0.4)", fontSize: "0.95rem" }}>ניהול משתמשים וסטטיסטיקות המערכת</p>
        </div>

        {/* ── Stats ── */}
        {stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 32 }}>
              <StatCard label="משתמשים רשומים" value={stats.totalUsers}        icon="👥" accent="249,115,22"  delay="0s" />
              <StatCard label="פריטי מקרר"      value={stats.totalPantryItems}  icon="🧊" accent="20,184,166"  delay=".06s" />
              <StatCard label="מתכונים שמורים"  value={stats.totalSavedRecipes} icon="📋" accent="234,179,8"   delay=".12s" />
              <StatCard label="תגובות"           value={stats.totalComments}     icon="💬" accent="168,85,247"  delay=".18s" />
              <StatCard
                label="ממוצע דירוג"
                value={stats.avgRating ? `${stats.avgRating.toFixed(1)} ⭐` : "אין"}
                icon="📊"
                accent="249,115,22"
                delay=".24s"
                sub={stats.ratedRecipesCount ? `מתוך ${stats.ratedRecipesCount} דירוגים` : null}
              />
            </div>

            {/* ── Analytics tables ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 32 }}>

              <AnalyticsTable title="מתכונים מובילים" icon="⭐" accentColor="234,179,8">
                {stats.topRatedRecipes?.length === 0 && <EmptyRow label="אין עדיין דירוגים" />}
                {stats.topRatedRecipes?.map((r, i) => (
                  <AnalyticsRow key={r._id} index={i}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(250,250,249,0.75)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fbbf24" }}>{r.avgRating.toFixed(1)}</span>
                      <span style={{ fontSize: "0.7rem", color: "rgba(250,250,249,0.3)" }}>({r.ratingCount})</span>
                    </div>
                  </AnalyticsRow>
                ))}
              </AnalyticsTable>

              <AnalyticsTable title="הכי מדוברים" icon="💬" accentColor="168,85,247">
                {stats.mostCommented?.length === 0 && <EmptyRow label="אין עדיין תגובות" />}
                {stats.mostCommented?.map((r, i) => (
                  <AnalyticsRow key={r._id} index={i}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(250,250,249,0.75)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || "מתכון לא ידוע"}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.22)", color: "#c084fc", flexShrink: 0 }}>
                      {r.commentCount}
                    </span>
                  </AnalyticsRow>
                ))}
              </AnalyticsTable>

              <AnalyticsTable title="משתמשים פעילים" icon="🏆" accentColor="249,115,22">
                {stats.mostActiveUsers?.length === 0 && <EmptyRow label="אין נתונים" />}
                {stats.mostActiveUsers?.map((u, i) => (
                  <AnalyticsRow key={u._id} index={i}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(250,250,249,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "rgba(250,250,249,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: ORANGE, flexShrink: 0 }}>
                      {u.count} מתכונים
                    </span>
                  </AnalyticsRow>
                ))}
              </AnalyticsTable>

            </div>
          </>
        )}

        {/* ── Users table ── */}
        <div className="adm-card" style={{ overflow: "hidden", animationDelay: ".3s" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 700, color: "#fafaf9", fontSize: "1rem" }}>
              משתמשים
              <span style={{ marginRight: 8, fontSize: "0.8rem", fontWeight: 600, color: "rgba(250,250,249,0.35)" }}>({users.length})</span>
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {["שם", "אימייל", "תפקיד", "הצטרפות", "פעולות"].map((h) => (
                    <th key={h} style={{ textAlign: "right", padding: "12px 20px", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(250,250,249,0.3)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserTableRow
                    key={u._id}
                    u={u}
                    currentUserId={user.id}
                    onViewPantry={handleViewPantry}
                    onViewRecipes={handleViewRecipes}
                    onRoleToggle={handleRoleToggle}
                    onDelete={setConfirmDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <DarkFooter />

      {/* Recipes modal */}
      {recipesModal && (
        <UserDataModal
          title={`מתכונים שמורים של ${recipesModal.user.name}`}
          subtitle={recipesModal.user.email}
          loading={recipesModal.loading}
          footerCount={`${recipesModal.recipes.length} מתכונים`}
          onClose={() => setRecipesModal(null)}
        >
          {recipesModal.recipes.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(250,250,249,0.35)", padding: "48px 0", fontSize: "0.875rem" }}>אין מתכונים שמורים</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {recipesModal.recipes.map((recipe) => (
                <RecipeRow key={recipe._id} recipe={recipe} />
              ))}
            </ul>
          )}
        </UserDataModal>
      )}

      {/* Pantry modal */}
      {pantryModal && (
        <UserDataModal
          title={`מקרר של ${pantryModal.user.name}`}
          subtitle={pantryModal.user.email}
          loading={pantryModal.loading}
          footerCount={`${pantryModal.items.length} פריטים`}
          onClose={() => setPantryModal(null)}
        >
          {pantryModal.items.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(250,250,249,0.35)", padding: "48px 0", fontSize: "0.875rem" }}>המקרר ריק</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {pantryModal.items.map((item) => (
                <li key={item._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px" }}>
                  <span style={{ fontWeight: 600, color: "#fafaf9", fontSize: "0.85rem" }}>{item.ingredientName}</span>
                  <div style={{ display: "flex", gap: 8, fontSize: "0.75rem", color: "rgba(250,250,249,0.4)" }}>
                    {item.quantity && <span>{item.quantity} {item.unit || ""}</span>}
                    {item.expiryDate && (
                      <span style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#fbbf24", padding: "2px 10px", borderRadius: 999 }}>
                        תפוגה: {new Date(item.expiryDate).toLocaleDateString("he-IL")}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </UserDataModal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="adm-modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="adm-modal" style={{ maxWidth: 400, padding: 28 }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 18 }}>
              🗑️
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.2rem", color: "#fafaf9", marginBottom: 10 }}>מחיקת משתמש</h3>
            <p style={{ color: "rgba(250,250,249,0.55)", fontSize: "0.875rem", marginBottom: 6 }}>
              האם למחוק את <strong style={{ color: "#fafaf9" }}>{confirmDelete.name}</strong>?
            </p>
            <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: 28, lineHeight: 1.6 }}>
              פעולה זו תמחק את כל הנתונים שלו כולל פריטי מקרר ומתכונים שמורים.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(250,250,249,0.7)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                ביטול
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                style={{ flex: 1, padding: "11px", borderRadius: 12, background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}
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
