/** Id del nodo input creado al abrir un espacio de trabajo vacío. */
export const DEFAULT_INPUT_NODE_ID = "input-default"

export function createInputNodeId(): string {
  return `input-${crypto.randomUUID()}`
}

export function createFilterNodeId(filterKey: string): string {
  return `filter-${filterKey}-${crypto.randomUUID()}`
}
