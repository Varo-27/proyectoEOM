from sqlmodel import Session
from database import engine
from .Place import Place

def save_place(name, slug, url):
    category = Place(name=name, slug=slug, url=url)

    with Session(engine) as session:
        session.add(category)
        session.commit()
        session.refresh(category)

    print("Autor guardado con ID:", category.id)
