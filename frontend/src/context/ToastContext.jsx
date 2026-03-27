import { createContext, useCallback, useMemo, useRef, useState } from "react";

export const ToastContext = createContext(null);

const toastStyles = {
  success: {
    accent: "#1a9c8a",
    bg: "rgba(240, 250, 248, 0.98)",
    border: "rgba(26, 156, 138, 0.18)",
    icon: "✓",
  },
  error: {
    accent: "#d14d4d",
    bg: "rgba(255, 243, 227, 0.98)",
    border: "rgba(209, 77, 77, 0.16)",
    icon: "!",
  },
  info: {
    accent: "#c98a4c",
    bg: "rgba(255, 250, 244, 0.98)",
    border: "rgba(201, 138, 76, 0.16)",
    icon: "i",
  },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed left-1/2 top-4 z-[100] flex w-[min(92vw,24rem)] -translate-x-1/2 flex-col gap-3 sm:left-auto sm:right-4 sm:translate-x-0">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;

        return (
          <div
            key={toast.id}
            className="toast-enter overflow-hidden rounded-[1.35rem] border shadow-[0_24px_60px_rgba(24,41,37,0.18)] backdrop-blur"
            style={{
              background: style.bg,
              borderColor: style.border,
            }}
          >
            <div className="flex items-start gap-3 px-4 py-4">
              <div
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: `${style.accent}16`, color: style.accent }}
              >
                {style.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: "#17322f" }}>
                  {toast.title}
                </p>
                {toast.message ? (
                  <p className="mt-1 text-sm leading-6" style={{ color: "#58736d" }}>
                    {toast.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-full p-1 text-sm transition hover:bg-black/5"
                style={{ color: "#58736d" }}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            <div
              className="toast-progress h-1 origin-left"
              style={{ background: style.accent }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ type = "info", title, message = "" }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((current) => [...current, { id, type, title, message }].slice(-3));

    const timeout = setTimeout(() => {
      dismissToast(id);
    }, 3200);

    timeoutsRef.current.set(id, timeout);
    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
