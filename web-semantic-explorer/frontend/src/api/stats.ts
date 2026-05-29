import type { CancelablePromise } from "@/client/core/CancelablePromise"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"

import type { HeatmapResponse } from "./types/heatmap"

export type { HeatmapEntry, HeatmapResponse } from "./types/heatmap"

/** Cliente manual para endpoints de estadísticas no cubiertos por openapi-ts. */
export const StatsApi = {
  getHeatmap(): CancelablePromise<HeatmapResponse> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/stats/heatmap",
    })
  },
}
