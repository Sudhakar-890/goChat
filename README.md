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
