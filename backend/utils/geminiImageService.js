let cachedGenAiModule;

const getGenAiModule = async () => {
  if (!cachedGenAiModule) {
    cachedGenAiModule = import("@google/genai");
  }
  return cachedGenAiModule;
};

const identifyIngredientFromImage = async (base64Image, mimeType) => {
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
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            {
              text: 'זהה את מוצר המזון בתמונה. אם התמונה מכילה מזון או מרכיב בישול — החזר את שמו בעברית. אם התמונה אינה מכילה מזון כלל (למשל: אדם, רכב, נוף, חפץ) — החזר בדיוק: {"ingredientName":"לא זוהה","suggestedUnit":"יח\'"}',
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            ingredientName: { type: "string" },
            suggestedUnit: { type: "string" },
          },
          required: ["ingredientName", "suggestedUnit"],
        },
      },
    });
  } catch (requestError) {
    const error = new Error(requestError?.message || "Gemini image identification failed");
    error.statusCode = 502;
    throw error;
  }

  const text = typeof response?.text === "string" ? response.text.trim() : "";

  try {
    return JSON.parse(text);
  } catch {
    return { ingredientName: "לא זוהה", suggestedUnit: "יח'" };
  }
};

module.exports = { identifyIngredientFromImage };
