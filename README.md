# CP Tracker - Coding Platform Tracker

👉 **Live Demo (Vercel)**: https://cp-tracker-mu.vercel.app/

CP Tracker is a premium, modern fullstack dashboard application that aggregates and tracks user metrics across popular competitive programming platforms including **LeetCode**, **CodeChef**, and **Codeforces**. Designed with sleek skeuomorphic/neumorphic aesthetics, the app supports active light and dark themes, submission streaks, interactive widgets, and platform-specific heatmaps.

---

## 🚀 Key Features

* **Interactive Code Constellation Login**: A full-screen split landing page featuring a custom HTML5 canvas constellation of floating code characters that dynamically gravitate toward the user's cursor.
* **Platform-Specific Heatmaps**: Full activity heatmaps detailing daily submissions for individual coding platforms.
* **Submission Streak Dashboard**: A glowing flame streak indicator tracking current and historical submission streaks.
* **Real-time Platform Statistics**: Fetches user ratings, active handles, solved problems, and upcoming contests schedules.
* **Complete Theme Adaptability**: Toggle switches for Light and Dark modes available globally and on individual platform pages.
* **Premium Skeuomorphic UI**: Beautiful cards, inset inputs, and sleek tactile buttons that elevate the user experience.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion
* **Backend**: Node.js, Express.js, Mongoose, JWT authentication
* **Database**: MongoDB Atlas (with local in-memory fallback for testing)

---

## 📁 Project Structure

```text
tracker/
├── backend/                  # Node/Express API Server
│   ├── config/               # Database connection logic
│   ├── middleware/           # Authentication middleware
│   ├── models/               # MongoDB models (User)
│   ├── routes/               # API routes (Auth, Platforms)
│   ├── server.js             # API server entrypoint
│   └── package.json
├── frontend/                 # Vite/React SPA
│   ├── public/               # Public assets (Favicons)
│   ├── src/                  # Source code (Components, Pages, Contexts)
│   ├── index.html            # Main HTML document
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite build configuration
│   └── package.json
├── package.json              # Concurrently dev runner scripts
├── cplogo.png                # Primary App Logo
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Setup
Create a `.env` file in the `backend/` directory using the `.env.example` template:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret_key
```

### Frontend Setup (Optional)
If deploying the frontend separately, you can specify the target backend API URL in `frontend/.env` (or via environment variables on your hosting provider):
```env
VITE_API_URL=https://your-deployed-backend-api.com
```
*Note: If `VITE_API_URL` is omitted, the frontend will default to relative paths `/api/...`, allowing the Vite dev server proxy (`http://localhost:5000`) to resolve them locally.*

---

## 💻 Local Development

### 1. Install Dependencies
Run the install script from the root directory to install packages for the root runner, backend, and frontend:
```bash
npm run install-all
```

### 2. Run in Development Mode
Start the backend server and frontend client concurrently:
```bash
npm run dev
```
The app will be active at:
* **Frontend client**: [http://localhost:3000](http://localhost:3000)
* **Backend server**: [http://localhost:5000](http://localhost:5000)

---

## 📦 Production Deployment

### Option A: Separate Deployments (Recommended)
1. **Backend**:
   - Deploy the `backend/` subdirectory to platforms like **Render**, **Railway**, or **Heroku**.
   - Configure the environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`) in your hosting provider's settings.
2. **Frontend**:
   - Deploy the `frontend/` subdirectory to platforms like **Vercel** or **Netlify**.
   - Set the environment variable `VITE_API_URL` in the dashboard to point to your deployed backend API (e.g., `https://your-api.onrender.com`).

### Option B: Unified Build
1. Build the production build folder inside the `frontend/` directory:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the built assets from the backend `server.js` using static file hosting:
   ```javascript
   // In backend/server.js:
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../frontend/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
   });
   ```
