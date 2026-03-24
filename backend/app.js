const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const pantryRoutes = require("./routes/pantryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const savedRecipeRoutes = require("./routes/savedRecipeRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
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


app.get("/", (_req, res) => {
  res.json({ message: "CookSmart auth API is running" });
});

app.use("/auth", authRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/pantry", pantryRoutes);
app.use("/recipes", recipeRoutes);
app.use("/saved-recipes", savedRecipeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
