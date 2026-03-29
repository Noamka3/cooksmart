# CookSmart – Frontend

## Project Overview

CookSmart is a smart cooking assistant web app that helps users decide what to cook based on the ingredients they already have at home. Users manage a personal pantry (fridge), and the app uses AI to generate personalized recipe suggestions that match their available ingredients and dietary preferences.

This repository contains the **frontend** — a React single-page application that communicates with the CookSmart REST API.

**Key features:**
- Personal pantry/fridge management with add, edit, delete, and AI image recognition
- AI-powered recipe generation based on pantry contents and user preferences
- Save and manage favorite recipes
- User authentication with JWT
- Hebrew RTL interface

> The backend lives in `../backend`. See `backend/README.md` for API documentation.

---

## Tech Stack

| Technology | Role |
|---|---|
| React 19 + Vite | UI framework and build tool |
| React Router v7 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Context API | Auth and Toast state management |
| localStorage | JWT token persistence |

---

## Setup & Running

```bash
cd frontend
npm install
npm run dev      # development server (HMR)
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm run lint     # run ESLint
```

---

## Environment Variables (.env)

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

> If `VITE_API_URL` is not set, services default to `http://localhost:5000`.

**Local storage:**
- `cooksmart_token` — JWT token, stored on login and cleared on logout.

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Router and route definitions
│   ├── index.css             # Global styles, animations, utility classes
│   ├── assets/
│   │   ├── logo.png
│   │   └── logo2.png
│   ├── Pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   ├── AccountPage.jsx
│   │   ├── PantryPage.jsx
│   │   ├── RecipesPage.jsx
│   │   └── SavedRecipesPage.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── AuthForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useToast.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── pantryService.js
│   │   └── savedRecipesService.js
│   └── utils/
│       └── authValidation.js
```

---

## Routing

| Path | Page | Protected |
|------|------|-----------|
| `/` | HomePage | No |
| `/login` | LoginPage | No (redirects if already logged in) |
| `/register` | RegisterPage | No (redirects if already logged in) |
| `/onboarding` | OnboardingPage | Yes |
| `/account` | AccountPage | Yes |
| `/pantry` | PantryPage | Yes |
| `/recipes` | RecipesPage | Yes |
| `/saved-recipes` | SavedRecipesPage | Yes |
| `*` | Redirect to `/` | — |

Protected routes use `<ProtectedRoute>` which redirects unauthenticated users to `/login` and preserves the intended path for redirect after login.

---

## Pages

### HomePage
Landing page with hero section, "How it works" steps, features overview, and a call-to-action. Adapts CTAs based on auth state.

### LoginPage / RegisterPage
Auth pages using the shared `AuthLayout` and `AuthForm` components. Handle client-side validation, field-level errors from the server, and redirect on success.

### OnboardingPage
Preference selection after registration. Users pick liked cuisines, food types, and dietary restrictions via toggle chips. Fetches existing preferences on load and saves via `PUT /preferences`.

### AccountPage
User dashboard showing pantry item count, liked cuisines, and quick nav cards to all features.

### PantryPage
Full pantry management:
- **Add / Edit / Delete** ingredients
- **AI image recognition** — upload a photo and Gemini identifies the ingredient
- **Search** by name, **sort** by date added / alphabetical / expiry date
- **Expiry indicators** — color-coded borders for expiring and expired items
- 75+ ingredient emoji icons mapped automatically by name

### RecipesPage
AI recipe generation:
- Sends pantry items + user preferences to the API
- Displays recipe with match percentage, ingredient pills, and instructions
- **Bonus recipes** — alternatives if the user adds missing ingredients
- Save / unsave with animated heart icon

### SavedRecipesPage
Grid of all saved recipes. Each card shows a preview with ingredients and a truncated instruction. Clicking opens a full modal. Recipes can be removed from the card or the modal.

---

## Components

### Navbar
Sticky top bar with logo on the left and nav links on the right. Shows login/register for guests and account info + logout for authenticated users. Fully responsive with a hamburger menu on mobile.

### Footer
Minimal footer with logo and copyright.

### AuthLayout
Two-column layout for login/register pages:
- **Left panel (desktop):** Dark teal gradient with floating food emoji decorations and tagline.
- **Right panel:** White form area with eyebrow label, title, subtitle, form, and alternate link.

### AuthForm
Reusable form renderer. Accepts a `fields` array and renders inputs with per-field error messages, a general error block, and a submit button with loading state.

### ProtectedRoute
Wraps routes that require authentication. Shows a spinner while bootstrapping, redirects to `/login` if unauthenticated.

---

## Hooks

### useAuth
```js
const { user, token, isAuthenticated, isBootstrapping, login, register, logout } = useAuth()
```
Reads from `AuthContext`. Provides auth state and actions.

### useToast
```js
const { showToast, dismissToast } = useToast()

