# Cloudflare 帖子评论

前端沿用项目的 `@waline/client`；服务端单独使用 Workers + D1，不要求访客登录。Board 每篇帖子都有独立评论区，Blog 则遵循文章原有的 `comment` 开关。

## 服务端来源

Waline 官方 Node.js 后端不能直接部署到 Workers。本次选用社区的 [Waline on Worker](https://github.com/lsy-404/Waline_On_Worker)，本地位于网站同级的 `../waline-on-worker/`，上游版本固定为 `0bc5d65f372869dc287aae073b50cfc0cf45a1f5`。保留其源码与许可证，后续升级单独检查兼容性。

该实现支持匿名评论、回复、管理后台和 D1 存储；当前没有邮件通知功能，所以页面不会承诺邮件回复提醒。不要将它与 Waline 官方后端混为一谈。

## 本地预览

服务端在 `../waline-on-worker/` 中运行：

```powershell
pnpm install --frozen-lockfile
pnpm exec wrangler d1 execute island-comments-local --config wrangler.local.toml --local --file schema.sql
pnpm exec wrangler dev --config wrangler.local.toml
```

本地使用独立的 D1 模拟数据库，保存在 `.wrangler/state/`；`.dev.vars` 中的 `JWT_SECRET` 只用于本地登录，不提交到 Git。网站目录中运行：

```powershell
$env:PUBLIC_WALINE_SERVER_URL = 'http://127.0.0.1:8787'
npm run dev -- --host 127.0.0.1
```

访问 `/board/foam-roller#board-comments-title` 即可看到评论区。

## 正式部署

1. 通过 Wrangler 登录自己的 Cloudflare 账户。
2. 在服务端目录创建专用 D1 数据库，将名称和真实 ID 填入 `wrangler.toml`（参考 `wrangler.toml.example`）；不要将本地全零数据库 ID 用于正式部署。
3. 使用 `wrangler d1 execute <数据库名> --remote --file schema.sql` 初始化新库。
4. 通过 `wrangler secret put JWT_SECRET` 设置随机签名密钥。密钥和数据库凭据不能放进网站的 `PUBLIC_` 变量。
5. 在服务端配置 `SITE_NAME`、`SITE_URL` 和 `SECURE_DOMAINS`。其中 CORS 配置应使用完整来源，例如 `https://jerrymain.top`，并加入评论服务自己的完整来源。
6. 运行 `wrangler deploy`，获取 Worker 的 HTTPS 地址。
7. 由站长访问服务端 `/ui/register`，完成第一个管理员账户的注册。
8. 在网站的 Cloudflare **构建环境变量** 中设置 `PUBLIC_WALINE_SERVER_URL` 为该 HTTPS 地址，重新构建网站。

没有评论服务地址时，网站不会显示失效表单或连接主题演示服务器。网站源代码不需要保存评论内容，评论数据持久保存在专用 D1 数据库中；本地测试数据不会自动上传。

参考：[Waline 官方部署范围](https://github.com/orgs/walinejs/discussions/3220)、[Workers + D1 实现说明](https://github.com/lsy-404/Waline_On_Worker/blob/main/docs/README.md)。
