import {
  particleStyle,
  resolveBackground,
  type Intensity,
  type Kind,
  type Period,
  type Reading,
  type Scene
} from './weather-model'

type Place = { name: string; latitude: number; longitude: number }
const icons: Record<Scene, string> = {
  original: '◌',
  sunny: '☀',
  cloudy: '☁',
  overcast: '☁',
  rain: '☂',
  snow: '❄',
  fog: '≋'
}
const CACHE_TIME = 20 * 60 * 1000

export function initWeather() {
  const sky = document.querySelector<HTMLElement>('#weather-sky')
  const status = document.querySelector<HTMLElement>('#weather-status')
  const canvas = document.querySelector<HTMLCanvasElement>('#weather-particles')
  if (!sky || !status || !canvas) return
  const place: Place = { name: '南京', latitude: 32.06, longitude: 118.79 }
  let reading: Reading | null = null
  let scene: Scene = 'original'
  let period: Period = 'day'
  let intensity: Intensity = 'none'
  let kind: Kind = 'original'
  let elapsed = 0
  let requestId = 0
  let controller: AbortController | undefined
  let frame = 0
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const ctx = canvas.getContext('2d')
  let width = 0,
    height = 0
  let particles: { x: number; y: number; size: number; speed: number; phase: number }[] = []

  function resize() {
    if (!canvas || !sky) return
    width = sky.clientWidth
    height = sky.clientHeight
    const ratio = Math.min(devicePixelRatio || 1, 2)
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
    seedParticles()
    draw(0)
  }
  function seedParticles() {
    const style = particleStyle(scene, intensity, width < 640)
    particles = Array.from({ length: style.count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 1.5 + 0.6,
      phase: Math.random() * Math.PI * 2
    }))
  }
  function draw(delta: number) {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    const stars = period === 'night' && scene === 'sunny'
    if (!['rain', 'snow'].includes(scene) && !stars) return
    const dark = period === 'night' || document.documentElement.classList.contains('dark')
    const style = particleStyle(scene, intensity, width < 640)
    const drizzle = kind === 'drizzle' || kind === 'freezing-drizzle'
    const freezing = kind === 'freezing-rain' || kind === 'freezing-drizzle'
    const storm = kind === 'thunderstorm' || kind === 'hail'
    const shower = kind === 'showers' || kind === 'snow-showers'
    const pulse = shower ? 0.65 + 0.35 * Math.sin(elapsed / 1900) ** 2 : 1
    ctx.strokeStyle = freezing ? (dark ? '#c1e8ff' : '#587f9e') : dark ? '#b5d7ed' : '#426a8d'
    ctx.fillStyle = stars ? '#edf4ff' : dark ? '#e8f2ff' : '#ffffff'
    for (const [index, p] of particles.entries()) {
      const center = Math.abs(p.x - width / 2) < Math.min(width * 0.28, 280) ? 0.55 : 1
      const depth = 0.65 + p.size * 0.22
      ctx.globalAlpha = (stars ? 0.65 : 0.21 + style.level * 0.055) * center * pulse
      if (scene === 'rain') {
        const gust = storm ? 1.4 + Math.sin(elapsed / 1700) * 0.3 : 1
        const length = drizzle ? 3 + p.size * 2 : (5 + style.level * 4) * depth
        const tilt = drizzle ? 0.6 : (1.5 + style.level * 1.2) * gust
        ctx.lineWidth = drizzle ? 0.6 : 0.65 + style.level * 0.12
        if (kind === 'hail' && index % 3 === 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, (1.1 + style.level * 0.4) * depth, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - tilt, p.y + length)
          ctx.stroke()
        }
        p.y += delta * p.speed * 0.42 * style.speed * (drizzle ? 0.45 : 1) * (storm ? 1.3 : 1)
        p.x -= delta * (drizzle ? 0.012 : 0.03 + style.level * 0.018) * gust
      } else {
        const grains = kind === 'snow-grains'
        const radius = stars
          ? p.size * 0.5
          : grains
            ? p.size * 0.5
            : p.size * (0.65 + style.level * 0.2)
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
        if (scene === 'snow') {
          if (!grains && style.level === 3 && index % 5 === 0) {
            ctx.strokeStyle = dark ? '#e8f2ff' : '#d0dfe8'
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(p.x - radius * 1.7, p.y)
            ctx.lineTo(p.x + radius * 1.7, p.y)
            ctx.moveTo(p.x, p.y - radius * 1.7)
            ctx.lineTo(p.x, p.y + radius * 1.7)
            ctx.stroke()
          }
          p.y += delta * p.speed * 0.025 * style.speed * (grains ? 2.2 : 1)
          p.x +=
            delta * (0.008 + Math.sin(elapsed / 1300 + p.phase) * 0.024) * (1 + style.level * 0.2)
        }
      }
      if (p.y > height + 30) {
        p.y = -30
        p.x = Math.random() * width
      }
      if (p.x < -10) p.x = width + 10
      if (p.x > width + 10) p.x = -10
    }
    ctx.globalAlpha = 1
  }
  let last = 0
  function tick(time: number) {
    const delta = last ? Math.min(time - last, 50) : 0
    elapsed += delta
    draw(delta)
    last = time
    frame = requestAnimationFrame(tick)
  }
  function animate() {
    cancelAnimationFrame(frame)
    last = 0
    sky!.dataset.motion = String(!reduced.matches)
    draw(0)
    if (!reduced.matches && !document.hidden && ['rain', 'snow'].includes(scene))
      frame = requestAnimationFrame(tick)
  }
  function render() {
    const background = resolveBackground(reading, 'live', 'live', 'live')
    scene = background.scene
    period = background.period
    kind = background.kind
    intensity = background.intensity
    seedParticles()
    sky!.dataset.scene = scene
    sky!.dataset.day = period
    sky!.dataset.kind = kind
    sky!.dataset.intensity = intensity
    const icon = scene === 'sunny' && period === 'night' ? '☾' : icons[scene]
    status!.textContent = reading
      ? `${icon} ${background.label} · ${Math.round(reading.temperature)}°C`
      : 'Weather unavailable'
    animate()
  }
  async function load(force = false) {
    const id = ++requestId
    controller?.abort()
    controller = new AbortController()
    const signal = controller.signal
    const timeout = window.setTimeout(
      () => controller?.signal === signal && controller.abort(),
      12000
    )
    const key = `weather-v1:${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`
    try {
      let cached: { saved: number; reading: Reading } | null = null
      try {
        cached = JSON.parse(localStorage.getItem(key) || 'null')
      } catch {
        /* Storage can be disabled. */
      }
      let result =
        !force && cached && Date.now() - cached.saved < CACHE_TIME ? cached.reading : null
      if (!result) {
        const params = new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          current: 'temperature_2m,weather_code,is_day',
          timezone: 'auto',
          timeformat: 'unixtime',
          forecast_days: '1'
        })
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
        if (!response.ok) throw new Error('Weather request failed')
        const data = await response.json()
        const c = data.current
        if (
          !c ||
          !Number.isFinite(c.temperature_2m) ||
          !Number.isFinite(c.weather_code) ||
          !Number.isFinite(c.time)
        )
          throw new Error('Invalid weather data')
        result = {
          temperature: c.temperature_2m,
          code: c.weather_code,
          day: c.is_day === 1
        }
        try {
          localStorage.setItem(key, JSON.stringify({ saved: Date.now(), reading: result }))
        } catch {
          /* Optional cache. */
        }
      }
      if (id !== requestId) return
      reading = result
      render()
    } catch {
      if (id !== requestId) return
      if (!reading) render()
    } finally {
      clearTimeout(timeout)
    }
  }
  reduced.addEventListener('change', animate)
  document.addEventListener('visibilitychange', animate)
  new MutationObserver(() => draw(0)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  new ResizeObserver(resize).observe(sky)
  const timer = window.setInterval(() => {
    if (!document.hidden) void load(true)
  }, CACHE_TIME)
  window.addEventListener(
    'pagehide',
    () => {
      clearInterval(timer)
      cancelAnimationFrame(frame)
      controller?.abort()
    },
    { once: true }
  )
  resize()
  void load()
}
