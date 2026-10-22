import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

// Run from the website root: node preset/scripts/import-board-archive.mjs [archive-directory]
const root = fileURLToPath(new URL('../../', import.meta.url))
const source = path.resolve(process.argv[2] ?? path.join(root, '../聊天记录'))
const destination = path.join(root, 'src/content/board')
const read = (name) => fs.readFileSync(path.join(source, name), 'utf8').replace(/^\uFEFF/, '')
const topics = JSON.parse(read('运科交流_问题与答复_初稿数据.json'))
const archive = JSON.parse(read('运科交流_消息数据.json'))
const timeline = read('运科交流_问题与答复_时间顺序.md')
const dates = new Map(
  [...timeline.matchAll(/^### (Q\d+) [^\n]+\n+\*\*首次记录：\*\* (\d{4}-\d{2}-\d{2}) ([^\n]+)/gm)]
    .map((match, order) => [match[1], { date: match[2], detail: match[3].split('　｜')[0], order }])
)
const messages = new Map(archive.messages.map((message) => [message.id, message]))
const names = [...new Set([...archive.messages.map((message) => message.sender), 'MYBSF.', '秦超巨', '郁总'])].filter(Boolean)
const pseudonyms = new Map(names.map((name, index) => [name, `群友（${index + 1}）`]))
// Replace in one pass so a replacement cannot be mistaken for another participant's name.
const namePattern = new RegExp(
  [...names].sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'
)
const anonymize = (text) => text.replace(namePattern, (name) => pseudonyms.get(name) ?? '群友')
const escapeQuote = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/([\\`*_[\]])/g, '\\$1').split('\n').map((line) => `> ${line}`).join('\n')

const slugs = [
  'warm-up', 'power-clean-readiness', 'romanian-deadlift', 'shoulder-blade',
  'serratus-activation', 'chest-press-asymmetry', 'bench-press-resources', 'training-periodization',
  'fitness-test-preparation', 'campus-running', 'thigh-fat-loss', 'lean-physique',
  'waist-reduction', 'body-composition', 'rapid-weight-loss', 'snacking-during-fat-loss',
  'cheat-meal-frequency', 'post-meal-vascularity', 'breakfast-ideas', 'chicken-skin',
  'creatine-selection', 'creatine-weight-gain', 'creatine-forms', 'creatine-purity',
  'coffee-and-creatine', 'protein-powder-timing', 'incomplete-protein', 'protein-powder-selection',
  'milk-intake', 'whole-or-skim-milk', 'milk-and-acne', 'recovery-and-supplements',
  'foam-roller', 'foam-roller-pain', 'massage-gun', 'deadlift-back-pain',
  'lower-back-pain', 'ankle-and-arch-training', 'hip-abduction-cramp', 'waking-up-sore',
  'sleep-difficulties', 'sleepiness-after-running', 'fasted-milk-tea', 'blood-glucose-fluctuations',
  'blood-pressure', 'cpt-learning-path', 'anatomy-study', 'clinical-study-resources',
  'medicine-and-sports-science', 'cpt-exam-readiness', 'cpt-exam-booking', 'acne-medication-discussion'
]
const slugFor = (id) => slugs[Number(id.slice(1)) - 1]
const existingIds = new Set(['Q33', 'Q01', 'Q03', 'Q04'])
const relatedGroups = [
  ['Q01', 'Q02', 'Q03', 'Q08'], ['Q04', 'Q05', 'Q06', 'Q07'],
  ['Q09', 'Q10', 'Q42'], ['Q11', 'Q12', 'Q13', 'Q14', 'Q15'],
  ['Q16', 'Q17', 'Q18', 'Q19', 'Q20'], ['Q21', 'Q22', 'Q23', 'Q24', 'Q25'],
  ['Q26', 'Q27', 'Q28'], ['Q29', 'Q30', 'Q31', 'Q52'],
  ['Q32', 'Q33', 'Q34', 'Q35', 'Q40'], ['Q03', 'Q36', 'Q37'],
  ['Q38', 'Q39'], ['Q41', 'Q42', 'Q43'], ['Q43', 'Q44', 'Q45'],
  ['Q46', 'Q47', 'Q48', 'Q49'], ['Q46', 'Q50', 'Q51']
]
const categories = {
  '减脂与日常饮食': '饮食与体重管理', '蛋白质、乳制品与补剂': '营养与补剂',
  '睡眠、饮料与身体状态': '睡眠与身体状态', '学习路径与考试': '学习与考试',
  '其他：皮肤与药物闲聊': '其他讨论'
}
const technique = new Set(['Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07'])
const recovery = new Set(['Q33', 'Q34', 'Q35', 'Q40'])
const needsFeedback = new Set(['Q05', 'Q06', 'Q36', 'Q37', 'Q38', 'Q39', 'Q40', 'Q41', 'Q42', 'Q43', 'Q45'])
const parse = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  assert(match, 'Missing frontmatter')
  return { document: YAML.parseDocument(match[1]), body: match[2].trim() }
}

assert.equal(topics.length, 52)
assert.equal(dates.size, 52, 'Every topic needs a first-discussed date from the existing timeline')
assert.equal(new Set(slugs).size, 52)
const planned = []
const previousFiles = fs.readdirSync(destination).filter((name) => name.endsWith('.md'))
let nextNumber = Math.max(...previousFiles.map((name) => Number(parse(fs.readFileSync(path.join(destination, name), 'utf8')).document.get('number')))) + 1
for (const topic of [...topics].sort((a, b) => dates.get(a.id).order - dates.get(b.id).order)) {
  const slug = slugFor(topic.id)
  const file = path.join(destination, `${slug}.md`)
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  const marker = `<!-- archive-import: ${topic.id} -->`
  if (original?.includes(marker)) continue
  assert(!original || existingIds.has(topic.id), `Refusing to overwrite ${slug}`)
  const first = dates.get(topic.id)
  const related = [...new Set(relatedGroups.filter((group) => group.includes(topic.id)).flat())]
    .filter((id) => id !== topic.id).slice(0, 3).map(slugFor)
  const category = categories[topic.c] ?? (topic.c === '训练方法与动作技术'
    ? technique.has(topic.id) ? '动作技术' : '训练方法'
    : recovery.has(topic.id) ? '恢复与放松' : '疼痛与康复')
  let document, body
  if (original) {
    ;({ document, body } = parse(original))
    document.set('updatedDate', '2026-10-22')
    document.set('related', [...new Set([...(document.get('related')?.toJSON() ?? []), ...related])])
    body = body.replace('Demo content; sources have not been fully verified.', 'Sources have not been fully verified. Source identifiers and imported excerpts are recorded below.')
  } else {
    document = new YAML.Document({
      number: String(nextNumber++).padStart(3, '0'), title: topic.q,
      summary: anonymize(topic.a), category,
      status: needsFeedback.has(topic.id) ? '待反馈' : '待补充',
      date: first.date, updatedDate: '2026-10-22', documented: false, draft: false, related
    })
    body = `## Current summary\n\n${anonymize(topic.a)}\n\n> Community discussion notes · Not a complete guide\n\n## Background\n\n${topic.q}\n\n首次记录：${first.date} ${first.detail}。`
  }
  const start = topic.s ? messages.get(topic.s) : null
  const timestamp = start ? `${start.date}${start.time ? ` ${start.time}` : ' · Time not shown'}` : ''
  const excerpt = start
    ? `### Opening excerpt · ${timestamp} · #${start.id}\n\n${escapeQuote(anonymize(start.body))}\n\n`
    : ''
  const scopeNote = topic.id === 'Q40' ? '\n\n首次日期依据先前截图整理；下面的文字摘录来自 10 月 19 日另一段相似讨论，不能视为同一个案。'
    : topic.id === 'Q39' ? '\n\n本条仅依据先前截图的整理记录；消息 JSON 没有对应原文，未补造引文。' : ''
  const sourceNote = topic.s
    ? `原归档消息 #${topic.s}—#${topic.e}（范围内含交叉话题，以上答复为归并转述）。`
    : '截图补充项，无原归档消息编号。'
  const supplement = topic.extra ? `\n\n${topic.extra.replace('用户先前', '先前').replace('用户先前', '先前')}` : ''
  body += `\n\n${marker}\n\n## Imported discussion\n\n${excerpt}### Group response · Editorial summary\n\n${anonymize(topic.a)}\n\n讨论状态：${topic.st}。${scopeNote}\n\n## ${original ? 'Additional editorial questions' : 'Open questions'}\n\n${anonymize(topic.v)}\n\n## Archive source\n\n来源：微信「运科交流」2026-10-16—2026-10-20 文字归档。原审核编号：${topic.id}。${sourceNote}${supplement}\n\n问题标题与群内答复经过整理；发言人使用统一匿名编号。群友意见未经外部事实核查，有回复不代表问题已解决。未显示的时分不推测；文件未读取、语音未转写，图片与合并聊天仅保留已归档信息。\n`
  // Astro's YAML reader interprets unquoted ISO dates as Date objects; Board requires strings.
  for (const field of ['date', 'updatedDate']) {
    if (document.has(field)) document.get(field, true).type = 'QUOTE_SINGLE'
  }
  const text = `---\n${document.toString().trimEnd()}\n---\n\n${body.trimEnd()}\n`
  const data = document.toJSON()
  assert(data.title.length <= 60 && data.summary.length <= 160, `${slug}: manager field length limit`)
  assert.equal(data.date, first.date)
  assert(data.related.every((id) => id !== slug && slugs.includes(id)))
  assert(!namePattern.test(body), `${slug}: participant name leaked`)
  namePattern.lastIndex = 0
  planned.push({ file, original, text })
}

// Validate every file before writing, and preserve any pre-existing local edits separately.
if (planned.some((entry) => entry.original)) {
  const fingerprint = createHash('sha256').update(planned.filter((entry) => entry.original).map((entry) => entry.original).join('\n')).digest('hex').slice(0, 12)
  const backup = path.join(source, `Board导入前备份_20261022_${fingerprint}`)
  fs.mkdirSync(backup, { recursive: true })
  for (const entry of planned.filter((entry) => entry.original)) {
    fs.writeFileSync(path.join(backup, path.basename(entry.file)), entry.original, { flag: 'wx' })
  }
  console.log(`Original records backed up to ${backup}`)
}
for (const entry of planned) fs.writeFileSync(entry.file, entry.text, 'utf8')
console.log(`Imported ${planned.length} records (${planned.filter((entry) => entry.original).length} existing, ${planned.filter((entry) => !entry.original).length} new).`)
