import time
import random
from stats import mostrar_estadisticas_finales
from Articles.saveArticle import save_article
from Articles.scrapArticle import searchArticles

def main():
    print("🔍 Escaneando Sitemap 1 (1000 artículos)...")
    articulos_capturados = searchArticles(limit=1000) 
    
    if not articulos_capturados:
        print("No se encontraron artículos nuevos en el scraper.")
        return # Sale de main, pero el script sigue abajo

    total = len(articulos_capturados)
    print(f"🚀 Iniciando volcado de {total} artículos...")
    print("🛡️ Modo 'Anti-Ban' activado (espera aleatoria entre peticiones).")
    
    for i, art_data in enumerate(articulos_capturados, 1):
        # Guardamos el artículo
        save_article(art_data)
        
        # 2. MARGEN DE SEGURIDAD:
        # Esperamos entre 1.5 y 3.5 segundos entre cada artículo
        # Esto hace que el tráfico parezca más "humano" y no un bot a toda velocidad
        espera = random.uniform(1.5, 3.5)
        
        if i < total: # No esperar después del último
            print(f"⏳ [{i}/{total}] Esperando {espera:.2f}s para el siguiente...")
            time.sleep(espera)

if __name__ == "__main__":
    main()

    # Al terminar, mostramos el reporte que configuramos antes
    mostrar_estadisticas_finales()