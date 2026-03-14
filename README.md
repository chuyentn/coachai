# CourseMarket VN - Full-Stack Online Course Marketplace

A production-ready online course platform built with React, Express, and Supabase.

## Features
- **Auth**: Email/Password & Social Auth (Google/GitHub) via Supabase.
- **Payments**: Integrated with VNPAY (Sandbox), MoMo, and PayPal.
- **Course Management**: Instructors can create courses and upload lessons.
- **Learning Experience**: Video player with progress tracking.
- **Dashboard**: Role-based dashboards for Students, Instructors, and Admins.
- **CRM**: Real-time ticket system for student support.
- **Analytics**: Revenue charts and sales tracking.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Express.js (Node.js).
- **Database**: Supabase (PostgreSQL).
- **Realtime**: Supabase Realtime.
- **Charts**: Recharts.

## Setup Instructions

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL script found in `supabase_schema.sql` in the Supabase SQL Editor.
3. Enable Google/GitHub Auth in the Authentication settings if needed.

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VNPAY_TMN_CODE` & `VNPAY_SECURE_SECRET` (Get from VNPAY Sandbox)

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

## Payment Sandbox Testing
- **VNPAY**: Use the VNPAY Sandbox test cards provided in their documentation.
- **MoMo**: Use MoMo Test App.
- **PayPal**: Use PayPal Developer Sandbox accounts.

## License
Apache-2.0
