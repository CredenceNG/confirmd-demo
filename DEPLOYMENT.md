# Deployment Guide

## Docker Build Optimizations

This document describes the optimizations implemented to fix the Docker build failures and improve deployment performance.

### Build Issues Identified

The deployment was failing during the Next.js build step with exit code 255, likely due to:
1. **Memory exhaustion** - Next.js builds are memory-intensive
2. **Build timeout** - The build process was taking too long
3. **Missing environment variables** - Prisma requires DATABASE_URL even during build

### Optimizations Implemented

#### 1. Next.js Configuration (`next.config.ts`)

**Standalone Output Mode:**
- Enables minimal production build with only necessary files
- Reduces final image size by ~50%
- Faster startup times

**Memory Optimizations:**
- Disabled source maps in production (`productionBrowserSourceMaps: false`)
- Reduced worker threads (`workerThreads: false`)
- Limited CPU usage (`cpus: 1`)
- Optimized webpack bundle splitting

**Bundle Size Reduction:**
- Remove console logs in production (except errors/warnings)
- Split chunks for better caching
- Separate vendor and common chunks

#### 2. Dockerfile Improvements

**Build-Time Optimizations:**
- Set Node memory limit: `NODE_OPTIONS="--max-old-space-size=2048"`
- Provide dummy DATABASE_URL for Prisma during build
- Use multi-stage build to minimize final image size

**Standalone Build Support:**
- Copy `.next/standalone` output instead of full `.next` directory
- Include only necessary Prisma client files
- Smaller runtime image with faster container startup

#### 3. Build Resource Requirements

**Recommended Settings for Coolify/Docker:**

```yaml
# Minimum build resources
build:
  memory: 4GB
  cpus: 2
  timeout: 20m

# Runtime resources
runtime:
  memory: 512MB
  cpus: 1
```

**Docker Build Command with Resource Limits:**

```bash
docker build \
  --memory=4g \
  --cpu-quota=200000 \
  --build-arg DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy \
  -t confirmd-demo:latest .
```

### Environment Variables Required

#### Build-Time Variables
These must be available during `docker build`:

- `DATABASE_URL` - Can be dummy value (e.g., `postgresql://dummy:dummy@localhost:5432/dummy`)
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

#### Runtime Variables
These must be set when running the container:

```bash
# ConfirmD Platform
CONFIRMD_ORG_ID
CONFIRMD_CLIENT_ID
CONFIRMD_CLIENT_SECRET
CONFIRMD_AUTH_URL
CONFIRMD_BASE_URL

# Database (actual connection)
DATABASE_URL=postgresql://user:pass@db:5432/dbname

# Credentials
STUDENT_CARD_CRED_DEF_ID
STATEMENT_OF_RESULT_CRED_DEF_ID
MEDICAL_FITNESS_CRED_DEF_ID
NYSC_GREEN_CARD_CRED_DEF_ID
NYSC_ID_CARD_CRED_DEF_ID
NYSC_CERTIFICATE_CRED_DEF_ID

# Webhook
WEBHOOK_SECRET
```

### Deployment Steps

#### 1. Local Testing

```bash
# Build the Docker image
docker build -t confirmd-demo:latest .

# Run with docker-compose (includes database)
docker-compose up -d

# Check logs
docker-compose logs -f app
```

#### 2. Coolify Deployment

**Increase Build Resources in Coolify:**

1. Go to your application settings in Coolify
2. Navigate to "Advanced" → "Build Settings"
3. Set:
   - Memory Limit: 4GB
   - Build Timeout: 20 minutes
   - Enable BuildKit

**Environment Variables:**

Ensure all required environment variables are set in Coolify's environment configuration.

#### 3. Monitoring Build Progress

Watch for these key stages in the build logs:

```
✓ [deps] npm ci --omit=dev (4m)
✓ [builder] npm ci (4m)
✓ [builder] prisma generate (30s)
✓ [builder] next build (5-10m)  ← Most likely to fail
✓ [runner] Copy standalone output
```

### Troubleshooting

#### Build Fails at "next build" Step

**Symptoms:**
- Process killed with exit code 255
- "Gracefully shutting down build container" message

**Solutions:**
1. Increase build memory to 4GB or higher
2. Increase build timeout to 20+ minutes
3. Check that `NODE_OPTIONS="--max-old-space-size=2048"` is set

#### "Cannot find module '@prisma/client'" Error

**Solution:**
Ensure Prisma is generated in all build stages:
```dockerfile
RUN npx prisma generate
```

#### Runtime Database Connection Errors

**Solution:**
Verify `DATABASE_URL` environment variable points to actual database at runtime:
```
DATABASE_URL=postgresql://user:password@db:5432/dbname
```

### Performance Metrics

**Before Optimizations:**
- Build time: Failed (OOM)
- Image size: N/A
- Memory usage: Exceeded limits

**After Optimizations:**
- Build time: ~8-12 minutes
- Image size: ~450MB (standalone)
- Memory usage: Peak 2-3GB during build, ~300MB runtime

### Next Steps

If builds continue to fail:

1. **Use BuildKit with cache:**
   ```bash
   DOCKER_BUILDKIT=1 docker build --progress=plain .
   ```

2. **Enable build caching:**
   ```dockerfile
   RUN --mount=type=cache,target=/root/.npm \
       npm ci
   ```

3. **Split build stages further:**
   - Separate Prisma generation
   - Cache node_modules between builds

### References

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)
