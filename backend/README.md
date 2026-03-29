# CookSmart – Backend API

## Project Overview

CookSmart is a smart cooking assistant web app that helps users decide what to cook based on the ingredients they already have at home. Users manage a personal pantry, and the app uses AI to generate personalized recipe suggestions that match their available ingredients and dietary preferences.

This repository contains the **backend** — a REST API that handles authentication, pantry management, recipe generation via Google Gemini AI, and image recognition via Cloudinary.

**Key features:**
- JWT-based user authentication and registration
- Full CRUD pantry management with automatic ingredient merging
- AI recipe generation using Google Gemini (based on pantry + user preferences)
- AI ingredient identification from uploaded images
- Saved recipes with SHA256-based deduplication
- Rate limiting on AI endpoints to prevent abuse

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
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cooksmart

JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5174

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> A `.env.example` file is already included in the project as a reference.

---

## Project Structure

```
backend/
├── server.js              # Entry point – connects to MongoDB, starts server
├── app.js                 # Express setup – routes, middleware, CORS
├── models/
│   ├── User.js
│   ├── UserPreference.js
│   ├── PantryItem.js
│   └── SavedRecipe.js
├── routes/
│   ├── authRoutes.js
│   ├── pantryRoutes.js
│   ├── preferencesRoutes.js
│   ├── recipeRoutes.js
│   └── savedRecipesRoutes.js
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── errorMiddleware.js # Global error handling
└── utils/
    ├── generateToken.js
    ├── geminiRecipeService.js
    └── geminiImageService.js
```

---

## API Routes

> All routes marked with 🔒 require `Authorization: Bearer <token>` header.

### Auth — `/auth`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/auth/me` 🔒 | Get current user info |

**Register request body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "John", "email": "john@example.com" }
}
```

---

### Pantry — `/pantry` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pantry` | Get all pantry items for the user |
| `POST` | `/pantry` | Add a new item (auto-merges if duplicate) |
| `PATCH` | `/pantry/:id` | Update a pantry item |
| `DELETE` | `/pantry/:id` | Delete a pantry item |
| `POST` | `/pantry/identify-image` | Identify ingredient from image using Gemini AI |

**Add item request body:**
```json
{
  "ingredientName": "Tomatoes",
  "quantity": "5",
  "unit": "pcs",
  "expiryDate": "2025-12-31"
}
```

> **Note:** If the same ingredient with the same unit already exists, the quantity is automatically merged.

**Image identification:**
```
POST /pantry/identify-image
Content-Type: multipart/form-data
Body: { image: <file> }   (max 5MB)
```

---

### Preferences — `/preferences` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/preferences` | Get user dietary preferences |
| `PUT` | `/preferences` | Save or update preferences |

**Request body:**
```json
{
  "likedCuisines": ["Italian", "Asian"],
  "dietaryRestrictions": ["Gluten-free"],
  "favoriteFoodTypes": ["Pasta", "Salads"],
  "preferredCookingTime": "under_30"
}
```

`preferredCookingTime` options: `"under_30"` | `"under_60"` | `"any"`

---

### Recipes — `/recipes` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/recipes/generate` | Generate a recipe based on pantry and preferences |

Gemini AI receives the user's pantry items and preferences, and returns a full recipe with bonus recipes.

**Response:**
```json
{
  "title": "Tomato Pasta",
  "ingredients": ["pasta", "tomatoes", "garlic"],
  "instructions": "...",
  "bonusRecipes": [
    {
      "title": "Quick Sauce",
      "missingIngredients": ["basil"],
      "content": "..."
    }
  ]
}
```

---

### Saved Recipes — `/saved-recipes` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/saved-recipes` | Get all saved recipes |
| `POST` | `/saved-recipes` | Save a recipe |
| `POST` | `/saved-recipes/check` | Check if a recipe is already saved |
| `DELETE` | `/saved-recipes/:id` | Delete a saved recipe |

> Duplicate prevention: each recipe gets a SHA256 signature. Saving the same recipe twice is automatically blocked.

---

## Data Models

### User
```js
{
  name:      String,   // 2–80 characters
  email:     String,   // unique
  password:  String,   // bcrypt hashed (12 rounds)
  createdAt, updatedAt
}
```

### PantryItem
```js
{
  userId:         ObjectId,  // ref: User
  ingredientName: String,
  quantity:       String,
  unit:           String,
  expiryDate:     Date,
  imageUrl:       String,    // Cloudinary URL
  createdAt, updatedAt
}
```

### UserPreference
```js
{
  userId:                ObjectId,  // ref: User (unique)
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
  userId:          ObjectId,  // ref: User
  recipeSignature: String,    // SHA256 hash for deduplication
  title:           String,
  ingredients:     [String],
  instructions:    String,
  bonusRecipes: [{
    title:              String,
    missingIngredients: [String],
    content:            String
  }]
}
```

---

## Authentication Flow

```
Client  →  POST /auth/login  →  { token: "eyJ..." }

Client  →  GET /pantry
           Headers: Authorization: Bearer eyJ...
           → authMiddleware decodes the token
           → req.user = { _id, name, email }
           → handler runs
```

- Tokens are signed with `JWT_SECRET`, default expiry **7 days**
- Passwords are hashed with **bcrypt (12 rounds)**
- Expired or invalid tokens return `401 Unauthorized`

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `/auth/*` | 10 requests / minute |
| `/pantry/identify-image` | 5 requests / minute |
| `/recipes/generate` | 15 requests / minute |

---

## CORS

Allowed origins:
- `http://localhost:5173`
- `http://localhost:5174`
- Value of `FRONTEND_URL` in environment

---

## Health Check

```
GET /   →   200 OK  →  { "message": "CookSmart API is running" }
```

---

## Full Request Flow (Frontend → Backend)

```
1. Register:      POST /auth/register        →  Save to MongoDB + return JWT
2. Login:         POST /auth/login           →  Return JWT
3. Add to pantry: POST /pantry              →  Save ingredient
4. Image scan:    POST /pantry/identify-image  →  Gemini → Cloudinary → PantryItem
5. Get recipe:    POST /recipes/generate    →  Gemini (pantry + prefs) → Recipe
6. Save recipe:   POST /saved-recipes       →  SHA256 dedup → SavedRecipe
```
