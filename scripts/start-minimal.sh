#!/bin/bash

# Wazuh Use Cases Platform - Minimal Startup Script

echo "🛡️  Starting Wazuh Platform (Minimal Version)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.minimal.yml down -v 2>/dev/null

# Start services
echo "🔧 Starting minimal services (Backend + PostgreSQL)..."
docker-compose -f docker-compose.minimal.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.minimal.yml ps

# Test API endpoint
echo ""
echo "🔍 Testing API..."
if curl -f -s http://localhost:8010/health > /dev/null; then
    echo "✅ Backend API is responding!"
else
    echo "❌ Backend API is not responding"
    echo "📋 Backend logs:"
    docker-compose -f docker-compose.minimal.yml logs backend --tail=20
    exit 1
fi

echo ""
echo "✅ Minimal Platform is running!"
echo ""
echo "🔧 Backend API: http://localhost:8010"
echo "📚 API Docs: http://localhost:8010/docs"
echo "🗄️  PostgreSQL: localhost:5433"
echo ""
echo "📋 Logs: docker-compose -f docker-compose.minimal.yml logs -f"
echo "🛑 Stop: docker-compose -f docker-compose.minimal.yml down"
echo ""
echo "🚀 To start the full platform later: ./scripts/start.sh"
echo ""