from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .routers import patient, superadmin, hospitals, bids
from .config import settings

# Create DB tables (for simplicity). In production use Alembic.
Base.metadata.create_all(bind=engine)



app = FastAPI(title=settings.APP_NAME)

# Add CORS middleware (must be after app is defined)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(patient.router)
app.include_router(superadmin.router)
app.include_router(bids.router)
app.include_router(hospitals.router)

@app.get("/")
def root():
    return {"app": settings.APP_NAME, "msg": "running"}
