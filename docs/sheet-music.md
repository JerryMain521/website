# 发布 PDF 乐谱

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
- 站内阅读器使用 PDF.js，支持上一页、下一页、适合宽度和放大阅读，并随屏幕宽度重新排版。仅在乐谱页加载 PDF 引擎，worker 随网站部署，不依赖第三方 CDN。
- 阅读器展示页面图像；需要搜索、选择文本或使用原始 PDF 的辅助功能时，可在新窗口打开或下载原文件。预览加载失败时仍可使用这两个入口。
- 下载使用同源文件链接和 `download` 属性，文件名沿用原文件名；最终保存行为由浏览器决定。

## 本地测试

运行 `npm run dev -- --port 4322`，访问 `/blog/music/score-pdf-demo`。

测试文章位于 `src/content/blog/music/score-pdf-demo.md`，PDF 位于 `public/scores/score-pdf-demo.pdf`。
示例文章设为 `draft: true`，仅开发模式显示，不生成生产文章页面。`public/` 中的静态 PDF 会随构建复制。

检查两页预览、下载、新窗口打开以及手机窄屏排版。正式发布时，新建真实乐谱文章并填写相应 PDF 路径即可。
