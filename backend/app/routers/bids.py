from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/bids",
    tags=["bids"]
)

@router.get("/by-email/{email}", response_model=List[schemas.BidOut])
def get_bids_by_email(email: str, db: Session = Depends(get_db)):
    bids = crud.get_bids_by_email(db, email)
    return bids



@router.get("/", response_model=List[schemas.BidOut])
def list_bids(db: Session = Depends(get_db)):
    """
    Get all bids (admin-ish). If you want patient-specific, use /by-email/ endpoint.
    """
    return crud.get_all_bids(db)


@router.patch("/{bid_id}/approve", response_model=schemas.BidOut)
def approve_bid(bid_id: int, db: Session = Depends(get_db)):
    """
    Set a bid's status to 'approved'
    """
    bid = crud.set_bid_status(db, bid_id, "approved")
    if not bid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bid not found")
    return bid


@router.patch("/{bid_id}/reject", response_model=schemas.BidOut)
def reject_bid(bid_id: int, db: Session = Depends(get_db)):
    """
    Set a bid's status to 'rejected'
    """
    bid = crud.set_bid_status(db, bid_id, "rejected")
    if not bid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bid not found")
    return bid