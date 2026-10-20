type Scene =
  | 'original'
  | 'sunny'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'sunset'
  | 'night'
type Place = { name: string; latitude: number; longitude: number }
type Reading = {
  temperature: number
  code: number
  day: boolean
  time: number
  sunrise: number
  sunset: number
}
const names: Record<Scene, string> = {
  original: '原版蓝色渐变',
  sunny: '晴天',
  cloudy: '多云',
  overcast: '阴天',
  rain: '雨天',
  snow: '下雪',
  fog: '薄雾',
  sunset: '日出 / 日落',
  night: '晴朗夜空'
}
const icons: Record<Scene, string> = {
  original: '◌',
  sunny: '☀',
  cloudy: '☁',
  overcast: '☁',
  rain: '☂',
  snow: '❄',
  fog: '≋',
  sunset: '◒',
  night: '☾'
}
const CACHE_TIME = 20 * 60 * 1000

export function weatherScene(reading: Reading): Scene {
  const code = reading.code
  if (code >= 95 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code === 45 || code === 48) return 'fog'
  if (code === 3) return 'overcast'
  if (
    code <= 2 &&
    [reading.sunrise, reading.sunset].some((time) => Math.abs(reading.time - time) < 2400)
  )
    return 'sunset'
  if (!reading.day && code <= 1) return 'night'
  return code <= 1 ? 'sunny' : 'cloudy'
}

export function initWeather() {
  const sky = document.querySelector<HTMLElement>('#weather-sky')
  const status = document.querySelector<HTMLElement>('#weather-status')
  const select = document.querySelector<HTMLSelectElement>('#weather-scene')
  const notice = document.querySelector<HTMLElement>('#weather-notice')
  const motion = document.querySelector<HTMLInputElement>('#weather-motion')
  const canvas = document.querySelector<HTMLCanvasElement>('#weather-particles')
  if (!sky || !status || !select || !notice || !motion || !canvas) return
  let place: Place = { name: '南京', latitude: 32.06, longitude: 118.79 }
  let reading: Reading | null = null
  let scene: Scene = 'original'
  let requestId = 0
  let controller: AbortController | undefined
  let frame = 0
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  motion.checked = !reduced.matches
  const ctx = canvas.getContext('2d')
  let width = 0,
    height = 0
  let particles: { x: number; y: number; size: number; speed: number }[] = []

  function resize() {
    if (!canvas || !sky) return
    width = sky.clientWidth
    height = sky.clientHeight
    const ratio = Math.min(devicePixelRatio || 1, 2)
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
    particles = Array.from({ length: width < 640 ? 35 : 75 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 1.5 + 0.6
    }))
    draw(0)
  }
  function draw(delta: number) {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    if (!['rain', 'snow', 'night'].includes(scene)) return
    const dark = document.documentElement.classList.contains('dark')
    ctx.strokeStyle = dark ? '#b5d7ed' : '#426a8d'
    ctx.fillStyle =
      scene === 'night' ? (dark ? '#edf4ff' : '#627496') : dark ? '#e8f2ff' : '#ffffff'
    for (const p of particles) {
      ctx.globalAlpha = scene === 'night' ? 0.5 : 0.28
      if (scene === 'rain') {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - 3, p.y + p.size * 10)
        ctx.stroke()
        p.y += delta * p.speed * 0.42
        p.x -= delta * 0.055
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, scene === 'night' ? p.size * 0.5 : p.size, 0, Math.PI * 2)
        ctx.fill()
        if (scene === 'snow') {
          p.y += delta * p.speed * 0.025
          p.x += delta * 0.008
        }
      }
      if (p.y > height + 20) {
        p.y = -20
        p.x = Math.random() * width
      }
      if (p.x < -10) p.x = width + 10
      if (p.x > width + 10) p.x = -10
    }
    ctx.globalAlpha = 1
  }
  let last = 0
  function tick(time: number) {
    draw(last ? Math.min(time - last, 50) : 0)
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
    scene = live ? (reading ? weatherScene(reading) : 'original') : (select!.value as Scene)
    sky!.dataset.scene = scene
    sky!.dataset.day = live && reading && !reading.day ? 'night' : 'day'
    status!.textContent = live
      ? reading
        ? `${icons[scene]} ${place.name} · ${names[scene]} · ${Math.round(reading.temperature)}°C`
        : `${place.name} · 天气暂不可用，保留原版背景`
      : `${icons[scene]} ${names[scene]} · ${scene === 'original' ? '背景对比' : '模拟预览'}`
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
          daily: 'sunrise,sunset',
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
          day: c.is_day === 1,
          time: c.time,
          sunrise: data.daily?.sunrise?.[0] ?? 0,
          sunset: data.daily?.sunset?.[0] ?? 0
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
