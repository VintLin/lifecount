# LifeCount 视觉模式调研保留纪要

调研：2026-11-16；最终取舍：2026-11-17。这里保留来源与后续方向，当前实施以 `specs/lifecount-visual-modes.md` 为准。

没有找到同时满足沙漏、蜡烛、天光和 Astro 接入的成熟组件。初版 SVG/几何占位视觉被否决；经过独立原型验收，选用白底玻璃照片素材 + Canvas 2D 黑沙，零新增运行时依赖。真实人生秒数与感知沙流分开，不能一个真实秒对应一个屏幕粒子。

## 已采用

- [Aether Sand](https://github.com/isco-tec/aether-sand)：粒子网格与局部下落思路参考，自行实现渲染器；声明保留于 `public/licenses/aether-sand.txt`。
- 用户提供的白底玻璃沙漏实拍图作为视觉参考。内置图片生成工具生成空玻璃底稿，用户确认后接入；最终文件 `public/images/hourglass-glass.png`。提示要求：去除全部沙子、保留瓶身比例、白色摄影背景、真实玻璃颈部/底部反光，无端盖、文字或 UI。仅采用生成图片，不将用户附件复制进发布产物。
- [Hourglass_Fable5](https://github.com/khanmjk/Hourglass_Fable5)：时钟与视觉效果分离的架构参考，没有复制其 3D 实现。

## 保留为未来研究，未接入依赖

- [SunCalc](https://github.com/mourner/suncalc)：如未来需要地理位置相关的日照计算再评估。
- [gfx-flames](https://github.com/nlharri/gfx-flames)、[SmokeGL](https://github.com/LucaAngioloni/SmokeGL)：火焰效果候选，蜡烛需要单独完成视觉验收。
- [threex.daynight](https://github.com/jeromeetienne/threex.daynight)、[a-super-sky](https://github.com/kylebakerio/a-super-sky)：天空表现参考，不能据此宣称已实现真实天气/光照。
- [Dusty](https://github.com/blaisereyes/dusty)、[ChromaChrono/hourglass](https://github.com/ChromaChrono/hourglass)：早期粒子/结构候选，未采用其实现。
- PixelGlass 未发现明确许可证、daylight-clock 为 GPL-3.0，原调研不建议直接复制。

研究下载的仓库、原始搜索输出及被否决的本地实现已清理。后续重新采用第三方代码时需重新核实当前版本及许可证，以上不构成新的依赖授权。
