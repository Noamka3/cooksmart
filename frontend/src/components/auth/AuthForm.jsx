export default function AuthForm({
  fields,
  formData,
  fieldErrors,
  generalError,
  onChange,
  onSubmit,
  submitLabel,
  loadingLabel,
  isSubmitting,
}) {
  return (
    <form style={{ display: "flex", flexDirection: "column", gap: 0 }} onSubmit={onSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
        {fields.map((field) => (
          <label key={field.name} style={{ display: "block" }}>
            <span
              style={{
                display: "block", marginBottom: 7,
                fontSize: "0.82rem", fontWeight: 600,
                color: "rgba(250,250,249,0.7)",
                letterSpacing: "0.03em",
              }}
            >
              {field.label}
            </span>
            <input
              className={`auth-input${fieldErrors[field.name] ? " error" : ""}`}
              autoComplete={field.autoComplete}
              name={field.name}
              onChange={onChange}
              placeholder={field.placeholder}
              type={field.type}
              value={formData[field.name]}
            />
            {fieldErrors[field.name] && (
              <span style={{ display: "block", marginTop: 5, fontSize: "0.78rem", color: "#f87171" }}>
                {fieldErrors[field.name]}
              </span>
            )}
          </label>
        ))}
      </div>

      {generalError && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            fontSize: "0.85rem",
            color: "#fca5a5",
          }}
        >
          {generalError}
        </div>
      )}

      <button className="auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
