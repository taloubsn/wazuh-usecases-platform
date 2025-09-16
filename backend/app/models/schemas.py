from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class MaturityStatus(str, Enum):
    draft = "draft"
    testing = "testing"
    production = "production"
    deprecated = "deprecated"


class DeploymentStatus(str, Enum):
    draft = "draft"
    pending = "pending"
    deployed = "deployed"
    failed = "failed"


class UseCaseMetadata(BaseModel):
    name: str
    description: str
    author: str
    version: str = "1.0.0"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = []


class Classification(BaseModel):
    platform: List[str] = []
    severity: SeverityLevel
    confidence: SeverityLevel
    false_positive_rate: SeverityLevel
    maturity: MaturityStatus
    compliance: List[str] = []


class MitreAttack(BaseModel):
    tactics: List[str] = []
    techniques: List[str] = []
    sub_techniques: List[str] = []


class ThreatIntel(BaseModel):
    mitre_attack: MitreAttack
    kill_chain: List[str] = []
    cve_references: List[str] = []
    threat_actors: List[str] = []
    campaigns: List[str] = []


class ResourceRequirements(BaseModel):
    cpu: str = "minimal"
    memory: str = "< 100MB"
    storage: str = "< 10MB"


class TechnicalSpecs(BaseModel):
    wazuh_version: str = ">=4.4.0"
    dependencies: List[str] = []
    supported_log_sources: List[str] = []
    performance_impact: SeverityLevel = SeverityLevel.low
    resource_requirements: ResourceRequirements


class WazuhRule(BaseModel):
    id: str
    level: int
    xml_content: str
    description: str


class WazuhDecoder(BaseModel):
    name: str
    xml_content: str


class AgentConfiguration(BaseModel):
    xml_content: str
    target_os: List[str] = []
    modules: List[str] = []


class DetectionLogic(BaseModel):
    rules: List[WazuhRule] = []
    decoders: List[WazuhDecoder] = []
    agent_configuration: Optional[AgentConfiguration] = None


class ActiveResponse(BaseModel):
    linux_script: Optional[str] = None
    windows_script: Optional[str] = None


class ResponsePlaybook(BaseModel):
    immediate_actions: List[str] = []
    investigation_steps: List[str] = []
    containment: List[str] = []
    active_response: Optional[ActiveResponse] = None


class ThreatIntelligence(BaseModel):
    virustotal_integration: bool = False
    abuseipdb_lookup: bool = False
    custom_feeds: List[str] = []


class ContextData(BaseModel):
    geolocation: bool = False
    asn_lookup: bool = False
    domain_reputation: bool = False


class Enrichment(BaseModel):
    threat_intelligence: Optional[ThreatIntelligence] = None
    context_data: Optional[ContextData] = None


class TestCase(BaseModel):
    name: str
    input_log: str
    expected_alert: bool
    alert_level: Optional[int] = None


class Testing(BaseModel):
    test_cases: List[TestCase] = []
    validation_status: str = "pending"
    last_tested: Optional[datetime] = None


class Deployment(BaseModel):
    target_groups: List[str] = []
    deployment_status: DeploymentStatus = DeploymentStatus.draft
    deployment_date: Optional[datetime] = None
    rollback_available: bool = False


class Metrics(BaseModel):
    alerts_generated: int = 0
    true_positives: int = 0
    false_positives: int = 0
    precision: float = 0.0
    last_triggered: Optional[datetime] = None


class Community(BaseModel):
    source_url: Optional[str] = None
    license: str = "Apache-2.0"
    contributors: List[str] = []
    download_count: int = 0
    rating: float = 0.0


class UseCaseBase(BaseModel):
    metadata: UseCaseMetadata
    classification: Optional[Classification] = None
    threat_intel: Optional[ThreatIntel] = None  
    technical_specs: Optional[TechnicalSpecs] = None
    detection_logic: Optional[DetectionLogic] = None
    response_playbook: Optional[ResponsePlaybook] = None
    enrichment: Optional[Enrichment] = None
    testing: Optional[Testing] = None
    deployment: Optional[Deployment] = None
    metrics: Optional[Metrics] = None
    community: Optional[Community] = None


class UseCaseCreate(UseCaseBase):
    pass


class UseCaseSimple(BaseModel):
    """Simplified use case model for easy creation"""
    name: str
    description: str
    author: str = "Anonymous"
    version: str = "1.0.0"
    tags: List[str] = []
    
    # Basic classification
    platform: List[str] = []
    severity: SeverityLevel = SeverityLevel.medium
    confidence: SeverityLevel = SeverityLevel.medium
    false_positive_rate: str = "low"  # Changed to string for more flexibility
    maturity: MaturityStatus = MaturityStatus.draft

    # MITRE ATT&CK mapping
    mitre_tactics: List[str] = []
    mitre_techniques: List[str] = []
    wazuh_rule_id: str = ""

    # CVE and CVSS information
    cve: List[str] = []
    cvss_score: Optional[float] = None

    # Detection logic
    rules_xml: str = ""
    decoders_xml: str = ""
    agent_config_xml: str = ""

    # Response playbook
    response_priority: str = "medium"
    response_actions: str = ""
    automation_script: str = ""
    escalation_contact: str = ""
    immediate_actions: List[str] = []
    investigation_steps: List[str] = []
    containment_steps: List[str] = []


class UseCaseUpdate(BaseModel):
    metadata: Optional[UseCaseMetadata] = None
    classification: Optional[Classification] = None
    threat_intel: Optional[ThreatIntel] = None
    technical_specs: Optional[TechnicalSpecs] = None
    detection_logic: Optional[DetectionLogic] = None
    response_playbook: Optional[ResponsePlaybook] = None
    enrichment: Optional[Enrichment] = None
    testing: Optional[Testing] = None
    deployment: Optional[Deployment] = None
    metrics: Optional[Metrics] = None
    community: Optional[Community] = None


class UseCase(UseCaseBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID


class UseCaseResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    author: str
    version: str
    severity: SeverityLevel
    maturity: MaturityStatus
    deployment_status: DeploymentStatus
    created_at: datetime
    updated_at: datetime
    tags: List[str]
    platform: List[str] = []


class SearchRequest(BaseModel):
    query: Optional[str] = None
    filters: Dict[str, Any] = {}
    page: int = 1
    size: int = 20
    sort: Optional[str] = None


class SearchResponse(BaseModel):
    items: List[UseCaseResponse]
    total: int
    page: int
    size: int
    pages: int