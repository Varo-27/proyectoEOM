/** GeoJSON Natural Earth (incluye ISO_A3 en properties). */
export const GEO_URLS = [
  "/geo/world-countries.geojson",
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson",
] as const

/** Territorios de ultramar ausentes en ne_110m_admin_0_countries (p. ej. Guayana Francesa). */
const OVERSEAS_MAP_UNITS_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_map_units.geojson"

const OVERSEAS_TERRITORY_ISOS = new Set(["GUF", "BMU", "GIB"])

const INVALID_GEO_ISO = new Set(["-99", "UNK", ""])

/** Códigos del GeoJSON que deben unirse con el país reconocido en EOM / ISO. */
const GEO_ISO_ALIAS: Record<string, string> = {
  SOL: "SOM", // Somaliland (Natural Earth) → Somalia
}

/** Natural Earth a veces deja ISO_A3 en -99 (p. ej. Noruega, Francia); usar ADM0_A3. */
export function getGeoIsoCode(geo: {
  properties?: Record<string, string | number | undefined | null>
}) {
  const props = geo.properties ?? {}
  const candidates = [
    props.ISO_A3,
    props.ISO_A3_EH,
    props.ADM0_A3,
    props.ADM0_A3_US,
    props.GU_A3,
    props.SOV_A3,
  ]

  for (const raw of candidates) {
    if (typeof raw !== "string") continue
    const normalized = raw.trim().toUpperCase()
    if (INVALID_GEO_ISO.has(normalized)) continue
    if (!/^[A-Z]{3}$/.test(normalized)) continue
    return canonicalMapIso(normalized)
  }
  return undefined
}

export function canonicalMapIso(isoCode: string | undefined) {
  if (!isoCode) return undefined
  return GEO_ISO_ALIAS[isoCode] ?? isoCode
}

type LonLat = [number, number]

function ringLonBounds(ring: LonLat[]) {
  let minLon = Number.POSITIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY
  for (const [lon] of ring) {
    if (lon < minLon) minLon = lon
    if (lon > maxLon) maxLon = lon
  }
  return { minLon, maxLon }
}

/** Polígonos en Sudamérica que Natural Earth agrupa dentro de FRA (Guayana Francesa). */
export function isOverseasFrancePolygon(ring: LonLat[]) {
  const { maxLon } = ringLonBounds(ring)
  return maxLon < -10
}

/** Francia metropolitana sin Guayana Francesa (territorio aparte como GUF). */
export function clipFranceMetropolitan(
  feature: GeoJSON.Feature,
): GeoJSON.Feature {
  const iso = getGeoIsoCode({ properties: feature.properties ?? {} })
  if (iso !== "FRA" || !feature.geometry) return feature

  const geometry = feature.geometry
  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates[0] as LonLat[]
    return isOverseasFrancePolygon(ring)
      ? { ...feature, geometry: { type: "MultiPolygon", coordinates: [] } }
      : feature
  }
  if (geometry.type !== "MultiPolygon") return feature

  const coordinates = geometry.coordinates
  const metroPolys = coordinates.filter(
    (poly) => !isOverseasFrancePolygon(poly[0] as LonLat[]),
  )
  if (metroPolys.length === coordinates.length) return feature

  return {
    ...feature,
    geometry:
      metroPolys.length === 1
        ? { type: "Polygon", coordinates: metroPolys[0] }
        : { type: "MultiPolygon", coordinates: metroPolys },
  }
}

function normalizeChoroplethGeojson(
  base: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  return {
    ...base,
    features: base.features
      .map((feature) => clipFranceMetropolitan(feature))
      .filter((feature) => {
        const geometry = feature.geometry
        if (!geometry) return false
        if (geometry.type === "MultiPolygon") {
          return geometry.coordinates.length > 0
        }
        return true
      }),
  }
}

export async function loadWorldCountriesGeoJson() {
  let lastError: Error | null = null

  for (const url of GEO_URLS) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const geojson = (await response.json()) as GeoJSON.FeatureCollection
      return normalizeChoroplethGeojson(await mergeOverseasTerritories(geojson))
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError ?? new Error("No se pudo cargar el mapa mundial")
}

