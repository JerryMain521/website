export type Scene = 'original' | 'sunny' | 'cloudy' | 'overcast' | 'rain' | 'snow' | 'fog'
export type Period = 'day' | 'night'
export type Intensity = 'none' | 'light' | 'moderate' | 'heavy'
export type Reading = { temperature: number; code: number; day: boolean }
export const levels = ['light', 'moderate', 'heavy'] as const

export const conditions = {
  original: { scene: 'original', label: '原版蓝色渐变', labels: [] },
  sunny: { scene: 'sunny', label: '晴朗', labels: [] },
  cloudy: { scene: 'cloudy', label: '多云', labels: [] },
  overcast: { scene: 'overcast', label: '阴天', labels: [] },
  fog: { scene: 'fog', label: '雾', labels: [] },
  'rime-fog': { scene: 'fog', label: '雾凇', labels: [] },
  drizzle: { scene: 'rain', label: '毛毛雨', labels: ['轻微毛毛雨', '中等毛毛雨', '浓密毛毛雨'] },
  rain: { scene: 'rain', label: '降雨', labels: ['小雨', '中雨', '大雨'] },
  showers: { scene: 'rain', label: '阵雨', labels: ['弱阵雨', '中等阵雨', '强阵雨'] },
  'freezing-drizzle': {
    scene: 'rain',
    label: '冻毛毛雨',
    labels: ['轻微冻毛毛雨', '', '浓密冻毛毛雨']
  },
  'freezing-rain': { scene: 'rain', label: '冻雨', labels: ['轻冻雨', '', '强冻雨'] },
  snow: { scene: 'snow', label: '降雪', labels: ['小雪', '中雪', '大雪'] },
  'snow-showers': { scene: 'snow', label: '阵雪', labels: ['弱阵雪', '', '强阵雪'] },
  'snow-grains': { scene: 'snow', label: '雪粒', labels: [] },
  thunderstorm: { scene: 'rain', label: '雷雨', labels: ['', '雷雨', '强雷雨'] },
  hail: { scene: 'rain', label: '雷雨伴冰雹', labels: ['雷雨伴小冰雹', '', '雷雨伴大冰雹'] }
} satisfies Record<string, { scene: Scene; label: string; labels: string[] }>
export type Kind = keyof typeof conditions
type Condition = { kind: Kind; intensity: Intensity; label: string }

// Open-Meteo WMO codes; intensity here is the provider's category, not a 24h total.
const codes: Record<number, Condition> = {
  0: { kind: 'sunny', intensity: 'none', label: '晴朗' },
  1: { kind: 'sunny', intensity: 'none', label: '大部晴朗' },
  2: { kind: 'cloudy', intensity: 'none', label: '多云' },
  3: { kind: 'overcast', intensity: 'none', label: '阴天' },
  45: { kind: 'fog', intensity: 'none', label: '雾' },
  48: { kind: 'rime-fog', intensity: 'none', label: '雾凇' },
  51: { kind: 'drizzle', intensity: 'light', label: '轻微毛毛雨' },
  53: { kind: 'drizzle', intensity: 'moderate', label: '中等毛毛雨' },
  55: { kind: 'drizzle', intensity: 'heavy', label: '浓密毛毛雨' },
  56: { kind: 'freezing-drizzle', intensity: 'light', label: '轻微冻毛毛雨' },
  57: { kind: 'freezing-drizzle', intensity: 'heavy', label: '浓密冻毛毛雨' },
  61: { kind: 'rain', intensity: 'light', label: '小雨' },
  63: { kind: 'rain', intensity: 'moderate', label: '中雨' },
  65: { kind: 'rain', intensity: 'heavy', label: '大雨' },
  66: { kind: 'freezing-rain', intensity: 'light', label: '轻冻雨' },
  67: { kind: 'freezing-rain', intensity: 'heavy', label: '强冻雨' },
  71: { kind: 'snow', intensity: 'light', label: '小雪' },
  73: { kind: 'snow', intensity: 'moderate', label: '中雪' },
  75: { kind: 'snow', intensity: 'heavy', label: '大雪' },
  77: { kind: 'snow-grains', intensity: 'none', label: '雪粒' },
  80: { kind: 'showers', intensity: 'light', label: '弱阵雨' },
  81: { kind: 'showers', intensity: 'moderate', label: '中等阵雨' },
  82: { kind: 'showers', intensity: 'heavy', label: '强阵雨' },
  85: { kind: 'snow-showers', intensity: 'light', label: '弱阵雪' },
  86: { kind: 'snow-showers', intensity: 'heavy', label: '强阵雪' },
  95: { kind: 'thunderstorm', intensity: 'moderate', label: '雷雨' },
  96: { kind: 'hail', intensity: 'light', label: '雷雨伴小冰雹' },
  97: { kind: 'thunderstorm', intensity: 'heavy', label: '强雷雨' },
  99: { kind: 'hail', intensity: 'heavy', label: '雷雨伴大冰雹' }
}

export function weatherCondition(code: number): Condition {
  return codes[code] ?? { kind: 'original', intensity: 'none', label: '天气状态未知' }
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
    scene === 'rain' ? [0, 55, 115, 210][level] : scene === 'snow' ? [0, 32, 75, 145][level] : 60
  return {
    count: Math.round(count * (mobile ? 0.55 : 1)),
    level,
    speed: [0.0, 0.65, 1, 1.5][level]
  }
}
