# 🛡️ Prompt Final - Plateforme de Renseignement Wazuh Use Cases & Playbooks

## 🎯 Contexte & Objectif

Tu es un **expert en cybersécurité DFIR/SOC et développement fullstack**, spécialisé dans :

- **Wazuh SIEM/XDR** (architecture, règles, décoders, Active Response, API)
- **Stack ELK/OpenSearch** (indexation, recherche, dashboards)
- **MITRE ATT&CK Framework** et **Cyber Kill Chain**
- **Développement web moderne** (React/Vue, FastAPI/Node.js, PostgreSQL)

**Mission** : Créer une plateforme web complète de gestion des use cases et playbooks Wazuh pour équipes SOC/CERT, incluant génération automatique, recherche intelligente, et déploiement automatisé.

---

## 📋 Spécifications Fonctionnelles

### Core Features

- **📝 Éditeur de Use Cases** : Interface graphique pour créer/modifier use cases avec prévisualisation
- **🔍 Moteur de Recherche** : Recherche par IOCs, MITRE TTPs, plateforme, criticité, mots-clés
- **🤖 Génération IA** : Création automatique de playbooks via LLM avec templates prédéfinis
- **📊 Dashboard Analytique** : Métriques de détection, taux de faux positifs, couverture MITRE
- **🚀 Déploiement Automatisé** : Push des règles vers Wazuh Manager via API
- **📚 Bibliothèque Communautaire** : Import/export depuis GitHub, Sigma, sources ouvertes
- **🔄 Versioning & Rollback** : Historique des modifications avec possibilité de retour arrière
- **⚡ Testing Framework** : Validation automatique des règles avec jeux de données de test

### Architecture Technique

#### Frontend (React + TypeScript)

```javascript
// Structure des composants principaux
src/
├── components/
│   ├── UseCaseEditor/          // Éditeur principal avec Monaco
│   ├── SearchEngine/           // Recherche avancée + filtres
│   ├── Dashboard/              // Métriques et analytics
│   ├── DeploymentManager/      // Interface de déploiement
│   └── CommunityHub/          // Import/export communautaire
├── hooks/
│   ├── useWazuhAPI.ts         // Hook pour API Wazuh
│   ├── useUseCases.ts         // Gestion state use cases
│   └── useDeployment.ts       // Gestion déploiements
└── types/
    └── wazuh.ts               // Types TypeScript Wazuh
```

#### Backend (FastAPI + Python)

```python
# Structure API principale
app/
├── api/
│   ├── usecases.py            # CRUD use cases
│   ├── wazuh.py              # Intégration API Wazuh
│   ├── search.py             # Moteur de recherche
│   ├── deployment.py         # Gestion déploiements
│   └── community.py          # Import/export communauté
├── services/
│   ├── wazuh_service.py      # Service Wazuh Manager
│   ├── llm_service.py        # Génération IA playbooks
│   ├── validation_service.py # Validation règles XML
│   └── testing_service.py    # Framework de test
└── models/
    └── schemas.py            # Modèles Pydantic
```

---

## 🏗️ Modèle de Données Use Case (Enrichi)

