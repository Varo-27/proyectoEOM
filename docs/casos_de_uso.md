# Diagramas de Casos de Uso: Web Semantic Explorer

## 1. Generalización de Actores

Los actores mantienen una relación de herencia estricta:
*   **Usuario Anónimo:** Interacciones efímeras (solo lectura, estado en navegador).
*   **Usuario Registrado:** Hereda del Anónimo + interacciones con persistencia en BD (perfil, engagement, áreas de trabajo).
*   **Administrador:** Hereda del Registrado + panel de gestión (usuarios y moderación).

```mermaid
flowchart TD
    ANON[("Usuario Anónimo")]
    REG[("Usuario Registrado")]
    ADM[("Administrador")]

    ANON <|-- REG : <<generaliza>>
    REG <|-- ADM : <<generaliza>>
```

## 2. Casos de Uso del Usuario Anónimo (Exploración Efímera)

Interacción con el sistema sin requerir identidad en la base de datos.

```mermaid
flowchart LR
    ANON[("Usuario Anónimo")]

    UC_BUS((Ejecutar búsqueda\nsemántica))
    UC_FIL((Configurar filtros\nde metadatos))
    UC_EXP((Expandir artículo))
    UC_EXPC((Expandir con\ncontexto enlazado))
    UC_DET((Ver detalle\nde artículo))
    UC_MAP((Interactuar con\nmapa de calor))
    UC_NAV((Ir al grafo desde\npaís/lugar))
    UC_AUTH((Registrarse /\nIniciar sesión))

    ANON --> UC_BUS
    ANON --> UC_EXP
    ANON --> UC_DET
    ANON --> UC_MAP
    ANON --> UC_AUTH

    UC_BUS -.->|<<include>>| UC_FIL
    UC_EXP -.->|<<include>>| UC_FIL
    UC_EXPC -.->|<<extend>>| UC_EXP
    UC_NAV -.->|<<extend>>| UC_MAP
```

## 3. Casos de Uso del Usuario Registrado (Engagement y Persistencia)

Hereda los casos anteriores e incorpora escritura en base de datos. Las acciones sobre artículos son extensiones del caso de uso base "Ver detalle de artículo".

```mermaid
flowchart LR
    REG[("Usuario Registrado")]

    UC_DET((Ver detalle\nde artículo))
    
    UC_FAV((Marcar como\nfavorito))
    UC_VAL((Valorar artículo))
    UC_COM((Publicar/Editar\ncomentario propio))
    
    UC_PERF((Gestionar perfil))
    UC_WRK((Guardar área\nde trabajo))
    UC_OUT((Cerrar sesión))

    REG --> UC_PERF
    REG --> UC_WRK
    REG --> UC_OUT

    UC_FAV -.->|<<extend>>| UC_DET
    UC_VAL -.->|<<extend>>| UC_DET
    UC_COM -.->|<<extend>>| UC_DET
    
    %% Relación implícita con el actor, ya que extiende un CU heredado
    REG -.- UC_COM
    REG -.- UC_VAL
    REG -.- UC_FAV
```

## 4. Casos de Uso del Administrador (Gestión y Moderación)

Hereda los permisos del Usuario Registrado y añade privilegios exclusivos de infraestructura y moderación.

```mermaid
flowchart LR
    ADM[("Administrador")]

    UC_LUSU((Listar usuarios))
    UC_EUSU((Crear/Editar/Eliminar\nusuario))
    
    UC_LCOM((Ver todos los\ncomentarios))
    UC_MCOM((Moderar/Eliminar\ncomentario ajeno))
    
    UC_TEST((Enviar email\nde prueba del sistema))

    ADM --> UC_LUSU
    ADM --> UC_LCOM
    ADM --> UC_TEST

    UC_EUSU -.->|<<extend>>| UC_LUSU
    UC_MCOM -.->|<<extend>>| UC_LCOM
```