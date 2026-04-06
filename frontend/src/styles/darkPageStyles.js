// Shared dark-theme constants used across all inner pages
export const ORANGE = "#f97316";
export const TEAL   = "#14b8a6";
export const GOLD   = "#eab308";
export const BG     = "#09090b";

export const DARK_PAGE_STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dk-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 1.25rem;
    transition: all .25s ease;
  }
  .dk-card-hover:hover {
    border-color: rgba(249,115,22,0.25);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }
  .dk-input {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    color: #fafaf9;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 0.875rem;
    outline: none;
    width: 100%;
    transition: border-color .2s;
    font-family: inherit;
  }
  .dk-input::placeholder { color: rgba(250,250,249,0.25); }
  .dk-input:focus { border-color: rgba(249,115,22,0.45); }
  select.dk-input option { background: #1a1a1e; color: #fafaf9; }
  .dk-label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250,250,249,0.35);
    margin-bottom: 6px;
  }
  .dk-btn-primary {
    background: linear-gradient(135deg,#f97316,#ea580c);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    font-family: inherit;
  }
  .dk-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .dk-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  .dk-btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fafaf9;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    font-family: inherit;
  }
  .dk-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
  .dk-btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
  .dk-btn-danger {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.25);
    color: #f87171;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    font-family: inherit;
  }
  .dk-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
  .dk-btn-danger:disabled { opacity: 0.45; cursor: not-allowed; }
  .dk-modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
  }
  .dk-modal {
    background: #111113;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem;
    width: 100%;
    max-width: 480px;
    padding: 28px;
  }
  .dk-modal-lg {
    background: #111113;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem;
    width: 100%;
    max-width: 640px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  }
  .dk-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 0; }
  .dk-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(20,184,166,0.1);
    border: 1px solid rgba(20,184,166,0.2);
    color: #14b8a6;
  }
  .dk-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

// Shared ambient glow element (put it fixed inside the page wrapper)
export const GLOW_STYLES = {
  orange: {
    position: "fixed", top: -120, right: -120, width: 500, height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(249,115,22,0.07),transparent 65%)",
    pointerEvents: "none", zIndex: 0,
  },
  teal: {
    position: "fixed", bottom: -100, left: -100, width: 400, height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(20,184,166,0.06),transparent 65%)",
    pointerEvents: "none", zIndex: 0,
  },
};
