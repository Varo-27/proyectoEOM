import logging

from sqlalchemy import Engine, text
from sqlmodel import Session, SQLModel, func, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app import models  # noqa: F401 — registra modelos antes de create_all
from app.core.db import engine
from app.models.engagement import Rating

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init(db_engine: Engine) -> None:
    try:
        with Session(db_engine) as session:
            session.exec(select(1))
    except Exception as e:
        logger.error(e)
        raise e


def _ensure_rating_value_constraint(session: Session) -> None:
    """Permite almacenar medias estrellas como enteros 1–10 (0.5–5.0)."""
    session.connection().execute(
        text("ALTER TABLE rating DROP CONSTRAINT IF EXISTS rating_value_check")
    )
    session.connection().execute(
        text(
            "ALTER TABLE rating ADD CONSTRAINT rating_value_check "
            "CHECK (value >= 1 AND value <= 10)"
        )
    )


def migrate_ratings_to_half_units(session: Session) -> None:
    _ensure_rating_value_constraint(session)

    max_value = session.exec(select(func.max(Rating.value))).one()
    if max_value is None or max_value > 5:
        session.commit()
        return

    for rating in session.exec(select(Rating)).all():
        rating.value = rating.value * 2
        session.add(rating)
    session.commit()
    logger.info("Ratings migrated to half-star storage units")


def main() -> None:
    logger.info("Initializing service")
    init(engine)
    logger.info("Service finished initializing DB check")
    logger.info("Creating DB tables if not exist")
    SQLModel.metadata.create_all(engine)
    logger.info("Tables created or verified")
    with Session(engine) as session:
        migrate_ratings_to_half_units(session)


if __name__ == "__main__":
    main()
