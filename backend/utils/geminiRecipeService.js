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

  const ingredients =
    Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0
      ? recipe.ingredients
      : [];

  const content =
    typeof recipe?.content === "string" && recipe.content.trim()
      ? recipe.content.trim()
      : "מצאתי לך רעיון קצר, טעים ונוח להכנה לפי מה שכבר יש בבית.";

  const bonusRecipes = Array.isArray(recipe?.bonusRecipes)
    ? recipe.bonusRecipes
        .filter((b) => b?.title && b?.content)
        .map((b) => ({
          title: b.title,
          missingIngredients: Array.isArray(b.missingIngredients) ? b.missingIngredients : [],
          content: b.content,
        }))
    : [];

  return { title, ingredients, content, bonusRecipes };
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
- להציע מתכון אחד קצר ומעשי אך ורק מהמרכיבים שיש במזווה
- אסור להוסיף מרכיבים שלא ברשימה
- אם יש לחם + כל מרכיב אחר = כריך, טוסט, סנדביץ — זה מספיק לחלוטין
- אם יש ביצה = ביצה מקושקשת / עין — זה מספיק
- אם יש 2-3 מרכיבים = תמיד אפשר להכין משהו
- "אין מספיק מרכיבים" רק אם המזווה ריק לגמרי — אחרת תמיד צור מתכון
- להתחשב במגבלות תזונה
- להימנע ממרכיבים לא אהובים
- להעדיף מטבחים אהובים וסוגי אוכל מועדפים כשאפשר

סגנון הכתיבה:
- בעברית בלבד
- חם, ידידותי ומעודד
- קצר, ברור וקל לסריקה
- לא רובוטי
- ללא פסקאות ארוכות

מבנה התוכן:
- פתיח קצר וחיובי במשפט אחד
- 3 עד 5 שלבים פשוטים וברורים — כל שלב בשורה חדשה עם מספור (1. 2. 3.)
- משפט סיום חיובי וקצר בשורה חדשה
- הפרד כל שלב עם תו שורה חדשה (\n) בתוך ה-JSON

כללי פלט:
- החזר JSON תקין בלבד
- ללא Markdown, ללא HTML, ללא מפתחות נוספים
- בדיוק במבנה:
{"title":"כותרת","ingredients":["מרכיב 1","מרכיב 2"],"content":"הוראות הכנה","bonusRecipes":[{"title":"כותרת בונוס","missingIngredients":["מרכיב חסר"],"content":"הוראות קצרות"}]}
- אם אין מספיק מרכיבים: {"title":"אין מספיק מרכיבים","ingredients":[],"content":"המזווה לא מכיל מספיק מרכיבים. נסה/י להוסיף עוד!","bonusRecipes":[]}

המתכון הראשי: רק מרכיבים מהמזווה.
bonusRecipes: 2 מתכונים שדורשים עד 3 מרכיבים נוספים שאינם במזווה — ציין/י בדיוק מה חסר ב-missingIngredients.

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
            ingredients: {
              type: "array",
              items: { type: "string" },
            },
            content: {
              type: "string",
            },
            bonusRecipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  missingIngredients: { type: "array", items: { type: "string" } },
                  content: { type: "string" },
                },
                required: ["title", "missingIngredients", "content"],
              },
            },
          },
          required: ["title", "ingredients", "content", "bonusRecipes"],
        },
        systemInstruction:
          "כתוב בעברית בלבד. פנה למשתמש/ת בלשון רבים או בצורה מכילה לזכר ולנקבה (למשל: 'תוכל/י', 'נסה/י', 'הוסף/י'). היה חם, ברור, קצר, מעשי ומעודד, כמו עוזר בישול אישי. אם יש אפילו מרכיב אחד — תמיד תציע מתכון. לעולם אל תגיד שאין מספיק מרכיבים כל עוד יש משהו אחד לאכול.",
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
