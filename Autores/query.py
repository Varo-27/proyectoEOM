from sqlmodel import Session, select
from .database import engine
from .Author import Author

def get_all_authors():
    with Session(engine) as session:
        return session.exec(select(Author)).all()
