import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="rounded-3xl border border-white/50 bg-white/80 px-8 py-6 text-center shadow-xl backdrop-blur">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2E7273]/20 border-t-[#2E7273]" />
          <p className="text-sm text-slate-600">Loading your CookSmart session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
