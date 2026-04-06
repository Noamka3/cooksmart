const homeStyles = `
  @keyframes floatA {
    0%,100% { transform: translateY(0px) rotate(-3deg); }
    50%     { transform: translateY(-16px) rotate(3deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-12px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseOrange {
    0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
    50%     { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ── Buttons ── */
  .btn-primary {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    box-shadow: 0 4px 24px rgba(249,115,22,0.4);
    transition: all .25s ease;
    display: inline-block;
    color: #fff;
  }
  .btn-primary:hover {
    box-shadow: 0 8px 36px rgba(249,115,22,0.65);
    transform: translateY(-3px);
  }
  .btn-outline {
    border: 1.5px solid rgba(249,115,22,0.45);
    transition: all .25s ease;
    display: inline-block;
    color: rgba(250,250,249,0.9);
  }
  .btn-outline:hover {
    border-color: #f97316;
    background: rgba(249,115,22,0.1);
    transform: translateY(-3px);
  }

  /* ── Cards ── */
  .img-card {
    border-radius: 1.5rem;
    overflow: hidden;
    position: relative;
    transition: transform .35s ease, box-shadow .35s ease;
  }
  .img-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 40px 70px rgba(0,0,0,0.6); }
  .img-card img   { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
  .img-card:hover img { transform: scale(1.07); }

  .step-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 1.5rem;
    transition: all .3s ease;
    position: relative;
    overflow: hidden;
  }
  .step-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, transparent 55%);
    opacity: 0;
    transition: opacity .3s ease;
  }
  .step-card:hover {
    border-color: rgba(249,115,22,0.3);
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.1);
  }
  .step-card:hover::before { opacity: 1; }

  .feat-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 1.5rem;
    overflow: hidden;
    transition: all .3s ease;
  }
  .feat-card:hover {
    border-color: rgba(249,115,22,0.3);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    transform: translateY(-6px);
  }

  .recipe-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 1.25rem;
    overflow: hidden;
    transition: all .3s ease;
    cursor: pointer;
  }
  .recipe-card:hover {
    border-color: rgba(249,115,22,0.35);
    transform: translateY(-6px);
    box-shadow: 0 24px 50px rgba(0,0,0,0.5), 0 0 20px rgba(249,115,22,0.08);
  }

  /* ── Utilities ── */
  .scroll-none::-webkit-scrollbar { display: none; }
  .scroll-none { scrollbar-width: none; }

  .tag-pill {
    background: rgba(20,184,166,0.1);
    border: 1px solid rgba(20,184,166,0.2);
  }
  .glass-badge {
    background: rgba(9,9,11,0.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1rem;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
`;

export default homeStyles;
