from sqlmodel import Session, select
from database import engine
from .Place import Place

def get_all_places():
    with Session(engine) as session:
        return session.exec(select(Place)).all()
