# Plan de Implementación: Web Semantic Explorer

Este documento contiene el plan estructurado en fases para el desarrollo de la interfaz de exploración semántica y grafos para la base de datos de artículos geopolíticos (El Orden Mundial).

## Arquitectura Base
*   **Base de datos:** PostgreSQL con extensión `pgvector` y esquemas poblados por el scrapper.
*   **Backend:** FastAPI (Python), SQLModel, SentenceTransformers (modelo local `mixedbread-ai/mxbai-embed-large-v1`).
*   **Frontend:** React, React Flow (grafos), React Simple Maps (geolocalización).

## Selecciones Técnicas y Patrones
1. **Gestor de Estado (Frontend):** **Zustand**. Permitirá que la Barra de Búsqueda, el Lienzo del Grafo y el Panel Lateral lean y escriban datos comunes (ej. `nodos`, `aristas`, `nodoSeleccionado`) con mínimo código puente sin penalizar el rendimiento por repintados masivos de React.
2. **Motor Físico del Grafo (Progresivo):** Comenzaremos situando los nodos con matemáticas simples (ej. posicionamiento radial) para comprender los límites de React Flow puros. Posteriormente, introduciremos **d3-force (en modo "Headless")** para simulaciones físicas orgánicas: `d3-force` sólo calculará la matemática invisible (x, y) en memoria, y React Flow se encargará exclusivamente de pintar el DOM con seguridad.
3. **Arquitectura de Búsqueda IA (Python + pgvector):** Usaremos el evento `lifespan` de FastAPI para mantener residente en la memoria RAM (solo 1 carga) el pesado modelo de `SentenceTransformer`. Python será un rápido "traductor" que convierte el texto en vectores al vuelo. Una vez codificado el vector, la delegación de búsqueda y la comparativa la realiza PostgreSQL usando directamente distancias con `pgvector`.
4. **Contratos Interfaz y Coherencia:** Tipado estricto con **Pydantic / SQLModel**. Se mantendrá la regla estricta de seguir la arquitectura de la plantilla de FastAPI separando responsabilidades:
    *   Ficheros de BBDD (`table=True`) no se devuelven nunca directamente.
    *   Se crearán siempre Schemas "Public" o "Response" (ej. `GraphResponse`, `GraphNode`) para proveer la estructura exacta (`{ id, data: {...} }`) que React Flow requiere.
5. **Optimizaciones de Infraestructura e IA:**
    *   **Caché en Memoria:** Uso nativo de `@lru_cache` de Python para peticiones repetidas al `SentenceTransformer`, logrando tiempos de respuesta de 0ms en búsquedas cacheadas.
    *   **Persistencia en Disco Secundario:** Configuración vía *Bind Mount* en `compose.yml` para mapear los 2GB+ de pesos del modelo de HuggingFace directamente a un segundo disco duro (ej. `/mnt/d/cache_ia`), evitando saturar el almacenamiento principal del sistema (C:).
    *   **Índices HNSW:** Creación de índice *Hierarchical Navigable Small World* en `pgvector` para reducir la latencia de las consultas de similitud (búsqueda y cruce de aristas) a niveles ultra-rápidos (O(log N)).


---

## 📍 Fase 1: El Motor Semántico (API Backend) ✅
*Objetivo: Exponer los datos del scrapper y la lógica vectorial mediante endpoints limpios para el frontend, incluyendo la lógica de grafos.*
*Estado: Implementado.*

*   **Fase 1a: Modelos y Cliente Embedding**
    *   Migrar/Compartir los modelos de `SQLModel` / `SQLAlchemy` (Article, Embedding, Topic, Author, etc.) desde el scrapper al directorio de backend (`web-semantic-explorer/backend/app/models.py`).
    *   Integrar un cliente o servicio encapsulado para generar embeddings al vuelo usando `SentenceTransformer` dentro de la API FastAPI.