```json
{
  "id": "UUID",
  "metadata": {
    "name": "SSH Brute Force Detection",
    "description": "Detect multiple failed SSH authentication attempts",
    "author": "SOC Team",
    "version": "1.2.0",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T15:30:00Z",
    "tags": ["linux", "authentication", "brute-force"]
  },
  "classification": {
    "platform": ["linux", "unix", "macos"],
    "severity": "high",
    "confidence": "high",
    "false_positive_rate": "low",
    "maturity": "production", // draft|testing|production|deprecated
    "compliance": ["PCI-DSS", "ISO27001", "NIST"]
  },
  "threat_intel": {
    "mitre_attack": {
      "tactics": ["credential-access"],
      "techniques": ["T1110.001"],
      "sub_techniques": ["T1110.001"]
    },
    "kill_chain": ["reconnaissance", "weaponization"],
    "cve_references": ["CVE-2023-XXXX"],
    "threat_actors": ["APT29", "Lazarus"],
    "campaigns": ["Operation XYZ"]
  },
  "technical_specs": {
    "wazuh_version": ">=4.4.0",
    "dependencies": ["sshd logs", "auth logs"],
    "supported_log_sources": ["syslog", "json", "eventlog"],
    "performance_impact": "low", // low|medium|high
    "resource_requirements": {
      "cpu": "minimal",
      "memory": "< 100MB",
      "storage": "< 10MB"
    }
  },
  "detection_logic": {
    "rules": [
      {
        "id": "100001",
        "level": 10,
        "xml_content": "<rule id=\"100001\" level=\"10\">...</rule>",
        "description": "SSH brute force attempt detected"
      }
    ],
    "decoders": [
      {
        "name": "ssh-decoder",
        "xml_content": "<decoder name=\"ssh-decoder\">...</decoder>"
      }
    ],
    "agent_configuration": {
      "xml_content": "<agent_config>...</agent_config>",
      "target_os": ["linux", "unix"],
      "modules": ["logcollector", "syscheck"]
    }
  },
  "response_playbook": {
    "immediate_actions": [
      "Block source IP via firewall",
      "Alert SOC team",
      "Create incident ticket"
    ],
    "investigation_steps": [
      "Check authentication logs",
      "Analyze source IP reputation",
      "Review successful logins from same IP"
    ],
    "containment": [
      "Isolate affected system",
      "Reset compromised credentials",
      "Enable MFA if not present"
    ],
    "active_response": {
      "linux_script": "#!/bin/bash\n# Block IP via iptables\niptables -A INPUT -s $1 -j DROP",
      "windows_script": "# PowerShell script for Windows\nNew-NetFirewallRule -DisplayName \"Block-$args[0]\" -Direction Inbound -RemoteAddress $args[0] -Action Block"
    }
  },
  "enrichment": {
    "threat_intelligence": {
      "virustotal_integration": true,
      "abuseipdb_lookup": true,
      "custom_feeds": ["internal_blacklist"]
    },
    "context_data": {
      "geolocation": true,
      "asn_lookup": true,
      "domain_reputation": true
    }
  },
  "testing": {
    "test_cases": [
      {
        "name": "SSH brute force simulation",
        "input_log": "Jan 15 10:00:01 server sshd[1234]: Failed password for user from 1.2.3.4",
        "expected_alert": true,
        "alert_level": 10
      }
    ],
    "validation_status": "passed", // passed|failed|pending
    "last_tested": "2025-01-15T12:00:00Z"
  },
  "deployment": {
    "target_groups": ["linux-servers", "web-servers"],
    "deployment_status": "deployed", // draft|pending|deployed|failed
    "deployment_date": "2025-01-15T14:00:00Z",
    "rollback_available": true
  },
  "metrics": {
    "alerts_generated": 1250,
    "true_positives": 1100,
    "false_positives": 150,
    "precision": 0.88,
    "last_triggered": "2025-01-15T16:30:00Z"
  },
  "community": {
    "source_url": "https://github.com/wazuh/wazuh-rules/ssh-brute-force",
    "license": "Apache-2.0",
    "contributors": ["security@company.com"],
    "download_count": 2500,
    "rating": 4.8
  }
}
```

---

## 🚀 Instructions de Développement

### Phase 1 : Core Platform (MVP)

1. **Setup Base Architecture**
   - Frontend React avec Vite + TypeScript
   - Backend FastAPI avec PostgreSQL
   - Docker Compose pour développement local
   - CI/CD avec GitHub Actions

2. **Développer Use Case Editor**
   - Monaco Editor pour XML/YAML/JSON
   - Validation en temps réel des règles Wazuh
   - Prévisualisation avec syntax highlighting
   - Import/export JSON/XML

3. **Intégration API Wazuh**
   - Connexion à Wazuh Manager API
   - Déploiement automatique des règles
   - Monitoring du statut des agents
   - Récupération des métriques d'alertes

### Phase 2 : Intelligence & Automation

1. **Moteur de Recherche**
   - Elasticsearch/OpenSearch pour indexation
   - Recherche par IOCs, MITRE TTPs, métadonnées
   - Filtres avancés et facettes
   - API de recherche rapide

2. **Génération IA de Playbooks**
   - Intégration OpenAI/Claude API
   - Templates prédéfinis par type de menace
   - Génération basée sur MITRE ATT&CK
   - Validation automatique du contenu généré

3. **Framework de Test**
   - Simulation d'événements de test
   - Validation automatique des règles
   - Métriques de performance
   - Rapport de couverture MITRE

### Phase 3 : Community & Advanced Features

1. **Community Hub**
   - Import depuis GitHub, Sigma repos
   - Partage communautaire sécurisé
   - Système de rating et reviews
   - Marketplace de playbooks

2. **Advanced Analytics**
   - Dashboard temps réel avec Grafana
   - Métriques de détection avancées
   - Analyse de tendances
   - Reporting automatisé

---

## 🔧 Stack Technique Recommandée

### Frontend

- **Framework** : React 18 + TypeScript + Vite
- **UI Library** : Ant Design ou Material-UI
- **State Management** : Zustand ou Redux Toolkit
- **Editor** : Monaco Editor (VS Code editor)
- **Charts** : Recharts ou Chart.js
- **Styling** : Tailwind CSS + CSS Modules

### Backend

