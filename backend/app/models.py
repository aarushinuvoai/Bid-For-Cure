from sqlalchemy import Column, Integer, String
from .db import Base
from sqlalchemy.sql import expression

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    medical_conditions = Column(String(512), nullable=False)
    surgery_needed = Column(String(256), nullable=False)
    surgery_area = Column(String(256), nullable=False)
    surgery_date = Column(String(64), nullable=False)
    hospital_id = Column(Integer, nullable=False)
    insurance = Column(String(256), nullable=True)
    insurance_balance = Column(String(64), nullable=True)
    budget = Column(String(64), nullable=True)
    status = Column(String(32), nullable=False, server_default=expression.literal_column("'pending'"), default="pending")



class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    emailid = Column(String(256), unique=True, nullable=False, index=True)
    passwd = Column(String(512), nullable=False)  # stored raw (insecure)
    role = Column(String(64), nullable=False, default="patient")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    address = Column(String(512), nullable=True)
    quote = Column(String(256), nullable=True)  # hospital quote/offer for surgery
