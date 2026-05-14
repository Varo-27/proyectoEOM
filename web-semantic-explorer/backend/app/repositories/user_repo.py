from sqlmodel import Session, select
from app.models.user import User

def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

def create(*, session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def update(*, session: Session, db_user: User) -> User:
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
