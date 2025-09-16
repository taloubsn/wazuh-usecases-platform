from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.database.database import get_db
from app.models.models import UseCase as UseCaseModel
from app.models.schemas import (
    UseCase, UseCaseCreate, UseCaseUpdate, UseCaseResponse, UseCaseSimple,
    SearchRequest, SearchResponse, UseCaseMetadata, Classification, DetectionLogic,
    ResponsePlaybook, Testing, Deployment, Metrics, Community, WazuhRule, WazuhDecoder,
    SeverityLevel, MaturityStatus, DeploymentStatus, ThreatIntel, TechnicalSpecs,
    MitreAttack, Enrichment, ThreatIntelligence, ContextData, ActiveResponse,
    ResourceRequirements, AgentConfiguration
)

router = APIRouter()


@router.post("/", response_model=UseCase)
async def create_usecase(usecase: UseCaseCreate, db: Session = Depends(get_db)):
    """Create a new use case"""
    db_usecase = UseCaseModel(
        # Metadata
        name=usecase.metadata.name,
        description=usecase.metadata.description,
        author=usecase.metadata.author,
        version=usecase.metadata.version,
        tags=usecase.metadata.tags,
        
        # Classification
        platform=usecase.classification.platform,
        severity=usecase.classification.severity,
        confidence=usecase.classification.confidence,
        false_positive_rate=usecase.classification.false_positive_rate,
        maturity=usecase.classification.maturity,
        compliance=usecase.classification.compliance,
        
        # Threat Intel
        mitre_tactics=usecase.threat_intel.mitre_attack.tactics,
        mitre_techniques=usecase.threat_intel.mitre_attack.techniques,
        mitre_sub_techniques=usecase.threat_intel.mitre_attack.sub_techniques,
        kill_chain=usecase.threat_intel.kill_chain,
        cve_references=usecase.threat_intel.cve_references,
        threat_actors=usecase.threat_intel.threat_actors,
        campaigns=usecase.threat_intel.campaigns,
        
        # Technical Specs
        wazuh_version=usecase.technical_specs.wazuh_version,
        dependencies=usecase.technical_specs.dependencies,
        supported_log_sources=usecase.technical_specs.supported_log_sources,
        performance_impact=usecase.technical_specs.performance_impact,
        
        # Detection Logic
        detection_rules=[rule.dict() for rule in usecase.detection_logic.rules],
        detection_decoders=[decoder.dict() for decoder in usecase.detection_logic.decoders],
        agent_configuration=usecase.detection_logic.agent_configuration.dict() if usecase.detection_logic.agent_configuration else None,
        
        # Response Playbook
        immediate_actions=usecase.response_playbook.immediate_actions,
        investigation_steps=usecase.response_playbook.investigation_steps,
        containment_actions=usecase.response_playbook.containment,
        active_response_linux=usecase.response_playbook.active_response.linux_script if usecase.response_playbook.active_response else None,
        active_response_windows=usecase.response_playbook.active_response.windows_script if usecase.response_playbook.active_response else None,
        
        # Enrichment
        virustotal_integration=usecase.enrichment.threat_intelligence.virustotal_integration,
        abuseipdb_lookup=usecase.enrichment.threat_intelligence.abuseipdb_lookup,
        custom_feeds=usecase.enrichment.threat_intelligence.custom_feeds,
        geolocation=usecase.enrichment.context_data.geolocation,
        asn_lookup=usecase.enrichment.context_data.asn_lookup,
        domain_reputation=usecase.enrichment.context_data.domain_reputation,
        
        # Testing
        test_cases=[test.dict() for test in usecase.testing.test_cases],
        validation_status=usecase.testing.validation_status,
        last_tested=usecase.testing.last_tested,
        
        # Deployment
        target_groups=usecase.deployment.target_groups,
        deployment_status=usecase.deployment.deployment_status,
        deployment_date=usecase.deployment.deployment_date,
        rollback_available=usecase.deployment.rollback_available,
        
        # Metrics
        alerts_generated=usecase.metrics.alerts_generated,
        true_positives=usecase.metrics.true_positives,
        false_positives=usecase.metrics.false_positives,
        precision=usecase.metrics.precision,
        last_triggered=usecase.metrics.last_triggered,
        
        # Community
        source_url=usecase.community.source_url,
        license=usecase.community.license,
        contributors=usecase.community.contributors,
        download_count=usecase.community.download_count,
        rating=usecase.community.rating
    )
    
    db.add(db_usecase)
    db.commit()
    db.refresh(db_usecase)
    
    return _convert_to_usecase_schema(db_usecase)


