const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let cachedGenAiModule;

const getGenAiModule = async () => {
  if (!cachedGenAiModule) {
    cachedGenAiModule = import("@google/genai");
  }

  return cachedGenAiModule;
};

const normalizeRecipe = (recipe) => {
  const title =
    typeof recipe?.title === "string" && recipe.title.trim()
      ? recipe.title.trim()
      : "ארוחה מהירה מהמזווה";

  const content =
    typeof recipe?.content === "string" && recipe.content.trim()
      ? recipe.content.trim()
      : "מצאתי לך רעיון קצר, טעים ונוח להכנה לפי מה שכבר יש בבית.";

  return { title, content };
};

const buildPrompt = ({ user, preferences, pantryItems }) => {
  const structuredInput = {
    user: {
      name: user.name || "CookSmart user",
    },
    preferences: preferences || {
      likedCuisines: [],
      dietaryRestrictions: [],
      dislikedIngredients: [],
      preferredCookingTime: "any",
      favoriteFoodTypes: [],
    },
    pantryItems,
  };

  return `
אתה CookSmart, עוזר בישול אישי חם, מעודד וברור.

המטרה:
- להציע מתכון אחד קצר ומעשי לפי המרכיבים שיש במזווה
- להתחשב במגבלות תזונה
- להימנע ממרכיבים לא אהובים
- להעדיף מטבחים אהובים וסוגי אוכל מועדפים כשאפשר
- להתחשב בזמן הבישול המועדף כשאפשר
- אם המזווה דל, עדיין להציע משהו פשוט, טעים ומעודד

סגנון הכתיבה:
- בעברית בלבד
- חם, ידידותי ומעודד
- קצר, ברור וקל לסריקה
- לא רובוטי
- ללא פסקאות ארוכות

מבנה התוכן:
- פתיח קצר וחיובי במשפט אחד
- 3 עד 5 שלבים פשוטים וברורים
- משפט סיום חיובי וקצר

כללי פלט:
- החזר JSON תקין בלבד
- ללא Markdown
- ללא HTML
- ללא מפתחות נוספים
- בדיוק במבנה:
{"title":"כותרת קצרה","content":"טקסט מתכון קצר, ברור וחם"}

הטקסט צריך להיות קומפקטי ומתאים להצגה בתוך כרטיס אחד.
אל תחזור יותר מדי על אותם מרכיבים.

נתוני המשתמש:
${JSON.stringify(structuredInput, null, 2)}
`.trim();
};

const generateRecipeFromProfile = async (profile) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const { GoogleGenAI } = await getGenAiModule();
  const ai = new GoogleGenAI({ apiKey });

  let response;

  try {
    response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: buildPrompt(profile),
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            content: {
              type: "string",
            },
          },
          required: ["title", "content"],
        },
        systemInstruction:
          "כתוב בעברית בלבד. היה חם, ברור, קצר, מעשי ומעודד, כמו עוזר בישול אישי.",
      },
    });
  } catch (requestError) {
    const error = new Error(
      requestError?.message || "Gemini recipe generation failed",
    );
    error.statusCode = 502;
    throw error;
  }

  const text = typeof response?.text === "string" ? response.text.trim() : "";

  if (!text) {
    const error = new Error("Gemini returned an empty recipe response");
    error.statusCode = 502;
    throw error;
  }

  try {
    return normalizeRecipe(JSON.parse(text));
  } catch {
    return normalizeRecipe({
      title: "A Cozy Pantry Recipe",
      content: text,
    });
  }
};

module.exports = { generateRecipeFromProfile };
