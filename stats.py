import os
from collections import Counter

# Asegúrate de que LOG_FILE apunte a la misma ruta que en saveArticle.py
LOG_FILE = "scraping_errors.log"

def mostrar_estadisticas_finales():
    """
    Lee el archivo de logs de errores y genera un reporte visual 
    sobre qué datos faltan en las tablas maestras.
    """
    if not os.path.exists(LOG_FILE) or os.path.getsize(LOG_FILE) == 0:
        print("\n✨ " + "="*40)
        print("PROCESO IMPECABLE: 0 errores de integridad.")
        print("="*40 + "\n")
        return

    # Diccionarios para trackear fallos
    conteo_errores = Counter()
    elementos_unicos = {}

    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                # El formato esperado es: URL: ... | Modelo: X | Valor faltante: Y
                if " | " not in line:
                    continue
                
                partes = line.split(" | ")
                # Extraer Modelo (Category, Tag, etc)
                modelo = partes[1].split(": ")[1].strip()
                # Extraer Valor (el slug o nombre que falló)
                valor = partes[2].split(": ")[1].strip()
                
                conteo_errores[modelo] += 1
                
                if modelo not in elementos_unicos:
                    elementos_unicos[modelo] = set()
                elementos_unicos[modelo].add(valor)

        # Renderizado del reporte
        print("\n" + "📊" + " REPORTE DE INTEGRIDAD DE DATOS " + "📊")
        print("-" * 50)
        
        for modelo, total in conteo_errores.items():
            unicos = elementos_unicos[modelo]
            print(f"🔹 {modelo:12} | Total Fallos: {total:3} | Únicos faltantes: {len(unicos)}")
            
            # Mostrar hasta 3 ejemplos para dar pistas rápidas
            ejemplos = list(unicos)[:3]
            print(f"   🔎 Ejemplos: {', '.join(ejemplos)}" + ("..." if len(unicos) > 3 else ""))
            print("-" * 50)

        print(f"📝 Log completo en: {os.path.abspath(LOG_FILE)}")
        print("=" * 50 + "\n")

    except Exception as e:
        print(f"No se pudo generar el reporte de estadísticas: {e}")

# Ejemplo de cómo llamarlo al final de tu main:
# if __name__ == "__main__":
#     main()
#     mostrar_estadisticas_finales()