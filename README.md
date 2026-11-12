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

- 默认出生日期为 `1995-01-01`，最高年龄为 85。
- 内置中国、美国、法国、英国、俄罗斯、日本和印度的 21 条代表性人生阶段预设，支持按国家分组选择。
- 可在预设旁选择未指定、女或男；退休年龄随预设和性别变化，工作阶段会在退休日前一天结束，之后显示为退休阶段。
- 未来方格保留所属阶段的颜色语义，并用偏灰的半透明颜色区分；现在方格使用更清晰的阶段色和描边。
- 预设名称和人生阶段名称均支持中文与英文；研究依据和来源见 [`docs/references/lifecount-presets.md`](docs/references/lifecount-presets.md)。
- 退休年龄是用于时间可视化的简化示意，不代表个人养老金资格或精确法定退休结论；假设和边界见 [`docs/references/lifecount-retirement.md`](docs/references/lifecount-retirement.md)。
- 设置和语言切换只影响当前页面会话，刷新后恢复默认值。
- 顶部提供 GitHub 入口和明暗主题切换；主题偏好会在浏览器中保留。
- 页面不读取或写入 TodoFlow 数据。
