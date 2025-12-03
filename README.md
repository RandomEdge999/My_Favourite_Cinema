# Liquid Cinema

A modern, fluid movie tracking application built with Next.js, Tailwind CSS, and Supabase.

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with your API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=
```

### 2. Database Setup (Supabase)

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy the contents of `supabase/schema.sql` and run it.
    *   This creates the `top10` and `watched` tables.
    *   It enables **Row Level Security (RLS)** so users can only manage their own data.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛠 Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Tailwind CSS + Framer Motion
*   **Backend**: Supabase (Auth & Database)
*   **Data**: TMDB API

## Deployment

This project is ready for Vercel.

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add the Environment Variables in Vercel Settings.
4.  Deploy.
