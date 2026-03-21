import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

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
      alternateLabel="Create your account"
      alternateLink="/register"
      alternateText="New to CookSmart?"
      eyebrow="Welcome back"
      subtitle="Sign in to unlock ingredient-based recommendations, personalized food preferences, and your saved CookSmart experience."
      title="Log in and pick up dinner planning right where you left it."
    >
      <AuthForm
        fieldErrors={fieldErrors}
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
            placeholder: "chef@cooksmart.app",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
            placeholder: "Enter your password",
          },
        ]}
        formData={formData}
        generalError={generalError}
        isSubmitting={isSubmitting}
        loadingLabel="Signing you in..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Log in"
      />

      <div className="mt-5 rounded-2xl border border-[#e9dbc1] bg-[#fffaf4] px-4 py-3 text-sm text-[#58736d]">
        Demo tip: connect the backend and MongoDB, then sign in with your registered CookSmart account.
      </div>
      <Link className="mt-5 inline-flex text-sm font-medium text-[#2E7273]" to="/">
        Back to homepage
      </Link>
    </AuthLayout>
  );
}
