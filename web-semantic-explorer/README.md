# Semantic Explorer

Explorador semántico de artículos geopolíticos de El Orden Mundial (EOM).

## Stack

- **Frontend:** React, Vite, TanStack Router, React Flow
- **Backend:** Python, FastAPI, SQLModel, PostgreSQL + pgvector
- **Infra:** Docker Compose

## Desarrollo local

Copia `.env.example` a `.env`, ajusta credenciales y levanta los servicios:

```bash
docker compose watch
```

- Frontend: http://localhost:8080
- API: http://localhost:8000
- Docs OpenAPI: http://localhost:8000/docs

## Estructura

```
web-semantic-explorer/
├── backend/     API y servicios
├── frontend/    Interfaz React
└── .env         Variables de entorno (no commitear)
```

Ver también la documentación en `docs/` del repositorio raíz.
