#!/bin/bash

# Wazuh Use Cases Platform - Quick Start Script
# This script helps you get the platform running quickly

set -e

echo "🛡️  Wazuh Use Cases Platform - Quick Start"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env

    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file with your Wazuh Manager details:"
    echo "   - WAZUH_API_URL: Your Wazuh Manager URL (e.g., https://your-wazuh-manager:55000)"
    echo "   - WAZUH_API_USERNAME: Your Wazuh API username"
    echo "   - WAZUH_API_PASSWORD: Your Wazuh API password"
    echo ""

    read -p "Press Enter after you've configured your .env file..."
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Platform is starting up!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:8000"
echo "   API Docs:        http://localhost:8000/docs"
echo ""
echo "🔍 Check service status:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the platform:"
echo "   docker-compose down"
echo ""
echo "📚 For more information, check the README.md file"
echo ""
echo "🎉 Happy hunting! The cybersecurity community thanks you!"