@router.get("/", response_model=List[UseCaseResponse])
async def list_usecases(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tag: Optional[str] = None,
    severity: Optional[str] = None,
    maturity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all use cases with optional filters"""
    query = db.query(UseCaseModel)
    
    if tag:
        query = query.filter(UseCaseModel.tags.contains([tag]))
    if severity:
        query = query.filter(UseCaseModel.severity == severity)
    if maturity:
        query = query.filter(UseCaseModel.maturity == maturity)
    
    usecases = query.offset(skip).limit(limit).all()
    
    return [_convert_to_response_schema(uc) for uc in usecases]


@router.get("/{usecase_id}", response_model=UseCase)
async def get_usecase(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific use case by ID"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    return _convert_to_usecase_schema(usecase)


@router.put("/{usecase_id}", response_model=UseCase)
async def update_usecase(
    usecase_id: uuid.UUID, 
    usecase_update: UseCaseUpdate, 
    db: Session = Depends(get_db)
):
    """Update a use case"""
    db_usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not db_usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Update fields if provided
    update_data = usecase_update.dict(exclude_unset=True)
    
    if "metadata" in update_data:
        metadata = update_data["metadata"]
        if "name" in metadata:
            db_usecase.name = metadata["name"]
        if "description" in metadata:
            db_usecase.description = metadata["description"]
        if "author" in metadata:
            db_usecase.author = metadata["author"]
        if "version" in metadata:
            db_usecase.version = metadata["version"]
        if "tags" in metadata:
            db_usecase.tags = metadata["tags"]
    
    # Add similar updates for other fields...
    
    db.commit()
    db.refresh(db_usecase)
    
    return _convert_to_usecase_schema(db_usecase)


@router.delete("/{usecase_id}")
async def delete_usecase(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a use case"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    db.delete(usecase)
    db.commit()
    
    return {"message": "Use case deleted successfully"}


def _convert_to_usecase_schema(db_usecase: UseCaseModel) -> UseCase:
    """Convert database model to Pydantic schema"""
    from app.models.schemas import (
        UseCaseMetadata, Classification, ThreatIntel, MitreAttack,
        TechnicalSpecs, DetectionLogic, ResponsePlaybook, Enrichment,
        Testing, Deployment, Metrics, Community, ResourceRequirements,
        ThreatIntelligence, ContextData, ActiveResponse, WazuhRule, WazuhDecoder, AgentConfiguration
    )
    
    return UseCase(
        id=db_usecase.id,
        metadata=UseCaseMetadata(
            name=db_usecase.name,
            description=db_usecase.description,
            author=db_usecase.author,
            version=db_usecase.version,
            created_at=db_usecase.created_at,
            updated_at=db_usecase.updated_at,
            tags=db_usecase.tags or []
        ),
        classification=Classification(
            platform=db_usecase.platform or [],
            severity=db_usecase.severity,
            confidence=db_usecase.confidence,
            false_positive_rate=db_usecase.false_positive_rate,
            maturity=db_usecase.maturity,
            compliance=db_usecase.compliance or []
        ),
        threat_intel=ThreatIntel(
            mitre_attack=MitreAttack(
                tactics=db_usecase.mitre_tactics or [],
                techniques=db_usecase.mitre_techniques or [],
                sub_techniques=[]
            ),
            kill_chain=[],
            cve_references=db_usecase.cve or [],
            threat_actors=[],
            campaigns=[]
        ),
        technical_specs=TechnicalSpecs(
            wazuh_version=db_usecase.wazuh_version or ">=4.4.0",
            dependencies=db_usecase.dependencies or [],
            supported_log_sources=db_usecase.supported_log_sources or [],
            performance_impact=db_usecase.performance_impact or "low",
            resource_requirements=ResourceRequirements()
        ),
        detection_logic=DetectionLogic(
            rules=[WazuhRule(id="100001", level=5, xml_content=db_usecase.rules_xml or "", description="Custom rule")] if db_usecase.rules_xml else [],
            decoders=[WazuhDecoder(name="decoder", xml_content=db_usecase.decoders_xml or "")] if db_usecase.decoders_xml else [],
            agent_configuration=AgentConfiguration(xml_content=db_usecase.agent_config_xml or "", target_os=[], modules=[]) if db_usecase.agent_config_xml else None
        ),
        response_playbook=ResponsePlaybook(
            immediate_actions=db_usecase.immediate_actions or [],
            investigation_steps=db_usecase.investigation_steps or [],
            containment=db_usecase.containment_actions or [],
            active_response=ActiveResponse(
                linux_script=db_usecase.automation_script,
                windows_script=db_usecase.automation_script
            ) if db_usecase.automation_script else None
        ),
        enrichment=Enrichment(
            threat_intelligence=ThreatIntelligence(
                virustotal_integration=db_usecase.virustotal_integration or False,
                abuseipdb_lookup=db_usecase.abuseipdb_lookup or False,
                custom_feeds=db_usecase.custom_feeds or []
            ),
            context_data=ContextData(
                geolocation=db_usecase.geolocation or False,
                asn_lookup=db_usecase.asn_lookup or False,
                domain_reputation=db_usecase.domain_reputation or False
            )
        ),
        testing=Testing(
            test_cases=db_usecase.test_cases or [],
            validation_status=db_usecase.validation_status or "pending",
            last_tested=db_usecase.last_tested
        ),
        deployment=Deployment(
            target_groups=db_usecase.target_groups or [],
            deployment_status=db_usecase.deployment_status or "draft",
            deployment_date=db_usecase.deployment_date,
            rollback_available=db_usecase.rollback_available or False
        ),
        metrics=Metrics(
            alerts_generated=db_usecase.alerts_generated or 0,
            true_positives=db_usecase.true_positives or 0,
            false_positives=db_usecase.false_positives or 0,
            precision=db_usecase.precision or 0.0,
            last_triggered=db_usecase.last_triggered
        ),
        community=Community(
            source_url=db_usecase.source_url,
            license=db_usecase.license or "Apache-2.0",
            contributors=db_usecase.contributors or [],
            download_count=db_usecase.download_count or 0,
            rating=db_usecase.rating or 0.0
        )
    )


def _convert_to_response_schema(db_usecase: UseCaseModel) -> UseCaseResponse:
    """Convert database model to response schema"""
    return UseCaseResponse(
        id=db_usecase.id,
        name=db_usecase.name,
        description=db_usecase.description,
        author=db_usecase.author,
        version=db_usecase.version,
        severity=db_usecase.severity,
        maturity=db_usecase.maturity,
        deployment_status=db_usecase.deployment_status,
        created_at=db_usecase.created_at,
        updated_at=db_usecase.updated_at,
        tags=db_usecase.tags or [],
        platform=db_usecase.platform or []
    )


@router.post("/simple", response_model=UseCase)
async def create_simple_usecase(usecase: UseCaseSimple, db: Session = Depends(get_db)):
    """Create a new use case with simplified form"""
    from datetime import datetime
    
    # Create the database record with simplified data
    db_usecase = UseCaseModel(
        # Basic metadata
        name=usecase.name,
        description=usecase.description,
        author=usecase.author,
        version=usecase.version,
        tags=usecase.tags,
        
        # Basic classification
        platform=usecase.platform,
        severity=usecase.severity,
        confidence=usecase.confidence,
        false_positive_rate=usecase.false_positive_rate,
        maturity=usecase.maturity,
        compliance=[],
        
        # Enhanced threat intel from form
        mitre_tactics=usecase.mitre_tactics,
        mitre_techniques=usecase.mitre_techniques,
        mitre_sub_techniques=[],
        kill_chain=[],
        cve_references=usecase.cve,  # Map cve field to cve_references
        threat_actors=[],
        campaigns=[],

        # New enhanced fields
        wazuh_rule_id=usecase.wazuh_rule_id,
        cve=usecase.cve,
        cvss_score=usecase.cvss_score,
        
        # Technical specs defaults
        wazuh_version="4.0+",
        dependencies=[],
        supported_log_sources=[],
        performance_impact="low",
        
        # Detection Logic XML
        rules_xml=usecase.rules_xml,
        decoders_xml=usecase.decoders_xml,
        agent_config_xml=usecase.agent_config_xml,
        
        # Enhanced playbook actions
        immediate_actions=usecase.immediate_actions,
        investigation_steps=usecase.investigation_steps,
        containment_actions=usecase.containment_steps,
        response_priority=usecase.response_priority,
        response_actions=usecase.response_actions,
        automation_script=usecase.automation_script,
        escalation_contact=usecase.escalation_contact,
        
        # Default values for other fields
        deployment_status=DeploymentStatus.draft,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        
        # Metrics defaults
        alerts_generated=0,
        true_positives=0,
        false_positives=0,
        precision=0.0,
        
        # Community defaults
        license="Apache-2.0",
        contributors=[],
        download_count=0,
        rating=0.0
    )
    
    db.add(db_usecase)
    db.commit()
    db.refresh(db_usecase)
    
    return _convert_to_usecase_schema(db_usecase)


@router.put("/simple/{usecase_id}", response_model=UseCase)
async def update_simple_usecase(
    usecase_id: uuid.UUID, 
    usecase: UseCaseSimple, 
    db: Session = Depends(get_db)
):
    """Update a use case with simplified form"""
    from datetime import datetime
    
    # Get existing use case
    db_usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not db_usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Update fields
    db_usecase.name = usecase.name
    db_usecase.description = usecase.description
    db_usecase.author = usecase.author
    db_usecase.version = usecase.version
    db_usecase.tags = usecase.tags
    db_usecase.updated_at = datetime.utcnow()
    
    # Update classification
    db_usecase.platform = usecase.platform
    db_usecase.severity = usecase.severity
    db_usecase.confidence = usecase.confidence
    db_usecase.false_positive_rate = usecase.false_positive_rate
    db_usecase.maturity = usecase.maturity

    # Update MITRE ATT&CK mapping
    db_usecase.mitre_tactics = usecase.mitre_tactics
    db_usecase.mitre_techniques = usecase.mitre_techniques
    db_usecase.wazuh_rule_id = usecase.wazuh_rule_id
    db_usecase.cve = usecase.cve
    db_usecase.cve_references = usecase.cve
    db_usecase.cvss_score = usecase.cvss_score

    # Update detection logic XML
    db_usecase.rules_xml = usecase.rules_xml
    db_usecase.decoders_xml = usecase.decoders_xml
    db_usecase.agent_config_xml = usecase.agent_config_xml

    # Update enhanced playbook actions
    db_usecase.immediate_actions = usecase.immediate_actions
    db_usecase.investigation_steps = usecase.investigation_steps
    db_usecase.containment_actions = usecase.containment_steps
    db_usecase.response_priority = usecase.response_priority
    db_usecase.response_actions = usecase.response_actions
    db_usecase.automation_script = usecase.automation_script
    db_usecase.escalation_contact = usecase.escalation_contact

    db.commit()
    db.refresh(db_usecase)

    return _convert_to_usecase_schema(db_usecase)


@router.get("/simple/{usecase_id}")
async def get_simple_usecase(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a use case in simplified format"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")

    # Return simplified format that matches the form
    return {
        "id": usecase.id,
        "name": usecase.name,
        "description": usecase.description,
        "author": usecase.author,
        "version": usecase.version,
        "tags": usecase.tags or [],
        "platform": usecase.platform or [],
        "severity": usecase.severity,
        "confidence": usecase.confidence,
        "false_positive_rate": usecase.false_positive_rate,
        "maturity": usecase.maturity,
        "mitre_tactics": usecase.mitre_tactics or [],
        "mitre_techniques": usecase.mitre_techniques or [],
        "wazuh_rule_id": usecase.wazuh_rule_id,
        "cve": usecase.cve or [],
        "cvss_score": usecase.cvss_score,
        "rules_xml": usecase.rules_xml,
        "decoders_xml": usecase.decoders_xml,
        "agent_config_xml": usecase.agent_config_xml,
        "response_priority": usecase.response_priority,
        "escalation_contact": usecase.escalation_contact,
        "response_actions": usecase.response_actions,
        "automation_script": usecase.automation_script,
        "immediate_actions": usecase.immediate_actions or [],
        "investigation_steps": usecase.investigation_steps or [],
        "containment_steps": usecase.containment_actions or [],
        "created_at": usecase.created_at,
        "updated_at": usecase.updated_at,
    }