showToast({ type: "success" | "error" | "info", title: "...", message: "..." })
```
Reads from `ToastContext`. Toasts auto-dismiss after 3.2 seconds, max 3 visible at once.

---

## Services

All services read the base URL from `VITE_API_URL` and include structured error handling. Protected services require a `token` argument and attach `Authorization: Bearer <token>`.

### authService
```js
registerUser(formData)            // POST /auth/register
loginUser(formData)               // POST /auth/login
getMe(token)                      // GET  /auth/me
```

### pantryService
```js
getPantryItems(token)             // GET    /pantry
createPantryItem(token, data)     // POST   /pantry
updatePantryItem(token, id, data) // PATCH  /pantry/:id
deletePantryItem(token, id)       // DELETE /pantry/:id
identifyPantryImage(token, file)  // POST   /pantry/identify-image  (FormData)
```

### savedRecipesService
```js
saveRecipe(token, recipe)         // POST   /saved-recipes
getSavedRecipes(token)            // GET    /saved-recipes
deleteSavedRecipe(token, id)      // DELETE /saved-recipes/:id
checkRecipeSaved(token, recipe)   // POST   /saved-recipes/check → { isSaved, savedRecipeId }
```

---

## Styling

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Teal | `#1a9c8a` | Primary actions, links, active states |
| Teal Deep | `#245C5D` | Hover states, dark panels |
| Gold | `#D08A2A` | Accents, labels, borders |
| Cream | `#f5ead0` | Page backgrounds |
| Dark | `#1a2e2b` | Headings and body text |

### Fonts
- **Playfair Display** (700) — headings
- **DM Sans** (400/500) — body text

Both loaded from Google Fonts in `index.css`.

### Custom Utility Classes

| Class | Description |
|---|---|
| `.premium-panel` | White/translucent panel with blur and subtle gradient |
| `.premium-card` | Glass-effect card |
| `.primary-button` | Teal gradient button with shadow |
| `.secondary-button` | Gold/cream button |
| `.ghost-button` | Transparent button with teal text and border |
| `.card-lift` | Hover: scale up + deepen shadow |
| `.premium-pill` | Rounded tag / chip |

### Animations

| Name | Used for |
|---|---|
| `toast-slide-in` | Toast notification entrance |
| `toast-progress` | Toast auto-dismiss progress bar |
| `save-pop` | Heart icon save animation |
| `modal-pop` | Modal entrance |
| `shimmer` | Loading skeleton shimmer |

---

## Authentication Flow

```
App load
  → AuthContext reads cooksmart_token from localStorage
  → calls GET /auth/me to validate
  → sets user + isAuthenticated

Login
  → POST /auth/login
  → stores token in localStorage
  → sets user in context

Logout
  → removes token from localStorage
  → clears user in context
  → redirects to /

Protected request
  → service attaches Authorization: Bearer <token>
  → 401 response → triggers logout
```

---

## Adding a New Page

1. Create `src/Pages/MyPage.jsx`
2. Add the route in `src/App.jsx`:
```jsx
<Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
```
3. If it needs API calls, add a function to the relevant service file.
4. Add a nav link in `Navbar.jsx` if needed.
