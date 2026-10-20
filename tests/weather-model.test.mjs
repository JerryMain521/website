import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/components/home/weather-model.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { weatherCondition, resolveBackground, availableIntensities, conditions, particleStyle } =
  await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

test('all documented WMO codes retain their type and intensity during both day and night', () => {
  const expected = [
    [0, 'sunny', 'none'], [1, 'sunny', 'none'], [2, 'cloudy', 'none'], [3, 'overcast', 'none'],
    [45, 'fog', 'none'], [48, 'rime-fog', 'none'],
    [51, 'drizzle', 'light'], [53, 'drizzle', 'moderate'], [55, 'drizzle', 'heavy'],
    [56, 'freezing-drizzle', 'light'], [57, 'freezing-drizzle', 'heavy'],
    [61, 'rain', 'light'], [63, 'rain', 'moderate'], [65, 'rain', 'heavy'],
    [66, 'freezing-rain', 'light'], [67, 'freezing-rain', 'heavy'],
    [71, 'snow', 'light'], [73, 'snow', 'moderate'], [75, 'snow', 'heavy'], [77, 'snow-grains', 'none'],
    [80, 'showers', 'light'], [81, 'showers', 'moderate'], [82, 'showers', 'heavy'],
    [85, 'snow-showers', 'light'], [86, 'snow-showers', 'heavy'],
    [95, 'thunderstorm', 'moderate'], [96, 'hail', 'light'], [97, 'thunderstorm', 'heavy'], [99, 'hail', 'heavy']
  ]
  for (const [code, kind, intensity] of expected) for (const day of [true, false]) {
    const result = resolveBackground({ temperature: 10, code, day }, 'live', 'live')
    assert.equal(result.kind, kind, `WMO ${code}`)
    assert.equal(result.intensity, intensity, `WMO ${code}`)
    assert.equal(result.period, day ? 'day' : 'night')
    assert.equal(result.label, weatherCondition(code).label)
  }
})

test('rain and snow strength overrides are independent of daylight and retain actual temperature', () => {
  const reading = { temperature: 12, code: 61, day: false }
  for (const time of ['day', 'night']) for (const [intensity, label] of [['light', '小雨'], ['moderate', '中雨'], ['heavy', '大雨']]) {
    const result = resolveBackground(reading, 'live', time, intensity)
    assert.equal(result.period, time)
    assert.equal(result.label, label)
    assert.equal(result.intensity, intensity)
  }
  assert.equal(reading.temperature, 12)
  assert.equal(resolveBackground(reading, 'snow', 'live', 'heavy').label, '大雪')
  assert.equal(resolveBackground(reading, 'snow', 'live', 'heavy').period, 'night')
})

test('unsupported intensity categories are never invented for freezing rain or snow showers', () => {
  for (const kind of ['freezing-rain', 'freezing-drizzle', 'snow-showers', 'hail']) {
    assert.deepEqual(availableIntensities(kind), ['light', 'heavy'])
    assert.equal(resolveBackground(null, kind, 'day', 'moderate').intensity, 'light')
  }
  for (const kind of ['sunny', 'fog', 'cloudy', 'snow-grains']) {
    assert.deepEqual(availableIntensities(kind), [])
    assert.equal(resolveBackground(null, kind, 'night', 'heavy').intensity, 'none')
  }
})

test('missing data and unknown codes keep original background; manual preview still works', () => {
  assert.equal(resolveBackground(null, 'live', 'night').scene, 'original')
  assert.equal(resolveBackground({ code: 123, day: false, temperature: 10 }, 'live', 'live').scene, 'original')
  assert.equal(resolveBackground(null, 'rain', 'night', 'heavy').label, '大雨')
  assert.equal(resolveBackground(null, 'original', 'night', 'heavy').scene, 'original')
})

test('every supported simulation can be combined with both time periods and has a label', () => {
  for (const kind of Object.keys(conditions)) for (const period of ['day', 'night']) {
    for (const intensity of ['live', ...availableIntensities(kind)]) {
      const result = resolveBackground(null, kind, period, intensity)
      assert.equal(result.kind, kind)
      assert.equal(result.period, period)
      assert.ok(result.label.length > 0)
    }
  }
})

test('stronger rain and snow increase density and speed within mobile particle limits', () => {
  for (const scene of ['rain', 'snow']) {
    let previous = { count: 0, speed: 0 }
    for (const intensity of ['light', 'moderate', 'heavy']) {
      const desktop = particleStyle(scene, intensity, false)
      const mobile = particleStyle(scene, intensity, true)
      assert.ok(desktop.count > previous.count)
      assert.ok(desktop.speed > previous.speed)
      assert.ok(mobile.count < desktop.count && mobile.count <= 120)
      previous = desktop
    }
  }
})
