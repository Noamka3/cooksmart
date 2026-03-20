import logo from "../assets/logo.png";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const teal    = "#2E7273";
const gold    = "#D08A2A";
const cream   = "#f5ead0";
const beige   = "#f5ede0";
const darkTeal = "#245C5D";

function Hero() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${cream} 0%, ${beige} 100%)` }}
    >
<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
  <span className="absolute text-6xl opacity-65" style={{ top: "8%",  left: "5%",  transform: "rotate(-20deg)" }}>🫙</span>
  <span className="absolute text-5xl opacity-65" style={{ top: "15%", right: "8%", transform: "rotate(15deg)" }}>🫙</span>
  <span className="absolute text-6xl opacity-65" style={{ bottom: "20%", left: "8%", transform: "rotate(10deg)" }}>🥄</span>
  <span className="absolute text-7xl opacity-65" style={{ bottom: "15%", right: "6%", transform: "rotate(-15deg)" }}>🍴</span>
  <span className="absolute text-5xl opacity-65" style={{ top: "40%", left: "3%",  transform: "rotate(5deg)" }}>🧂</span>
  <span className="absolute text-5xl opacity-65" style={{ top: "35%", right: "4%", transform: "rotate(-10deg)" }}>🫒</span>
</div>
      {/* soft blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: teal, opacity: 0.07, filter: "blur(70px)" }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: gold, opacity: 0.1, filter: "blur(70px)" }} />

      <div className="mb-6 relative z-10">
        <img src={logo} alt="CookSmart" className="w-60 mx-auto" />
      </div>

      <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight max-w-2xl relative z-10"
        style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
      ? מה מבשלים היום<br />
        <span style={{ color: teal }}>הבית מחליט בשבילך</span>
      </h1>

      <p className="text-base max-w-lg mb-10 leading-relaxed relative z-10"
        style={{ color: "#5a7a75" }}>
       תן לנו את המרכיבים שיש לך ואנחנו נמצא לך מתכון מושלם, מותאם אישית תוך שניות.
      </p>

      <div className="flex gap-4 flex-wrap justify-center relative z-10">
        <a href="/register"
          className="px-8 py-3 rounded-lg text-white font-semibold text-base shadow transition-all hover:opacity-90"
          style={{ background: teal }}>
          התחל עכשיו בחינם
        </a>
        <a href="/login"
          className="px-8 py-3 rounded-lg font-semibold text-base border-2 transition-all hover:opacity-80"
          style={{ borderColor: teal, color: teal, background: "white" }}>
          כניסה
        </a>
      </div>

<div className="flex gap-6 mt-14 text-3xl opacity-60 relative z-10">
  <span>🍋</span><span>🫒</span><span>🧄</span><span>🍅</span><span>🧅</span>
</div>
    </section>
  );
}

const steps = [
  { 

    num: "03", 
    emoji: "👨‍🍳", 
    title: "בשל כמו מקצוען",    
    desc: "קבל הנחיות ברורות, טיפים חכמים והמלצות AI לתוצאה מושלמת." 
  },
  { 
    num: "02", 
    emoji: "🔍", 
    title: "קבל מתכונים מתאימים",  
    desc: "נגלה עבורך מתכונים לפי מה שיש לך, כולל אחוז התאמה ורשימת חוסרים." 
  },
  { 
    num: "01", 
    emoji: "🛒", 
    title: "הוסף מרכיבים", 
    desc: "בחר או הזן את המרכיבים שיש לך בבית, פשוט ומהיר." 

  },
];

function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "white" }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center uppercase tracking-widest mb-2 text-xs font-bold"
          style={{ color: gold }}>איך זה עובד</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16"
          style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
          שלושה צעדים פשוטים
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm"
                style={{ background: cream, border: `2px solid ${gold}` }}>
                {s.emoji}
              </div>
              <span className="text-xs font-bold tracking-widest mb-1" style={{ color: gold }}>{s.num}</span>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1a2e2b" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5a7a75" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { 
    icon: "🥦", 
    title: "ניהול מלאי חכם", 
    desc: "נהל בקלות את המרכיבים שיש לך בבית, הוסף, עדכן והסר פריטים מהמטבח האישי שלך." 
  },
  { 
    icon: "🍽️", 
    title: "מתכונים לפי מה שיש בבית", 
    desc: "קבל מתכונים שמבוססים על המרכיבים שלך, כולל אחוז התאמה, רשימת חוסרים וזמן הכנה." 
  },
  { 
    icon: "🤖", 
    title: "המלצות מותאמות אישית עם AI", 
    desc: "קבל המלצות חכמות בהתאם להעדפות שלך, סוג מטבח, מגבלות תזונה ורמת קושי." 
  },
];
function Features() {
  return (
    <section className="py-24 px-6" style={{ background: cream }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center uppercase tracking-widest mb-2 text-xs font-bold"
          style={{ color: gold }}>CookSmart למה כדאי</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16"
          style={{ fontFamily: "'Playfair Display', serif", color: "#1a2e2b" }}>
          יותר מסתם מתכונים
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title}
              className="rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              style={{ border: `1px solid #e8f0ef` }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1a2e2b" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5a7a75" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-8 px-6 text-center" style={{ background: "#245C5D" }}>
      <p className="uppercase tracking-widest mb-1 text-xs font-bold" style={{ color: gold }}>
        מוכן?
      </p>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-5"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        בוא נבשל ביחד
      </h2>
      <p className="text-white opacity-80 text-base mb-8 max-w-md mx-auto">
        הצטרף עכשיו בחינם ותתחיל לקבל המלצות מתכונים מותאמות אישית.
      </p>
      <a href="/register"
        className="inline-block px-10 py-3 rounded-lg font-bold text-base transition-all hover:opacity-90 shadow-lg"
        style={{ background: gold, color: "#1a2e2b" }}>
        הרשמה חינמית
      </a>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
