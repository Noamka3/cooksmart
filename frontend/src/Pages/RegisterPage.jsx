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
      navigate("/account", { replace: true });
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
      alternateLabel="Log in"
      alternateLink="/login"
      alternateText="Already have a CookSmart account?"
      eyebrow="Create account"
      subtitle="Build your CookSmart profile to get ingredient-aware suggestions, a personalized food journey, and a smoother cooking workflow."
      title="Join CookSmart and turn the ingredients in your kitchen into your next meal."
    >
      <AuthForm
        fieldErrors={fieldErrors}
        fields={[
          {
            name: "name",
            label: "Full name",
            type: "text",
            autoComplete: "name",
            placeholder: "Noam Chef",
          },
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
            autoComplete: "new-password",
            placeholder: "At least 8 characters",
          },
          {
            name: "confirmPassword",
            label: "Confirm password",
            type: "password",
            autoComplete: "new-password",
            placeholder: "Repeat your password",
          },
        ]}
        formData={formData}
        generalError={generalError}
        isSubmitting={isSubmitting}
        loadingLabel="Creating your account..."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create account"
      />

      <div className="mt-5 rounded-2xl border border-[#e9dbc1] bg-[#fffaf4] px-4 py-3 text-sm text-[#58736d]">
        Your account is secured with hashed passwords and JWT-based authentication on the backend.
      </div>
      <Link className="mt-5 inline-flex text-sm font-medium text-[#2E7273]" to="/">
        Back to homepage
      </Link>
    </AuthLayout>
  );
}
