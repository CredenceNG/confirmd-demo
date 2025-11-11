# Docker Deployment Guide

This guide explains how to deploy the NELFUND Demo application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- Git (for cloning the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nelfund-demo
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the following required variables:

```bash
# ConfirmD Platform Configuration
CONFIRMD_ORG_ID=your-actual-org-id
CONFIRMD_CLIENT_ID=your-actual-client-id
CONFIRMD_CLIENT_SECRET=your-actual-client-secret

# Database Configuration (for Docker)
DATABASE_URL=postgresql://nelfund:nelfund_password@db:5432/nelfund_demo

# Update credential definition IDs with your actual IDs
STUDENT_CARD_CRED_DEF_ID=your-actual-cred-def-id
# ... etc
```

### 3. Build and Start the Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check service status
docker-compose ps
```

### 4. Initialize the Database

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# (Optional) Seed the database
docker-compose exec app npx prisma db seed
```

### 5. Configure Cloudflare Tunnel (Optional)

If you want public HTTPS access via Cloudflare Tunnel:

1. **Ensure you have Cloudflare tunnel credentials** in `~/.cloudflared/c99d1116-58bd-443e-838f-9a62e2cbb01f.json`

2. **The tunnel is pre-configured** in `cloudflare-tunnel.docker.yml`:
   - Tunnel ID: `c99d1116-58bd-443e-838f-9a62e2cbb01f`
   - Hostname: `demo.confamd.com`
   - Routes to: `http://nelfund-demo:3300` (Docker network)

3. **Start with Cloudflare tunnel**:
   ```bash
   docker-compose up -d
   ```

4. **Access via public URL**:
   ```
   https://demo.confamd.com
   ```

**Note**: If you don't have Cloudflare tunnel configured, you can still run the app without it by removing the `cloudflared` service from docker-compose.yml or by using:

```bash
docker-compose up -d app db redis
```

### 6. Access the Application

**Local Access:**
```
http://localhost:3302
```

**Public Access (if Cloudflare tunnel is configured):**
```
https://demo.confamd.com
```

## Services

The Docker Compose configuration includes the following services:

### 1. **app** - Next.js Application
- Port: `3300` (mapped to `3302` on host)
- Runs the NELFUND demo application
- Connects to PostgreSQL database

### 2. **db** - PostgreSQL Database
- Port: `5432` (mapped to `5435` on host)
- Stores application data
- Persistent volume: `postgres_data`

### 3. **redis** - Redis Cache (Optional)
- Port: `6379` (mapped to `6380` on host)
- Session storage and caching
- Persistent volume: `redis_data`

### 4. **cloudflared** - Cloudflare Tunnel
- Provides public HTTPS access to the application
- Routes traffic from `demo.confamd.com` to the app container
- Requires Cloudflare tunnel credentials (see setup below)

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db
```

### Execute Commands

```bash
# Run Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate dev

# Access the application shell
docker-compose exec app sh

# Access PostgreSQL
docker-compose exec db psql -U nelfund -d nelfund_demo
```

### Rebuild Services

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build app
```

## Production Deployment

### 1. Update Environment Variables

```bash
# Set production environment
NODE_ENV=production

# Use strong passwords
POSTGRES_PASSWORD=<strong-random-password>

# Update database URL
DATABASE_URL=postgresql://nelfund:<strong-password>@db:5432/nelfund_demo
```

### 2. Enable HTTPS

For production, use a reverse proxy like Nginx or Traefik with SSL certificates:

```yaml
# Example Nginx configuration
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### 3. Resource Limits

Add resource limits to the docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 4. Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U nelfund nelfund_demo > backup.sql

# Restore backup
docker-compose exec -T db psql -U nelfund nelfund_demo < backup.sql
```

## Troubleshooting

### Application Won't Start

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Database connection failed
- Port 3300 already in use

### Database Connection Error

```bash
# Check database status
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Clear Everything and Start Fresh

```bash
# Stop all services
docker-compose down

# Remove volumes
docker volume rm nelfund-demo_postgres_data nelfund-demo_redis_data

# Rebuild and start
docker-compose up -d --build
```

## Development with Docker

### Hot Reload

For development with hot reload:

```yaml
# docker-compose.dev.yml
services:
  app:
    build:
      context: .
      target: deps  # Stop at deps stage
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### VS Code Integration

Install the Docker extension and use the Remote - Containers extension to develop inside the container.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `CONFIRMD_ORG_ID` | ConfirmD Organization ID | Yes |
| `CONFIRMD_CLIENT_ID` | OAuth2 Client ID | Yes |
| `CONFIRMD_CLIENT_SECRET` | OAuth2 Client Secret | Yes |
| `CONFIRMD_AUTH_URL` | OAuth2 Token URL | Yes |
| `CONFIRMD_BASE_URL` | ConfirmD Platform API URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `POSTGRES_USER` | Database username | Yes |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_DB` | Database name | Yes |
| `STUDENT_CARD_CRED_DEF_ID` | Student Card credential definition ID | No |
| `NYSC_GREEN_CARD_CRED_DEF_ID` | NYSC Green Card credential definition ID | No |
| `REDIS_URL` | Redis connection string | No |

## Health Checks

The services include health checks:

```bash
# Check health status
docker-compose ps

# Services should show "healthy" status
```

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for production databases
3. **Enable SSL/TLS** for production deployments
4. **Regularly update** Docker images
5. **Limit exposed ports** in production
6. **Use secrets management** for sensitive credentials

## Support

For issues or questions:
- Check the [main README](README.md)
- Review the [CLAUDE.md](CLAUDE.md) for architecture details
- Open an issue on GitHub