*   **Fase 1b: Endpoints de Búsqueda Inicial (Seed)**
    *   Crear endpoint `/api/search` que recibe texto libre de búsqueda.
    *   Convierte el texto en vector y hace la consulta por coseno (`ORDER BY embedding <=> query_embedding`) devolviendo los metadatos de los Top N artículos.
*   **Fase 1c: Endpoint de Expansión Expansiva (5N+ Interconectados)**
    *   Crear endpoint `/api/graph/expand`.
    *   **Entrada:** `source_article_id` (el artículo a expandir) y `existing_node_ids` (lista de artículos visibles en React Flow).
    *   **Proceso (2 pasos clave):**
        1. **Extracción (Garantizar 5 nuevos):** Buscar los Top 5 artículos más similares al `source_article_id`, excluyendo explícitamente mediante SQL (`NOT IN`) los `existing_node_ids`. Esto garantiza que el grafo siempre crezca sin frustrar al usuario.
        2. **Interconexión (Cruce de aristas):** Una vez extraídos, calcular matemáticamente la similitud entre estos 5 NUEVOS nodos y TODOS los nodos pasados en `existing_node_ids`. Si la afinidad supera un umbral (ej. > 85%), se genera una arista cruzada de conexión.
        3. Formar aristas directas correspondientes (padre original -> nuevos nodos).
    *   **Salida:** JSON con lista de `{new_nodes: [...], new_edges: [...]}` listos para renderizar en UI.

---

## 📍 Fase 2: Explorador Gráfico Orgánico (Frontend)
*Objetivo: Construir el lienzo principal donde el usuario introduce una búsqueda y expande conocimiento a través de los nodos. El entorno usa TanStack Router (enrutamiento) y Zustand (estado).*

*   **Fase 2a: Setup Interfaz y Estado Global**
    *   Generar los clientes API actualizados (`openapi-ts`) para conectar React con FastAPI.
    *   Configurar Store de Zustand (`useGraphStore`) para gestionar `nodes`, `edges`, estado de carga y `nodoSeleccionado`.
    *   Implementar el layout base con TanStack Router.
*   **Fase 2b: Buscador Flotante y Semilla de Búsqueda**
    *   Crear componente de Input Flotante para búsquedas en texto libre.
    *   Al usar el buscador, invocar a `/api/search` o un nuevo endpoint adaptado para inicializar la semilla.
    *   Renderizar un nodo central ("Búsqueda: [texto]") y 5 nodos alrededor que representen los resultados encontrados.
*   **Fase 2c: Motor de Físicas y Renderizado (React Flow + d3-force)**
    *   Integrar layout automático (ej. `d3-force` en modo headless o un layout de DAG) para que los nodos no se solapen y mantengan distancias orgánicas.
    *   Crear Custom Nodes (Nodos Personalizados) en React Flow para mostrar imágenes, titulares y metadatos de los artículos.
*   **Fase 2d: Navegación y Expansión Dinámica**
    *   Configurar evento `onNodeClick` o un botón "+" en cada nodo dentro de React Flow.
    *   Mostrar spinner de carga, recoger IDs renderizados enviarlos a `/api/graph/expand`.
    *   Recibir los nodos/aristas y fusionarlos con el Store, dejando que el motor de físicas reacomode el lienzo visualmente.
*   **Fase 2e: Panel de Detalles (Sidebar / Drawer)**
    *   Al seleccionar o hacer click en un nodo (artículo), abrir un panel lateral (Sidebar/Drawer).
    *   El panel debe mostrar título, resumen, autores, fecha, y un enlace para leer el artículo completo.

---

## 📍 Fase 3: Visión Geoespacial (Mapa de Calor)
*Objetivo: Vista alternativa basada en metadatos geográficos (ArticlePlace/Places) para pintar un mapa.*

*   **Fase 3a: Endpoint Agregador (Backend)**
    *   Endpoint `/api/stats/heatmap/` que devuelva métricas agrupadas: `(Country Code / Place) -> (Número de artículos)`.
