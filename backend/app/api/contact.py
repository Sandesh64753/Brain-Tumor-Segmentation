from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactOut

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def submit_contact_form(contact_in: ContactCreate, db: Session = Depends(get_db)):
    contact_msg = ContactMessage(
        name=contact_in.name.strip(),
        email=contact_in.email.lower().strip(),
        subject=contact_in.subject.strip(),
        message=contact_in.message.strip()
    )
    db.add(contact_msg)
    db.commit()
    db.refresh(contact_msg)
    return ContactOut.model_validate(contact_msg)
