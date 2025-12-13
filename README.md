# Credence Confirmd Demo - Student Registration Platform

Demo application to demostrate the various features of the Confirmd Platform with ConfirmD digital wallet integration, built with Next.js 15, TypeScript, Prisma, SQLite, and Tailwind CSS. Features real-time connection notifications via WebSockets and webhooks.

## Features

- **Next.js 15** with App Router and Custom Server
- **TypeScript** for type-safe code
- **Prisma ORM** with SQLite database
- **Tailwind CSS** for styling
- **ConfirmD Platform Integration** - Digital wallet connections
- **Real-time WebSocket Notifications** - Instant connection status updates
- **Webhook Infrastructure** - Secure event handling from ConfirmD Platform
- **Dual-key Session Matching** - Smart session tracking with multi-use invitations
- AdminLTE-inspired dashboard layout
- Student registration workflow
- Sample database models and seed data
- ESLint for code quality

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Linting**: ESLint

## Project Structure

```
nelfund-demo/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data script
│   └── dev.db                 # SQLite database (generated)
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Dashboard layout with sidebar
│   │   │   ├── page.tsx       # Dashboard home page
│   │   │   ├── users/         # Users management page
│   │   │   ├── posts/         # Posts management page
│   │   │   └── settings/      # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Root page (redirects to dashboard)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx    # Navigation sidebar
│   │       ├── Navbar.tsx     # Top navigation bar
│   │       └── Footer.tsx     # Footer component
│   └── lib/
│       └── prisma.ts          # Prisma client instance
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.18 or higher
- npm or yarn

### Installation

1. **Clone the repository** (or use this as a template):

```bash
git clone https://github.com/CredenceNG/nelfund-demo.git
cd nelfund-demo
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up the database**:

Create and run database migrations:

```bash
npx prisma migrate dev --name init
```

This will:

- Create the SQLite database file
- Apply the schema migrations
- Generate Prisma Client

4. **Seed the database** (optional but recommended):

```bash
npx prisma db seed
```

This will populate the database with sample users and posts.

5. **Start the development server**:

```bash
npm run dev
```

6. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create a new migration
- `npx prisma db seed` - Seed the database with sample data

## Database Schema

The application includes two main models:

### User Model

- `id`: Auto-incrementing integer
- `email`: Unique email address
- `name`: Optional user name
- `role`: User role (default: "user")
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `posts`: Relation to Post model

### Post Model

- `id`: Auto-incrementing integer
- `title`: Post title
- `content`: Optional post content
- `published`: Boolean (default: false)
- `author`: Relation to User model
- `authorId`: Foreign key to User
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Customization

### Changing the Database

To use a different database (PostgreSQL, MySQL, etc.):

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // or "mysql", "mongodb", etc.
  url      = env("DATABASE_URL")
}
```

2. Update `.env` with your database connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations:

```bash
npx prisma migrate dev --name init
```

### Adding New Pages

1. Create a new directory in `src/app/dashboard/`
2. Add a `page.tsx` file with your component
3. The route will be automatically available

### Modifying the Sidebar

Edit `src/components/layout/Sidebar.tsx` to add or remove menu items:

```typescript
const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
  // Add more items here
];
```

## Styling

The project uses Tailwind CSS with custom AdminLTE-inspired styles. Global styles are in `src/app/globals.css`.

### Custom CSS Classes

- `.card` - Card container
- `.card-header` - Card header section
- `.card-body` - Card body section
- `.btn-primary` - Primary button style
- `.sidebar` - Sidebar styling
- `.sidebar-link` - Sidebar link styling

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

## Production Deployment

1. Build the application:

```bash
npm run build
```

2. Set up your production database:

```bash
npx prisma migrate deploy
```

3. Start the production server:

```bash
npm start
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note**: For production, consider using PostgreSQL or MySQL instead of SQLite.

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Reset the database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

### Node Version Issues

Ensure you're using Node.js 18.18 or higher:

```bash
node --version
```

If using nvm:

```bash
nvm use 18
```

## ConfirmD Integration Documentation

Complete documentation for integrating verifiable credential proof requests with the ConfirmD Platform.

### 🚀 Quick Start

- **[QUICKSTART.md](docs/QUICKSTART.md)** - Get your integration running in 30 minutes
  - Step-by-step setup guide
  - Essential code snippets
  - Testing your first connection
  - Common troubleshooting tips

### 📖 Comprehensive Guides

#### Main Integration Guide

- **[CONFIRMD_INTEGRATION_GUIDE.md](docs/CONFIRMD_INTEGRATION_GUIDE.md)** - Complete integration reference
  - Architecture overview and component diagrams
  - Core concepts (connections, proofs, attributes)
  - Phase-by-phase implementation
  - Full code examples for all components
  - Common pitfalls and solutions
  - Production deployment checklist

