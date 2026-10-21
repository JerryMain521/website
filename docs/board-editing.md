# 编辑 Board

所有记录存放在 `src/content/board/`，每条记录一个 Markdown 文件。正文可以写中文，界面保持英文。

## 修改现有记录

打开对应 `.md` 文件：文件顶部 `---` 之间是元数据，下方是正文。修改后保存，本地预览自动刷新；线上网站需要重新构建部署。

文件名决定网址，例如 `foam-roller.md` 对应 `/forum/foam-roller`。发布后尽量不更改文件名，否则原链接会失效。

## 新增记录

在 `src/content/board/` 新建文件，例如 `squat-balance.md`，参考以下模板。编号应唯一，且用引号保留前导零。

```markdown
---
number: '005'
title: '这里写问题标题'
summary: '这里写简短摘要'
category: '动作技术'
status: '待补充'
date: '2026-10-22'
updatedDate: '2026-10-22'
documented: false
draft: false
related: ['warm-up']
---

## Current summary

这里写当前整理结果。

## Background

这里写提问背景。可以使用列表、链接、引用和图片等 Markdown 语法。

## Discussion notes

### Question · 10-22 10:00

这里写第一段讨论。

### Response · 10-22 10:05

这里写回应或后续反馈。

## Open questions

- 还缺什么资料或实践反馈？

## Source & editorial notes

这里填写来源、编辑说明及资料链接。
```

## 字段说明

- `number`：显示编号，如 `"005"`。
- `date`：首次讨论日期，格式 `YYYY-MM-DD`。
- `updatedDate`：本条记录最后一次内容更新日期；不填时使用 `date`。
- `category`：现有分类为 `恢复与放松`、`训练方法`、`动作技术`。
- `status`：现有状态为 `待补充`、`待反馈`、`有分歧`。
- `documented`：是否已经形成完整文档，决定 Documented 筛选和数量。
- `draft`：设为 `true` 时，不生成公开列表和详情页。
- `related`：相关记录的文件名，不带 `.md`；没有时写 `[]`。

页面目录从正文的二级标题 `##` 自动生成。列表的 excerpts 数量按正文三级标题 `###` 数量计算，建议每段讨论使用一个三级标题。

分类和状态的英文显示名仍在 `src/data/forum.ts` 的 `boardLabels` 中配置。新增分类时可以补充映射；没有映射的值会原样显示。

示例文件保留原有讨论内容及来源说明。编辑后请同步调整 `updatedDate`，避免把未经查证的讨论直接写成已验证结论。
