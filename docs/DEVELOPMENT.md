# Development Guide

This guide helps you set up the project locally and understand the deployment workflow.

## ⚙️ Environment Variables
Create a `.env` file in the root directory based on `.env.example`.

### Mandatory Keys
- `VITE_FIREBASE_API_KEY`: From Firebase Console Settings.
- `VITE_FIREBASE_AUTH_DOMAIN`: `your-app.firebaseapp.com`.
- `VITE_FIREBASE_PROJECT_ID`: `your-app-id`.
- `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL`: The "Web App URL" from your Apps Script deployment.
- `VITE_APP_NAME`: Default branding if no tenant is found.

---

## 🛠️ Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/edu-vibe.git
    cd edu-vibe
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Fill in the `.env` file with your Firebase and Google Apps Script keys.
4.  **Run Dev Server**:
    ```bash
    npm run dev
    ```
5.  **Build for Production**:
    ```bash
    npm run build
    ```

---

## 🚀 Deployment Workflow

### 1. Frontend (Vercel/Netlify/Cloudflare)
Simply connect your GitHub repo. Ensure you add the environment variables in the provider's dashboard.

### 2. Backend (Google Apps Script)
1.  Open the Google Sheet.
2.  Go to `Extensions` > `Apps Script`.
3.  Paste the code from `scripts/coachai_apps_script.js`.
4.  Deploy as a **Web App**:
    - **Execute as**: `Me`
    - **Who has access**: `Anyone`
5.  Update `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` in your frontend with the generated URL.

---

## 🤝 Contribution Rules
- Always use **TypeScript** for new files.
- Follow **Tailwind CSS** naming conventions.
- Use **shadcn/ui** components for consistent design.
- Keep components focused and small.