*   **Fase 3b: Visor del Mapa interactivo (Frontend)**
    *   Integrar librería geopolítica como `react-simple-maps`.
    *   Aplicar un código de color (rampa) a los países/regiones según el volumen devuelto por la API.
    *   Permitir seleccionar en país/lugar para navegar al explorador web (Grafo) pre-filtrando los resultados.

---

## 📍 Fase 4: Filtros Estrictos en Búsqueda y Grafo
*Objetivo: Combinar búsqueda semántica (vectorial) con metadatos exactos (SQL).*

*   **Fase 4a: Contratos y Filtros (Backend)**
    *   Creación de esquemas Pydantic `SearchFilters` y `GraphFilters`: `year_range`, `category`, `author`, `place`.
    *   Actualizar `/api/search` y `/api/graph/expand` para inyectar cláusulas `WHERE` tradicionales antes del ordenamiento vectorial.
*   **Fase 4b: UI de Filtros (Frontend)**
    *   Añadir un componente persistente de filtros en el buscador y el sidebar.
    *   Sincronización del estado de filtros en Zustand y en los Query Params de la URL usando hooks de TanStack Router.

---

## 📍 Fase 5: Memoria de Usuario y Señales Sociales
*Objetivo: Dotar a la aplicación de personalización y métricas de valor. (Nota: los modelos base en `SQLModel` como `Favorite`, `Rating`, `Comment` ya están implementados).*

*   **Fase 5a: API de Interacción (Backend)** ✅
    *   `GET /api/v1/articles/{id}` — detalle con taxonomía, comentarios, rating y favorito del usuario.
    *   Favoritos: `POST/DELETE /api/v1/favorites/{article_id}` y toggle en `/articles/{id}/favorite`.
    *   Valoraciones: `POST /api/v1/ratings?article_id=…`, `GET /api/v1/ratings/average`, `POST /articles/{id}/rating`.
    *   Comentarios: listado/creación por artículo; `PATCH/DELETE /api/v1/comments/{id}`.
*   **Fase 5b: Integración de Acciones Sociales en Grafo/Panel (Frontend)** ✅
    *   Cliente `@/api/articles` + modal y nodo con favorito real (sin mock).
    *   Valoración interactiva (5 estrellas) y CRUD de comentarios propios en el panel.
*   **Fase 5c: Seguimiento y Notas Privadas (Próximos pasos)**
    *   Modelos de Base de Datos y Endpoints para "Notas Privadas por Usuario" (anotación en markdown por artículo).
    *   Sistema básico de seguimiento (Follow) a temas puntuales.

---

## 📍 Fase 6: Mapa de Calor con Filtros Temporales
*Objetivo: Mejorar la vista geoespacial cruzándola con la dimensión del tiempo.*

*   **Fase 6a: Filtros Temporales (Backend)**
    *   Hacer que `/api/stats/heatmap/` acepte rangos dinámicos en los query params (ej. `year_start`, `year_end`).
*   **Fase 6b: Control del Tiempo (Frontend)**
    *   Slider interactivo de rango de años superpuesto sobre el Mapa.
    *   Animación (play/pause) para ver la evolución del foco mediático y la cobertura a través de los años.

---

## 📍 Fase 7 (Opcional): Historial de Navegación
*Objetivo: Guardar el recorrido interactivo por el grafo.*

*   **Fase 7a: Historial Ligero (Backend/Frontend)**
    *   Guardar en BD (o localStorage temporalmente) los pasos que el usuario va dando ("Búsqueda X" -> "Expande nodo Y" -> "Abre artículo Z").
*   **Fase 7b: Trazabilidad UI**
    *   Rastro de migas de pan ("Breadcrumbs") o listado lateral para permitir deshacer expansiones del grafo o regresar a un hilo de investigación anterior.
