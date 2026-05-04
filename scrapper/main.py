import time
import random
from stats import mostrar_estadisticas_finales

# Importamos los entrypoints de cada scraper
from Authors.scrapAuthor import buscarAutores
from Tags.scrapTag import searchTags
from Categories.scrapCategory import searchCategories
from Articles.scrapArticle import searchArticles
from Embeddings.process_articles import process_all_articles
from Topics import generate_topics
from sqlmodel import Session 
from database import engine, check_db_connection

def run_scrapers():
    print("🔵 1. Iniciando scraper de Autores...")
    buscarAutores()
    
    print("\n🔵 2. Iniciando scraper de Tags...")
    searchTags()
    
    print("\n🔵 3. Iniciando scraper de Categorías...")
    searchCategories()
    
    print("\n🔵 4. Iniciando scraper de Artículos (limit=1000)...")
    searchArticles() 
    
    print("✅ Todos los scrapers han finalizado.")

if __name__ == "__main__":
    # Verificamos la base de datos antes de hacer nada
    check_db_connection()

    # Ejecuta la secuencia de scrapers
    run_scrapers()

    print("\n🔵 5. Generando embeddings de artículos...")
    process_all_articles()

    print("\n🔵 6. Generando topics de artículos...")
    with Session(engine) as session:
        generate_topics(session)

    # Al terminar, mostramos el reporte
    mostrar_estadisticas_finales()