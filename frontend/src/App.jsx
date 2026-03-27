import { Navigate, Route, Routes } from "react-router-dom";
import OnboardingPage from "./Pages/OnboardingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./Pages/AccountPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import PantryPage from "./Pages/PantryPage";
import RecipesPage from "./Pages/RecipesPage";
import SavedRecipesPage from "./Pages/SavedRecipesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/onboarding"
        element={(
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/account"
        element={(
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        )}
      />
      <Route
  path="/pantry"
        element={
          <ProtectedRoute>
            <PantryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={(
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/saved-recipes"
        element={(
          <ProtectedRoute>
            <SavedRecipesPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
