#!/usr/bin/env python3
import json
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import requests
from urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

# Configuration Wazuh depuis .env
WAZUH_URL = 'https://10.32.1.130:55000'
USERNAME = 'wazuh-wui'
PASSWORD = 'wazuh-wui'

class WazuhAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        path = self.path

        # Headers CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        try:
            if path == '/api/v1/wazuh/status':
                self.handle_wazuh_status()
            elif path == '/api/v1/wazuh/agents':
                self.handle_wazuh_agents()
            elif path.startswith('/api/v1/wazuh/'):
                self.handle_generic_wazuh_api(path)
            elif path == '/api/v1/usecases' or path.startswith('/api/v1/usecases'):
                self.handle_usecases(path)
            else:
                self.wfile.write(json.dumps({'error': 'Not found'}).encode())

        except Exception as e:
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def get_wazuh_token(self):
        """Obtient un token d'authentification Wazuh"""
        auth_url = f'{WAZUH_URL}/security/user/authenticate'
        auth_headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()}'
        }

        response = requests.post(auth_url, headers=auth_headers, verify=False, timeout=10)
        if response.status_code == 200:
            return response.json()['data']['token']
        else:
            raise Exception(f'Authentification Wazuh échouée: {response.status_code}')

    def handle_wazuh_status(self):
        """Gère la route /api/v1/wazuh/status"""
        try:
            token = self.get_wazuh_token()

            # Obtenir les informations du manager
            api_headers = {'Authorization': f'Bearer {token}'}
            manager_response = requests.get(f'{WAZUH_URL}/?pretty=true', headers=api_headers, verify=False, timeout=10)

            if manager_response.status_code == 200:
                response_data = {
                    'connected': True,
                    'status': {
                        'manager': 'Wazuh Manager',
                        'version': '4.8.0',
                        'api_version': '4.8.0',
                        'authenticated': True,
                        'url': WAZUH_URL
                    },
                    'timestamp': '2025-01-15T10:30:00Z'
                }
                self.wfile.write(json.dumps(response_data).encode())
            else:
                raise Exception(f'API Manager error: {manager_response.status_code}')

        except Exception as e:
            response_data = {
                'connected': False,
                'error': str(e),
                'timestamp': '2025-01-15T10:30:00Z'
            }
            self.wfile.write(json.dumps(response_data).encode())

    def handle_wazuh_agents(self):
        """Gère la route /api/v1/wazuh/agents"""
        try:
            token = self.get_wazuh_token()

            api_headers = {'Authorization': f'Bearer {token}'}
            agents_response = requests.get(f'{WAZUH_URL}/agents?pretty=true', headers=api_headers, verify=False, timeout=10)

            if agents_response.status_code == 200:
                agents_data = agents_response.json()
                # Simplifie les données des agents
                agents = []
                if 'data' in agents_data and 'affected_items' in agents_data['data']:
                    for agent in agents_data['data']['affected_items']:
                        agents.append({
                            'id': agent.get('id', ''),
                            'name': agent.get('name', ''),
                            'ip': agent.get('ip', ''),
                            'status': agent.get('status', ''),
                            'version': agent.get('version', ''),
                            'os': agent.get('os', {}).get('name', '')
                        })

                self.wfile.write(json.dumps(agents).encode())
            else:
                raise Exception(f'Agents API error: {agents_response.status_code}')

        except Exception as e:
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def handle_generic_wazuh_api(self, path):
        """Proxy générique pour les autres routes Wazuh"""
        try:
            token = self.get_wazuh_token()

            # Convertit le path frontend vers l'API Wazuh
            wazuh_path = path.replace('/api/v1/wazuh', '')
            if not wazuh_path:
                wazuh_path = '/'

            api_headers = {'Authorization': f'Bearer {token}'}
            wazuh_response = requests.get(f'{WAZUH_URL}{wazuh_path}?pretty=true', headers=api_headers, verify=False, timeout=10)

            self.wfile.write(wazuh_response.content)

        except Exception as e:
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def handle_usecases(self, path):
        """Gère la route /api/v1/usecases avec données de demo"""
        try:
            # Données de demo pour les use cases
            mock_usecases = [
                {
                    "id": "1",
                    "name": "Brute Force Attack Detection",
                    "description": "Detects multiple failed login attempts",
                    "author": "Security Team",
                    "version": "1.0.0",
                    "tags": ["T1110", "brute-force", "authentication"],
                    "platform": ["windows", "linux"],
                    "severity": "high",
                    "maturity": "production",
                    "deployment_status": "deployed"
                },
                {
                    "id": "2",
                    "name": "Suspicious Process Creation",
                    "description": "Monitors for suspicious process execution",
                    "author": "Security Team",
                    "version": "1.2.0",
                    "tags": ["T1055", "process-injection"],
                    "platform": ["windows"],
                    "severity": "medium",
                    "maturity": "production",
                    "deployment_status": "deployed"
                },
                {
                    "id": "3",
                    "name": "File Integrity Monitoring",
                    "description": "Monitors critical file changes",
                    "author": "Admin",
                    "version": "2.1.0",
                    "tags": ["T1222", "file-modification"],
                    "platform": ["linux", "windows"],
                    "severity": "medium",
                    "maturity": "draft",
                    "deployment_status": "pending"
                }
            ]

            # Check if this is a request for a specific use case
            path_parts = path.split('/')
            if len(path_parts) >= 5 and path_parts[4].isdigit():
                # Request for /api/v1/usecases/{id}
                usecase_id = path_parts[4]
                usecase = next((uc for uc in mock_usecases if uc["id"] == usecase_id), None)

                if usecase:
                    # Return full detailed use case structure
                    detailed_usecase = {
                        "id": usecase["id"],
                        "metadata": {
                            "name": usecase["name"],
                            "description": usecase["description"],
                            "author": usecase["author"],
                            "version": usecase["version"],
                            "created_at": "2025-01-15T10:00:00Z",
                            "updated_at": "2025-01-15T10:00:00Z",
                            "tags": usecase["tags"]
                        },
                        "classification": {
                            "severity": usecase["severity"],
                            "maturity": usecase["maturity"],
                            "platform": usecase["platform"],
                            "confidence": "high",
                            "false_positive_rate": "low",
                            "compliance": ["PCI-DSS", "NIST"]
                        },
                        "threat_intel": {
                            "mitre_attack": {
                                "tactics": ["Initial Access", "Credential Access"],
                                "techniques": usecase["tags"]
                            }
                        },
                        "detection_logic": {
                            "rules": [{
                                "xml_content": f"<rule id=\"100{usecase['id']}\" level=\"8\"><decoded_as>ssh</decoded_as><if_sid>5716</if_sid><match>Failed password</match><description>{usecase['name']}</description></rule>"
                            }],
                            "decoders": [],
                            "agent_configuration": None
                        },
                        "response_playbook": {
                            "immediate_actions": ["Block source IP", "Alert security team"],
                            "investigation_steps": ["Check user account", "Review logs"],
                            "containment": ["Isolate affected system"]
                        },
                        "metrics": {
                            "alerts_generated": 45,
                            "true_positives": 42,
                            "false_positives": 3,
                            "precision": 0.93,
                            "last_triggered": "2025-01-15T09:30:00Z"
                        },
                        "testing": {
                            "validation_status": "passed",
                            "last_tested": "2025-01-15T08:00:00Z",
                            "test_cases": [{
                                "name": "Basic Brute Force Test",
                                "input_log": "Jan 15 10:00:00 server sshd[1234]: Failed password for admin from 192.168.1.100",
                                "expected_alert": True,
                                "alert_level": 8
                            }]
                        },
                        "deployment": {
                            "deployment_status": usecase["deployment_status"],
                            "deployment_date": "2025-01-15T10:00:00Z" if usecase["deployment_status"] == "deployed" else None,
                            "rollback_available": True,
                            "target_groups": ["all", "production"]
                        },
                        "enrichment": {
                            "threat_intelligence": {
                                "virustotal_integration": True,
                                "abuseipdb_lookup": True
                            },
                            "context_data": {
                                "geolocation": True,
                                "asn_lookup": True
                            }
                        },
                        "community": {
                            "license": "MIT",
                            "repository_url": f"https://github.com/security/usecase{usecase['id']}",
                            "documentation_url": f"https://docs.security.com/usecase{usecase['id']}"
                        },
                        "technical_specs": {
                            "wazuh_version": "4.8.0",
                            "performance_impact": "low",
                            "supported_log_sources": ["ssh", "system", "auth"]
                        }
                    }
                    self.wfile.write(json.dumps(detailed_usecase).encode())
                else:
                    self.wfile.write(json.dumps({'error': 'Use case not found'}).encode())

            elif len(path_parts) >= 6 and path_parts[4] == "simple" and path_parts[5].isdigit():
                # Request for /api/v1/usecases/simple/{id}
                usecase_id = path_parts[5]
                usecase = next((uc for uc in mock_usecases if uc["id"] == usecase_id), None)

                if usecase:
                    # Return simple enhanced data
                    simple_data = {
                        "id": usecase["id"],
                        "wazuh_rule_id": f"100{usecase['id']}",
                        "cve": ["CVE-2023-1234"] if usecase_id == "1" else [],
                        "cvss_score": 7.5 if usecase_id == "1" else None,
                        "response_priority": usecase["severity"],
                        "escalation_contact": "security-team@company.com",
                        "response_actions": f"1. Immediately block the source IP\n2. Alert the security team\n3. Review authentication logs\n4. Check for similar attempts",
                        "automation_script": f"#!/bin/bash\n# Block IP script for {usecase['name']}\niptables -A INPUT -s $1 -j DROP\necho 'Blocked IP: $1' | mail security@company.com"
                    }
                    self.wfile.write(json.dumps(simple_data).encode())
                else:
                    self.wfile.write(json.dumps({'error': 'Use case not found'}).encode())
            else:
                # Return list of all use cases
                self.wfile.write(json.dumps(mock_usecases).encode())

        except Exception as e:
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def log_message(self, format, *args):
        """Supprime les logs pour plus de clarté"""
        pass

if __name__ == '__main__':
    print(f'🚀 Démarrage serveur backend Wazuh...')
    print(f'📡 Configuration Wazuh: {WAZUH_URL}')
    print(f'👤 Utilisateur: {USERNAME}')
    print('✅ Serveur prêt sur http://localhost:8000')
    print('🔗 Routes disponibles:')
    print('   - GET /api/v1/wazuh/status')
    print('   - GET /api/v1/wazuh/agents')
    print('')

    server = HTTPServer(('localhost', 8000), WazuhAPIHandler)
    server.serve_forever()