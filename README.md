# LaborLog - Labor Management & Payroll System

A modern, responsive web application for managing laborers, work sites, attendance, salary, and payments. Built with Next.js 16, Prisma ORM, and Tailwind CSS.

## Features

- **Dashboard** - Overview of workforce, attendance, and financial metrics
- **Labor Management** - Full CRUD for employee records with status tracking
- **Work Sites** - Manage project locations and assign workers
- **Attendance Tracking** - Daily attendance with bulk marking functionality
- **Payments & Salary** - Track advances, salary payments, and bonuses
- **Money Ledger** - Per-labor financial ledger with balance calculations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js Server Actions |
| Database | Prisma ORM + PostgreSQL (production) / SQLite (development) |
| UI | Custom components with glassmorphism design |

---

## Local Development

### Prerequisites
- Node.js 20+ installed
- npm package manager

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd labor-log

# 2. Install dependencies
npm install

# 3. Set up environment (for local SQLite development)
cp .env.example .env
# Edit .env and set: DATABASE_URL="file:./dev.db"

# 4. Update schema for SQLite (local dev only)
# In prisma/schema.prisma, change provider to "sqlite"

# 5. Push database schema
npx prisma db push

# 6. Seed sample data
npx prisma db seed

# 7. Start development server
npm run dev

# 8. Open browser
# http://localhost:3000
```

---

## 🚀 Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repository
5. Render will detect `render.yaml` and set up everything automatically

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Fill in:
   - **Name:** `laborlog-db`
   - **Region:** Oregon (or your preferred)
   - **Plan:** Free
4. Click **Create Database**
5. Wait for creation, then copy the **External Database URL**

#### Step 2: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `labor-log`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

#### Step 3: Set Environment Variables

In the web service settings, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (paste your PostgreSQL connection string) |
| `DIRECT_URL` | (same as DATABASE_URL) |
| `NODE_VERSION` | `20.10.0` |

#### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for the build to complete (5-10 minutes)
3. Your app will be live at `https://labor-log.onrender.com`

#### Step 5: Seed Production Data (Optional)

After deployment, you can seed data via Render Shell:
```bash
npx prisma db seed
```

---

## Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name <migration-name>

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (deletes all data)
npx prisma migrate reset

# Push schema changes (no migration)
npx prisma db push
```

---

## Project Structure

```
labor-log/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Sample data seeding
│   └── migrations/        # Database migrations
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── actions/           # Server actions
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript definitions
├── render.yaml            # Render Blueprint config
└── render-build.sh        # Render build script
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Direct database connection | Same as DATABASE_URL |
| `NODE_VERSION` | Node.js version for Render | `20.10.0` |

---

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ using Next.js and Prisma
