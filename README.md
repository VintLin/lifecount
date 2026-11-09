# LifeCount

一个只读的人生时间可视化工具，支持日、周、月、年四种视图、中英文界面和人生阶段预设。

## Development

```bash
npm install
npm run dev
```

本地地址为 `http://localhost:4321/lifecount/`。

## Build

```bash
npm run check
npm run build
```

生产站点固定发布在 `https://vintlin.com/lifecount/`。项目使用 GitHub Pages 项目站点，并继承 `VintLin/vintlin.github.io` 用户站点的 `vintlin.com` 自定义域名。

## Deploy

```bash
npm run deploy:pages
```

该命令会检查并构建站点，然后把 `dist/` 发布到 `gh-pages` 分支。GitHub Pages 从该分支根目录提供静态文件。

## Behavior

- 默认出生日期为 `2000-01-01`，最高年龄为 80。
- 设置和语言切换只影响当前页面会话，刷新后恢复默认值。
- 顶部提供 GitHub 入口和明暗主题切换；主题偏好会在浏览器中保留。
- 页面不读取或写入 TodoFlow 数据。
