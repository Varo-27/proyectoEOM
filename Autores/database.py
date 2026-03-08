from sqlmodel import SQLModel, create_engine

DATABASE_URL = "postgresql://admin:renaido@localhost:5432/EOM"


engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)
