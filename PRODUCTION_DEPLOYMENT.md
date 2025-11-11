# Production Deployment Guide

This guide covers the complete production deployment workflow using Docker containers.

## Quick Start

```bash
# 1. Build all containers
docker-compose build

# 2. Start all services (app, database, redis, cloudflare tunnel)
docker-compose up -d

# 3. Verify everything is running
docker-compose ps

# 4. Check logs
docker-compose logs -f
```

## Services Overview

The production deployment includes 4 containers:

| Service | Container Name | Purpose | Port Mapping |
|---------|---------------|---------|--------------|
| **app** | `nelfund-demo` | Next.js application | `3302:3300` |
| **db** | `nelfund-postgres` | PostgreSQL database | `5435:5432` |
| **redis** | `nelfund-redis` | Session storage & caching | `6380:6379` |
| **cloudflared** | `nelfund-cloudflared` | Cloudflare tunnel for webhooks | - |

## Access Points

- **Public URL**: https://demo.confamd.com (via Cloudflare tunnel)
- **Local Access**: http://localhost:3302
- **Database**: localhost:5435
- **Redis**: localhost:6380

## Development Workflow

### Making Code Changes

After making code changes, follow this workflow:

```bash
# 1. Stop all containers
docker-compose down

# 2. Rebuild the app container
docker-compose build app

# 3. Start all services
docker-compose up -d

# 4. Check logs to verify
docker-compose logs -f app
```

### Quick Restart (no code changes)

If you only need to restart services without rebuilding:

```bash
docker-compose restart app
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f cloudflared
docker-compose logs -f db
```

## Cloudflare Tunnel

The containerized Cloudflare tunnel:
- **Routes traffic** from `https://demo.confamd.com` → `http://nelfund-demo:3300` (Docker network)
- **Enables webhooks** from ConfirmD Platform
- **Auto-restarts** if connection drops
- **Configuration**: `cloudflare-tunnel.docker.yml`

### Verify Tunnel Status

```bash
# Check tunnel logs
docker-compose logs cloudflared

# Should see: "Registered tunnel connection" messages
```

### Test Public Access

```bash
curl -I https://demo.confamd.com/
# Should return: HTTP/2 200
```

## Database Management

### Run Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

### Access Database

```bash
# Via psql in container
docker-compose exec db psql -U nelfund -d nelfund_demo

# Via external tool
Host: localhost
Port: 5435
User: nelfund
Password: nelfund_password
Database: nelfund_demo
```

### Backup Database

```bash
docker-compose exec db pg_dump -U nelfund nelfund_demo > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U nelfund nelfund_demo < backup.sql
```

## Troubleshooting

### Containers Won't Start

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs

# Restart specific service
docker-compose restart app
```

### Webhooks Not Received

1. **Check tunnel status**:
   ```bash
   docker-compose logs cloudflared | grep "Registered"
   ```
   Should see 4 registered connections.

2. **Test public URL**:
   ```bash
   curl https://demo.confamd.com/api/health
   ```

3. **Check app logs**:
   ```bash
   docker-compose logs -f app
   ```

### Port Already in Use

```bash
# Find process using port 3302
lsof -i :3302

# Kill process
kill -9 <PID>

# Restart containers
docker-compose up -d
```

### Fresh Start (Clean Slate)

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## Environment Variables

Key environment variables for production (in `.env`):

```bash
# ConfirmD Platform
CONFIRMD_ORG_ID=your-org-id
CONFIRMD_CLIENT_ID=your-client-id
CONFIRMD_CLIENT_SECRET=your-client-secret
CONFIRMD_AUTH_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_BASE_URL=https://platform.confamd.com

# Database (Docker)
DATABASE_URL=postgresql://nelfund:nelfund_password@db:5432/nelfund_demo

# Credential Definition IDs
STATEMENT_OF_RESULTS_CRED_DEF_ID=your-cred-def-id
NYSC_CERTIFICATE_CRED_DEF_ID=your-cred-def-id
# ... etc
```

## Performance Monitoring

### Check Resource Usage

```bash
docker stats
```

### View Container Metrics

```bash
docker-compose ps
```

### Check Tunnel Metrics

Cloudflare tunnel exposes metrics at `http://localhost:20241/metrics` inside the container.

## Security Best Practices

1. **Never commit** `.env` file to version control
2. **Use strong passwords** for production databases
3. **Rotate credentials** regularly
4. **Monitor logs** for suspicious activity
5. **Keep containers updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Production Checklist

Before deploying to production:

- [ ] Update `.env` with production credentials
- [ ] Set strong database passwords
- [ ] Configure credential definition IDs
- [ ] Test webhook delivery
- [ ] Verify tunnel connectivity
- [ ] Run database migrations
- [ ] Test all demo flows
- [ ] Monitor logs for errors
- [ ] Set up backup schedule
- [ ] Document recovery procedures

## Additional Resources

- [Docker Deployment Guide](DOCKER.md) - Detailed Docker setup
- [Cloudflare Tunnel Guide](CLOUDFLARE_TUNNEL.md) - Tunnel configuration
- [Architecture Guide](CLAUDE.md) - System architecture

## Support

For issues or questions:
- Check service logs: `docker-compose logs -f`
- Verify tunnel status: `docker-compose logs cloudflared`
- Test connectivity: `curl https://demo.confamd.com/`
