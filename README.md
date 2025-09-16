# Wazuh Use Cases & Playbooks Platform

![Wazuh Logo](https://wazuh.com/static/wazuh_logo.svg)

## 📋 Overview

A comprehensive web-based platform for managing Wazuh SIEM detection rules, use cases, and response playbooks. This platform provides security teams with tools to create, test, deploy, and manage custom Wazuh detection logic with an intuitive interface.

## ✨ Features

### 🔍 Detection Management
- **Use Case Editor**: Visual editor for creating and managing Wazuh detection use cases
- **Rule & Decoder Management**: Create and validate Wazuh XML rules and decoders
- **Test Framework**: Built-in testing capabilities for detection logic
- **Classification System**: Organize use cases by severity, maturity, and MITRE ATT&CK techniques

### 📊 Wazuh Integration
- **Real-time Status Monitoring**: Live dashboard showing Wazuh Manager and agent status
- **Agent Management**: View and monitor all connected Wazuh agents
- **API Integration**: Direct connection to Wazuh API for data retrieval and management
- **Service Monitoring**: Track Wazuh Manager services status in real-time

### 🚀 Deployment & Operations
- **Automated Deployment**: Deploy use cases directly to Wazuh infrastructure
- **Rollback Capabilities**: Safe rollback mechanisms for deployed rules
- **Performance Monitoring**: Track rule performance and alert metrics
- **Search & Discovery**: Advanced search functionality for finding relevant use cases

### 🤝 Community Features
- **Community Hub**: Share and discover community-contributed detection rules
- **Collaboration Tools**: Share use cases and collaborate with other security professionals
- **Version Control**: Track changes and maintain version history
- **Import/Export**: Easy migration of detection logic between environments

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   FastAPI       │    │   Wazuh         │
│   Frontend      │◄──►│   Backend       │◄──►│   Manager       │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 55000)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │   PostgreSQL    │             │
         └──────────────►│   Database      │◄────────────┘
                        │   (Port 5432)   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Redis Cache   │
                        │   (Port 6379)   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Elasticsearch  │
                        │   (Port 9200)   │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Wazuh Manager (v4.0+) with API enabled
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/taloubsn/wazuh-usecases-platform.git
   cd wazuh-usecases-platform
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your Wazuh Manager details:
   ```bash
   WAZUH_API_URL=https://your-wazuh-manager:55000
   WAZUH_API_USERNAME=your-username
   WAZUH_API_PASSWORD=your-password
   ```

3. **Start the platform**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### First Run Setup

1. Navigate to http://localhost:3000
2. Check the Wazuh Status page to verify connection
3. Start creating your first use case!

## 📖 Usage Guide

### Creating a Use Case

1. **Navigate to Use Cases** → **New Use Case**
2. **Fill in metadata**: Name, description, author, tags
3. **Set classification**: Severity, maturity level, MITRE ATT&CK mapping
4. **Define detection logic**:
   - Add Wazuh rules (XML format)
   - Create custom decoders if needed
   - Configure agent settings
5. **Create response playbook**: Define investigation and response steps
6. **Test your logic**: Use built-in test framework
7. **Deploy**: Push to your Wazuh infrastructure

### Monitoring Wazuh Infrastructure

1. **Navigate to Wazuh Status**
2. **View Manager Status**: Check all Wazuh services
3. **Monitor Agents**: See all connected agents and their status
4. **Real-time Updates**: Automatic refresh of status information

### Community Integration

1. **Browse Community Hub**: Discover shared use cases
2. **Download & Import**: Import community use cases to your environment
3. **Share Your Work**: Contribute your use cases to the community
4. **Rate & Review**: Help others find quality content

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WAZUH_API_URL` | Wazuh Manager API endpoint | `https://localhost:55000` |
| `WAZUH_API_USERNAME` | Wazuh API username | `wazuh-wui` |
| `WAZUH_API_PASSWORD` | Wazuh API password | `wazuh-wui` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `SECRET_KEY` | Application secret key | `change-in-production` |

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React.js web interface |
| backend | 8000 | FastAPI backend service |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| elasticsearch | 9200 | Elasticsearch (optional) |

## 🛠️ Development

### Local Development Setup

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database Migrations

```bash
docker-compose exec backend alembic upgrade head
```

## 🧪 Testing

### Backend Tests
```bash
docker-compose exec backend pytest
```

### Frontend Tests
```bash
docker-compose exec frontend npm test
```

### Integration Tests
```bash
docker-compose exec backend pytest tests/integration/
```

## 📊 Monitoring & Logging

### Application Logs
```bash
docker-compose logs -f [service-name]
```

### Health Checks
- Backend Health: http://localhost:8000/health
- Database Status: Accessible via API endpoints
- Wazuh Connection: Monitored in real-time on status page

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files
- **API Security**: All API endpoints are secured
- **Database**: Use strong passwords in production
- **Wazuh API**: Ensure proper authentication and SSL/TLS
- **Network Security**: Consider firewall rules for production

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/taloubsn/wazuh-usecases-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/taloubsn/wazuh-usecases-platform/discussions)
- **Documentation**: [Wiki](https://github.com/taloubsn/wazuh-usecases-platform/wiki)

## 🙏 Acknowledgments

- [Wazuh](https://wazuh.com/) for the excellent SIEM platform
- [React](https://reactjs.org/) and [Ant Design](https://ant.design/) for the frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- The open-source security community

---

**Built with ❤️ for the cybersecurity community**

![GitHub last commit](https://img.shields.io/github/last-commit/taloubsn/wazuh-usecases-platform)
![GitHub issues](https://img.shields.io/github/issues/taloubsn/wazuh-usecases-platform)
![GitHub stars](https://img.shields.io/github/stars/taloubsn/wazuh-usecases-platform)
![License](https://img.shields.io/github/license/taloubsn/wazuh-usecases-platform)