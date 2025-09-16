from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import usecases, search, deployment, community, wazuh, enrichment
from app.database.database import Base, engine

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    debug=settings.debug
)

# Create database tables after app initialization
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("Database will be created when first accessed")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(usecases.router, prefix="/api/v1/usecases", tags=["usecases"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(deployment.router, prefix="/api/v1/deployment", tags=["deployment"])
app.include_router(community.router, prefix="/api/v1/community", tags=["community"])
app.include_router(wazuh.router, prefix="/api/v1/wazuh", tags=["wazuh"])
app.include_router(enrichment.router, prefix="/api/v1/enrichment", tags=["enrichment"])


@app.get("/")
async def root():
    return {
        "message": "Wazuh Use Cases & Playbooks Platform API",
        "version": settings.version,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.version}