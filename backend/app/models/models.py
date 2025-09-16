from sqlalchemy import Column, String, DateTime, Text, JSON, Integer, Float, Boolean, Enum as SQLAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database.database import Base


class SeverityLevel(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class MaturityStatus(enum.Enum):
    draft = "draft"
    testing = "testing"
    production = "production"
    deprecated = "deprecated"


class DeploymentStatus(enum.Enum):
    draft = "draft"
    pending = "pending"
    deployed = "deployed"
    failed = "failed"


class UseCase(Base):
    __tablename__ = "use_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Metadata
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    version = Column(String, default="1.0.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    tags = Column(JSON, default=list)
    
    # Classification
    platform = Column(JSON, default=list)
    severity = Column(SQLAEnum(SeverityLevel), nullable=False)
    confidence = Column(SQLAEnum(SeverityLevel), nullable=False)
    false_positive_rate = Column(String, default="low")  # Changed to string for flexibility
    maturity = Column(SQLAEnum(MaturityStatus), default=MaturityStatus.draft)
    compliance = Column(JSON, default=list)
    
    # Threat Intelligence
    mitre_tactics = Column(JSON, default=list)
    mitre_techniques = Column(JSON, default=list)
    mitre_sub_techniques = Column(JSON, default=list)
    kill_chain = Column(JSON, default=list)
    cve_references = Column(JSON, default=list)
    threat_actors = Column(JSON, default=list)
    campaigns = Column(JSON, default=list)

    # Additional fields for enhanced form
    wazuh_rule_id = Column(String)
    cve = Column(JSON, default=list)  # Alias for cve_references
    cvss_score = Column(Float)
    
    # Technical Specs
    wazuh_version = Column(String, default=">=4.4.0")
    dependencies = Column(JSON, default=list)
    supported_log_sources = Column(JSON, default=list)
    performance_impact = Column(SQLAEnum(SeverityLevel), default=SeverityLevel.low)
    
    # Detection Logic (stored as JSON)
    detection_rules = Column(JSON, default=list)
    detection_decoders = Column(JSON, default=list)
    agent_configuration = Column(JSON)
    
    # Detection Logic XML (for simplified forms)
    rules_xml = Column(Text)
    decoders_xml = Column(Text)
    agent_config_xml = Column(Text)
    
    # Response Playbook
    immediate_actions = Column(JSON, default=list)
    investigation_steps = Column(JSON, default=list)
    containment_actions = Column(JSON, default=list)
    active_response_linux = Column(Text)
    active_response_windows = Column(Text)

    # Enhanced response fields
    response_priority = Column(String, default="medium")
    response_actions = Column(Text)
    automation_script = Column(Text)
    escalation_contact = Column(String)
    
    # Enrichment
    virustotal_integration = Column(Boolean, default=False)
    abuseipdb_lookup = Column(Boolean, default=False)
    custom_feeds = Column(JSON, default=list)
    geolocation = Column(Boolean, default=False)
    asn_lookup = Column(Boolean, default=False)
    domain_reputation = Column(Boolean, default=False)
    
    # Testing
    test_cases = Column(JSON, default=list)
    validation_status = Column(String, default="pending")
    last_tested = Column(DateTime(timezone=True))
    
    # Deployment
    target_groups = Column(JSON, default=list)
    deployment_status = Column(SQLAEnum(DeploymentStatus), default=DeploymentStatus.draft)
    deployment_date = Column(DateTime(timezone=True))
    rollback_available = Column(Boolean, default=False)
    
    # Metrics
    alerts_generated = Column(Integer, default=0)
    true_positives = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    precision = Column(Float, default=0.0)
    last_triggered = Column(DateTime(timezone=True))
    
    # Community
    source_url = Column(String)
    license = Column(String, default="Apache-2.0")
    contributors = Column(JSON, default=list)
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)


class UseCaseVersion(Base):
    __tablename__ = "use_case_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    use_case_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    version = Column(String, nullable=False)
    changes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=False)
    data = Column(JSON, nullable=False)


class DeploymentLog(Base):
    __tablename__ = "deployment_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    use_case_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    action = Column(String, nullable=False)  # deploy, rollback, test
    status = Column(String, nullable=False)  # success, failed, pending
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=False)