from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.database.database import get_db
from app.models.models import UseCase as UseCaseModel, DeploymentLog
from app.services.wazuh_service import WazuhService

router = APIRouter()


@router.post("/{usecase_id}/deploy")
async def deploy_usecase(
    usecase_id: uuid.UUID,
    target_groups: List[str] = None,
    db: Session = Depends(get_db)
):
    """Deploy a use case to Wazuh Manager"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    try:
        wazuh_service = WazuhService()
        
        # Deploy rules and decoders
        deployment_result = await wazuh_service.deploy_usecase(
            usecase_id=str(usecase_id),
            rules=usecase.detection_rules or [],
            decoders=usecase.detection_decoders or [],
            target_groups=target_groups or usecase.target_groups or []
        )
        
        # Update use case deployment status
        usecase.deployment_status = "deployed" if deployment_result["success"] else "failed"
        usecase.target_groups = target_groups or usecase.target_groups
        
        # Log deployment
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="deploy",
            status="success" if deployment_result["success"] else "failed",
            message=deployment_result.get("message", ""),
            created_by="system"  # TODO: Get from authentication
        )
        db.add(log)
        db.commit()
        
        return {
            "success": deployment_result["success"],
            "message": deployment_result.get("message", ""),
            "deployment_id": deployment_result.get("deployment_id")
        }
        
    except Exception as e:
        # Log failed deployment
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="deploy",
            status="failed",
            message=str(e),
            created_by="system"
        )
        db.add(log)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")


@router.post("/{usecase_id}/rollback")
async def rollback_usecase(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Rollback a deployed use case"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    if not usecase.rollback_available:
        raise HTTPException(status_code=400, detail="Rollback not available for this use case")
    
    try:
        wazuh_service = WazuhService()
        
        # Perform rollback
        rollback_result = await wazuh_service.rollback_usecase(
            usecase_id=str(usecase_id)
        )
        
        # Update use case status
        usecase.deployment_status = "draft"
        
        # Log rollback
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="rollback",
            status="success" if rollback_result["success"] else "failed",
            message=rollback_result.get("message", ""),
            created_by="system"
        )
        db.add(log)
        db.commit()
        
        return {
            "success": rollback_result["success"],
            "message": rollback_result.get("message", "")
        }
        
    except Exception as e:
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="rollback",
            status="failed",
            message=str(e),
            created_by="system"
        )
        db.add(log)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")


@router.get("/{usecase_id}/status")
async def get_deployment_status(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get deployment status and logs for a use case"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    # Get deployment logs
    logs = db.query(DeploymentLog).filter(
        DeploymentLog.use_case_id == usecase_id
    ).order_by(DeploymentLog.created_at.desc()).limit(10).all()
    
    return {
        "use_case_id": usecase_id,
        "deployment_status": usecase.deployment_status,
        "deployment_date": usecase.deployment_date,
        "rollback_available": usecase.rollback_available,
        "target_groups": usecase.target_groups,
        "logs": [
            {
                "id": log.id,
                "action": log.action,
                "status": log.status,
                "message": log.message,
                "created_at": log.created_at,
                "created_by": log.created_by
            }
            for log in logs
        ]
    }


@router.post("/{usecase_id}/test")
async def test_usecase(usecase_id: uuid.UUID, db: Session = Depends(get_db)):
    """Test a use case with sample data"""
    usecase = db.query(UseCaseModel).filter(UseCaseModel.id == usecase_id).first()
    if not usecase:
        raise HTTPException(status_code=404, detail="Use case not found")
    
    try:
        wazuh_service = WazuhService()
        
        # Run tests with sample data
        test_result = await wazuh_service.test_usecase(
            usecase_id=str(usecase_id),
            test_cases=usecase.test_cases or []
        )
        
        # Update test status
        usecase.validation_status = "passed" if test_result["success"] else "failed"
        usecase.last_tested = test_result["tested_at"]
        
        # Log test
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="test",
            status="success" if test_result["success"] else "failed",
            message=test_result.get("message", ""),
            created_by="system"
        )
        db.add(log)
        db.commit()
        
        return {
            "success": test_result["success"],
            "message": test_result.get("message", ""),
            "test_results": test_result.get("results", []),
            "tested_at": test_result["tested_at"]
        }
        
    except Exception as e:
        log = DeploymentLog(
            use_case_id=usecase_id,
            action="test",
            status="failed",
            message=str(e),
            created_by="system"
        )
        db.add(log)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Testing failed: {str(e)}")


@router.get("/logs")
async def get_deployment_logs(
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """Get all deployment logs"""
    logs = db.query(DeploymentLog).order_by(
        DeploymentLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "use_case_id": log.use_case_id,
            "action": log.action,
            "status": log.status,
            "message": log.message,
            "created_at": log.created_at,
            "created_by": log.created_by
        }
        for log in logs
    ]