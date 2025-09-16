# 🚀 Quick Start Guide

## Prerequisites

- **Docker & Docker Compose** (Required)
- **Git** (Required)

## 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd wazuh-usecases-platform

# Copy environment configuration
cp .env.example .env
```

## 2. Configure Environment

Edit `.env` file with your settings:

```bash
# Essential configurations:
WAZUH_API_URL=https://your-wazuh-manager:55000
WAZUH_API_USERNAME=wazuh-api-user
WAZUH_API_PASSWORD=your-password

# Optional: OpenAI for AI features
OPENAI_API_KEY=your-openai-key
```

## 3. Start the Platform

### Option A: Using the startup script
```bash
./scripts/start.sh
```

### Option B: Using Docker Compose directly
```bash
docker-compose up -d --build
```

## 4. Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 5. First Steps

1. **Check Wazuh Connection**: Go to "Wazuh Status" to verify API connectivity
2. **Create Use Case**: Click "Create Use Case" to start building detection rules
3. **Import Examples**: Use Community Hub to import sample use cases

## Troubleshooting

### Services won't start?
```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose down
docker-compose up -d --build
```

### Can't connect to Wazuh?
1. Verify Wazuh Manager is running
2. Check firewall allows port 55000
3. Verify API credentials in `.env`
4. Test API manually: `curl -k https://your-wazuh:55000`

### Database issues?
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## Development Mode

For development with hot reload:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Support

- Check logs: `docker-compose logs -f [service-name]`
- API docs: http://localhost:8000/docs
- Issues: Create GitHub issue with logs