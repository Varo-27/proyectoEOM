import { select } from "d3-selection"
import { type ZoomTransform, zoom, zoomIdentity } from "d3-zoom"
import { useCallback, useEffect, useRef, useState } from "react"

import type { MapProjectionId } from "@/lib/mapProjections"

export function useChoroplethZoom(
  countriesLoaded: boolean,
  _projectionId: MapProjectionId,
) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl || !countriesLoaded) return

    const svg = select(svgEl)
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 14])
      .on("zoom", (event) => {
        setTransform(event.transform)
      })

    svg.call(zoomBehavior)

    return () => {
      svg.on(".zoom", null)
    }
  }, [countriesLoaded])

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    select(svgEl).call(zoom<SVGSVGElement, unknown>().transform, zoomIdentity)
    setTransform(zoomIdentity)
  }, [])

  const resetView = useCallback(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    select(svgEl).call(zoom<SVGSVGElement, unknown>().transform, zoomIdentity)
    setTransform(zoomIdentity)
  }, [])

  return { svgRef, transform, resetView }
}
