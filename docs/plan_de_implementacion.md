# Plan de Implementación: Web Semantic Explorer

Plan de producto para la exploración semántica y grafos sobre el corpus geopolítico (El Orden Mundial). Las **fases ya entregadas en frontend** están recogidas en [Capacidades del frontend](#capacidades-del-frontend); el resto del documento describe arquitectura, modelo de tubería y **trabajo pendiente**.

---

## Arquitectura base

*   **Base de datos:** PostgreSQL con extensión `pgvector` y esquemas poblados por el scrapper.
*   **Backend:** FastAPI (Python), SQLModel, SentenceTransformers (modelo local `mixedbread-ai/mxbai-embed-large-v1`).
*   **Frontend:** React, TanStack Router, React Flow (grafos), React Simple Maps (mapa), Zustand.

---

## Selecciones técnicas y patrones

1. **Gestor de estado (frontend):** **Zustand** en dos capas: `useGraphStore` (lienzo en vivo: nodos, aristas, modal, carga) y `useWorkspaceStore` (áreas de trabajo persistidas). El grafo es la fuente de verdad del lienzo; la sesión vive en el workspace, no en la URL del grafo.
2. **Motor físico del grafo:** Posicionamiento manual + colocación radial/tree al buscar/expandir. **d3-force descartado** (no se implementará).
3. **Búsqueda IA:** `lifespan` FastAPI + `SentenceTransformer` en RAM; ranking vectorial en PostgreSQL (`pgvector`).
4. **Contratos:** Pydantic/SQLModel; respuestas públicas (`GraphResponse`, `GraphNode`) adaptadas a React Flow.
5. **Infra:** `@lru_cache`, bind mount de modelos, índices HNSW en embeddings.

---

## Estado del proyecto (resumen)

| Ámbito | Estado |
|--------|--------|
| **Fase 1 — API semántica** (`/api/search`, `/api/graph/expand`) | ✅ |
| **Fase 3 — Mapa de calor** (API + visor) | ✅ |
| **Fase 4 — Filtros en API** | ✅ |
| **Fase 5a–5b — API social + UI en grafo/modal** | ✅ |
| **Fase 6 — Grafo, workspaces y tubería** | ✅ |
| **Fase 5c — Notas + follow** | ✅ |
| **Fase 7, 8** | ⏳ Pendiente |

---

## Modelo de tubería (upstream → downstream)

El grafo define **cadenas de contexto** dirigidas. Todo lo downstream hereda lo definido upstream.

```text
[input] → [filtro₁] → [filtro₂] → (búsqueda / expand) → [artículos…]
```

| Dirección | Significado |
|-----------|-------------|
| **Upstream** (hacia el `input`) | Consultas de inputs ancestros + filtros acumulados en la cadena |
| **Downstream** (hacia artículos) | Resultados de `/api/search` y ramas de `/api/graph/expand` |

Principios vigentes:

1. **Entrada = nodo `query`:** uno por defecto al crear un área; la paleta añade más con drag and drop. El tipo legado `input` se migra a `query` al cargar snapshots.
2. **Re-buscar no mueve el lienzo:** solo sustituye artículos downstream del `input` activo en esa tubería.
3. **Filtros en cadena:** nodos `filter:*` conectados entre `input` y artículos; se envían en el body de search/expand (AND).
4. **Expansión con contexto:** «Ver más» usa `seed_queries` y artículos ancestros si hay tubería cableada.
5. **Varias investigaciones:** varios `input` sin arista entre ellos = islas en el mismo área.
6. **Un artículo = un nodo:** mismo `article_id` no se duplica; nuevas aristas desde quien lo descubrió.
7. **Persistencia = área de trabajo** en `localStorage` (invitado) o sync servidor (usuario registrado).

El tipo legado `searchCenter` se **migra a `query`** al cargar snapshots antiguos; el componente `SearchNode` solo renderiza datos legacy no migrados.

---

## Capacidades del frontend

Inventario de lo que el usuario puede hacer hoy en la interfaz. Sirve como base para documentar casos de uso.

> **Rutas principales:** `/` (explorador de grafo), `/map` (mapa de cobertura), `/settings`, `/login`, `/signup`, `/admin` (superusuario).

### Shell, navegación y apariencia

- Ver barra superior con logo, enlaces **Grafo** y **Mapa** (y **Admin** si es superusuario).
- Cambiar tema **Claro / Oscuro / Sistema** desde el menú de apariencia en la barra.
- Abrir **Ajustes** de cuenta desde el menú de usuario (perfil, contraseña, borrar cuenta).
- Cerrar sesión.
- Pantalla de carga «Cargando área de trabajo…» hasta hidratar workspaces desde el navegador.
- Mensajes de error/toast (Sonner) en fallos de búsqueda, expansión o acciones sociales.

### Áreas de trabajo (workspaces)

- Tener **varias áreas** guardadas en este navegador (`localStorage`, clave `wse-workspaces-v1`).
- **Elegir** el área activa desde un desplegable en la barra lateral.
- **Renombrar** el área activa (campo de texto; guardar con Enter o al salir del campo).
- **Crear** un área nueva (botón «Nueva»); incluye un nodo `input` por defecto centrado en el lienzo.
- **Eliminar** un área (icono papelera); deshabilitado si solo queda una.
- Ver indicador **Guardada** / **Sin guardar** según cambios pendientes.
- **Autoguardado** ~800 ms tras cambios en nodos, aristas o cámara (pan/zoom).
- **Restaurar** al cambiar de área: nodos, aristas y viewport (`x`, `y`, `zoom`) del snapshot.
- **Guardar viewport** al mover la cámara (`onMoveEnd`) y al desmontar el explorador.
- Al primer arranque sin datos: crear payload por defecto con un área y un `input`.
- **Migración automática** de snapshots antiguos (`searchCenter` → `input`).
- Export interno `workspaceToApiBody()` y sync `PUT/GET /workspaces/sync` para usuarios registrados.

### Paleta lateral («Añadir nodos»)

- Leer hint: arrastrar al lienzo y conectar filtros entre input y artículos.
- **Arrastrar y soltar** un **Nodo consulta (`query`)** en cualquier punto del lienzo (centrado bajo el cursor).
- **Arrastrar y soltar** cada tipo de **Nodo filtro**: Autor, Categoría, Lugar, Desde (año), Hasta (año).
- Ver la paleta **deshabilitada** (sin drag) mientras hay una búsqueda o expansión en curso (`isLoading`).
- Feedback visual en el lienzo: clase `graph-explorer__canvas--drag-over` al arrastrar un ítem de paleta válido sobre el canvas.

### Lienzo del grafo (React Flow)

- **Pan** (arrastrar fondo) y **zoom** con rueda o gestos (límites configurados `GRAPH_MIN_ZOOM` / `GRAPH_MAX_ZOOM`).
- Usar controles integrados de React Flow (**Controls**).
- Ver **minimapa** coloreada: nodo activo en color primario, resto en muted.
- Ver **rejilla** de fondo (líneas, estilo EOM).
- **Mover nodos** arrastrándolos; posición persistida en el workspace.
- **Seleccionar** nodos y aristas (comportamiento estándar React Flow).
- Modo de color del grafo acorde al tema claro/oscuro.
- Renderizado solo de elementos visibles (`onlyRenderVisibleElements`).
- **No** se aplica layout global automático (d3-force) al buscar o expandir; los artículos nuevos aparecen en posiciones relativas calculadas (radial / offset).

### Aristas (conexiones)

- **Crear** una arista arrastrando desde un handle de salida (abajo) a un handle de entrada (arriba); solo tipos válidos (`query→filter→article`).
- **Eliminar** una o varias aristas seleccionadas y pulsar **Supr** o **Retroceso** (`deleteKeyCode`).
- Al eliminar aristas, recalcular flags de contexto enlazado en nodos artículo (`hasLinkedDownstreamContext`).
- Al conectar/desconectar, actualizar esos mismos flags en el store.

### Nodo `query` (consulta semántica)

- Ver etiquetas «Consulta semántica» / «Escribe y pulsa Explorar» y borde primario fijo (estilo input).
- Escribir texto en el campo (clase `nodrag nopan` para no mover el lienzo al interactuar).
- Pulsar **Explorar** o Enter en el formulario para lanzar búsqueda.
- Ver botón deshabilitado si la consulta está vacía o hay carga global.
- Ver estado **Buscando…** en el botón durante la petición.
- **Eliminar** el nodo (icono papelera → menú «¿Eliminar este nodo?» → Sí / Cancelar); quita el nodo y sus aristas, sin re-cablear otros nodos.
- Handles: entrada arriba, salida abajo (para encadenar filtros o enlazar a artículos vía tubería manual).
- Múltiples `query` en el mismo área = **islas** de investigación independientes.
- Atajos en nodos artículo: **Filtro** (desde metadatos) y **Rama** (query + filtro cableados al artículo).

### Nodos `filter` (metadatos)

- Tipos en paleta: **Autor**, **Categoría**, **Lugar**, **Desde (año)**, **Hasta (año)**.
- Editar valor en campo de texto (debounce ~400 ms) o confirmar con Enter / blur.
- **Autor:** combobox con búsqueda de autores (`AuthorFilterCombobox`) en lugar de texto libre.
- Años: input numérico.
- Título del nodo actualizado como `{Dimensión}: {valor}`.
- **Eliminar** filtro con el mismo flujo de confirmación que otros nodos.
- Handles arriba/abajo para encadenar `input → filtro → filtro → …` hacia artículos.
- Los filtros **conectados downstream** del `input` (siguiendo aristas salientes) se envían como `ArticleMetadataFilters` en búsqueda y expansión.

### Nodos `article` (artículos)

- Ver categoría, autor (truncado), imagen, titular, extracto.
- Ver nodo **activo** resaltado (`graph-node-active`) cuando coincide con `activeNodeId`.
- Ver nodo **visitado** atenuado tras abrir detalle (`visitedAt` persistido en workspace).
- Animación de aparición escalonada (`appearDelay`) al llegar de búsqueda/expansión.
- **Favorito** (corazón) en el nodo si hay sesión iniciada; toggle contra API con toast.
- **Ver más** / **Ver más (contexto enlazado)** según exista tubería `input`/`filter` cableada bajo el artículo (`hasLinkedDownstreamContext`).
- **Abrir detalle** → abre modal sin depender del clic en el lienzo.
- **Eliminar** artículo con confirmación; al borrar, **reconecta** automáticamente nodos entrantes con salientes (patrón «delete middle node»).
- **Clic en el nodo** en el lienzo abre el modal de detalle (excepto `input` y `filter`, que ignoran el clic).
- Handles arriba (target) y abajo (source) para aristas entre artículos y con la tubería.
- Estilo brutalista: bloque fijo detrás (`::before`), tarjeta con hover lento; bloque pasa a verde primario en hover; handles siempre por encima.

### Búsqueda desde `input`

- Llamada a `/api/search` con texto, límite de resultados y filtros de la tubería.
- Envío de `seed_queries` y `context_article_ids` derivados de la cadena upstream (ranking enriquecido).
- **Sustituir** solo artículos **downstream** de ese `input` (no el resto del lienzo ni otros inputs).
- Quitar aristas que tocaban artículos eliminados de esa rama.
- Actualizar el texto guardado en `data.query` del `input`.
- Cerrar modal y limpiar nodo activo al iniciar búsqueda.
- Fusionar resultados: **un nodo por `article_id`**; conservar aristas si el artículo ya existía.
- Colocar artículos nuevos en disposición **radial** alrededor del `input`.
- Toast si la búsqueda falla.

### Expansión («Ver más») desde artículo

- Llamada a `/api/graph/expand` con `source_article_id`, `existing_node_ids`, filtros upstream, `seed_queries`, `context_article_ids`.
- Añadir hasta N artículos nuevos (umbral y límite configurados) y aristas devueltas por la API.
- Posicionar nodos nuevos con offset respecto al artículo origen.
- Fusionar sin duplicar nodos-artículo.
- Etiqueta del botón distingue expansión con o sin contexto enlazado.
- Toast «Sin artículos nuevos» con sugerencias si la API no devuelve nodos.
- Toast de error si falla la expansión.
- Deshabilitar interacciones pesadas vía `isLoading` global durante la petición.

### Modal de detalle del artículo

- Abrir/cerrar diálogo (clic en nodo artículo o «Abrir detalle»).
- Cargar detalle desde API (`GET` artículo) con spinner y mensaje de error.
- Mostrar imagen, título, autores, fecha, extracto, categorías, lugares.
- Enlace **Leer artículo completo** (URL externa) si existe.
- **Valoración media** (estrellas + media + recuento).
- **Tu valoración** (5 estrellas interactivas) si hay sesión.
- **Favorito** en modal (misma API que en el nodo).
- **Nota privada** por artículo (solo visible para el usuario; GET/PUT `/note`).
- **Seguir** autores y categorías del artículo desde el modal (`POST/DELETE /follows`).
- Sección **Comentarios** (plegable): listar, publicar, **editar** y **eliminar** comentarios propios.
- Acciones sociales deshabilitadas o limitadas sin login (favorito/valoración/comentarios).

### Mapa de cobertura (`/map`)

- Ver mapa coroplético mundial con intensidad por volumen de artículos (`/api/stats/heatmap/`).
- Cambiar **proyección** del mapa desde selector en cabecera.
- **Zoom** con rueda y **pan** arrastrando el mapa.
- **Hover** en países: resaltar y tooltip en mapa.
- **Clic en país** o lugar del panel: navegar a `/` con `place` y `q`; el grafo crea tubería y lanza búsqueda automática.
- Panel lateral: leyenda de color, listas de lugares por país, regiones, lugares sin mapear a ISO.
- Clic en lugar del listado o región seleccionada: misma navegación al grafo con parámetros de lugar.
- Resaltar códigos de países al pasar por regiones transnacionales.

### Autenticación y cuenta

- **Login**, **registro**, **recuperar** y **restablecer** contraseña.
- Sesión con token; rutas protegidas según plantilla.
- **Ajustes:** ver/editar información de usuario, cambiar contraseña, eliminar cuenta.
- **Admin** (superusuario): gestión de usuarios (tabla, alta, edición, borrado).

### Persistencia y datos locales

- Grafo + viewport por área en `localStorage`.
- Schema versionado en payload de workspaces.
- Hidratar grafo al cargar y aplicar `syncLinkedContextFlags` tras migración.
- Al salir de la app, capturar último viewport del área activa.

### Comportamientos que el frontend aún no ofrece

| Tema | Estado |
|------|--------|
| Historial de pasos / deshacer (Fase 8) | ⏳ |
| Slider temporal en mapa (Fase 7) | ⏳ |
| Fusión explícita de contexto entre inputs distintos (backlog 6f) | ⏳ |

---

## Pendiente y backlog

### Backend y producto

- **Fase 7 (opcional):** Heatmap con rango temporal + slider en mapa (depende de cobertura `Place` en scrapper).
- **Fase 8 (opcional):** Log de pasos de exploración, breadcrumbs, deshacer expansiones.

### Frontend (mejoras planificadas)

- **Refactor FSD (completado):** capas `entities/`, `features/`, `widgets/`, `pages/`, `shared/`; ver [frontend-architecture.md](./frontend-architecture.md). Verificación: `pnpm run check:imports` en `web-semantic-explorer/frontend`.

### Motor físico

- **d3-force:** descartado. Layout manual + `d3-hierarchy` puntual tras búsqueda/expansión.

---

## Referencias

- [Informe diagramas y casos de uso](./informe_diagramas_clases_casos_uso.md)
