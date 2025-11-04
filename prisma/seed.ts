import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'user',
      },
    }),
  ])

  console.log(`Created ${users.length} users`)

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with Next.js',
        content: 'Learn how to build modern web applications with Next.js...',
        published: true,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Introduction to Prisma',
        content: 'Prisma is a next-generation ORM that makes working with databases easy...',
        published: true,
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'TypeScript Best Practices',
        content: 'Discover the best practices for writing TypeScript code...',
        published: false,
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Building Admin Dashboards',
        content: 'Learn how to create beautiful and functional admin dashboards...',
        published: true,
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Database Design Tips',
        content: 'Important considerations when designing your database schema...',
        published: false,
        authorId: users[2].id,
      },
    }),
  ])

  console.log(`Created ${posts.length} posts`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
