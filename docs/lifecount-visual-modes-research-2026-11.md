# LifeCount 人生视觉模式调研纪要

日期：2026-11-16

## 调研范围

通过 ChatGPT 调研在 LifeCount header 设置按钮左侧增加“人生视图”入口的可行方案。入口打开弹窗，允许用户在现有方块网格、沙漏、蜡烛、天光之间切换。当前仅记录研究结论，不修改产品实现。

## 推荐产品结构

```text
Header
├── 人生视图按钮
│   └── 弹窗
│       ├── 方块网格
│       ├── 沙漏
│       ├── 蜡烛
│       └── 天光
└── 设置按钮

Me 设置
出生日期 + 最高年龄
        ↓
统一 TimeSnapshot
        ↓
网格 / 沙漏 / 蜡烛 / 天光
```

现有方块网格继续作为精确信息视图，新的视觉模式读取同一套 Me 数据，不能各自重复计算生日、最高年龄和人生进度。

## 三种模式

### 沙漏

- 使用出生日期到最高年龄终点的时间区间。
- 已过去秒数、剩余秒数和人生进度必须真实计算。
- 不能为每一秒创建一颗真实渲染粒子；几十年对应数十亿秒，实际应使用固定数量的可见粒子进行采样。
- 推荐 Canvas 2D 绘制动态沙粒，SVG 绘制玻璃轮廓，DOM 展示数字和控制项。
- 初始性能预算可从 300–800 个动态粒子、30 FPS 开始，需用真实设备验证。

### 蜡烛

- 已燃烧部分表示已经过去的寿命，剩余烛身表示未来寿命。
- 蜡流属于艺术化的视觉表现，不应假设所有消耗的蜡都实际凝固到两侧。
- 推荐 SVG + CSS，以参数化路径表示烛身、火焰和左右蜡流。
- 首版使用有限的预设蜡流形状；后续如需要，再加入基于固定 seed 的确定性生成。
- 火焰可用 CSS 动画，蜡烛几何根据人生进度按需更新。

### 天光

- 天光表示当前本地一天，不直接表示人生进度。
- 首版采用本地时钟映射，不请求定位权限：凌晨、清晨、上午、正午、下午、傍晚、暮色、夜间等关键帧之间平滑插值。
- 推荐 CSS 渐变 + SVG 太阳/月亮、星光和地平线图层。
- 后续需要真实日照时再评估 SunCalc、城市坐标或用户授权的经纬度。
- 没有定位时不能偷偷通过 IP 推断精确位置，应回退到固定时钟模型。

## 技术选型

| 技术 | 当前建议 | 原因 |
| --- | --- | --- |
| 原生 Canvas 2D | 首选 | 无新增依赖，适合沙漏粒子 |
| SVG + CSS | 首选 | 适合蜡烛路径、火焰和天光图层 |
| PixiJS | 后续备选 | 只有 Canvas 实测无法满足粒子性能时再引入 |
| three.js | 暂不使用 | 当前需求没有真实 3D 透视、折射和光照的必要 |
| Lottie | 不作为主渲染器 | 适合预制动画，不适合实时人生数据驱动 |
| SunCalc | 后续按需引入 | 用于真实日出、日落和太阳位置 |

MVP 建议零新增运行时依赖。三种模式不必使用同一种渲染技术，只需要统一输入数据和组件生命周期接口。

## 统一时间模型

```text
出生日期 → 最高年龄终点
          ↓
已过去秒数 / 总秒数 / 剩余秒数 / 人生进度
          ↓
沙漏、蜡烛、方块网格共用
```

建议集中维护 `TimeSnapshot`：

- `totalSeconds`
- `elapsedSeconds`
- `remainingSeconds`
- `progress`

日期只包含年月日时，应明确按当地 00:00 作为时间轴起点；跨闰年、夏令时和时区的规则必须集中封装，避免各视图出现不同结果。

## 动画和生命周期

- 数字和时间状态约 1Hz 更新。
- 沙漏粒子约 30 FPS，使用 `requestAnimationFrame`。
- 蜡烛火焰约 15–30 FPS，优先使用 CSS。
- 天光每 10–60 秒更新即可，常态不需要持续高频绘制。
- 弹窗关闭后停止所有高频动画。
- 页面切后台时停止装饰动画，回到前台直接重新计算当前时间，不补播离开期间的动画。
- 支持 `prefers-reduced-motion`：沙漏停止粒子、蜡烛停止火焰摆动、天光保留静态颜色。
- Canvas DPR 建议默认上限为 2。

## 推荐开发顺序

1. 统一现有 Me 设置和时间计算。
2. 增加 header 人生视图按钮及弹窗框架。
3. 先实现天光，验证模式切换、响应式和生命周期。
4. 实现蜡烛。
5. 实现沙漏和粒子性能控制。
6. 用真实设备测量后，再决定是否需要 PixiJS。

## 参考资料

- [Astro Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- [Canvas 性能优化](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [PixiJS ParticleContainer](https://pixijs.com/8.x/guides/components/scene-objects/particle-container)
- [PixiJS 性能建议](https://pixijs.com/8.x/guides/production/performance-tips/)
- [three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [SunCalc](https://github.com/mourner/suncalc)
- [HTML Dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)

## 当前边界

本纪要只记录产品和技术调研，不代表已经检查当前源码、依赖版本、Me 数据结构或浏览器性能。下一阶段需要单独调研可复用的 GitHub 仓库，并核对许可证、实际源码和集成成本。
