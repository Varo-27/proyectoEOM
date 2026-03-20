def get_headers():
    return {
        # Combinamos un navegador real con tu identificación de proyecto
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Compatible; FP DesarrolloWebIesTeis/1.1; +alvaroalevin123@gmail.com)',
        
        # Indica qué tipos de archivos aceptas (formato estándar de Chrome)
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        
        'Accept-Language': 'es-ES,es;q=0.9',
        
        # ¡MUY IMPORTANTE! Ahorra ancho de banda al recibir datos comprimidos
        'Accept-Encoding': 'gzip, deflate, br',
        
        # Mantiene la conexión abierta para múltiples peticiones (más eficiente)
        'Connection': 'keep-alive',
        
        # Ayuda a que el servidor crea que vienes de su propia página
        'Referer': 'https://elordenmundial.com/',
        
        # Indica que no quieres que te rastreen (un detalle de "buen ciudadano")
        'DNT': '1' 
    }


from sqlmodel import Session, select

def get_or_create_id(session: Session, model, name_field, name_value, **kwargs):
    """
    Busca un registro por nombre. Si no existe, lo crea.
    Ejemplo: get_or_create_id(session, Author, "nombre", "Alba Leiva")
    """
    # 1. Intentar buscarlo
    statement = select(model).where(getattr(model, name_field) == name_value)
    instance = session.exec(statement).first()
    
    if instance:
        return instance.id
    
    # 2. Si no existe, crearlo
    new_instance = model(**{name_field: name_value}, **kwargs)
    session.add(new_instance)
    session.flush()  # Obtenemos el ID sin cerrar la transacción
    return new_instance.id