#### API Reference

- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Quick API lookup
  - All ConfirmD Platform endpoints
  - Request/response examples
  - Webhook payload structures
  - Database schema definitions
  - Error codes and troubleshooting
  - Testing commands

### 🔑 Key Integration Features

#### 1. Connection Establishment

```
Your App → Create Invitation → Generate QR Code →
User Scans → Webhook Received → Connection Active
```

#### 2. Proof Request & Verification

```
Request Proof → User Presents Credentials →
Verify Proof → Extract Attributes → Save to Database
```

#### 3. Attribute Extraction

**Critical Implementation Detail**: The ConfirmD Platform returns attributes where each array element contains ONE attribute:

```typescript
// Response structure:
[
  { admission_number: "123", schemaId: "...", credDefId: "..." },
  { programme: "CS", schemaId: "...", credDefId: "..." },
];

// Must iterate and merge:
const attributes = {};
data.forEach((item) => {
  const { schemaId, credDefId, ...attr } = item;
  Object.assign(attributes, attr);
});
```

#### 4. Real-Time Updates (Optional)

The platform includes WebSocket support for real-time connection status updates:

- **[REAL_TIME_NOTIFICATIONS_GUIDE.md](docs/REAL_TIME_NOTIFICATIONS_GUIDE.md)** - WebSocket implementation
- **[SESSION_MATCHING_FIX.md](docs/SESSION_MATCHING_FIX.md)** - Dual-key tracking system
- **[WEBSOCKET_IMPLEMENTATION.md](docs/WEBSOCKET_IMPLEMENTATION.md)** - Technical details

### 📋 Integration Checklist

- [ ] Obtain ConfirmD Platform credentials (Org ID, Client ID/Secret)
- [ ] Configure environment variables
- [ ] Set up database schema (Prisma)
- [ ] Create `config/proof-attributes.json` with your credential attributes
- [ ] Implement OAuth2 authentication service
- [ ] Create API client for ConfirmD Platform
- [ ] Build connection session management
- [ ] Implement proof request logic
- [ ] Set up webhook endpoint (public HTTPS required)
- [ ] Handle webhook events (connection, proof)
- [ ] Extract and store verified attributes
- [ ] Build frontend UI (QR code, status updates)
- [ ] Test end-to-end flow
- [ ] Deploy to production

### 🔧 Core Components

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React/Next.js)                           │
│  - Connection UI with QR codes                      │
│  - Real-time status updates                         │
│  - Form pre-fill with verified data                 │
├─────────────────────────────────────────────────────┤
│  API Routes                                          │
│  - /api/connections/session                         │
│  - /api/proofs/request                              │
│  - /api/proofs/verify                               │
│  - /api/webhooks/confirmd                           │
├─────────────────────────────────────────────────────┤
│  Services                                            │
│  - OAuth2 Auth (confirmd-auth.ts)                   │
│  - API Client (confirmd-client.ts)                  │
│  - Proof Config (proof-config.ts)                   │
├─────────────────────────────────────────────────────┤
│  Database (Prisma)                                   │
│  - ConnectionSession                                 │
│  - ProofRequest                                      │
│  - WebhookEvent                                      │
└─────────────────────────────────────────────────────┘
                    ↕
            ConfirmD Platform API
```

### 🎯 Use Cases

This integration enables:

- **Student verification** for loan applications (NELFUND use case)
- **Employee credential** verification for onboarding
- **Certificate verification** for professional services
- **Identity verification** for KYC processes
- **Academic credential** verification for admissions
- Any scenario requiring verifiable digital credentials

### 🐛 Common Issues & Solutions

| Issue                      | Solution                                     |
| -------------------------- | -------------------------------------------- |
| Only 1 attribute extracted | Use `forEach` to iterate ALL array items     |
| Webhooks not received      | Expose public HTTPS endpoint (ngrok for dev) |
| Connection timeout         | Increase timeout, check wallet connectivity  |
| 401 Unauthorized           | Verify OAuth2 credentials, check token cache |
| Missing attributes         | Ensure attribute names match config file     |

### 📚 Additional Resources

- **[WEBHOOK_IMPLEMENTATION.md](docs/WEBHOOK_IMPLEMENTATION.md)** - Webhook setup details
- **[WEBHOOK_SETUP_GUIDE.md](docs/WEBHOOK_SETUP_GUIDE.md)** - Webhook registration
- [ConfirmD Platform Documentation](https://docs.confirmd.com)
- [Verifiable Credentials W3C Spec](https://www.w3.org/TR/vc-data-model/)
- [Hyperledger AnonCreds Spec](https://hyperledger.github.io/anoncreds-spec/)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [ConfirmD Platform Documentation](https://docs.confirmd.com)

## License

ISC

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/CredenceNG/nelfund-demo/issu
