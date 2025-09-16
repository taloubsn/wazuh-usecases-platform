from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.database.database import get_db
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class EnrichmentServiceConfig(BaseModel):
    """Configuration for a single enrichment service"""
    enabled: bool = False
    api_key: str = ""
    timeout: int = 30
    rate_limit: int = Field(default=100, description="Requests per time window")
    additional_config: Dict[str, Any] = Field(default_factory=dict)


class VirusTotalConfig(EnrichmentServiceConfig):
    """VirusTotal specific configuration"""
    enrich_files: bool = True
    enrich_urls: bool = True
    enrich_domains: bool = True
    enrich_ips: bool = True
    rate_limit: int = 4  # Free tier default


class AbuseIPDBConfig(EnrichmentServiceConfig):
    """AbuseIPDB specific configuration"""
    confidence_threshold: int = Field(default=75, ge=0, le=100)
    rate_limit: int = 1000  # Daily requests


class MISPConfig(EnrichmentServiceConfig):
    """MISP specific configuration"""
    url: str = ""
    verify_ssl: bool = True


class EnrichmentSettings(BaseModel):
    """Complete enrichment configuration"""
    virustotal: VirusTotalConfig = Field(default_factory=VirusTotalConfig)
    abuseipdb: AbuseIPDBConfig = Field(default_factory=AbuseIPDBConfig)
    misp: MISPConfig = Field(default_factory=MISPConfig)
    otx: EnrichmentServiceConfig = Field(default_factory=EnrichmentServiceConfig)
    urlvoid: EnrichmentServiceConfig = Field(default_factory=EnrichmentServiceConfig)
    shodan: EnrichmentServiceConfig = Field(default_factory=EnrichmentServiceConfig)

    # Global settings
    cache_ttl: int = Field(default=3600, description="Cache TTL in seconds")
    max_cache_size: int = Field(default=1000, description="Maximum cache entries")
    concurrent_requests: int = Field(default=5, description="Max concurrent enrichment requests")
    retry_attempts: int = Field(default=2, description="Number of retry attempts")
    enable_cache_compression: bool = True
    enable_auto_throttling: bool = True


class EnrichmentTest(BaseModel):
    """Test result for enrichment service"""
    service: str
    success: bool
    response_time: float
    error_message: str = None


# Mock storage (in real app, this would be in database)
_enrichment_settings = EnrichmentSettings()


@router.get("/settings", response_model=EnrichmentSettings)
async def get_enrichment_settings():
    """Get current enrichment settings"""
    return _enrichment_settings


@router.post("/settings", response_model=EnrichmentSettings)
async def update_enrichment_settings(settings: EnrichmentSettings):
    """Update enrichment settings"""
    global _enrichment_settings

    # Validate API keys are not empty for enabled services
    services = {
        'virustotal': settings.virustotal,
        'abuseipdb': settings.abuseipdb,
        'misp': settings.misp,
        'otx': settings.otx,
        'urlvoid': settings.urlvoid,
        'shodan': settings.shodan,
    }

    for service_name, service_config in services.items():
        if service_config.enabled and not service_config.api_key.strip():
            if service_name != 'misp':  # MISP might not need API key
                raise HTTPException(
                    status_code=400,
                    detail=f"API key is required for {service_name} when service is enabled"
                )

    # Additional MISP validation
    if settings.misp.enabled and not settings.misp.url.strip():
        raise HTTPException(
            status_code=400,
            detail="MISP URL is required when MISP service is enabled"
        )

    _enrichment_settings = settings
    logger.info("Enrichment settings updated successfully")
    return _enrichment_settings


