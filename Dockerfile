# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev && \
    npx prisma generate

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files for builder
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci && \
    npx prisma generate

# Copy source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Set Node memory limit to prevent OOM during build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Set dummy DATABASE_URL for Prisma during build (not used, but required)
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (includes only necessary files)
# Standalone output includes server.js, node_modules, config, and .next/server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# If standalone created nested directory structure, flatten it
RUN if [ -d "_confirmd/confirmd-demo" ]; then \
      cp -r _confirmd/confirmd-demo/* . && \
      cp -r _confirmd/confirmd-demo/.next . && \
      rm -rf _confirmd; \
    fi

# Ensure Prisma client is available (standalone should include it, but we copy as fallback)
RUN if [ ! -d "node_modules/.prisma" ]; then \
      echo "Warning: Prisma client not found in standalone, copying from builder..."; \
      mkdir -p node_modules/.prisma node_modules/@prisma; \
    fi

COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3300

ENV PORT=3300
ENV HOSTNAME="0.0.0.0"

# Start the application with custom server
CMD ["node", "server.js"]
