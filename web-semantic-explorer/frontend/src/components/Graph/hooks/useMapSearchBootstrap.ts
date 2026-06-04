import { useEffect, useRef } from "react"

import type { GraphSearchParams } from "@/shared/lib/filters"
import { searchParamsToFilters } from "@/shared/lib/filters"
import { useGraphStore } from "@/entities/graph"

import {
  buildEdge,
  createFilterNodeAtPosition,
  createQueryNodeAtPosition,
  GRAPH_NODE_TYPE,
} from "@/entities/graph"
import { centerPaletteDropPosition } from "../palette/paletteDropPosition"

type UseMapSearchBootstrapOptions = {
  searchParams: GraphSearchParams
  enabled: boolean
  onConsumed?: () => void
}

/**
 * Al llegar desde el mapa con ?place=&q=, crea tubería query→filtro lugar y lanza búsqueda.
 */
export function useMapSearchBootstrap({
  searchParams,
  enabled,
  onConsumed,
}: UseMapSearchBootstrapOptions) {
  const consumedRef = useRef(false)

  useEffect(() => {
    if (!enabled || consumedRef.current) {
      return
    }

    const queryText = searchParams.q?.trim()
    const place = searchParams.place?.trim()
    const extraFilters = searchParamsToFilters(searchParams)

    if (!queryText && !place && !Object.keys(extraFilters).length) {
      return
    }

    consumedRef.current = true

    const { nodes, edges } = useGraphStore.getState()
    const existingQuery = nodes.find(
      (node) => node.type === GRAPH_NODE_TYPE.query,
    )
    const queryNode =
      existingQuery ??
      createQueryNodeAtPosition(
        centerPaletteDropPosition({ x: 480, y: 280 }, "query"),
      )

    let nextNodes = existingQuery
      ? nodes.map((node) =>
          node.id === queryNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  query: queryText ?? node.data.query ?? "",
                },
              }
            : node,
        )
      : [...nodes, queryNode]

    let nextEdges = [...edges]
    const searchNodeId = queryNode.id
    let searchQuery = queryText ?? place ?? ""

    if (place) {
      const filterNode = createFilterNodeAtPosition("place", {
        x: queryNode.position.x,
        y: queryNode.position.y + 180,
      })
      filterNode.data.filterValue = place
      filterNode.data.title = `Lugar: ${place}`

      nextNodes = [...nextNodes, filterNode]
      nextEdges = [...nextEdges, buildEdge(queryNode.id, filterNode.id)]

      if (!searchQuery) {
        searchQuery = place
      }
    }

    useGraphStore.getState().setNodes(nextNodes)
    useGraphStore.getState().setEdges(nextEdges)

    const searchFromInput = useGraphStore.getState().searchFromInput
    if (searchFromInput && searchQuery.trim()) {
      window.setTimeout(() => {
        searchFromInput(searchNodeId, searchQuery.trim())
      }, 120)
    }

    onConsumed?.()
  }, [enabled, onConsumed, searchParams])
}
