

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..db import get_db

router = APIRouter(prefix="/patient", tags=["patient"])

@router.post("/signup", response_model=schemas.LoginResponse, status_code=status.HTTP_201_CREATED)
def patient_signup(payload: schemas.PatientSignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = crud.get_patient_by_email(db, payload.emailid)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    patient = crud.create_patient(db, payload)
    response = schemas.LoginResponse(
        status="success",
        message="Signup successful",
        role=patient.role,
        patient=patient
    )
    return response

@router.post("/create-bid", response_model=schemas.BidOut, status_code=status.HTTP_201_CREATED)
def create_bid(payload: schemas.BidCreateRequest, db: Session = Depends(get_db)):
    bid = crud.create_bid(db, payload)
    return bid

@router.get("/by-email/{email}", response_model=schemas.PatientOut)
def get_patient_by_email(email: str, db: Session = Depends(get_db)):
    patient = crud.get_patient_by_email(db, email)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

@router.post("/login", response_model=schemas.LoginResponse)
def patient_login(payload: schemas.PatientLoginRequest, db: Session = Depends(get_db)):
    patient = crud.get_patient_by_email(db, payload.emailid)
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Raw password check (as requested)
    if patient.passwd != payload.passwd:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    response = schemas.LoginResponse(
        status="success",
        message="Login successful",
        role=patient.role,
        patient=patient
    )
    return response
