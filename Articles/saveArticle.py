import logging
from sqlmodel import Session, select, col
from database import engine

# Importación de modelos
from .Article import Article
from .ArticleAuthor import ArticleAuthor
from .ArticleCategory import ArticleCategory
from .ArticleTag import ArticleTag
from .ArticlePlace import ArticlePlace
from Authors.Author import Author
from Categories.Category import Category
from Tags.Tag import Tag
from Places.Place import Place

# Usamos el logger configurado en el otro archivo
logger = logging.getLogger("scraper")

def get_tolerant(session: Session, model, field: str, value: str, article_url: str):
    val_clean = value.strip() if value else ""
    if not val_clean: return None

    # Búsqueda exacta
    obj = session.exec(select(model).where(getattr(model, field) == val_clean)).first()
    
    # Búsqueda por patrón (slugs)
    if not obj and model.__name__ in ["Category", "Tag", "Place"]:
        obj = session.exec(select(model).where(col(getattr(model, field)).like(f"%/{val_clean}"))).first()

    if not obj:
        # Esto va directo a critical_errors.log, no ensucia la consola
        logger.warning(f"FALTANTE | Modelo: {model.__name__} | Valor: '{val_clean}' | URL: {article_url}")
        return None
    return obj

BLACKLIST = ["suscripcion", "premium", "exclusivo"]

def save_article(data: dict, session: Session = None):
    # Gestión de sesión local o heredada
    local_session = session if session else Session(engine)

    try:
        new_article = Article(
            url=data["url"], title=data["title"], excerpt=data["excerpt"],
            content=data["content"], image_url=data["image_url"],
            date=data["date"], paywalled=data["paywalled"]
        )
        local_session.add(new_article)
        local_session.flush()

        # Relaciones
        for name in data.get("authors", []):
            auth = get_tolerant(local_session, Author, "name", name, data["url"])
            if auth: local_session.add(ArticleAuthor(article_id=new_article.id, author_id=auth.id))

        for slug in data.get("categories", []):
            if slug.lower() in BLACKLIST: continue
            cat = get_tolerant(local_session, Category, "slug", slug, data["url"])
            if cat: local_session.add(ArticleCategory(article_id=new_article.id, category_id=cat.id))

        for slug in data.get("places", []):
            place = get_tolerant(local_session, Place, "slug", slug, data["url"])
            if place: local_session.add(ArticlePlace(article_id=new_article.id, place_id=place.id))

        for slug in data.get("tags", []):
            if slug.lower() in BLACKLIST: continue
            tag = get_tolerant(local_session, Tag, "slug", slug, data["url"])
            if tag: local_session.add(ArticleTag(article_id=new_article.id, tag_id=tag.id))

        local_session.commit()
        return new_article

    except Exception as e:
        local_session.rollback()
        logger.error(f"Error guardando {data['url']}: {e}")
        return None
    finally:
        if not session: local_session.close()