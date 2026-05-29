/**
 * Configuración compartida del cliente openapi-ts.
 * Importar y llamar `configureOpenAPI()` desde el entrypoint (main.tsx).
 */
import { OpenAPI } from "./core/OpenAPI"

export function configureOpenAPI(baseUrl: string) {
  OpenAPI.BASE = baseUrl
  OpenAPI.TOKEN = async () => localStorage.getItem("access_token") || ""
}
