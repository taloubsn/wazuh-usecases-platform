from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.services.wazuh_service import WazuhService

router = APIRouter()


@router.get("/status")
async def get_wazuh_status():
    """Get Wazuh Manager connection status"""
    try:
        wazuh_service = WazuhService()
        status = await wazuh_service.get_manager_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get Wazuh status: {str(e)}")


@router.get("/agents")
async def get_agents():
    """Get all Wazuh agents"""
    try:
        wazuh_service = WazuhService()
        agents = await wazuh_service.get_agents()
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agents: {str(e)}")


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific Wazuh agent details"""
    try:
        wazuh_service = WazuhService()
        agent = await wazuh_service.get_agent(agent_id)
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent: {str(e)}")


@router.get("/rules")
async def get_rules(
    limit: int = 100,
    offset: int = 0,
    search: str = None
):
    """Get Wazuh rules"""
    try:
        wazuh_service = WazuhService()
        rules = await wazuh_service.get_rules(
            limit=limit,
            offset=offset,
            search=search
        )
        return rules
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get rules: {str(e)}")


@router.post("/rules/validate")
async def validate_rule(rule_xml: str):
    """Validate a Wazuh rule XML"""
    try:
        wazuh_service = WazuhService()
        validation = await wazuh_service.validate_rule(rule_xml)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule validation failed: {str(e)}")


@router.get("/decoders")
async def get_decoders(
    limit: int = 100,
    offset: int = 0,
    search: str = None
):
    """Get Wazuh decoders"""
    try:
        wazuh_service = WazuhService()
        decoders = await wazuh_service.get_decoders(
            limit=limit,
            offset=offset,
            search=search
        )
        return decoders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get decoders: {str(e)}")


@router.post("/decoders/validate")
async def validate_decoder(decoder_xml: str):
    """Validate a Wazuh decoder XML"""
    try:
        wazuh_service = WazuhService()
        validation = await wazuh_service.validate_decoder(decoder_xml)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decoder validation failed: {str(e)}")


@router.get("/groups")
async def get_agent_groups():
    """Get all agent groups"""
    try:
        wazuh_service = WazuhService()
        groups = await wazuh_service.get_agent_groups()
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get groups: {str(e)}")


@router.get("/alerts")
async def get_alerts(
    limit: int = 100,
    offset: int = 0,
    timeframe: str = "24h",
    rule_id: str = None,
    agent_id: str = None
):
    """Get Wazuh alerts"""
    try:
        wazuh_service = WazuhService()
        alerts = await wazuh_service.get_alerts(
            limit=limit,
            offset=offset,
            timeframe=timeframe,
            rule_id=rule_id,
            agent_id=agent_id
        )
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")


@router.get("/stats/rules")
async def get_rule_stats():
    """Get rule statistics (most triggered, etc.)"""
    try:
        wazuh_service = WazuhService()
        stats = await wazuh_service.get_rule_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get rule stats: {str(e)}")


@router.post("/test-rule")
async def test_rule_with_log(rule_xml: str, test_log: str):
    """Test a rule against a sample log entry"""
    try:
        wazuh_service = WazuhService()
        test_result = await wazuh_service.test_rule_with_log(rule_xml, test_log)
        return test_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule test failed: {str(e)}")


@router.get("/configuration")
async def get_manager_configuration():
    """Get Wazuh Manager configuration"""
    try:
        wazuh_service = WazuhService()
        config = await wazuh_service.get_manager_configuration()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get configuration: {str(e)}")


@router.get("/info")
async def get_manager_info():
    """Get Wazuh Manager information"""
    try:
        wazuh_service = WazuhService()
        info = await wazuh_service.get_manager_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get manager info: {str(e)}")


@router.post("/restart")
async def restart_manager():
    """Restart Wazuh Manager (admin only)"""
    try:
        wazuh_service = WazuhService()
        result = await wazuh_service.restart_manager()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restart manager: {str(e)}")


@router.get("/logs")
async def get_manager_logs(
    limit: int = 100,
    offset: int = 0,
    level: str = None
):
    """Get Wazuh Manager logs"""
    try:
        wazuh_service = WazuhService()
        logs = await wazuh_service.get_manager_logs(
            limit=limit,
            offset=offset,
            level=level
        )
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get logs: {str(e)}")