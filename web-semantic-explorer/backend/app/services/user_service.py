from typing import Any
from sqlmodel import Session

from app.core.security import get_password_hash
from app.models.user import User, UserCreate, UserUpdate
from app.repositories import user_repo

def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    return user_repo.create(session=session, user=db_obj)

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    return user_repo.update(session=session, db_user=db_user)
