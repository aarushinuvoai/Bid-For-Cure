# ---- Bid Schemas ----
from pydantic import BaseModel, EmailStr
from typing import Optional

class BidCreateRequest(BaseModel):
    patient_id: int
    medical_conditions: str
    surgery_needed: str
    surgery_area: str
    surgery_date: str
    hospital_id: int
    insurance: Optional[str] = None
    insurance_balance: Optional[str] = None
    budget: Optional[str] = None


class HospitalCreate(BaseModel):
    name: str
    address: Optional[str] = None
    quote: Optional[str] = None

class HospitalOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    quote: Optional[str] = None

    class Config:
        from_attributes = True


class BidOut(BaseModel):
    id: int
    patient_id: int
    medical_conditions: str
    surgery_needed: str
    surgery_area: str
    surgery_date: str
    hospital_id: int
    insurance: Optional[str] = None
    insurance_balance: Optional[str] = None
    budget: Optional[str] = None
    status: str  # new field

    class Config:
        from_attributes = True


# ---- Requests ----
class PatientSignupRequest(BaseModel):
    name: str
    emailid: EmailStr
    passwd: str
    role: Optional[str] = "patient"

class PatientLoginRequest(BaseModel):
    emailid: EmailStr
    passwd: str

class SuperadminLoginRequest(BaseModel):
    email: EmailStr
    passwd: str

# ---- Responses ----
class PatientOut(BaseModel):
    id: int
    name: str
    emailid: EmailStr
    role: str

    class Config:
           from_attributes = True

class LoginResponse(BaseModel):
    status: str
    message: str
    role: Optional[str] = None
    patient: Optional[PatientOut] = None
