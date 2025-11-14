from fastapi import APIRouter, Depends, HTTPException, status
from ..config import settings
from ..schemas import SuperadminLoginRequest, LoginResponse

router = APIRouter(prefix="/superadmin", tags=["superadmin"])

@router.post("/login", response_model=LoginResponse)
def superadmin_login(payload: SuperadminLoginRequest):
    # Compare against environment credentials (raw)
    if payload.email != settings.ADMIN_EMAIL or payload.passwd != settings.ADMIN_PASSWD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid superadmin credentials")

    return LoginResponse(
        status="success",
        message="Superadmin authenticated",
        role=settings.ADMIN_ROLE
    )
