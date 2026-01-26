# LaborLog - Labor Management & Payroll System

A modern, responsive web application for managing laborers, work sites, attendance, salary, and payments. Built with Next.js 15, Prisma ORM, and Tailwind CSS.

![Dashboard Preview](docs/dashboard.png)

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
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js Server Actions |
| Database | Prisma ORM + SQLite (easily switchable to PostgreSQL) |
| UI | Custom components with glassmorphism design |

## Project Structure

```
labor-log/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data seeding
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── labors/        # Labor management
│   │   ├── sites/         # Work site management
│   │   ├── attendance/    # Attendance tracking
│   │   ├── payments/      # Payment management
│   │   └── ledger/        # Financial ledger
│   ├── actions/           # Server actions
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   └── forms/         # Form components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript definitions
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd labor-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (deletes all data)
npx prisma migrate reset

# Push schema changes (without migration)
npx prisma db push
```

## Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/laborlog?schema=public"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## API Structure

All data operations use Next.js Server Actions:

| Module | Actions |
|--------|---------|
| `labors.ts` | getLabors, getLaborById, createLabor, updateLabor, deleteLabor |
| `sites.ts` | getSites, getSiteById, createSite, updateSite, deleteSite |
| `attendance.ts` | getAttendanceByDate, saveAttendance, bulkSaveAttendance |
| `payments.ts` | getPayments, createPayment, updatePayment, deletePayment |
| `ledger.ts` | getLaborLedger, getAllLaborsBalance |
| `dashboard.ts` | getDashboardStats, getRecentActivities |

## Future Enhancements

- [ ] Add authentication (NextAuth.js)
- [ ] Export reports to PDF/Excel
- [ ] Multi-tenant support
- [ ] Mobile app with React Native
- [ ] Email/SMS notifications
- [ ] Overtime and leave management

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ using Next.js and Prisma