- **Framework** : FastAPI + Python 3.11+
- **Database** : PostgreSQL 15+ (primary) + Redis (cache)
- **Search** : Elasticsearch 8.x ou OpenSearch
- **Queue** : Celery + Redis (tâches async)
- **Auth** : OAuth2 + JWT (Keycloak ou Auth0)
- **API Doc** : FastAPI auto-generation (Swagger/OpenAPI)

### Infrastructure

- **Containers** : Docker + Docker Compose
- **Orchestration** : Kubernetes (production)
- **Monitoring** : Prometheus + Grafana + Loki
- **Secrets** : HashiCorp Vault ou Kubernetes Secrets
- **Storage** : MinIO (S3-compatible) pour fichiers
- **Backup** : PostgreSQL automated backups

### Security

- **HTTPS** : Let's Encrypt + Nginx reverse proxy
- **WAF** : ModSecurity ou CloudFlare
- **Secrets** : Rotation automatique des credentials
- **Audit** : Logging centralisé de toutes les actions
- **RBAC** : Role-Based Access Control fin

---

## 📋 Checklist de Livrables

### 🎯 Code Source Complet

- [ ] Frontend React TypeScript avec tous les composants
- [ ] Backend FastAPI avec API complète
- [ ] Base de données PostgreSQL avec migrations
- [ ] Docker Compose pour développement local
- [ ] Configuration CI/CD GitHub Actions
- [ ] Documentation technique et utilisateur

### 🔧 Intégrations Fonctionnelles

- [ ] API Wazuh Manager (authentification, déploiement règles)
- [ ] Moteur de recherche Elasticsearch/OpenSearch
- [ ] Génération IA de playbooks (OpenAI/Claude)
- [ ] Import/export formats standards (STIX, Sigma, JSON)
- [ ] Système d'authentification et autorisation
- [ ] Framework de test automatisé

### 📊 Features Avancées

- [ ] Dashboard analytics temps réel
- [ ] Système de versioning et rollback
- [ ] Community hub avec rating système
- [ ] Notifications et alertes configurables
- [ ] Export PDF/Word des playbooks
- [ ] API publique documentée

### 🚀 Production Ready

- [ ] Configuration Kubernetes/Docker Swarm
- [ ] Monitoring et logging centralisé
- [ ] Backup et disaster recovery
- [ ] Sécurité hardened (HTTPS, WAF, secrets)
- [ ] Tests unitaires et intégration (>90% coverage)
- [ ] Documentation déploiement production

---

## 💡 Use Cases Prédéfinis à Implémenter

Génère et intègre ces playbooks standards dans la plateforme :

### Network Security

1. **DDoS Attack Detection** - Détection d'attaques par déni de service
2. **Port Scanning** - Reconnaissance réseau malveillante
3. **DNS Tunneling** - Communication cachée via DNS
4. **C2 Communication** - Trafic command & control
5. **Data Exfiltration** - Transfert non autorisé de données

### Endpoint Security  

1. **Malware Execution** - Détection d'exécution de malware
2. **Privilege Escalation** - Élévation de privilèges suspecte
3. **Persistence Mechanisms** - Techniques de persistance
4. **Process Injection** - Injection de code en mémoire
5. **Suspicious PowerShell** - Activité PowerShell malveillante

### Authentication & Access

1. **Brute Force Attacks** - Attaques par force brute
2. **Credential Stuffing** - Réutilisation de credentials
3. **Suspicious Login Patterns** - Patterns de connexion suspects
4. **Account Enumeration** - Énumération de comptes
5. **MFA Bypass Attempts** - Tentatives de contournement MFA

### Web Application Security

1. **SQL Injection** - Attaques par injection SQL
2. **XSS Attacks** - Cross-Site Scripting
3. **Web Shell Detection** - Détection de web shells
4. **Directory Traversal** - Traversée de répertoires
5. **API Abuse** - Utilisation abusive d'API

---

## 🎯 Instructions Finales d'Exécution

1. **Commence par créer l'architecture de base** avec Docker Compose
2. **Développe d'abord l'éditeur de use cases** avec validation XML
3. **Intègre l'API Wazuh** pour le déploiement automatique
4. **Ajoute le moteur de recherche** avec Elasticsearch
5. **Implémente la génération IA** avec les playbooks prédéfinis
6. **Crée le dashboard analytics** avec métriques temps réel
7. **Finalise avec les features communautaires** et production

**Format de sortie demandé** : Code source complet, prêt à déployer, avec documentation et scripts d'installation automatisés.

**Contraintes importantes** :

- Code production-ready avec gestion d'erreurs robuste
- Interface utilisateur intuitive pour analystes SOC
- Performance optimisée pour gros volumes de données
- Sécurité renforcée (authentification, autorisation, audit)
- Compatibilité Wazuh 4.4+ et intégration API complète
