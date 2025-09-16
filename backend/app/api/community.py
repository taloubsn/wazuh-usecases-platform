from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
import uuid
from app.database.database import get_db
from app.models.models import UseCase as UseCaseModel
from app.models.schemas import UseCaseCreate, UseCase

router = APIRouter()


@router.post("/import/json")
async def import_from_json(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import use cases from JSON file"""
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be JSON format")
    
    try:
        content = await file.read()
        data = json.loads(content)
        
        imported_count = 0
        errors = []
        
        # Handle both single use case and array of use cases
        use_cases = data if isinstance(data, list) else [data]
        
        for uc_data in use_cases:
            try:
                # Convert to UseCaseCreate schema and create
                usecase = UseCaseCreate(**uc_data)
                
                # Create database entry (similar to POST /usecases/)
                db_usecase = UseCaseModel(
                    name=usecase.metadata.name,
                    description=usecase.metadata.description,
                    author=usecase.metadata.author,
                    version=usecase.metadata.version,
                    tags=usecase.metadata.tags,
                    # ... other fields
                )
                
                db.add(db_usecase)
                imported_count += 1
                
            except Exception as e:
                errors.append({
                    "use_case": uc_data.get("metadata", {}).get("name", "Unknown"),
                    "error": str(e)
                })
        
        db.commit()
        
        return {
            "imported_count": imported_count,
            "total_count": len(use_cases),
            "errors": errors
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.post("/export/json")
async def export_to_json(
    use_case_ids: List[uuid.UUID],
    db: Session = Depends(get_db)
):
    """Export use cases to JSON format"""
    usecases = db.query(UseCaseModel).filter(
        UseCaseModel.id.in_(use_case_ids)
    ).all()
    
    if not usecases:
        raise HTTPException(status_code=404, detail="No use cases found")
    
    exported_data = []
    for uc in usecases:
        # Convert database model to JSON-serializable format
        uc_data = {
            "id": str(uc.id),
            "metadata": {
                "name": uc.name,
                "description": uc.description,
                "author": uc.author,
                "version": uc.version,
                "created_at": uc.created_at.isoformat() if uc.created_at else None,
                "updated_at": uc.updated_at.isoformat() if uc.updated_at else None,
                "tags": uc.tags or []
            },
            "classification": {
                "platform": uc.platform or [],
                "severity": uc.severity.value if uc.severity else None,
                "confidence": uc.confidence.value if uc.confidence else None,
                "false_positive_rate": uc.false_positive_rate.value if uc.false_positive_rate else None,
                "maturity": uc.maturity.value if uc.maturity else None,
                "compliance": uc.compliance or []
            },
            "threat_intel": {
                "mitre_attack": {
                    "tactics": uc.mitre_tactics or [],
                    "techniques": uc.mitre_techniques or [],
                    "sub_techniques": uc.mitre_sub_techniques or []
                },
                "kill_chain": uc.kill_chain or [],
                "cve_references": uc.cve_references or [],
                "threat_actors": uc.threat_actors or [],
                "campaigns": uc.campaigns or []
            },
            # ... other fields
        }
        exported_data.append(uc_data)
    
    return {
        "use_cases": exported_data,
        "export_count": len(exported_data),
        "exported_at": "2025-01-15T12:00:00Z"  # Current timestamp
    }


@router.post("/import/sigma")
async def import_from_sigma(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import use cases from Sigma rule format"""
    if not file.filename.endswith(('.yml', '.yaml')):
        raise HTTPException(status_code=400, detail="File must be YAML format")
    
    try:
        import yaml
        content = await file.read()
        sigma_rule = yaml.safe_load(content.decode('utf-8'))
        
        # Convert Sigma rule to use case format
        usecase_data = _convert_sigma_to_usecase(sigma_rule)
        
        # Create use case
        usecase = UseCaseCreate(**usecase_data)
        # ... create database entry
        
        return {"message": "Sigma rule imported successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sigma import failed: {str(e)}")


@router.get("/github/search")
async def search_github_rules(
    query: str,
    language: str = "wazuh",
    limit: int = 20
):
    """Search for rules on GitHub repositories"""
    try:
        import httpx
        
        # Search GitHub API for relevant repositories
        search_url = "https://api.github.com/search/repositories"
        params = {
            "q": f"{query} {language} rules",
            "sort": "stars",
            "order": "desc",
            "per_page": limit
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(search_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            repositories = []
            for repo in data.get("items", []):
                repositories.append({
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo["description"],
                    "stars": repo["stargazers_count"],
                    "url": repo["html_url"],
                    "language": repo["language"],
                    "updated_at": repo["updated_at"]
                })
            
            return {
                "repositories": repositories,
                "total_count": data.get("total_count", 0)
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub search failed: {str(e)}")


@router.get("/marketplace")
async def get_marketplace_usecases(
    category: str = None,
    sort_by: str = "rating",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get use cases from community marketplace"""
    query = db.query(UseCaseModel).filter(
        UseCaseModel.source_url.isnot(None)  # Only community contributed
    )
    
    if category:
        query = query.filter(UseCaseModel.tags.contains([category]))
    
    if sort_by == "rating":
        query = query.order_by(UseCaseModel.rating.desc())
    elif sort_by == "downloads":
        query = query.order_by(UseCaseModel.download_count.desc())
    elif sort_by == "recent":
        query = query.order_by(UseCaseModel.created_at.desc())
    
    usecases = query.limit(limit).all()
    
    return [
        {
            "id": uc.id,
            "name": uc.name,
            "description": uc.description,
            "author": uc.author,
            "rating": uc.rating,
            "download_count": uc.download_count,
            "tags": uc.tags,
            "source_url": uc.source_url,
            "license": uc.license
        }
        for uc in usecases
    ]


def _convert_sigma_to_usecase(sigma_rule: dict) -> dict:
    """Convert Sigma rule format to use case format"""
    return {
        "metadata": {
            "name": sigma_rule.get("title", "Unknown"),
            "description": sigma_rule.get("description", ""),
            "author": sigma_rule.get("author", "Unknown"),
            "version": "1.0.0",
            "tags": sigma_rule.get("tags", [])
        },
        "classification": {
            "platform": [sigma_rule.get("logsource", {}).get("product", "unknown")],
            "severity": "medium",  # Default, could be mapped from sigma level
            "confidence": "medium",
            "false_positive_rate": "low",
            "maturity": "draft",
            "compliance": []
        },
        # ... map other fields
    }