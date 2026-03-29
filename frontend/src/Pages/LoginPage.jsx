import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateLoginForm } from "../utils/authValidation";

const initialState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateLoginForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");
      await login(formData);
      navigate(location.state?.from || "/account", { replace: true });
    } catch (error) {
      const serverErrors = Object.fromEntries((error.fields || []).map((item) => [item.field, item.message]));
      setFieldErrors(serverErrors);
      setGeneralError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      alternateLabel="הירשם עכשיו"
      alternateLink="/register"
      alternateText="חדש ב-CookSmart?"
      eyebrow="ברוך השב"
      subtitle="היכנס כדי לקבל המלצות מתכונים מותאמות אישית ולנהל את המזווה שלך."
      title="כניסה לחשבון שלך"
    >
      <AuthForm
        fieldErrors={fieldErrors}
        fields={[
          {
            name: "email",
            label: "אימייל",
            type: "email",
            autoComplete: "email",
            placeholder: "chef@cooksmart.app",
          },
          {
            name: "password",
            label: "סיסמה",
            type: "password",
            autoComplete: "current-password",
            placeholder: "הכנס את הסיסמה שלך",
          },
        ]}
        formData={formData}
        generalError={generalError}
        isSubmitting={isSubmitting}
        loadingLabel="מתחבר..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="כניסה"
      />

    </AuthLayout>
  );
}
