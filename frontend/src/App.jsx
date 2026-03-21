import { Navigate, Route, Routes } from "react-router-dom";
import OnboardingPage from "./Pages/OnboardingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./Pages/AccountPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;