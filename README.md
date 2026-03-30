# 🍳 CookSmart

> **עוזר בישול חכם המופעל על ידי AI** — הכנס את המרכיבים שיש לך בבית, וקבל מתכונים מותאמים אישית תוך שניות.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple?logo=google)
![Render](https://img.shields.io/badge/Deployed-Render-blue)

</div>

---

## 🌐 קישורים

| | |
|---|---|
| **אתר חי** | https://cooksmart-1.onrender.com |
| **Backend API** | https://cooksmart-vwpo.onrender.com |

---

## 📌 על הפרויקט

CookSmart היא אפליקציית Full-Stack המאפשרת למשתמשים לנהל את המרכיבים שיש להם בבית ולקבל המלצות מתכונים מותאמות אישית באמצעות Gemini AI של Google.

### מה הפרויקט עושה?

1. **ניהול מקרר חכם** — הוסף מרכיבים ידנית או סרוק תמונה והAI יזהה את המרכיב
2. **מתכונים מבוססי AI** — Gemini מייצר מתכון מותאם לפי מה שיש לך + העדפות אישיות
3. **שמירת מתכונים** — שמור מתכונים שאהבת עם מניעת כפילויות חכמה
4. **דירוג מתכונים** — דרג מתכונים 1-5 כוכבים, ראה מתכונים מומלצים בדף הבית
5. **תגובות ולייקים** — כתוב תגובות על מתכונים, לייק/דיסלייק על תגובות
6. **לוח ניהול (Admin)** — סטטיסטיקות מלאות, ניהול משתמשים, מתכונים מובילים

---

## ✨ פיצ'רים עיקריים

### 👤 משתמשים
| פיצ'ר | תיאור |
|--------|--------|
| הרשמה / התחברות | JWT עם bcrypt (12 rounds) |
| פרופיל אישי | עריכת שם, אימייל, סיסמה |
| העדפות תזונה | מטבחים אהובים, הגבלות תזונה, זמן בישול |
| Onboarding | הגדרת העדפות בהרשמה ראשונה |

### 🧊 מקרר (Pantry)
| פיצ'ר | תיאור |
|--------|--------|
| הוספת מרכיבים | ידנית עם כמות, יחידה ותאריך תפוגה |
| סריקת תמונה | Gemini AI מזהה מרכיב מתמונה |
| מיזוג אוטומטי | הוספת אותו מרכיב מחברת כמויות |
| מניעת מרכיבים לא מזון | AI מתעלם מפריטים שאינם אוכל |

### 🍽️ מתכונים
| פיצ'ר | תיאור |
|--------|--------|
| יצירת מתכון | Gemini AI מבוסס על המקרר + העדפות |
| בונוס מתכונים | 2 מתכונים נוספים עם רשימת חוסרים |
| אחוז התאמה | כמה % מהמרכיבים כבר יש לך |
| שמירת מתכונים | SHA256 deduplication |
| דירוג כוכבים | 1-5 כוכבים עם אפקט אנימציה |

### ⭐ מתכונים מומלצים
- קרוסלה אינטראקטיבית בדף הבית
- מחושב לפי ממוצע דירוגים (כמו IMDb)
- לחיצה על כרטיס פותחת מודל עם המתכון המלא
- גלוי לכולם — גם ללא הרשמה

### 💬 תגובות
- כתיבת תגובות על מתכונים (משתמשים רשומים בלבד)
- ♥ לייק / 💔 דיסלייק על תגובות
- לחיצה על לייק מבטלת דיסלייק ולהפך

### 👑 ניהול (Admin)
- סטטיסטיקות: משתמשים, מקרר, מתכונים, תגובות, ממוצע דירוג
- Top 5 מתכונים מדורגים
- Top 5 מתכונים מדוברים (הכי הרבה תגובות)
- Top 5 משתמשים פעילים
- ניהול משתמשים: צפייה במקרר, מתכונים, שינוי תפקיד, מחיקה
- הגנה: אדמין לא יכול למחוק / לשנות את עצמו

---

## 🏗️ ארכיטקטורה

```
CookSmart/
├── backend/          # Node.js + Express REST API
│   ├── controllers/  # לוגיקה עסקית
│   ├── models/       # MongoDB schemas
│   ├── routes/       # הגדרת נתיבים
│   ├── middleware/   # JWT auth, error handling
│   └── utils/        # Gemini AI, Cloudinary
│
└── frontend/         # React + Vite + Tailwind CSS
    └── src/
        ├── Pages/    # דפי האפליקציה
        ├── components/ # רכיבים משותפים
        ├── services/ # קריאות API
        ├── hooks/    # Custom hooks
        └── context/  # Auth context
```

---

## 🛠️ Tech Stack

### Backend
| טכנולוגיה | שימוש |
|-----------|--------|
| Node.js + Express | שרת REST API |
| MongoDB + Mongoose | מסד נתונים |
| JWT + bcryptjs | אימות משתמשים |
| Google Gemini AI | יצירת מתכונים + זיהוי תמונות |
| Cloudinary | אחסון תמונות |
| Helmet.js | Security headers |
| express-rate-limit | הגבלת קצב בקשות |

### Frontend
| טכנולוגיה | שימוש |
|-----------|--------|
| React 19 | UI |
| Vite | Build tool |
| Tailwind CSS | עיצוב |
| React Router v7 | ניווט |

---

## 🚀 התקנה והרצה מקומית

### דרישות מוקדמות
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Cloudinary account

### Backend

```bash
cd backend
npm install
```

צור קובץ `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cooksmart
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev   # development
npm start     # production
```

### Frontend

```bash
cd frontend
npm install
```

צור קובץ `.env`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev   # development
npm run build # production build
```

---

## 📡 API Endpoints

> 🔒 = דורש `Authorization: Bearer <token>`
> 👑 = דורש תפקיד Admin

### Auth `/auth`
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/auth/register` | הרשמה |
| POST | `/auth/login` | התחברות |
| GET | `/auth/me` 🔒 | פרטי משתמש נוכחי |

### Pantry `/pantry` 🔒
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/pantry` | כל פריטי המקרר |
| POST | `/pantry` | הוסף פריט |
| PATCH | `/pantry/:id` | עדכן פריט |
| DELETE | `/pantry/:id` | מחק פריט |
| POST | `/pantry/identify-image` | זהה מרכיב מתמונה |

### Recipes `/recipes` 🔒
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/recipes/generate` | צור מתכון עם AI |

### Saved Recipes `/saved-recipes`
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/saved-recipes/top-rated` | מתכונים מומלצים (ציבורי) |
| GET | `/saved-recipes` 🔒 | מתכונים שמורים |
| POST | `/saved-recipes` 🔒 | שמור מתכון |
| DELETE | `/saved-recipes/:id` 🔒 | מחק מתכון |
| PATCH | `/saved-recipes/:id/rating` 🔒 | דרג מתכון |

### Comments `/comments`
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/comments/:signature` | קבל תגובות (ציבורי) |
| POST | `/comments/:signature` 🔒 | הוסף תגובה |
| PATCH | `/comments/:id/like` 🔒 | לייק / ביטול לייק |
| PATCH | `/comments/:id/dislike` 🔒 | דיסלייק / ביטול |

### Admin `/admin` 🔒 👑
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/admin/stats` | סטטיסטיקות מלאות |
| GET | `/admin/users` | כל המשתמשים |
| PATCH | `/admin/users/:id/role` | שנה תפקיד |
| DELETE | `/admin/users/:id` | מחק משתמש |
| GET | `/admin/users/:id/saved-recipes` | מתכונים של משתמש |
| GET | `/admin/users/:id/pantry` | מקרר של משתמש |

---

## 🔐 אבטחה

- **JWT** — טוקן עם תפוגה של 7 ימים
- **bcrypt** — 12 salt rounds
- **Helmet.js** — Security headers
- **CORS** — Whitelist של origins מאושרים
- **Rate Limiting** — הגבלת קצב על נתיבי AI ו-Auth
- **בידוד נתונים** — כל query מסונן לפי `userId`
- **הגנת Admin** — Admin לא יכול למחוק/לשנות את עצמו

---

## 🗄️ מבנה המסד נתונים

```
User           → name, email, password, role
PantryItem     → userId, ingredientName, quantity, unit, expiryDate, imageUrl
UserPreference → userId, likedCuisines, dietaryRestrictions, ...
SavedRecipe    → userId, recipeSignature (SHA256), title, ingredients, instructions, rating
Comment        → recipeSignature, userId, userName, text, likes[], dislikes[]
```

---

## 👥 צוות הפיתוח

פרויקט זה פותח כפרויקט גמר.

---

<div align="center">
  <sub>Built with ❤️ and a lot of coffee ☕</sub>
</div>
