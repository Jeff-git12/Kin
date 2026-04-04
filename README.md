# KIN

KIN is a trust-first digital community center where neighbors can connect, share useful updates, and recommend people they trust.

This app is built with Next.js App Router, TypeScript, Tailwind, and Supabase.

## What KIN includes today

- Auth: sign up, log in, onboarding, and profile editing
- Profile avatars with Supabase Storage
- Town Square feed with text + optional image posts
- Trusted Services directory with category filters and community recommendations

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (Auth, Postgres, Storage)

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up Supabase tables/policies:

- Run `docs/service-listings-setup.sql`
- Run `docs/storage-setup-avatars.sql`
- Review `docs/kin-data-model.md` for full schema and policy notes

4. Start the app:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - create production build
- `npm run start` - run production server

## Trusted Services categories

Current listing categories:

- What's new around town
- Contractors
- Tutors
- Babysitters
- Accountants
- Restaurants
- Vets
- House cleaners
- Dog walkers

The browse filters are client-side, and signed-in users can post new listings from the same category set.

## Project structure

- `src/app` - routes and page UI
- `src/app/components` - reusable UI/form components
- `src/app/lib` - Supabase and storage helpers
- `docs` - SQL setup and data model notes

## Deployment

Deploy to Vercel (or any Node host that supports Next.js) and provide the same Supabase environment variables used locally.
