# Femifunmi Charity Website

Full-stack charity organization website for **Femi & Funmi Charity Organisation** built with:

- Public website: React + TypeScript + Vite + Tailwind CSS
- Admin website: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript

## Project structure

- `client/` public React web app
- `admin/` separate admin React web app
- `server/` Express API

## Quick start

1. Install root tooling:

```bash
npm install
```

2. Install frontend and backend dependencies:

```bash
npm run install:all
```

3. Create env files:

- `server/.env` (copy from `server/.env.example`)
- `client/.env` (copy from `client/.env.example`)
- `admin/.env` (copy from `admin/.env.example`)

4. Run app:

```bash
npm run dev
```

- Public site runs on `http://localhost:5173`
- Admin site runs on `http://localhost:5174`
- Backend runs on `http://localhost:4000`

## Admin access

- Open `http://localhost:5174`
- Enter the same admin key value as `ADMIN_KEY` in `server/.env`

## Content included

- Home, About, Gallery, Donations, Contact sections
- Organization details, social links, mission statements
- Contact form API integration
- Donation case listing with backend-managed content
