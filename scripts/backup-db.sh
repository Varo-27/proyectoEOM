#!/usr/bin/env bash
#
# Exporta el volumen PostgreSQL a ./backups/app-db-data-YYYYMMDD-HHMMSS.tar.gz
#
# Uso:
#   ./scripts/backup-db.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VOLUME_NAME="web-semantic-explorer_app-db-data"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_DIR="${ROOT}/backups"
ARCHIVE_NAME="app-db-data-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${OUTPUT_DIR}/${ARCHIVE_NAME}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
  echo "Error: el volumen ${VOLUME_NAME} no existe. ¿Has levantado la base de datos al menos una vez?" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Exportando volumen ${VOLUME_NAME}..."
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "${VOLUME_NAME}:/data:ro" \
  -v "${OUTPUT_DIR}:/backup" \
  alpine tar czf "/backup/${ARCHIVE_NAME}" -C /data .

echo "Backup guardado en: ${ARCHIVE_PATH}"
