#!/bin/bash

# Wazuh Use Cases Platform - Startup Script

echo "🛡️  Starting Wazuh Use Cases & Playbooks Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file with your configuration"
fi

# Build and start services
echo "🔧 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Platform is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔍 Elasticsearch: http://localhost:9200"
echo "🗄️  PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""