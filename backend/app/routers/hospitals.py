# hospital.py (FastAPI router)
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas  # adjust relative import if needed
from app.db import get_db   # adjust to your get_db dependency

router = APIRouter(
    prefix="/hospitals",
    tags=["hospitals"],
)


@router.get("/", response_model=List[schemas.HospitalOut])
def list_hospitals(db: Session = Depends(get_db)):
    return crud.get_all_hospitals(db)


@router.get("/{hospital_id}", response_model=schemas.HospitalOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = crud.get_hospital_by_id(db, hospital_id)
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    return hospital


@router.post("/", response_model=schemas.HospitalOut, status_code=status.HTTP_201_CREATED)
def create_new_hospital(payload: schemas.HospitalCreate, db: Session = Depends(get_db)):
    return crud.create_hospital(db, payload)
