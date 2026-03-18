# Workflow: Account Migration & Quota Recovery

This documentation outlines the steps to migrate the backend (Google Apps Script & Sheets) to a new Google account when quota limits (e.g., URL Fetch, Execution Time) are reached.

## 📍 Step 1: Clone the Apps Script
1. Log in to the new Google Account.
2. Create a new Google Spreadsheet.
3. Go to **Extensions > Apps Script**.
4. Copy the contents of `COACH_AI_APP_SCRIPT_V5.js` from the codebase into the script editor.
5. In the script editor, click **Deploy > New Deployment**.
6. Select **Web App**.
7. Set **Execute as:** `Me`.
8. Set **Who has access:** `Anyone`.
9. Click **Deploy** and copy the **Web App URL**.

## 📍 Step 2: Initialize the System
1. Open the Web App URL in your browser with the `setup` action:
   `https://script.google.com/macros/s/NEW_SCRIPT_ID/exec?action=setup`
2. Verify the response is `{"result":"success"}`. This automatically creates all necessary sheets (courses, bots, leads, etc.) on the new account.

## 📍 Step 3: Update Environment Variables
1. Update your `.env` file with the new credentials:
   ```env
   VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/NEW_SCRIPT_ID/exec
   VITE_GOOGLE_SHEET_EDIT_URL=https://docs.google.com/spreadsheets/d/NEW_SPREADSHEET_ID/edit
   ```
2. Restart the development server: `npm run dev`.

## 📍 Step 4: Verify Connectivity
1. Check the **AI Hub** and **Projects** pages to ensure data is fetching correctly from the new sheets.
2. Submit a test Lead or Comment to verify POST operations.

---
*Last Updated: 2026-03-18*
