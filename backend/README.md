# CookSmart – Backend API

## Project Overview

CookSmart is a smart cooking assistant web app that helps users decide what to cook based on the ingredients they already have at home. Users manage a personal pantry, and the app uses AI to generate personalized recipe suggestions that match their available ingredients and dietary preferences.

This repository contains the **backend** — a REST API that handles authentication, pantry management, recipe generation via Google Gemini AI, image recognition, recipe ratings, comments, and admin analytics.

**Key features:**
- JWT-based user authentication and registration
- Full CRUD pantry management with automatic ingredient merging
- AI recipe generation using Google Gemini (based on pantry + user preferences)
- AI ingredient identification from uploaded images (non-food items filtered out)
- Saved recipes with SHA256-based deduplication
- Recipe ratings (1–5 stars) with top-rated public endpoint
- Comments on recipes with like / dislike (mutual exclusion)
- Admin dashboard: statistics, user management, pantry viewer
- Rate limiting, CORS whitelist, and Helmet.js security headers

> The frontend lives in `../frontend`. See `frontend/README.md` for the client documentation.

---

## Tech Stack

| Technology | Role |
|---|---|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Google Gemini API | Image recognition + Recipe generation |
| Cloudinary | Image hosting |
| Multer | File upload handling |
| Helmet.js | HTTP security headers |
| express-rate-limit | Request rate limiting |

---

## Setup & Running

```bash
cd backend
npm install
npm run dev      # development (nodemon)
npm start        # production
```

---

## Environment Variables (.env)

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cooksmart

JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5174

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Project Structure

```
backend/
├── server.js              # Entry point – connects to MongoDB, starts server
├── app.js                 # Express setup – routes, middleware, CORS, Helmet
├── models/
│   ├── User.js
│   ├── UserPreference.js
│   ├── PantryItem.js
│   ├── SavedRecipe.js     # includes rating field
│   └── Comment.js         # recipe comments with likes/dislikes
├── routes/
│   ├── authRoutes.js
│   ├── pantryRoutes.js
│   ├── preferencesRoutes.js
│   ├── recipeRoutes.js
│   ├── savedRecipeRoutes.js
│   ├── commentRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── errorMiddleware.js # Global error handling
└── utils/
    ├── generateToken.js
    ├── geminiRecipeService.js
    ├── geminiImageService.js
    └── cloudinaryService.js
```

---

## API Routes

> 🔒 = requires `Authorization: Bearer <token>` header
> 👑 = requires Admin role

### Auth — `/auth`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/auth/me` 🔒 | Get current user info |

---

### Pantry — `/pantry` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pantry` | Get all pantry items |
| `POST` | `/pantry` | Add a new item (auto-merges duplicates) |
| `PATCH` | `/pantry/:id` | Update a pantry item |
| `DELETE` | `/pantry/:id` | Delete a pantry item |
| `POST` | `/pantry/identify-image` | Identify ingredient from image (Gemini AI) |

> Non-food items (e.g. a bag, pen) are ignored by the AI.

---

### Preferences — `/preferences` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/preferences` | Get user dietary preferences |
| `PUT` | `/preferences` | Save or update preferences |

---

### Recipes — `/recipes` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/recipes/generate` | Generate recipe via Gemini AI |

Returns a main recipe + 2 bonus recipes with missing ingredient lists.

---

### Saved Recipes — `/saved-recipes`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/saved-recipes/top-rated` | Top-rated recipes (public, no auth) |
| `GET` | `/saved-recipes` 🔒 | Get all saved recipes |
| `POST` | `/saved-recipes` 🔒 | Save a recipe |
| `DELETE` | `/saved-recipes/:id` 🔒 | Delete a saved recipe |
| `PATCH` | `/saved-recipes/:id/rating` 🔒 | Rate a recipe (1–5) |

> `top-rated` uses a MongoDB aggregation to compute average rating per `recipeSignature`, sorted descending.

---

### Comments — `/comments`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/comments/:signature` | Get comments for a recipe (public) |
| `POST` | `/comments/:signature` 🔒 | Add a comment |
| `PATCH` | `/comments/:id/like` 🔒 | Toggle like (removes dislike if set) |
| `PATCH` | `/comments/:id/dislike` 🔒 | Toggle dislike (removes like if set) |

---

### Admin — `/admin` 🔒 👑

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/stats` | Full stats (users, pantry, recipes, comments, avg rating, top lists) |
| `GET` | `/admin/users` | All users |
| `PATCH` | `/admin/users/:id/role` | Change user role |
| `DELETE` | `/admin/users/:id` | Delete a user |
| `GET` | `/admin/users/:id/saved-recipes` | User's saved recipes |
| `GET` | `/admin/users/:id/pantry` | User's pantry items |

> Admin cannot change or delete their own account.

---

## Data Models

### User
```js
{
  name:      String,   // 2–80 characters
  email:     String,   // unique
  password:  String,   // bcrypt hashed (12 rounds)
  role:      "user" | "admin"
}
```

### PantryItem
```js
{
  userId:         ObjectId,
  ingredientName: String,
  quantity:       String,
  unit:           String,
  expiryDate:     Date,
  imageUrl:       String,    // Cloudinary URL
  imagePublicId:  String
}
```

### UserPreference
```js
{
  userId:                ObjectId,
  likedCuisines:         [String],
  dietaryRestrictions:   [String],
  dislikedIngredients:   [String],
  favoriteFoodTypes:     [String],
  preferredCookingTime:  "under_30" | "under_60" | "any"
}
```

### SavedRecipe
```js
{
  userId:          ObjectId,
  recipeSignature: String,    // SHA256 hash for deduplication
  title:           String,
  ingredients:     [String],
  instructions:    String,
  rating:          Number,    // 1–5, nullable
  bonusRecipes:    [{ title, missingIngredients, content }]
}
```

### Comment
```js
{
  recipeSignature: String,    // links comment to a recipe
  userId:          ObjectId,
  userName:        String,
  text:            String,    // max 500 characters
  likes:           [ObjectId],
  dislikes:        [ObjectId]
}
```

---

## Security

- **JWT** — 7-day token expiry
- **bcrypt** — 12 salt rounds
- **Helmet.js** — sets secure HTTP headers
- **CORS** — explicit origin whitelist
- **Rate limiting** — `/auth` (10 req/min), `/recipes/generate` (15 req/min)
- **Data isolation** — every query filtered by `userId`
- **Regex injection prevention** — user input is escaped before use in RegExp
- **Admin self-protection** — admin cannot delete or demote themselves

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `/auth/*` | 10 requests / minute |
| `/recipes/generate` | 15 requests / minute |

---

## Health Check

```
GET /   →   200 OK  →  { "message": "CookSmart auth API is running" }
```
