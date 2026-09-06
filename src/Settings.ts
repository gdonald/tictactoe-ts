export interface Settings {
  gamesBeforeSimulation: number
  aiSpeed: number
  aiThinkingDelay: number
  decodingSpeed: number
}

export const DEFAULT_SETTINGS: Settings = {
  gamesBeforeSimulation: 80,
  aiSpeed: 130,
  aiThinkingDelay: 200,
  decodingSpeed: 150,
}

export function readSettings(search: string = window.location.search): Settings {
  const params = new URLSearchParams(search)

  return {
    gamesBeforeSimulation: numberFrom(params, "games", DEFAULT_SETTINGS.gamesBeforeSimulation),
    aiSpeed: numberFrom(params, "aiSpeed", DEFAULT_SETTINGS.aiSpeed),
    aiThinkingDelay: numberFrom(params, "aiDelay", DEFAULT_SETTINGS.aiThinkingDelay),
    decodingSpeed: numberFrom(params, "decodeSpeed", DEFAULT_SETTINGS.decodingSpeed),
  }
}

function numberFrom(params: URLSearchParams, name: string, fallback: number): number {
  const raw = params.get(name)

  if (raw === null) {
    return fallback
  }

  const value = Number(raw)

  if (!Number.isFinite(value) || value < 0) {
    return fallback
  }

  return value
}
