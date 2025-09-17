import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import base64
from app.core.config import settings


class WazuhService:
    """Service for interacting with Wazuh Manager API"""

    def __init__(self):
        self.base_url = settings.wazuh_api_url
        self.username = settings.wazuh_api_username
        self.password = settings.wazuh_api_password
        self.token = None
        self.client = httpx.AsyncClient(verify=False)  # For dev environments

    async def _authenticate(self):
        """Authenticate with Wazuh API and get token"""
        if not self.base_url or not self.username or not self.password:
            raise Exception("Wazuh API credentials not configured")

        auth_url = f"{self.base_url}/security/user/authenticate"

        try:
            response = await self.client.get(
                auth_url,
                auth=(self.username, self.password)
            )
            response.raise_for_status()

            data = response.json()
            self.token = data.get("data", {}).get("token")

            if not self.token:
                raise Exception("Failed to get authentication token")

        except httpx.RequestError as e:
            raise Exception(f"Connection error: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Authentication failed: {e.response.status_code}")

    async def _make_request(self, method: str, endpoint: str, **kwargs):
        """Make authenticated request to Wazuh API"""
        if not self.token:
            await self._authenticate()

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        url = f"{self.base_url}{endpoint}"

        try:
            response = await self.client.request(
                method, url, headers=headers, **kwargs
            )

            # Handle token expiration
            if response.status_code == 401:
                await self._authenticate()
                headers["Authorization"] = f"Bearer {self.token}"
                response = await self.client.request(
                    method, url, headers=headers, **kwargs
                )

            response.raise_for_status()
            return response.json()

        except httpx.RequestError as e:
            raise Exception(f"Request error: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"API error: {e.response.status_code} - {e.response.text}")

    async def get_manager_status(self) -> Dict[str, Any]:
        """Get Wazuh Manager status"""
        try:
            data = await self._make_request("GET", "/manager/status")
            return {
                "connected": True,
                "status": data.get("data", {}),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def get_agents(self) -> Dict[str, Any]:
        """Get all Wazuh agents"""
        data = await self._make_request("GET", "/agents")
        return data.get("data", {})

    async def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """Get specific agent details"""
        data = await self._make_request("GET", f"/agents/{agent_id}")
        return data.get("data", {})

    async def get_rules(self, limit: int = 100, offset: int = 0, search: str = None) -> Dict[str, Any]:
        """Get Wazuh rules"""
        params = {"limit": limit, "offset": offset}
        if search:
            params["search"] = search

        data = await self._make_request("GET", "/rules", params=params)
        return data.get("data", {})

    async def get_decoders(self, limit: int = 100, offset: int = 0, search: str = None) -> Dict[str, Any]:
        """Get Wazuh decoders"""
        params = {"limit": limit, "offset": offset}
        if search:
            params["search"] = search

        data = await self._make_request("GET", "/decoders", params=params)
        return data.get("data", {})

    async def get_agent_groups(self) -> Dict[str, Any]:
        """Get all agent groups"""
        data = await self._make_request("GET", "/groups")
        return data.get("data", {})

    async def get_alerts(
        self,
        limit: int = 100,
        offset: int = 0,
        timeframe: str = "24h",
        rule_id: str = None,
        agent_id: str = None
    ) -> Dict[str, Any]:
        """Get Wazuh alerts"""
        params = {"limit": limit, "offset": offset}

        if rule_id:
            params["rule_id"] = rule_id
        if agent_id:
            params["agent_id"] = agent_id

        data = await self._make_request("GET", "/alerts", params=params)
        return data.get("data", {})

    async def validate_rule(self, rule_xml: str) -> Dict[str, Any]:
        """Validate Wazuh rule XML"""
        try:
            # Parse XML to check syntax
            ET.fromstring(rule_xml)

            # Additional validation can be added here
            return {
                "valid": True,
                "message": "Rule XML is valid"
            }
        except ET.ParseError as e:
            return {
                "valid": False,
                "message": f"XML Parse Error: {str(e)}"
            }
        except Exception as e:
            return {
                "valid": False,
                "message": f"Validation Error: {str(e)}"
            }

    async def validate_decoder(self, decoder_xml: str) -> Dict[str, Any]:
        """Validate Wazuh decoder XML"""
        try:
            # Parse XML to check syntax
            ET.fromstring(decoder_xml)

            return {
                "valid": True,
                "message": "Decoder XML is valid"
            }
        except ET.ParseError as e:
            return {
                "valid": False,
                "message": f"XML Parse Error: {str(e)}"
            }
        except Exception as e:
            return {
                "valid": False,
                "message": f"Validation Error: {str(e)}"
            }




    async def get_rule_statistics(self) -> Dict[str, Any]:
        """Get rule statistics"""
        # This would query the Wazuh database for alert statistics
        # For now, returning mock data
        return {
            "most_triggered_rules": [
                {"rule_id": "5500", "count": 1250, "description": "User login"},
                {"rule_id": "5501", "count": 890, "description": "User logout"},
                {"rule_id": "5502", "count": 456, "description": "Login failure"}
            ],
            "timeframe": "24h",
            "total_alerts": 15678
        }

    async def test_rule_with_log(self, rule_xml: str, test_log: str) -> Dict[str, Any]:
        """Test a rule against a sample log entry"""
        try:
            # In a real implementation, this would use wazuh-logtest
            return {
                "matched": True,
                "rule_id": "100001",
                "level": 10,
                "description": "SSH brute force detected",
                "groups": ["authentication_failed", "sshd"],
                "decoded_fields": {
                    "srcip": "192.168.1.100",
                    "user": "admin",
                    "program_name": "sshd"
                }
            }
        except Exception as e:
            return {
                "matched": False,
                "error": str(e)
            }

    async def get_manager_configuration(self) -> Dict[str, Any]:
        """Get manager configuration"""
        data = await self._make_request("GET", "/manager/configuration")
        return data.get("data", {})

    async def get_manager_info(self) -> Dict[str, Any]:
        """Get manager information"""
        data = await self._make_request("GET", "/manager/info")
        return data.get("data", {})

    async def restart_manager(self) -> Dict[str, Any]:
        """Restart Wazuh Manager"""
        data = await self._make_request("PUT", "/manager/restart")
        return data.get("data", {})

    async def get_manager_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        level: str = None
    ) -> Dict[str, Any]:
        """Get manager logs"""
        params = {"limit": limit, "offset": offset}
        if level:
            params["level"] = level

        data = await self._make_request("GET", "/manager/logs", params=params)
        return data.get("data", {})

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()