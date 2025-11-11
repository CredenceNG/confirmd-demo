# Cloudflare Tunnel Configuration

This document explains the Cloudflare Tunnel setup for the ConfirmD Demo application.

## Overview

The application uses Cloudflare Tunnel to provide secure public HTTPS access without exposing ports or configuring firewalls. This is essential for receiving webhooks from the ConfirmD Platform.

## Configuration Files

### 1. `cloudflare-tunnel.yml` - Local Development

Used when running the dev server directly on the host machine:

```yaml
tunnel: c99d1116-58bd-443e-838f-9a62e2cbb01f
credentials-file: /Users/itopa/.cloudflared/c99d1116-58bd-443e-838f-9a62e2cbb01f.json

ingress:
  - hostname: demo.confamd.com
    service: http://localhost:3300  # Routes to host machine
  - service: http_status:404
```

**Usage:**
```bash
cloudflared tunnel run confirmd-demo
```

### 2. `cloudflare-tunnel.docker.yml` - Docker Deployment

Used when running the application in Docker containers:

```yaml
tunnel: c99d1116-58bd-443e-838f-9a62e2cbb01f
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: demo.confamd.com
    service: http://nelfund-demo:3300  # Routes to Docker container
  - service: http_status:404
```

**Usage:**
```bash
docker-compose up -d cloudflared
```

## Tunnel Details

- **Tunnel ID**: `c99d1116-58bd-443e-838f-9a62e2cbb01f`
- **Tunnel Name**: `confirmd-demo`
- **Public URL**: `https://demo.confamd.com`
- **Internal Port**: `3300`

## Setup Instructions

### For Local Development

1. **Ensure tunnel credentials exist**:
   ```bash
   ls ~/.cloudflared/c99d1116-58bd-443e-8aaf-9a62e2cbb01f.json
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   # Server runs on http://localhost:3300
   ```

3. **Start the tunnel**:
   ```bash
   cloudflared tunnel run confirmd-demo
   ```

4. **Verify tunnel is working**:
   ```bash
   curl https://demo.confamd.com/
   ```

### For Docker Deployment

1. **Ensure tunnel credentials exist**:
   ```bash
   ls ~/.cloudflared/c99d1116-58bd-443e-838f-9a62e2cbb01f.json
   ```

2. **Start all services** (including tunnel):
   ```bash
   docker-compose up -d
   ```

3. **Check tunnel status**:
   ```bash
   docker-compose logs cloudflared
   ```

4. **Verify tunnel is working**:
   ```bash
   curl https://demo.confamd.com/
   ```

## Why We Need This

### Webhook Delivery

The ConfirmD Platform sends webhooks to notify the application about:
- Connection status changes
- Proof request responses
- Credential issuance updates

**Without a public URL**, the Platform cannot send these webhooks, and the application won't receive real-time updates.

### Benefits of Cloudflare Tunnel

1. **No Port Forwarding**: Works behind NAT/firewalls
2. **Automatic HTTPS**: Free SSL/TLS certificates
3. **DDoS Protection**: Cloudflare's security features
4. **Easy Setup**: No complex networking configuration
5. **Development Friendly**: Works on localhost

## Troubleshooting

### Tunnel Won't Start

**Error**: `Tunnel credentials file doesn't exist`

**Solution**: Ensure the credentials file path matches your system:
```bash
# Check if file exists
ls ~/.cloudflared/c99d1116-58bd-443e-838f-9a62e2cbb01f.json

# Update path in cloudflare-tunnel.yml if needed
```

### Webhooks Not Received

**Check tunnel status**:
```bash
# For local development
ps aux | grep cloudflared

# For Docker
docker-compose ps cloudflared
docker-compose logs cloudflared
```

**Check tunnel connections**:
```bash
cloudflared tunnel info confirmd-demo
```

**Verify public URL is accessible**:
```bash
curl https://demo.confamd.com/api/health
```

### Wrong Routing

**Symptom**: Tunnel runs but webhooks don't reach the application

**Causes**:
1. Using `cloudflare-tunnel.yml` (localhost) when running in Docker
2. Using `cloudflare-tunnel.docker.yml` (container) when running on host

**Solution**:
- **Local dev**: Use `cloudflare-tunnel.yml` → routes to `http://localhost:3300`
- **Docker**: Use `cloudflare-tunnel.docker.yml` → routes to `http://nelfund-demo:3300`

### Multiple Tunnels Running

**Check for duplicate tunnels**:
```bash
ps aux | grep cloudflared
```

**Kill old tunnels**:
```bash
pkill cloudflared
# Or for specific process
kill <PID>
```

## Docker Compose Integration

The `docker-compose.yml` includes the tunnel service:

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: nelfund-cloudflared
    command: tunnel --config /etc/cloudflared/config.yml run confirmd-demo
    volumes:
      - ./cloudflare-tunnel.docker.yml:/etc/cloudflared/config.yml:ro
      - ${HOME}/.cloudflared/c99d1116-58bd-443e-838f-9a62e2cbb01f.json:/etc/cloudflared/credentials.json:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - nelfund-network
```

**Key points**:
- Uses `cloudflare-tunnel.docker.yml` for container networking
- Mounts credentials from host (`${HOME}/.cloudflared/...`)
- Auto-restarts if it crashes
- Waits for `app` service to be ready

### Production Workflow

For production-ready deployments, use the fully containerized setup:

1. **Build the application with latest changes**:
   ```bash
   docker-compose build
   ```

2. **Start all services** (app + database + redis + cloudflare tunnel):
   ```bash
   docker-compose up -d
   ```

3. **Check status**:
   ```bash
   docker-compose ps
   ```

4. **View logs**:
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f app
   docker-compose logs -f cloudflared
   ```

5. **After code changes**, rebuild and restart:
   ```bash
   docker-compose build app
   docker-compose up -d app
   ```

## Commands Reference

### Local Development

```bash
# List tunnels
cloudflared tunnel list

# Get tunnel info
cloudflared tunnel info confirmd-demo

# Start tunnel
cloudflared tunnel run confirmd-demo

# Stop tunnel
pkill cloudflared
```

### Docker

```bash
# Start tunnel container
docker-compose up -d cloudflared

# View tunnel logs
docker-compose logs -f cloudflared

# Restart tunnel
docker-compose restart cloudflared

# Stop tunnel
docker-compose stop cloudflared
```

## Monitoring

### Check Tunnel Health

```bash
# Test public endpoint
curl https://demo.confamd.com/

# Check tunnel metrics (if running locally)
curl http://localhost:20242/metrics
```

### Webhook Testing

After starting the tunnel, test webhook delivery:

1. **Create a connection** in the app
2. **Check application logs** for webhook receipt
3. **Verify webhook processing** in database

Example log output when webhook is received:
```
[2025-11-11T00:19:21.887Z] [INFO] === WEBHOOK REQUEST START ===
[2025-11-11T00:19:21.888Z] [INFO] RAW WEBHOOK PAYLOAD
...
```

## Security Notes

1. **Credentials**: The tunnel credentials file contains secrets - never commit to version control
2. **Access Control**: Configure firewall rules on Cloudflare dashboard if needed
3. **Rate Limiting**: Cloudflare provides automatic DDoS protection
4. **Audit Logs**: Check Cloudflare dashboard for tunnel access logs

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Integration Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/as-a-service/docker/)
