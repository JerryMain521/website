export type Scene = 'original' | 'sunny' | 'cloudy' | 'overcast' | 'rain' | 'snow' | 'fog'
export type Period = 'day' | 'night'
export type Intensity = 'none' | 'light' | 'moderate' | 'heavy'
export type Reading = { temperature: number; code: number; day: boolean }
export const levels = ['light', 'moderate', 'heavy'] as const

export const conditions = {
  original: { scene: 'original', label: 'Original background', labels: [] },
  sunny: { scene: 'sunny', label: 'Clear', labels: [] },
  cloudy: { scene: 'cloudy', label: 'Partly cloudy', labels: [] },
  overcast: { scene: 'overcast', label: 'Overcast', labels: [] },
  fog: { scene: 'fog', label: 'Fog', labels: [] },
  'rime-fog': { scene: 'fog', label: 'Rime fog', labels: [] },
  drizzle: {
    scene: 'rain',
    label: 'Drizzle',
    labels: ['Light drizzle', 'Moderate drizzle', 'Dense drizzle']
  },
  rain: { scene: 'rain', label: 'Rain', labels: ['Light rain', 'Moderate rain', 'Heavy rain'] },
  showers: {
    scene: 'rain',
    label: 'Rain showers',
    labels: ['Light rain showers', 'Moderate rain showers', 'Heavy rain showers']
  },
  'freezing-drizzle': {
    scene: 'rain',
    label: 'Freezing drizzle',
    labels: ['Light freezing drizzle', '', 'Dense freezing drizzle']
  },
  'freezing-rain': {
    scene: 'rain',
    label: 'Freezing rain',
    labels: ['Light freezing rain', '', 'Heavy freezing rain']
  },
  snow: { scene: 'snow', label: 'Snow', labels: ['Light snow', 'Moderate snow', 'Heavy snow'] },
  'snow-showers': {
    scene: 'snow',
    label: 'Snow showers',
    labels: ['Light snow showers', '', 'Heavy snow showers']
  },
  'snow-grains': { scene: 'snow', label: 'Snow grains', labels: [] },
  thunderstorm: {
    scene: 'rain',
    label: 'Thunderstorm',
    labels: ['', 'Thunderstorm', 'Heavy thunderstorm']
  },
  hail: {
    scene: 'rain',
    label: 'Thunderstorm with hail',
    labels: ['Thunderstorm with light hail', '', 'Thunderstorm with heavy hail']
  }
} satisfies Record<string, { scene: Scene; label: string; labels: string[] }>
export type Kind = keyof typeof conditions
type Condition = { kind: Kind; intensity: Intensity; label: string }

// Open-Meteo WMO codes; intensity here is the provider's category, not a 24h total.
const codes: Record<number, Condition> = {
  0: { kind: 'sunny', intensity: 'none', label: 'Clear' },
  1: { kind: 'sunny', intensity: 'none', label: 'Mostly clear' },
  2: { kind: 'cloudy', intensity: 'none', label: 'Partly cloudy' },
  3: { kind: 'overcast', intensity: 'none', label: 'Overcast' },
  45: { kind: 'fog', intensity: 'none', label: 'Fog' },
  48: { kind: 'rime-fog', intensity: 'none', label: 'Rime fog' },
  51: { kind: 'drizzle', intensity: 'light', label: 'Light drizzle' },
  53: { kind: 'drizzle', intensity: 'moderate', label: 'Moderate drizzle' },
  55: { kind: 'drizzle', intensity: 'heavy', label: 'Dense drizzle' },
  56: { kind: 'freezing-drizzle', intensity: 'light', label: 'Light freezing drizzle' },
  57: { kind: 'freezing-drizzle', intensity: 'heavy', label: 'Dense freezing drizzle' },
  61: { kind: 'rain', intensity: 'light', label: 'Light rain' },
  63: { kind: 'rain', intensity: 'moderate', label: 'Moderate rain' },
  65: { kind: 'rain', intensity: 'heavy', label: 'Heavy rain' },
  66: { kind: 'freezing-rain', intensity: 'light', label: 'Light freezing rain' },
  67: { kind: 'freezing-rain', intensity: 'heavy', label: 'Heavy freezing rain' },
  71: { kind: 'snow', intensity: 'light', label: 'Light snow' },
  73: { kind: 'snow', intensity: 'moderate', label: 'Moderate snow' },
  75: { kind: 'snow', intensity: 'heavy', label: 'Heavy snow' },
  77: { kind: 'snow-grains', intensity: 'none', label: 'Snow grains' },
  80: { kind: 'showers', intensity: 'light', label: 'Light rain showers' },
  81: { kind: 'showers', intensity: 'moderate', label: 'Moderate rain showers' },
  82: { kind: 'showers', intensity: 'heavy', label: 'Heavy rain showers' },
  85: { kind: 'snow-showers', intensity: 'light', label: 'Light snow showers' },
  86: { kind: 'snow-showers', intensity: 'heavy', label: 'Heavy snow showers' },
  95: { kind: 'thunderstorm', intensity: 'moderate', label: 'Thunderstorm' },
  96: { kind: 'hail', intensity: 'light', label: 'Thunderstorm with light hail' },
  97: { kind: 'thunderstorm', intensity: 'heavy', label: 'Heavy thunderstorm' },
  99: { kind: 'hail', intensity: 'heavy', label: 'Thunderstorm with heavy hail' }
}

export function weatherCondition(code: number): Condition {
  return codes[code] ?? { kind: 'original', intensity: 'none', label: 'Weather unavailable' }
}

export function availableIntensities(kind: Kind): Intensity[] {
  return levels.filter((_, index) => Boolean(conditions[kind].labels[index]))
}

export function resolveBackground(
  reading: Reading | null,
  weather: string,
  time: string,
  strength = 'live'
) {
  const actual = reading ? weatherCondition(reading.code) : null
  const kind: Kind =
    weather === 'live'
      ? (actual?.kind ?? 'original')
      : Object.hasOwn(conditions, weather)
        ? (weather as Kind)
        : 'original'
  const definition = conditions[kind]
  const supported = availableIntensities(kind)
  const fallback =
    actual?.kind === kind
      ? actual.intensity
      : supported.includes('moderate')
        ? 'moderate'
        : (supported[0] ?? 'none')
  const intensity: Intensity = supported.includes(strength as Intensity)
    ? (strength as Intensity)
    : fallback
  const label =
    weather === 'live' && strength === 'live' && actual
      ? actual.label
      : definition.labels[levels.indexOf(intensity as (typeof levels)[number])] || definition.label
  const period: Period =
    time === 'live'
      ? reading?.day === false
        ? 'night'
        : 'day'
      : time === 'night'
        ? 'night'
        : 'day'
  return { kind, scene: definition.scene, intensity, label, period }
}

export function particleStyle(scene: Scene, intensity: Intensity, mobile: boolean) {
  const level = intensity === 'heavy' ? 3 : intensity === 'moderate' ? 2 : 1
  const count =
    scene === 'rain' ? [0, 55, 115, 210][level] : scene === 'snow' ? [0, 40, 100, 210][level] : 60
  return {
    count: Math.round(count * (mobile ? 0.55 : 1)),
    level,
    speed: scene === 'snow' ? [0, 0.9, 1.5, 2.4][level] : [0, 0.65, 1, 1.5][level]
  }
}
