# Data & API Documentation

This document describes the structure of the data across Google Sheets and Firebase Firestore, and how the frontend interacts with them.

## 📊 Google Sheets (CMS)
The core content is stored in a master Google Spreadsheet named `CoachAI_Control_Panel`.

### Key Sheets & Headers
- **tenants**: `domain`, `app_name`, `logo_url`, `primary_color`, `contact_email`, `zalo_url`, `status`.
- **courses**: `id`, `title`, `slug`, `category`, `price`, `sale_price`, `thumbnail`, `description`, `status`, `teacher_id`, `tenant_id`.
- **bots**: `tenant_id`, `id`, `title`, `slug`, `category`, `short_desc`, `long_desc`, `status`.
- **page_content**: `tenant_id`, `key`, `value_vi`, `value_en`, `status`.
- **leads**: `tenant_id`, `name`, `email`, `phone`, `note`, `source`, `timestamp`.

---

## 🔥 Firebase Firestore (Dynamic User Data)
Firestore handles transactional and user-specific data.

### Collection: `users`
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | string | Firebase Auth UID |
| `email` | string | User email |
| `role` | enum | `admin`, `teacher`, `student`, `affiliate` |
| `displayName`| string | Full name |
| `photoURL` | string | Profile picture |
| `isLocked` | boolean | Account status |
| `tenant_id` | string | The tenant domain the user belongs to |
| `createdAt` | timestamp| Registration date |

---

## 📡 API Interaction (Google Apps Script)
The frontend communicates with Google Sheets through a single Web App URL.

### Endpoint URL
Defined in `.env`: `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL`

### Request Format (POST)
```json
{
  "action": "action_name",
  "tenant_id": "client_domain",
  "updates": {
    "field": "value"
  },
  ...other_fields
}
```

### Supported Actions
- `update`: Generic record update for any sheet.
- `lead`: Submit a new marketing lead.
- `course`: Submit a new course for approval.
- `teacher`: Submit a teacher registration.
- `comment`: Post a student comment.
- `register-tenant`: Create a new SaaS tenant.

---

## 🔒 Security & Data Isolation
- **Tenant ID**: Every request includes a `tenant_id` (usually the domain). The Apps Script filters data to ensure one tenant cannot see or modify another's data.
- **Firestore Rules**: Strict rules ensure users can only read/write their own profiles, while `admin` users can access global lists.
