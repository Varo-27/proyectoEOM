/**
 * Configuración compartida del cliente openapi-ts.
 * Importar y llamar `configureOpenAPI()` desde el entrypoint (AppProviders).
 */
import { OpenAPI } from "./core/OpenAPI"

export function configureOpenAPI(baseUrl: string) {
  OpenAPI.BASE = baseUrl
  OpenAPI.TOKEN = async () => localStorage.getItem("access_token") || ""
}
