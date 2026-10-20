import {
  availableIntensities,
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
  const select = document.querySelector<HTMLSelectElement>('#weather-scene')
  const intensitySelect = document.querySelector<HTMLSelectElement>('#weather-intensity')
  const periodSelect = document.querySelector<HTMLSelectElement>('#weather-period')
  const notice = document.querySelector<HTMLElement>('#weather-notice')
  const motion = document.querySelector<HTMLInputElement>('#weather-motion')
  const canvas = document.querySelector<HTMLCanvasElement>('#weather-particles')
  if (
    !sky ||
    !status ||
    !select ||
    !intensitySelect ||
    !periodSelect ||
    !notice ||
    !motion ||
    !canvas
  )
    return
  let place: Place = { name: '南京', latitude: 32.06, longitude: 118.79 }
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
  motion.checked = !reduced.matches
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
    sky!.dataset.motion = String(motion!.checked && !reduced.matches)
    draw(0)
    if (motion!.checked && !reduced.matches && !document.hidden && ['rain', 'snow'].includes(scene))
      frame = requestAnimationFrame(tick)
  }
  function render() {
    const live = select!.value === 'live'
    const candidate = resolveBackground(reading, select!.value, periodSelect!.value)
    const supported = availableIntensities(candidate.kind)
    intensitySelect!.disabled = supported.length === 0
    for (const option of intensitySelect!.options) {
      option.disabled = option.value !== 'live' && !supported.includes(option.value as Intensity)
    }
    if (intensitySelect!.selectedOptions[0]?.disabled) intensitySelect!.value = 'live'
    const background = resolveBackground(
      reading,
      select!.value,
      periodSelect!.value,
      intensitySelect!.value
    )
    scene = background.scene
    period = background.period
    kind = background.kind
    intensity = background.intensity
    seedParticles()
    sky!.dataset.scene = scene
    sky!.dataset.day = period
    sky!.dataset.kind = kind
    sky!.dataset.intensity = intensity
    const timeLabel = period === 'day' ? '白天' : '黑夜'
    const icon = scene === 'sunny' && period === 'night' ? '☾' : icons[scene]
    const preview =
      !live ||
      periodSelect!.value !== 'live' ||
      (!intensitySelect!.disabled && intensitySelect!.value !== 'live')
    status!.textContent = live
      ? reading
        ? `${icon} ${place.name} · ${timeLabel} · ${background.label} · ${Math.round(reading.temperature)}°C${preview ? ' · 效果模拟' : ''}`
        : `${place.name} · 天气暂不可用，保留原版背景`
      : scene === 'original'
        ? '◌ 原版蓝色渐变 · 背景对比'
        : `${icon} ${timeLabel} · ${background.label} · 模拟预览${periodSelect!.value === 'live' && !reading ? '（昼夜未获取，暂按白天）' : ''}`
    animate()
  }
  async function load(next: Place, force = false) {
    const id = ++requestId
    controller?.abort()
    controller = new AbortController()
    const signal = controller.signal
    const timeout = window.setTimeout(
      () => controller?.signal === signal && controller.abort(),
      12000
    )
    const key = `weather-v1:${next.latitude.toFixed(2)},${next.longitude.toFixed(2)}`
    notice!.textContent = `正在查询${next.name}天气…`
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
          latitude: String(next.latitude),
          longitude: String(next.longitude),
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
      place = next
      reading = result
      notice!.textContent = `已获取${place.name}天气，每 20 分钟更新。可切换模拟场景比较效果。`
      render()
    } catch {
      if (id !== requestId) return
      notice!.textContent = `暂时无法获取${next.name}天气，请稍后重试；仍可使用全部模拟场景。`
      if (!reading) render()
    } finally {
      clearTimeout(timeout)
    }
  }
  select.addEventListener('change', render)
  periodSelect.addEventListener('change', render)
  intensitySelect.addEventListener('change', render)
  motion.addEventListener('change', animate)
  reduced.addEventListener('change', () => {
    motion.checked = !reduced.matches
    animate()
  })
  document.addEventListener('visibilitychange', animate)
  new MutationObserver(() => draw(0)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  new ResizeObserver(resize).observe(sky)
  document.querySelector('#weather-city-form')?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const input = document.querySelector<HTMLInputElement>('#weather-city')!
    const city = input.value.trim()
    if (!city) return
    const button = document.querySelector<HTMLButtonElement>('#weather-city-form button')!
    button.disabled = true
    notice.textContent = '正在查找城市…'
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: city, count: '1', language: 'zh', format: 'json' })}`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!response.ok) throw new Error('City lookup failed')
      const data = await response.json()
      const found = data.results?.[0]
      if (!found) {
        notice.textContent = '未找到城市，可以尝试拼音或英文城市名。'
        return
      }
      select.value = 'live'
      await load({ name: found.name, latitude: found.latitude, longitude: found.longitude })
    } catch {
      notice.textContent = '城市查询失败，请稍后重试。'
    } finally {
      button.disabled = false
    }
  })
  document.querySelector('#weather-location')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      notice.textContent = '浏览器不支持定位，请手动查询城市。'
      return
    }
    notice.textContent = '正在等待定位授权…'
    navigator.geolocation.getCurrentPosition(
      (position) => {
        select.value = 'live'
        void load({
          name: '我的位置',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      () => {
        notice.textContent = '未能取得位置，可手动查询城市。'
      },
      { timeout: 10000, maximumAge: 600000 }
    )
  })
  const timer = window.setInterval(() => {
    if (!document.hidden) void load(place, true)
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
  void load(place)
}
