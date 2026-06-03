# Color e imagen de marca — Web Semantic Explorer

Apartado para la memoria del TFC. Solo tratamiento cromático (no tipografía ni accesibilidad).

---

## Texto para la memoria

### Identidad cromática de El Orden Mundial

La web de **El Orden Mundial (EOM)** se reconoce por un **verde oliva** como color de marca, combinado con **negro tipográfico** (`#212529`), **grises** de apoyo y **fondos claros** (`#f8f9fa`, blanco). Esa paleta transmite sobriedad editorial y continuidad visual con el medio impreso. El explorador semántico **no redefine la marca**: centraliza los mismos tonos en variables CSS (`--eom-green`, `--eom-ink`, etc.) definidas en `colors.css`, de modo que grafo, mapa, navegación y modal se lean como una extensión del sitio original.

### Escala de verdes y tonos neutros

El verde EOM no es un único hexadecimal, sino una **familia de tonos**:

| Token | Uso principal |
|-------|----------------|
| `#ebf2e3` (`--eom-green-pale`) | Fondos suaves, acentos, países sin artículos en el mapa |
| `#497d0b` (`--eom-green`) | Primario en tema claro: botones, anillos de foco, selección en mapa |
| `#5c9e0e` (`--eom-green-light`) | Primario en tema oscuro; aristas del grafo en énfasis |
| `#264106` (`--eom-green-dark`) | Texto sobre fondos pálidos |
| `#6c757d` (`--eom-gray`) | Metadatos y texto secundario |

Para el **mapa de cobertura** se reutiliza la escala de verdes del sitio original (del 50 al 950 en `heatmapColors.ts`): cuanto mayor es el número de artículos por país, más saturado el relleno. El océano y los paneles usan grises del tema (`--map-ocean`). Los estados de interacción del mapa emplean **ámbar/dorado** (`#ffc107`, `#d39e00`), alineado con los avisos visuales de EOM, para distinguir hover y selección del verde de datos.

En el **grafo**, el estilo «brutalista» de EOM se mantiene con **bordes gruesos** y **sombras desplazadas** en negro o verde (`brutalist.css`, sombra de nodos en `nodes.css`), sin introducir colores ajenos a la marca.

### Modo oscuro

La web original de EOM opera en **tema claro**; el explorador añade un **modo oscuro** (clase `.dark` en `colors.css`) como decisión propia del TFG, no presente en el portal editorial. Los fondos pasan a `#1b1e21` y `#2c2f34`; el texto principal a `#f8f9fa`. El verde de marca se **aclara** en interactivos (`--eom-green-light`) para conservar legibilidad sobre fondo oscuro; bordes e inputs usan blanco semitransparente. El mapa adapta océano, trazos y hovers (ámbar más suave en hover de región). Así se ofrece lectura prolongada en entornos con poca luz sin romper la identidad verde-gris de EOM.

### Cierre

El color del proyecto es **herencia de marca más extensión funcional**: misma familia cromática que elordenmundial.com, escala de verdes para densidad geográfica, ámbar para énfasis en el mapa, y tema oscuro como aporte exclusivo del explorador. La coherencia visual refuerza que la herramienta es una capa de análisis sobre el mismo universo editorial, no un producto ajeno.

---

## Referencia técnica (tokens)

Archivo: `web-semantic-explorer/frontend/src/styles/tokens/colors.css`  
Escala mapa: `web-semantic-explorer/frontend/src/lib/heatmapColors.ts` → `EOM_GREEN`
