# Accesibilidad web — Web Semantic Explorer

Documentación de apoyo para la memoria del TFC y para el diseño del frontend. El producto es una **extensión visual** de [El Orden Mundial](https://elordenmundial.com/); la búsqueda plenamente accesible sigue en la web original. El grafo (React Flow) no es equivalente para lectores de pantalla.

---

## Texto para la memoria (apartado breve)

### Enfoque

El explorador prioriza el grafo y el mapa como valor añadido visual sobre el corpus de EOM. La accesibilidad se aborda de forma realista: mejorar controles convencionales (navegación, formularios, modal) y **no pretender** que el lienzo interactivo sea usable al 100 % con lector de pantalla. Para buscar sin depender del diagrama, el usuario puede usar el buscador de la web original de EOM.

### Contraste de color

En textos y controles de la interfaz general se aplican los umbrales de **WCAG 2.x nivel AA** para contraste ([WebAIM, 2024](https://webaim.org/articles/contrast/)):

| Tipo de texto | Ratio mínimo |
|---------------|--------------|
| Texto normal (&lt; 18 pt o &lt; 14 pt negrita) | **4,5:1** |
| Texto grande (≥ 18 pt o ≥ 14 pt negrita) | **3:1** |

La paleta replica la marca EOM (`colors.css`: `--eom-ink`, `--eom-green`, fondos claro/oscuro). Las combinaciones habituales se **verifican** con:

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — referencia habitual en auditorías y formación (p. ej. SUNY Empire, 2024).
- [Contrast Ratio (Siege Media)](https://www.siegemedia.com/contrast-ratio) — comprobación rápida al ajustar pares de color en diseño.

Ejemplos comprobados (tema claro, API WebAIM):

| Primer plano | Fondo | Ratio | AA texto normal |
|--------------|-------|-------|-----------------|
| `#212529` (cuerpo) | `#ffffff` | 15,4:1 | ✓ |
| `#6c757d` (secundario) | `#ffffff` | 4,68:1 | ✓ |
| `#497d0b` (primario) | `#ffffff` | 4,97:1 | ✓ |
| `#264106` (acento) | `#ebf2e3` | 9,96:1 | ✓ |

En tema oscuro, cuerpo `#f8f9fa` sobre `#1b1e21` supera 15:1. El verde claro `#5c9e0e` sobre blanco (~3,3:1) **solo cumple como texto grande**; en la UI se reserva para botones con texto blanco o tamaños mayores, no para etiquetas pequeñas sobre fondo blanco.

Los nodos del grafo y el mapa coropleático usan color también como canal visual; ahí el contraste de **texto sobre fondo** se controla en tarjetas y leyendas, no en cada píxel del SVG.

### Tipografía y ARIA

- **Fuentes:** Expose (editorial y nodos), Bitter (lectura en modal), Roboto Mono (navegación y etiquetas).
- **ARIA puntual:** `aria-label` en iconos (p. ej. «Editar comentario»), países del mapa, navegación principal; teclado en mapa (Intro / Espacio).

### Grafo

Orientado al ratón (zoom, arrastre, paleta). No se documenta como alternativa accesible al buscador de EOM.

---

## Verificación de contraste (procedimiento)

1. Tomar el par **texto / fondo** en hexadecimal desde `web-semantic-explorer/frontend/src/styles/tokens/colors.css` o desde DevTools.
2. Comprobar en [WebAIM](https://webaim.org/resources/contrastchecker/) o [Siege Media](https://www.siegemedia.com/contrast-ratio).
3. Si el ratio es &lt; 4,5:1 para texto normal, oscurecer el primer plano o aclarar el fondo hasta pasar (ambas herramientas permiten ajustar luminosidad).
4. Tras cambiar tokens, repetir la comprobación en **tema claro y oscuro** (`:root` y `.dark`).

Comando rápido (API WebAIM):

```bash
curl -s "https://webaim.org/resources/contrastchecker/?fcolor=212529&bcolor=FFFFFF&api"
```

---

## Referencias

- WebAIM. *Contrast and Color Accessibility*. https://webaim.org/articles/contrast/
- WebAIM. *Contrast Checker*. https://webaim.org/resources/contrastchecker/
- Siege Media. *Contrast Ratio — WCAG Color Contrast Checker*. https://www.siegemedia.com/contrast-ratio
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.1*, criterio 1.4.3 (Contraste mínimo, nivel AA).
