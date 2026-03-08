from sqlmodel import Session
from .database import engine
from .Author import Author

def save_author(name, url, bio):
    author = Author(name=name, profile_url=url, bio=bio)

    with Session(engine) as session:
        session.add(author)
        session.commit()
        session.refresh(author)

    print("Autor guardado con ID:", author.id)
