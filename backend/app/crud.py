
from sqlalchemy.orm import Session
from . import models, schemas

def get_patient_by_email(db: Session, email: str):
    return db.query(models.Patient).filter(models.Patient.emailid == email).first()

def create_patient(db: Session, payload: schemas.PatientSignupRequest):
    patient = models.Patient(
        name=payload.name,
        emailid=payload.emailid,
        passwd=payload.passwd,  # raw password stored
        role=payload.role or "patient"
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def create_bid(db: Session, payload: schemas.BidCreateRequest):
    bid = models.Bid(
        patient_id=payload.patient_id,
        medical_conditions=payload.medical_conditions,
        surgery_needed=payload.surgery_needed,
        surgery_area=payload.surgery_area,
        surgery_date=payload.surgery_date,
        hospital_id=payload.hospital_id,
        insurance=payload.insurance,
        insurance_balance=payload.insurance_balance,
        budget=payload.budget
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid

def get_all_hospitals(db: Session):
    return db.query(models.Hospital).all()

def get_hospital_by_id(db: Session, hospital_id: int):
    return db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()

def create_hospital(db: Session, payload: schemas.HospitalCreate):
    hospital = models.Hospital(
        name=payload.name,
        address=payload.address,
        quote=payload.quote
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


def get_bids_by_email(db: Session, email: str):
    """
    Fetch all bids for the patient that has this emailid.
    """
    # Step 1: get patient
    patient = db.query(models.Patient).filter(models.Patient.emailid == email).first()
    if not patient:
        return []

    # Step 2: get bids of that patient
    return db.query(models.Bid).filter(models.Bid.patient_id == patient.id).all()


def get_all_bids(db: Session):
    """
    Return all bids.
    """
    return db.query(models.Bid).order_by(models.Bid.id.desc()).all()

def get_bid_by_id(db: Session, bid_id: int):
    return db.query(models.Bid).filter(models.Bid.id == bid_id).first()

def set_bid_status(db: Session, bid_id: int, status: str):
    """
    Set status for a bid and return updated bid. status should be one of:
    'pending', 'approved', 'rejected'
    """
    bid = db.query(models.Bid).filter(models.Bid.id == bid_id).first()
    if not bid:
        return None
    bid.status = status
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid