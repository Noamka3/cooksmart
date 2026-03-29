import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { validateRegisterForm } from "../utils/authValidation";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

if (isAuthenticated) {
  return <Navigate to="/onboarding" replace />;
}

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateRegisterForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");
      await register(formData);
      navigate("/onboarding", { replace: true });
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
      alternateLabel="כניסה"
      alternateLink="/login"
      alternateText="כבר יש לך חשבון?"
      eyebrow="יצירת חשבון"
      subtitle="צור פרופיל ותקבל המלצות מתכונים מותאמות אישית לפי מה שיש לך בבית."
      title="הצטרף ל-CookSmart"
    >
      <AuthForm
        fieldErrors={fieldErrors}
        fields={[
          {
            name: "name",
            label: "שם מלא",
            type: "text",
            autoComplete: "name",
            placeholder: "נועם שף",
          },
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
            autoComplete: "new-password",
            placeholder: "לפחות 8 תווים",
          },
          {
            name: "confirmPassword",
            label: "אימות סיסמה",
            type: "password",
            autoComplete: "new-password",
            placeholder: "הכנס שוב את הסיסמה",
          },
        ]}
        formData={formData}
        generalError={generalError}
        isSubmitting={isSubmitting}
        loadingLabel="יוצר חשבון..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="הרשמה"
      />

      <Link className="mt-5 inline-flex text-sm font-medium text-[#2E7273]" to="/">
        חזרה לדף הראשי
      </Link>
    </AuthLayout>
  );
}
