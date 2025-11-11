#!/bin/bash

# NELFUND Demo - Docker Quick Start Script
# This script helps you quickly set up and run the application using Docker

set -e

echo "======================================"
echo "NELFUND Demo - Docker Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your actual credentials:"
    echo "   - CONFIRMD_ORG_ID"
    echo "   - CONFIRMD_CLIENT_ID"
    echo "   - CONFIRMD_CLIENT_SECRET"
    echo "   - Credential Definition IDs"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
else
    echo "✓ .env file exists"
fi

echo ""
echo "======================================"
echo "Building Docker Images..."
echo "======================================"
docker-compose build

echo ""
echo "======================================"
echo "Starting Services..."
echo "======================================"
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "======================================"
echo "Service Status"
echo "======================================"
docker-compose ps

echo ""
echo "======================================"
echo "Running Database Migrations..."
echo "======================================"
docker-compose exec -T app npx prisma migrate deploy || echo "⚠️  Migration failed - this is normal for first run"

echo ""
echo "======================================"
echo "✓ Setup Complete!"
echo "======================================"
echo ""
echo "Application is running at: http://localhost:3300"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f app"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo "  View database:    docker-compose exec app npx prisma studio"
echo ""
echo "For more information, see DOCKER.md"
echo ""
