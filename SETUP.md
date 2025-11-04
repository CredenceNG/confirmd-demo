# Quick Setup Guide

This guide will help you get the Nelfund Demo dashboard up and running in minutes.

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Create database and run migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You'll See

The dashboard includes:

- **Dashboard Home** (`/dashboard`) - Statistics and recent activity
- **Users Page** (`/dashboard/users`) - User management with sample data
- **Posts Page** (`/dashboard/posts`) - Content management
- **Settings Page** (`/dashboard/settings`) - Configuration options

## Sample Data

After seeding, you'll have:

- 3 sample users:
  - admin@example.com (Admin)
  - john.doe@example.com (User)
  - jane.smith@example.com (User)

- 5 sample posts (mix of published and drafts)

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Reset database (careful - deletes all data!)
npx prisma migrate reset

# Check code quality
npm run lint

# Build for production
npm run build
```

## Next Steps

1. Explore the code in `src/app/dashboard/`
2. Modify the database schema in `prisma/schema.prisma`
3. Customize components in `src/components/layout/`
4. Add your own pages and features

## Need Help?

Check the main [README.md](./README.md) for detailed documentation.
