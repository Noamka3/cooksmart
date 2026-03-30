const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const pantryRoutes = require("./routes/pantryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const savedRecipeRoutes = require("./routes/savedRecipeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "יותר מדי ניסיונות, נסה שוב עוד דקה" },
  standardHeaders: true,
  legacyHeaders: false,
});

const recipeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { message: "יותר מדי בקשות יצירת מתכון, נסה שוב עוד דקה" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (_req, res) => {
  res.json({ message: "CookSmart auth API is running" });
});

app.use("/auth", authLimiter, authRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/pantry", pantryRoutes);
app.use("/recipes", recipeLimiter, recipeRoutes);
app.use("/saved-recipes", savedRecipeRoutes);
app.use("/admin", adminRoutes);
app.use("/comments", commentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
