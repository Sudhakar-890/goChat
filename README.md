# goChat — Real-Time Chat Application

A production-grade real-time chat application built with React, Express.js, and Supabase.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v3 + Framer Motion
- **Backend**: Express.js + TypeScript + Zod validation
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Zustand

## Getting Started

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and open your **goChat** project
2. Go to **Settings** → **API** to find your:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon/public key** (for the frontend)
   - **service_role key** (for the backend — keep secret!)
3. Go to **SQL Editor** and run each migration file from `supabase/migrations/` **in order** (001 through 007)
4. Go to **Database** → **Replication** and enable replication for `messages` and `rooms` tables
5. (Optional) Go to **Authentication** → **Providers** and enable **Google** if you want social login

### 2. Set Up the Backend
 
```bash
cd server
cp .env.example .env
# Edit .env with your Supabase URL and service_role key
npm install
npm run dev
```

The server runs on `http://localhost:3001`.

### 3. Set Up the Frontend

```bash
cd client
cp .env.example .env
# Edit .env with your Supabase URL and anon key
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Project Structure

```
goChat/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── features/auth/     # Authentication
│       ├── features/chat/     # Chat engine
│       ├── pages/             # Route pages
│       └── config/            # Supabase client
├── server/          # Express.js backend
│   └── src/
│       ├── routes/            # API endpoints
│       ├── services/          # Business logic
│       ├── schemas/           # Zod validation
│       └── middleware/        # Auth, validation, errors
└── supabase/
    └── migrations/  # SQL scripts (run in order)
```

## Features

- ✅ Email/password & Google authentication
- ✅ Real-time messaging with Supabase Realtime
- ✅ Image/video upload with signed URLs
- ✅ DM and group chat support
- ✅ Typing indicators
- ✅ Message status (sent/delivered/seen)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark theme with glassmorphism UI
- ✅ Framer Motion animations

## Deployment & Required Settings

To successfully deploy and run the app in production, you MUST configure the following settings across your platforms:

### 1. Supabase (Database & Auth)
- **SQL Migrations**: You must execute the SQL scripts in `supabase/migrations/` in order. 
  - *🚨 IMPORTANT BUG FIX*: If your project was already created, you **must run** the updated `005_enable_rls.sql` file again in your SQL Editor! It contains a critical `SECURITY DEFINER` function fix (`public.is_room_participant`) that resolves the `infinite recursion detected in policy for relation "participants"` error when creating chats!
- **Realtime**: Go to **Database** → **Replication** and turn it ON for the `messages` and `rooms` tables. If this is off, chat messages won't appear instantly.
- **Auth URL**: Go to **Authentication** → **URL Configuration**. Set the **Site URL** to your Netlify production URL (e.g., `https://your-app.netlify.app`).

### 2. Vercel (Backend API)
- **Root Directory**: When importing the project in Vercel, click Edit on Root Directory and change it from `./` to `server`.
- **Environment Variables**: You must add the following variables in the Vercel dashboard:
  - `SUPABASE_URL`: Your Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (found in API settings)
  - `FRONTEND_URL`: Your Netlify URL (e.g., `https://your-app.netlify.app`). This is required for CORS to allow the frontend to connect to the backend!

### 3. Netlify (Frontend)
- **Base Directory**: When importing, change the Base directory to `client`. Netlify will automatically detect Vite.
- **Environment Variables**: Add these in the Netlify dashboard:
  - `VITE_SUPABASE_URL`: Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
  - `VITE_API_URL`: Your deployed Vercel API URL (e.g., `https://your-api.vercel.app`). Do not include a trailing slash.

### 4. GitHub
- Ensure your repository contains both the `client` and `server` folders.
- Do not commit your `.env` files. Ensure they are listed in your `.gitignore` so your Supabase keys remain secure.
