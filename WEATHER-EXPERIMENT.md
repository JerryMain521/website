# 天气背景实验

本地预览：`npm run dev -- --port 4322`，打开 http://localhost:4322/。

头像下方展开“天气实验室”，可以选择当地天气、原版背景和八种模拟场景。模拟场景不显示虚构温度。默认查询南京；支持手动查询城市、点击后申请定位、关闭动画。天气来源为 Open-Meteo；浏览器缓存 20 分钟，失败时保留原版背景。页面的浅色／深色主题仍独立控制。

## Git 恢复点

- 原版分支：`main`
- 原版提交：`62fc8a3`
- 额外备份分支：`backup/home-before-weather-20261020`
- 实验分支：`experiment/weather-background`

实验已经提交且工作区没有待保存修改时，运行 `git switch main` 即可回到原版。重新体验实验用 `git switch experiment/weather-background`。如工作区有后续修改，应先保存再切换，不使用强制覆盖或删除。

选择“原版蓝色渐变”只还原背景，实验控件仍会保留；切回 `main` 才是完整原版。此实验没有推送或发布。