async function mergeOverseasTerritories(
  base: GeoJSON.FeatureCollection,
): Promise<GeoJSON.FeatureCollection> {
  const existingIsos = new Set<string>()
  for (const feature of base.features) {
    const iso = getGeoIsoCode({ properties: feature.properties ?? {} })
    if (iso) existingIsos.add(iso)
  }

  const missing = [...OVERSEAS_TERRITORY_ISOS].filter(
    (iso) => !existingIsos.has(iso),
  )
  if (missing.length === 0) return base

  try {
    const response = await fetch(OVERSEAS_MAP_UNITS_URL)
    if (!response.ok) return base

    const units = (await response.json()) as GeoJSON.FeatureCollection
    const extras = units.features.filter((feature) => {
      const iso = getGeoIsoCode({ properties: feature.properties ?? {} })
      return iso !== undefined && missing.includes(iso)
    })

    if (extras.length === 0) return base

    return {
      ...base,
      features: [...base.features, ...extras],
    }
  } catch {
    return base
  }
}

export function isDirectCountryEntry(entry: {
  map_country_codes?: string[]
  country_code?: string | null
}) {
  if (entry.map_country_codes?.length === 1) return true
  return Boolean(entry.country_code && !entry.map_country_codes?.length)
}

export function isRegionEntry(entry: { map_country_codes?: string[] }) {
  return (entry.map_country_codes?.length ?? 0) > 1
}

/** Solo países/territorios concretos — las macro-regiones no diluyen el mapa. */
export function buildCountryCounts(
  entries: {
    country_code: string | null
    map_country_codes?: string[]
    article_count: number
  }[],
) {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    if (isRegionEntry(entry)) continue

    const code = entry.map_country_codes?.[0] ?? entry.country_code ?? undefined
    if (!code) continue

    counts.set(code, (counts.get(code) ?? 0) + entry.article_count)
  }
  return counts
}

export function getMaxCount(counts: Map<string, number>) {
  let max = 0
  for (const value of counts.values()) {
    if (value > max) max = value
  }
  return max
}

function mixChannel(from: number, to: number, t: number) {
  return Math.round(from + (to - from) * t)
}

function mixRgb(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
) {
  return `rgb(${mixChannel(from[0], to[0], t)}, ${mixChannel(from[1], to[1], t)}, ${mixChannel(from[2], to[2], t)})`
}

/** Escala de verdes EOM (elordenmundial.com) para intensidad en el mapa. */
export const EOM_GREEN = {
  50: "#ebf2e3",
  100: "#ccdbbb",
  200: "#bfd2aa",
  300: "#9cbd7a",
  400: "#7aad52",
  500: "#5c9e0e",
  600: "#497d0b",
  700: "#4c8a00",
  800: "#345a08",
  900: "#264106",
  950: "#203705",
} as const

/** @deprecated Usa EOM_GREEN */
export const HARLEQUIN = EOM_GREEN

/** Mar y fondo del contenedor (gris del tema). */
export const HEATMAP_SEA_FILL = "var(--map-ocean)"

/** Países sin artículos en EOM: siempre el verde más pálido de la escala. */
export const HEATMAP_EMPTY_COUNTRY_FILL = EOM_GREEN[50]

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "")
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

const EOM_GREEN_SCALE_KEYS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const

const HEATMAP_COLOR_STOPS: { at: number; rgb: [number, number, number] }[] =
  EOM_GREEN_SCALE_KEYS.map((key, index) => ({
    at: (index + 1) / EOM_GREEN_SCALE_KEYS.length,
    rgb: hexToRgb(EOM_GREEN[key]),
  }))

/** Más contraste en bajos, poco entre los máximos. */
export function countToColorIntensity(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) return 0
  return Math.min(1, (count / maxCount) ** 0.3)
}

function colorFromIntensity(intensity: number) {
  const t = Math.max(0, Math.min(1, intensity))

  for (let i = 0; i < HEATMAP_COLOR_STOPS.length; i++) {
    const upper = HEATMAP_COLOR_STOPS[i]
    if (t <= upper.at) {
      if (i === 0) return mixRgb(upper.rgb, upper.rgb, 0)
      const lower = HEATMAP_COLOR_STOPS[i - 1]
      const span = upper.at - lower.at
      const local = span > 0 ? (t - lower.at) / span : 0
      return mixRgb(lower.rgb, upper.rgb, local)
    }
  }

  const last = HEATMAP_COLOR_STOPS[HEATMAP_COLOR_STOPS.length - 1]
  return mixRgb(last.rgb, last.rgb, 0)
}

export type CountryFillParams = {
  isoCode: string | undefined
  counts: Map<string, number>
  maxCount: number
  selectedCode: string | null
  hoveredCode: string | null
  highlightedCodes: Set<string> | null
  hoveredRegionCodes?: Set<string> | null
}