@router.post("/test/{service_name}")
async def test_enrichment_service(service_name: str) -> EnrichmentTest:
    """Test connection to an enrichment service"""
    import time
    import random

    if service_name not in ['virustotal', 'abuseipdb', 'misp', 'otx', 'urlvoid', 'shodan']:
        raise HTTPException(status_code=400, detail="Invalid service name")

    service_config = getattr(_enrichment_settings, service_name)

    if not service_config.enabled:
        raise HTTPException(status_code=400, detail=f"{service_name} is not enabled")

    if not service_config.api_key.strip() and service_name != 'misp':
        raise HTTPException(status_code=400, detail=f"API key not configured for {service_name}")

    # Simulate API test (in real implementation, make actual API calls)
    start_time = time.time()

    try:
        # Simulate network delay
        await asyncio.sleep(random.uniform(0.5, 2.0))

        # Simulate success/failure (90% success rate)
        if random.random() < 0.9:
            response_time = time.time() - start_time
            return EnrichmentTest(
                service=service_name,
                success=True,
                response_time=round(response_time, 2)
            )
        else:
            return EnrichmentTest(
                service=service_name,
                success=False,
                response_time=round(time.time() - start_time, 2),
                error_message="Connection timeout or invalid credentials"
            )

    except Exception as e:
        return EnrichmentTest(
            service=service_name,
            success=False,
            response_time=round(time.time() - start_time, 2),
            error_message=str(e)
        )


@router.get("/stats")
async def get_enrichment_statistics():
    """Get enrichment usage statistics"""
    import random

    # Mock statistics (in real app, get from database/metrics store)
    services_stats = {}
    service_names = ['virustotal', 'abuseipdb', 'misp', 'otx', 'urlvoid', 'shodan']

    for service in service_names:
        service_config = getattr(_enrichment_settings, service)
        services_stats[service] = {
            'enabled': service_config.enabled,
            'requests_today': random.randint(0, 500) if service_config.enabled else 0,
            'success_rate': round(95 + random.random() * 5, 1) if service_config.enabled else 0,
            'avg_response_time': round(1 + random.random() * 3, 1) if service_config.enabled else 0,
            'cache_hits': random.randint(50, 200) if service_config.enabled else 0,
        }

    return {
        'total_enrichments': sum(s['requests_today'] for s in services_stats.values()),
        'cache_hit_rate': 98.5,
        'avg_response_time': 2.1,
        'services': services_stats,
        'global_stats': {
            'cache_size': random.randint(100, 1000),
            'active_services': sum(1 for s in services_stats.values() if s['enabled']),
            'total_services': len(service_names),
        }
    }


@router.post("/enrich")
async def enrich_ioc(
    ioc: str,
    ioc_type: str,
    services: List[str] = None
):
    """
    Enrich an IOC (Indicator of Compromise) using enabled services

    Args:
        ioc: The IOC value (IP, domain, hash, etc.)
        ioc_type: Type of IOC (ip, domain, hash, url)
        services: Optional list of specific services to use
    """
    if not ioc or not ioc_type:
        raise HTTPException(status_code=400, detail="IOC and IOC type are required")

    if ioc_type not in ['ip', 'domain', 'hash', 'url']:
        raise HTTPException(status_code=400, detail="Invalid IOC type")

    # Get enabled services
    enabled_services = []
    if _enrichment_settings.virustotal.enabled:
        enabled_services.append('virustotal')
    if _enrichment_settings.abuseipdb.enabled and ioc_type == 'ip':
        enabled_services.append('abuseipdb')
    if _enrichment_settings.misp.enabled:
        enabled_services.append('misp')
    # Add more services as needed

    if not enabled_services:
        return {'error': 'No enrichment services enabled'}

    # Filter by requested services if provided
    if services:
        enabled_services = [s for s in enabled_services if s in services]

    # Mock enrichment results
    results = {}
    for service in enabled_services:
        # In real implementation, call actual APIs
        results[service] = {
            'status': 'success',
            'data': {
                'reputation': 'clean' if random.random() > 0.1 else 'malicious',
                'confidence': random.randint(70, 100),
                'last_seen': '2024-01-15T10:30:00Z',
                'additional_info': f'Enriched by {service}'
            }
        }

    return {
        'ioc': ioc,
        'ioc_type': ioc_type,
        'enrichment_results': results,
        'timestamp': '2024-01-15T10:30:00Z'
    }


# Import asyncio at the top
import asyncio