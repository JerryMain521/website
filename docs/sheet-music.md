# 发布 PDF 乐谱

## 使用上位机

在博客管理器中打开或新建 Blog 文章，在右侧「文章设置 → 乐谱 PDF」选择文件，填写标题和简介后保存。
管理器自动将 PDF 放入网站静态资源目录，并填写文章的 `pdf` 字段。支持查看、替换 PDF 和移除关联；替换或移除时保留原文件。
「网站预览」可以直接打开已保存的乐谱草稿，线上发布仍使用「发布到 GitHub」，PDF 与文章一起提交。

## 手动添加

每份乐谱是一篇普通博客。将文件放入 `public/scores/`，再在文章 frontmatter 中填写 `pdf`。

```yaml
---
title: '你的乐谱名称'
description: '乐器、编配或演奏说明。'
publishDate: '2026-10-25'
tags:
  - Music
  - 乐谱
pdf: /scores/your-score.pdf
draft: false
comment: true
---
可选的简短介绍。
```

- `/scores/your-score.pdf` 对应 `public/scores/your-score.pdf`，只接受本站以 `/` 开头、以 `.pdf` 结尾的文件路径。建议使用英文短文件名。
- 正文说明之后会自动出现预览、下载按钮和新窗口打开入口，无需手写 iframe。
- 未填写 `pdf` 的博客保持原有展示。
- 站内阅读器使用 PDF.js，支持上一页、下一页，并随屏幕宽度自动调整页面尺寸。仅在乐谱页加载 PDF 引擎，worker 随网站部署，不依赖第三方 CDN。
- 阅读区域按当前 PDF 页面的实际宽高比例完整展开，不限制为屏幕高度，也没有内部上下滚动；使用上一页、下一页切换页面。
- 阅读器展示页面图像；需要搜索、选择文本或使用原始 PDF 的辅助功能时，可在新窗口打开或下载原文件。预览加载失败时仍可使用这两个入口。
- 下载使用同源文件链接和 `download` 属性，文件名沿用原文件名；最终保存行为由浏览器决定。

## 本地测试

运行 `npm run dev -- --port 4322`，访问 `/blog/music/score-pdf-demo`。

测试文章位于 `src/content/blog/music/score-pdf-demo.md`，PDF 位于 `public/scores/score-pdf-demo.pdf`。
示例文章设为 `draft: true`，仅开发模式显示，不生成生产文章页面。`public/` 中的静态 PDF 会随构建复制。

检查两页预览、下载、新窗口打开以及手机窄屏排版。正式发布时，新建真实乐谱文章并填写相应 PDF 路径即可。
