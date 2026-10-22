import { getCollection } from 'astro:content'

// Content is authored in src/content/board/*.md.
export async function getForumTopics() {
  const entries = await getCollection('board', ({ data }) => !data.draft)
  return entries
    .map((entry) => ({
      ...entry.data,
      id: entry.id,
      entry
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || Number(b.number) - Number(a.number))
}

// UI labels stay separate from the original Chinese discussion content.
const boardLabels: Record<string, string> = {
  恢复与放松: 'Recovery',
  训练方法: 'Training',
  动作技术: 'Technique',
  饮食与体重管理: 'Diet & weight',
  营养与补剂: 'Nutrition',
  疼痛与康复: 'Pain & rehabilitation',
  睡眠与身体状态: 'Sleep & wellbeing',
  学习与考试: 'Learning & exams',
  其他讨论: 'Other discussions',
  待补充: 'Needs details',
  待反馈: 'Awaiting feedback',
  有分歧: 'Under discussion',
  提出问题: 'Question',
  经验交流: 'Shared experience',
  补充情境: 'More context',
  群友答复: 'Response',
  初步回复: 'Initial response',
  出现分歧: 'Different views',
  观点修正: 'Revised view',
  仍待核查: 'Needs verification'
}
export const boardLabel = (value: string) => boardLabels[value] ?? value
export const boardDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T12:00:00Z`))
