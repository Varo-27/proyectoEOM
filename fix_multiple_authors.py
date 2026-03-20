from sqlmodel import Session, select
from database import engine

# Importación de modelos
from Articles.Article import Article
from Authors.Author import Author
from Articles.ArticleAuthor import ArticleAuthor

# Lista de errores extraída de tu log
ERRORES_LOG = [
    ("https://elordenmundial.com/guia-michelin-elitista-sesgada-alta-cocina-gastronomia/", "Álvaro Merino, Alba Leiva"),
    ("https://elordenmundial.com/otan-gasto-defensa-trump-espana/", "David Gómez, Carmen Martín"),
    ("https://elordenmundial.com/que-es-usaid/", "Rodrigo Castellanos, Nerea Seijas"),
    ("https://elordenmundial.com/entrevista-tarja-halonen-finlandia-ucrania-union-europea-seguridad/", "Jara Monter"),
    ("https://elordenmundial.com/mejores-mapas-el-orden-mundial-eom-2025/", "José Luis Marín, Celia Hernando, Álvaro Merino, Jara Monter"),
    ("https://elordenmundial.com/doctrina-monroe/", "Natalia Ochoa, Candela Pons"),
    ("https://elordenmundial.com/alemania-economia-crisis-modelo-politica/", "David Gómez, Álvaro Merino"),
    ("https://elordenmundial.com/kurdistan-kurdos-siria-fds-pkk-turquia-irak-iran/", "Jara Monter"),
    ("https://elordenmundial.com/union-europea-ue-groenlandia-trump/", "Pauline Eiselt, Celia Hernando"),
    ("https://elordenmundial.com/trump-iran-ataque-estados-unidos/", "Celia Hernando, Jara Monter"),
    ("https://elordenmundial.com/cierre-estrecho-ormuz-crisis-energetica/", "Álvaro Merino, Miguel Gómez Catalán"),
    ("https://elordenmundial.com/claves-ataque-estados-unidos-israel-iran/", "José Manuel Cuevas, José Luis Marín"),
    ("https://elordenmundial.com/iran-escenarios-futuro-transicion-guerra-civil/", "Jara Monter"),
    ("https://elordenmundial.com/sucesion-lider-supremo-iran/", "Mencía Montoya Barreiros, Pauline Eiselt"),
    ("https://elordenmundial.com/israel-estrategia-oriente-proximo-iran-palestina-hezbola/", "Jara Monter"),
]

def reparar_relaciones_autores():
    with Session(engine) as session:
        print("🛠️  Iniciando reparación de autores múltiples...")
        total_creados = 0

        for url, cadena_autores in ERRORES_LOG:
            # 1. Buscar el artículo
            articulo = session.exec(select(Article).where(Article.url == url)).first()
            if not articulo:
                print(f"❌ Artículo no encontrado: {url}")
                continue

            # 2. Separar los autores por la coma y limpiar espacios
            nombres_individuales = [n.strip() for n in cadena_autores.split(",")]

            for nombre in nombres_individuales:
                # 3. Buscar el autor en la DB
                autor = session.exec(select(Author).where(Author.name == nombre)).first()
                
                if not autor:
                    print(f"⚠️  Autor no existe en DB: '{nombre}' (Revisa si tiene tildes o espacios)")
                    continue

                # 4. Verificar si la relación ya existe
                existe = session.exec(
                    select(ArticleAuthor).where(
                        ArticleAuthor.article_id == articulo.id,
                        ArticleAuthor.author_id == autor.id
                    )
                ).first()

                if not existe:
                    relacion = ArticleAuthor(article_id=articulo.id, author_id=autor.id)
                    session.add(relacion)
                    total_creados += 1
                    print(f"✅ Enlazado: {nombre} ↔️ {articulo.title[:40]}...")

        session.commit()
        print(f"\n✨ ¡Hecho! Se han creado {total_creados} relaciones de autoría.")

if __name__ == "__main__":
    reparar_relaciones_autores()