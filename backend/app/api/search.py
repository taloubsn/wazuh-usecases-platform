from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.models import UseCase as UseCaseModel
from app.models.schemas import SearchRequest, SearchResponse, UseCaseResponse

router = APIRouter()


@router.post("/", response_model=SearchResponse)
async def search_usecases(search_request: SearchRequest, db: Session = Depends(get_db)):
    """Advanced search for use cases"""
    query = db.query(UseCaseModel)
    
    # Text search
    if search_request.query:
        search_term = f"%{search_request.query}%"
        query = query.filter(
            UseCaseModel.name.ilike(search_term) |
            UseCaseModel.description.ilike(search_term) |
            UseCaseModel.mitre_techniques.contains([search_request.query]) |
            UseCaseModel.tags.contains([search_request.query])
        )
    
    # Apply filters
    filters = search_request.filters
    
    if "severity" in filters:
        query = query.filter(UseCaseModel.severity == filters["severity"])
    
    if "maturity" in filters:
        query = query.filter(UseCaseModel.maturity == filters["maturity"])
    
    if "platform" in filters:
        query = query.filter(UseCaseModel.platform.contains([filters["platform"]]))
    
    if "mitre_tactic" in filters:
        query = query.filter(UseCaseModel.mitre_tactics.contains([filters["mitre_tactic"]]))
    
    if "mitre_technique" in filters:
        query = query.filter(UseCaseModel.mitre_techniques.contains([filters["mitre_technique"]]))
    
    if "deployment_status" in filters:
        query = query.filter(UseCaseModel.deployment_status == filters["deployment_status"])
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (search_request.page - 1) * search_request.size
    usecases = query.offset(offset).limit(search_request.size).all()
    
    # Convert to response format
    items = []
    for uc in usecases:
        items.append(UseCaseResponse(
            id=uc.id,
            name=uc.name,
            description=uc.description,
            author=uc.author,
            version=uc.version,
            severity=uc.severity,
            maturity=uc.maturity,
            deployment_status=uc.deployment_status,
            created_at=uc.created_at,
            updated_at=uc.updated_at,
            tags=uc.tags or []
        ))
    
    pages = (total + search_request.size - 1) // search_request.size
    
    return SearchResponse(
        items=items,
        total=total,
        page=search_request.page,
        size=search_request.size,
        pages=pages
    )


@router.get("/mitre-tactics")
async def get_mitre_tactics(db: Session = Depends(get_db)):
    """Get all available MITRE tactics from use cases"""
    result = db.execute(
        "SELECT DISTINCT jsonb_array_elements_text(mitre_tactics) as tactic "
        "FROM use_cases WHERE mitre_tactics IS NOT NULL"
    )
    tactics = [row[0] for row in result.fetchall()]
    return {"tactics": sorted(tactics)}


@router.get("/mitre-techniques")
async def get_mitre_techniques(db: Session = Depends(get_db)):
    """Get all available MITRE techniques from use cases"""
    result = db.execute(
        "SELECT DISTINCT jsonb_array_elements_text(mitre_techniques) as technique "
        "FROM use_cases WHERE mitre_techniques IS NOT NULL"
    )
    techniques = [row[0] for row in result.fetchall()]
    return {"techniques": sorted(techniques)}


@router.get("/tags")
async def get_tags(db: Session = Depends(get_db)):
    """Get all available tags from use cases"""
    result = db.execute(
        "SELECT DISTINCT jsonb_array_elements_text(tags) as tag "
        "FROM use_cases WHERE tags IS NOT NULL"
    )
    tags = [row[0] for row in result.fetchall()]
    return {"tags": sorted(tags)}


@router.get("/platforms")
async def get_platforms(db: Session = Depends(get_db)):
    """Get all available platforms from use cases"""
    result = db.execute(
        "SELECT DISTINCT jsonb_array_elements_text(platform) as platform "
        "FROM use_cases WHERE platform IS NOT NULL"
    )
    platforms = [row[0] for row in result.fetchall()]
    return {"platforms": sorted(platforms)}