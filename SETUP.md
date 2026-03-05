# Hydration App Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase account (free tier)
- A Resend account (free tier)

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** and run the contents of `backend/database/schema.sql`
3. Go to **Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_KEY`

## 2. Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys** and create a new key
3. Copy the key → `RESEND_API_KEY`

## 3. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env

# Edit .env with your values:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-role-key
# RESEND_API_KEY=re_your-resend-key
# APP_URL=http://localhost:5173
# PORT=3001

# Install dependencies
npm install

# Start the server
npm run dev
```

## 4. Frontend Setup

```bash
cd frontend

# Create environment file
cp .env.example .env

# Edit .env if needed (defaults work for local dev):
# VITE_API_URL=http://localhost:3001/api

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 5. Test the App

1. Open http://localhost:5173
2. Enter your email
3. Check your email for the magic link (check spam folder)
4. Click the link to sign in
5. Complete onboarding
6. Start logging drinks!

## Project Structure

```
hydration-app/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   ├── config/           # Supabase & Resend clients
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   └── data/             # Beverage categories
│   ├── database/
│   │   └── schema.sql        # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with routing
│   │   ├── api/              # API client
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Login, Dashboard, etc.
│   │   └── components/       # Reusable components
│   └── package.json
└── SETUP.md
```

## Deployment

### Backend (Render)

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env`

### Frontend (Vercel)

1. Import project on [vercel.com](https://vercel.com)
2. Set root directory: `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Update Resend Domain

For production emails, verify a domain in Resend and update the `from` address in `backend/src/routes/auth.js`.
