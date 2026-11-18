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
- 设置中提供国家、模板、出生日期和最高年龄。退休阶段按所选预设规则生成。
- 未来方格保留所属阶段的颜色语义，并用偏灰的半透明颜色区分；现在方格使用更清晰的阶段色和描边。
- 预设名称和人生阶段名称均支持中文与英文；研究依据和来源见 [`docs/references/lifecount-presets.md`](docs/references/lifecount-presets.md)。
- 退休年龄是用于时间可视化的简化示意，不代表个人养老金资格或精确法定退休结论；假设和边界见 [`docs/references/lifecount-retirement.md`](docs/references/lifecount-retirement.md)。
- 设置、语言和人生视图保存在当前浏览器，刷新后恢复；URL 中的明确参数优先。
- 页面采用白色背景；顶部提供 GitHub、语言、时间单位、人生视图与设置入口。
- 页面不读取或写入 TodoFlow 数据。

## 沙漏视图

视图菜单可切换网格和沙漏。沙漏使用“我”的出生日期和最高年龄，显示真实秒数与人生进度；细沙流不推进真实寿命。支持全屏、后台暂停及减少动态效果。名人履历仍使用网格。实现与边界见 [视觉模式说明](docs/specs/lifecount-visual-modes.md)，素材与调研来源见 [保留纪要](docs/lifecount-visual-modes-research-2026-11.md)。
