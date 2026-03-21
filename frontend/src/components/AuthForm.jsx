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
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-semibold text-[#17322f]">{field.label}</span>
            <input
              autoComplete={field.autoComplete}
              className="w-full rounded-2xl border border-[#e9dbc1] bg-[#fffaf4] px-4 py-3 text-[#17322f] shadow-sm outline-none transition focus:border-[#2E7273] focus:ring-4 focus:ring-[#2E7273]/10"
              name={field.name}
              onChange={onChange}
              placeholder={field.placeholder}
              type={field.type}
              value={formData[field.name]}
            />
            {fieldErrors[field.name] ? (
              <span className="mt-2 block text-sm text-[#b45309]">{fieldErrors[field.name]}</span>
            ) : null}
          </label>
        ))}
      </div>

      {generalError ? (
        <div className="rounded-2xl border border-[#f5c28b] bg-[#fff3e3] px-4 py-3 text-sm text-[#9a5d13]">
          {generalError}
        </div>
      ) : null}

      <button
        className="flex w-full items-center justify-center rounded-2xl bg-[#2E7273] px-5 py-3 text-base font-semibold text-white shadow-lg shadow-[#2E7273]/20 transition hover:-translate-y-0.5 hover:bg-[#245C5D] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
