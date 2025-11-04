# Development Guide

This guide covers common development tasks and best practices for the Nelfund Demo dashboard.

## Development Workflow

### Starting Development

```bash
# Start the dev server
npm run dev

# In another terminal, open Prisma Studio to view/edit data
npx prisma studio
```

## Adding a New Page

### 1. Create the Page File

Create a new directory and page file:

```bash
mkdir -p src/app/dashboard/your-page
touch src/app/dashboard/your-page/page.tsx
```

### 2. Add the Component

```typescript
// src/app/dashboard/your-page/page.tsx
export default function YourPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Page</h1>
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Content</h3>
        </div>
        <div className="card-body">
          <p>Your content here</p>
        </div>
      </div>
    </div>
  );
}
```

### 3. Add to Sidebar Navigation

Edit [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx):

```typescript
const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
  { href: "/dashboard/posts", label: "Posts", icon: "📝" },
  { href: "/dashboard/your-page", label: "Your Page", icon: "🎯" }, // Add this
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];
```

## Working with the Database

### Adding a New Model

1. Edit [prisma/schema.prisma](prisma/schema.prisma):

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Create and apply migration:

```bash
npx prisma migrate dev --name add_category_model
```

3. Use in your code:

```typescript
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany();

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### Querying Data

Common Prisma queries:

```typescript
// Find all
const users = await prisma.user.findMany();

// Find with filter
const admins = await prisma.user.findMany({
  where: { role: "admin" }
});

// Find with relations
const posts = await prisma.post.findMany({
  include: { author: true }
});

// Create
const user = await prisma.user.create({
  data: {
    email: "new@example.com",
    name: "New User"
  }
});

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Updated Name" }
});

// Delete
await prisma.user.delete({
  where: { id: 1 }
});
```

## Creating API Routes

Next.js App Router uses Route Handlers for APIs.

### Example: Create User API

Create [src/app/api/users/route.ts](src/app/api/users/route.ts):

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// POST /api/users
export async function POST(request: Request) {
  const data = await request.json();
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
    }
  });
  return NextResponse.json(user, { status: 201 });
}
```

### Using the API from Client Components

```typescript
"use client";

import { useState } from "react";

export default function UserForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: "New User" })
    });

    if (response.ok) {
      const user = await response.json();
      console.log("Created:", user);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Create User</button>
    </form>
  );
}
```

## Styling

### Using Tailwind Classes

The project uses Tailwind CSS. Common patterns:

```typescript
// Card
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
</div>

// Button
<button className="btn-primary">Click Me</button>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* items */}
</div>

// Flex
<div className="flex items-center justify-between">
  {/* content */}
</div>
```

### Custom Styles

Add custom styles to [src/app/globals.css](src/app/globals.css):

```css
.my-custom-class {
  /* your styles */
}
```

## TypeScript Tips

### Type Safety with Prisma

Prisma generates types automatically:

```typescript
import { User, Post } from "@prisma/client";

// Type for user with posts
type UserWithPosts = User & {
  posts: Post[];
};

const user: UserWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
});
```

### Component Props

```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}
```

## Common Issues

### Database Locked Error

SQLite can lock during development. Solution:

```bash
# Stop dev server
# Delete database
rm prisma/dev.db

# Recreate
npx prisma migrate dev --name init
npx prisma db seed
```

### Type Errors After Schema Changes

Regenerate Prisma Client:

```bash
npx prisma generate
```

### Port Already in Use

Change the port:

```bash
npm run dev -- -p 3001
```

## Best Practices

1. **Server vs Client Components**
   - Use Server Components by default
   - Only add `"use client"` when you need interactivity

2. **Data Fetching**
   - Fetch data in Server Components
   - Use React Server Actions for mutations

3. **Error Handling**
   - Wrap database calls in try-catch
   - Show user-friendly error messages

4. **Performance**
   - Use Prisma's `select` to fetch only needed fields
   - Implement pagination for large lists
   - Use `findUnique` instead of `findFirst` when possible

5. **Security**
   - Validate user input
   - Use environment variables for sensitive data
   - Implement authentication before production

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
