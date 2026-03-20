import requests
from bs4 import BeautifulSoup
from utils import get_headers
from datetime import datetime
import time
import random
import re
import logging
from sqlmodel import Session, select
from database import engine
from Articles.Article import Article

# Importamos la función de guardado
from .saveArticle import save_article

# --- CONFIGURACIÓN DE LOGS PROFESIONAL ---
logger = logging.getLogger("scraper")
logger.setLevel(logging.DEBUG)

# Handler para CONSOLA (Limpio: solo Info y errores)
c_handler = logging.StreamHandler()
c_handler.setLevel(logging.INFO)
c_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

# Handler para ARCHIVO (Detallado: Warnings y Errores críticos)
f_handler = logging.FileHandler("critical_errors.log", encoding='utf-8')
f_handler.setLevel(logging.WARNING)
f_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

logger.addHandler(c_handler)
logger.addHandler(f_handler)

# Silenciamos el ruido de SQLAlchemy y Requests
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

def extract_authors(soup):
    authors = []
    author_blocks = soup.select(".author.vcard a") or soup.select("[rel='author']")
    if author_blocks:
        authors = [a.get_text(strip=True) for a in author_blocks]
    
    if not authors:
        meta_auth = soup.find("meta", attrs={"name": "author"})
        if meta_auth: authors = [meta_auth.get("content", "")]

    if not authors or len(authors) == 1:
        raw_text = authors[0] if authors else ""
        if not raw_text:
            auth_div = soup.select_one(".entry-content-head-author")
            if auth_div: raw_text = auth_div.get_text(strip=True).replace("Por", "", 1).strip()

        if raw_text and raw_text != "El Orden Mundial":
            parts = re.split(r',\s*|\s+y\s+', raw_text)
            authors = [p.strip() for p in parts if p.strip()]

    final = list(dict.fromkeys([a for a in authors if a]))
    if not final or final == ["El Orden Mundial"]: return ["El Orden Mundial"]
    if len(final) > 1 and "El Orden Mundial" in final: final.remove("El Orden Mundial")
    return final

def article_scraper(url: str):
    if any(url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.xml', '.gif']):
        return None
    try:
        resp = requests.get(url, headers=get_headers(), timeout=20)
        if resp.status_code != 200: return None
        soup = BeautifulSoup(resp.text, 'lxml')
        article_tag = soup.find("article")
        if not article_tag: return None

        # Fecha
        date_tag = soup.find("time", attrs={"datetime": True})
        db_date = datetime.now()
        if date_tag:
            try:
                db_date = datetime.fromisoformat(date_tag.get("datetime").split('+')[0])
            except: pass

        # Contenido y Paywall
        is_paywalled = soup.select_one(".payment-wall, .mepr-unauthorized-excerpt") is not None
        content_div = soup.select_one(".mepr-unauthorized-excerpt") if is_paywalled else soup.select_one(".entry-content")
        db_content = ""
        if content_div:
            for noise in content_div.select(".entry-content-head, .audioarticulo, .payment-wall, .cbxwpbkmarkwrap, script, ins, .share-pill-wrapper, .post-tags"):
                noise.decompose()
            db_content = content_div.get_text("\n\n", strip=True)

        # Taxonomías
        classes = article_tag.get('class', [])
        return {
            "url": url,
            "title": (soup.select_one("h1.entry-title") or soup.find("h1")).get_text(strip=True),
            "excerpt": (soup.select_one(".entry-header__entradilla, .excerpt") or soup.find(text=True)).strip()[:300],
            "content": db_content,
            "date": db_date,
            "authors": extract_authors(soup),
            "categories": [c.replace('category-', '') for c in classes if c.startswith('category-')],
            "places": [c.replace('lugar-', '') for c in classes if c.startswith('lugar-')],
            "tags": [c.replace('tag-', '') for c in classes if c.startswith('tag-')],
            "image_url": (soup.select_one(".post-thumbnail img") or {}).get('src', ""),
            "paywalled": is_paywalled
        }
    except Exception as e:
        logger.error(f"Error en scraper para {url}: {e}")
        return None

def searchArticles(limit=1000):
    sitemap_url = "https://elordenmundial.com/post-sitemap4.xml"
    logger.info(f"🚀 Iniciando captura masiva: Objetivo {limit} artículos")
    
    try:
        resp = requests.get(sitemap_url, headers=get_headers())
        urls = [loc.text for loc in BeautifulSoup(resp.text, 'xml').find_all("loc")]
        
        count = 0
        with Session(engine) as session:
            for url in urls:
                if count >= limit: break
                
                # Salto rápido si ya existe
                if session.exec(select(Article).where(Article.url == url)).first():
                    continue 
                
                data = article_scraper(url)
                if data:
                    if save_article(data, session=session):
                        count += 1
                        if count % 10 == 0: logger.info(f"📊 Progreso: {count}/{limit}")
                    time.sleep(random.uniform(1.5, 2.5))
        
        logger.info(f"✨ Finalizado. {count} nuevos artículos en la DB.")
    except Exception as e:
        logger.error(f"Fallo masivo: {e}", exc_info=True)