export function getCountryFill(
  isoCode: string | undefined,
  counts: Map<string, number>,
  maxCount: number,
  selectedCode: string | null,
  hoveredCode: string | null,
  highlightedCodes: Set<string> | null,
  hoveredRegionCodes: Set<string> | null = null,
) {
  const countryHighlight = "var(--primary)"
  const regionHover = "var(--map-region-hover)"
  const regionSelected = "var(--map-region-selected)"

  if (!isoCode) return HEATMAP_SEA_FILL

  if (selectedCode === isoCode || hoveredCode === isoCode) {
    return countryHighlight
  }

  if (hoveredRegionCodes?.has(isoCode)) {
    return regionHover
  }

  if (highlightedCodes?.has(isoCode)) {
    return regionSelected
  }

  return getCountryBaseFill(isoCode, counts, maxCount)
}

/** Relleno sin estados de énfasis (capa base del mapa). */
export function getCountryBaseFill(
  isoCode: string | undefined,
  counts: Map<string, number>,
  maxCount: number,
) {
  if (!isoCode) return HEATMAP_SEA_FILL

  const count = counts.get(isoCode) ?? 0
  if (count === 0) return HEATMAP_EMPTY_COUNTRY_FILL

  const intensity = countToColorIntensity(count, maxCount)
  return colorFromIntensity(intensity)
}

export function isCountryEmphasized(
  isoCode: string | undefined,
  selectedCode: string | null,
  hoveredCode: string | null,
  highlightedCodes: Set<string> | null,
  hoveredRegionCodes: Set<string> | null = null,
) {
  if (!isoCode) return false
  return (
    selectedCode === isoCode ||
    hoveredCode === isoCode ||
    Boolean(hoveredRegionCodes?.has(isoCode)) ||
    Boolean(highlightedCodes?.has(isoCode))
  )
}

/** Color EOM para un conteo (lista lateral, leyenda). */
export function getHeatmapColorForCount(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) return HEATMAP_EMPTY_COUNTRY_FILL
  return colorFromIntensity(countToColorIntensity(count, maxCount))
}

export type EomGreenLegendKey = keyof typeof EOM_GREEN | "ocean" | "empty"

export const EOM_GREEN_LEGEND_STEPS: {
  key: EomGreenLegendKey
  label: string
}[] = [
  { key: "ocean", label: "Mar" },
  { key: "empty", label: "0 artículos" },
  { key: 100, label: "Muy bajo" },
  { key: 300, label: "Bajo" },
  { key: 500, label: "Medio" },
  { key: 700, label: "Alto" },
  { key: 950, label: "Máximo" },
]

/** @deprecated Usa EOM_GREEN_LEGEND_STEPS */
export const HARLEQUIN_LEGEND_STEPS = EOM_GREEN_LEGEND_STEPS

/** Etiqueta para búsqueda semántica: solo país directo en heatmap, nunca macro-región. */
export function resolveCountryClickSearch<
  T extends {
    name: string
    country_code: string | null
    map_country_codes?: string[]
  },
>(
  entries: T[] | undefined,
  isoCode: string,
  geoFallbackName: string | undefined,
  getLabel: (iso: string, geoName?: string) => string,
) {
  const direct = entries
    ? findDirectEntryForCountry(entries, isoCode)
    : undefined
  if (direct) return { place: direct.name, q: direct.name }
  const label = getLabel(isoCode, geoFallbackName)
  return { place: label, q: label }
}

export function findEntriesForCountry<
  T extends { country_code: string | null; map_country_codes?: string[] },
>(entries: T[], isoCode: string) {
  return entries.filter(
    (entry) =>
      entry.country_code === isoCode ||
      entry.map_country_codes?.includes(isoCode),
  )
}

export function findDirectEntryForCountry<
  T extends {
    name: string
    country_code: string | null
    map_country_codes?: string[]
  },
>(entries: T[], isoCode: string) {
  return entries.find(
    (entry) =>
      isDirectCountryEntry(entry) &&
      (entry.map_country_codes?.[0] === isoCode ||
        entry.country_code === isoCode),
  )
}

export function findRegionEntriesForCountry<
  T extends { map_country_codes?: string[] },
>(entries: T[], isoCode: string) {
  return entries.filter(
    (entry) =>
      isRegionEntry(entry) && entry.map_country_codes?.includes(isoCode),
  )
}

export function findBestEntryForCountry<
  T extends {
    name: string
    country_code: string | null
    map_country_codes?: string[]
  },
>(entries: T[], isoCode: string) {
  return (
    findDirectEntryForCountry(entries, isoCode) ??
    findEntriesForCountry(entries, isoCode)[0]
  )
}
