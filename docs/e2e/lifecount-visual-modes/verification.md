# 正式沙漏接入验收

2026-11-17；独立 Chromium 会话 `hourglass-integration`；当前项目已有开发服务 `http://localhost:4321/lifecount/`。未部署、未 commit/push。

## 可重复步骤与观察

1. 打开视图菜单：仅网格、沙漏两个选项，选中标记在右侧。选沙漏，网格隐藏。
2. 初始 1995-01-01 / 85：沙量进度约 37.5%，与秒数快照对应。最高年龄控件改为 100，进度约 31.9%。
3. 生日设置为 2000-01-01，进度约 26.9%。日期控件自动化的直接 fill 清空了分段字段，因此生日这项通过设置原生 input.value 并派发 input 事件验证，最高年龄使用可见控件输入验证。缓存正确保存两者；刷新后恢复生日、最高年龄和 hourglass 模式。
4. 中文 → English：菜单、秒数摘要和全屏按钮显示英文，沙量不变。
5. 切换 Biography：网格显示、沙漏隐藏、视图入口禁用。回 Me：恢复用户生日和沙漏。
6. 原生全屏实测为 true，画布区域宽 1280；Escape 退出。原生请求被拒绝时另有窗口内全屏退路。
7. 390×844：document.scrollWidth=390，无横向溢出，沙量不因 resize 重置。见 hourglass-mobile.png；桌面见 hourglass-desktop.png。
8. reduced-motion emulation：间隔 1.2 秒的 canvas 数据完全相同。恢复后可继续感知沙流。
9. 后台分支：临时覆写 document.hidden=true 并派发 visibilitychange，间隔 1.2 秒 canvas 相同；删除覆写并派发事件后重新读取真实时间。此项是事件模拟，不是移动设备后台实测。
10. 动画持续运行时 sandElapsed 前后均为 5201，秒数摘要按实际时间更新；无原型加速扣减。
11. 模拟时钟到 2101-01-01：progress=1，sandElapsed=sandTotal=19351。等待沉降结束后，连续 1.5 秒 canvas 完全相同。模拟到出生日前：progress=0、sandElapsed=0。恢复时钟后返回实际比例。时钟覆写仅在隔离浏览器中。
12. 将隔离缓存 visualMode 改为 candle，刷新后显示网格；从菜单重新选沙漏可用。网格/沙漏往返切换验证通过。

## 实现与清理

- 源码唯一模式列表：src/data/lifecount.ts。
- 控制器：src/scripts/lifecount-visual.ts；渲染器：src/scripts/visuals/hourglass.ts。
- 图片：public/images/hourglass-glass.png；来源：docs/lifecount-visual-modes-research-2026-11.md；声明：public/licenses/aether-sand.txt。
- 删除 docs/prototypes/aether-hourglass、github-research-output/lifecount-visual-modes 及旧视觉验收目录内容，新增本记录与最终截图。
- 未触及其他项目数据、研究资料、外部 /tmp 备份或用户附件。

`npm run check`：0 errors / warnings / hints。`npm run build`：通过。生产代码无独立原型入口、Base64 图片副本、window.hourglass 调试入口或 candle/daylight 实现。像素合成与感知沙流是二维近似，不能视为光学或逐秒物理模拟。

## 顶部摘要与秒单位修正

- 从 month 网格进入沙漏：顶部年龄和格数摘要隐藏，仅有一份秒数摘要；沙漏容器下方没有重复节点。顶部 aria-live=off。
- 单位显示“秒”，原生 select 与可见 trigger 都 disabled；尝试 trigger.click() 后菜单仍隐藏。URL 与缓存仍为 month。
- 切换 English：按钮显示 Seconds；390px viewport 无横向溢出。截图 summary-zh.png、summary-en-mobile.png 是当前布局，之前 hourglass-* 为接入阶段记录。
- 返回 grid：恢复 Month、年龄与月份摘要，单位控件重新启用，缓存仍为 month，顶部 aria-live 恢复 polite。
- npm run check / npm run build 通过。

## 沙面抗锯齿优化验收

2026-11-17；当前本地 Astro 服务和 ego-browser 浏览器会话实测。实现位于 `src/scripts/visuals/hourglass.ts`。未发布至线上。

可重复执行：在项目根目录运行 `ego-browser nodejs < docs/e2e/hourglass-antialias/verify.mjs`。脚本实际切换页面视图，并在同一浏览器中调用正式渲染器及正式玻璃素材，固定进度检查渲染边界。结果和 PNG 保存到 `docs/e2e/hourglass-antialias/`，退出码非零表示验收失败。

- 固定 35%、600×1172 CSS 像素、DPR 2：`before-pile.png` / `current-pile.png` 对照确认上腔浅凹、下腔坡面及细颗粒保留，明显方格台阶减弱。
- 下腔中央 100 个模拟像素宽度内，采样 480 列的暗色轮廓高度；相对 11 点局部均值的平均绝对偏差由约 0.380 降至 0.124 CSS 像素，降低约 67%。这仅是该固定画面的局部边缘指标，不代表所有画面或性能的提升比例。原始高度数组在 `before.json` / `current.json`。
- 0%、0.01%、1%、35%、99%、99.99%、100% 共七个固定进度的数量分配正确，并保存各自渲染图片。人工查看极少量沙粒和 100% 画面，未见沙体越过玻璃边界；两粒散沙仍可见。
- 沙流在独立动画帧间改变画面，颗粒数量保持一致；暂停后及重复绘制时 PNG 字节完全相同。macOS 遮挡窗口可能推迟动画帧，因此对比前通过截图触发合成帧，避免把没有执行的帧当作动画故障。
- 390×844 手机视口没有横向溢出；原生全屏成功；两次尺寸变化前后 `sandElapsed` 一致。截图分别为 `current-mobile.png` / `current-fullscreen.png`。
- 减少动态效果下两次截图之间画布一致；网格／沙漏往返切换通过。
- `npm run check`：0 errors / warnings / hints；`npm run build`：通过。

手机项为浏览器尺寸模拟，不是实体手机验收。固定进度实例只存在于验收脚本的页面内，结束时销毁，生产代码未增加调试入口。

## 沙漏顶部留白

2026-11-17；用户确认桌面额外 24px、手机 16px、全屏 32px 后调整。仅修改容器留白及全屏可用画布高度。

- 同一验收脚本修改前因留白断言失败，修改后通过；桌面普通视图顶部 padding 为 24px，390px 手机视图为 16px。
- 1280×900 原生全屏的顶部 padding 为 48px（原有 16px 加 32px）；画布高 756px，底部在容器内。全屏画面顶部较之前下移 32px，底部保持完整。
- 568×320 横屏原生全屏补充检查通过；顶部 padding 仍为 48px，画布完整位于视口内。结果见 `docs/e2e/hourglass-antialias/spacing-short.json`，截图为 `current-short-fullscreen.png`。复现方式：浏览器设为 568×320 后进入全屏，检查画布上下边界均在视口内。
- 修改前截图为 `spacing-before-page.png`、`spacing-before-mobile.png`、`spacing-before-fullscreen.png`；修改后为同目录 `current-page.png`、`current-mobile.png`、`current-fullscreen.png`。
- 原有沙面、暂停、沙量、减少动态效果和视图切换验收保持通过。`npm run check` 无错误、警告及提示，`npm run build` 通过。仅本地变更。

## 杯壁曲线与贴边优化

2026-11-17；用户确认后修改 `src/scripts/visuals/hourglass.ts`，未发布。

复现：开发服务运行时，在项目根目录执行 `ego-browser nodejs < docs/e2e/hourglass-wall/verify.mjs`，再执行原有 `ego-browser nodejs < docs/e2e/hourglass-antialias/verify.mjs`。两者使用同一浏览器任务空间；结果与截图分别位于 `docs/e2e/hourglass-wall/` 和 `docs/e2e/hourglass-antialias/`。

- 修改前新验收确实失败：截取正式渲染器传给 Canvas 的杯壁裁切路径，按 8 倍分辨率栅格化，检查 16 个原节点前后各 2 个模拟单位的局部斜率差；最大值 0.5625，超过 0.25 阈值。修改后最大值 0.125，通过。该指标检查实际裁切轮廓的局部折角，不是性能或全图观感评分。原始样本在 `hourglass-wall/before.json` / `current.json`。
- 放大图 `before-shoulder.png` / `current-shoulder.png`、`before-neck.png` / `current-neck.png`、`before-floor.png` / `current-floor.png` 保存实际合成画面的肩部、收腰和底部。额外最近邻放大用于观察原像素，没有对证据图片再加平滑。
- 0%、0.01%、1%、35%、75%、99%、100% 七种固定进度均保存完整画面，数量符合 `round(progress * total)`。人工查看 1%、35%、100% 的杯壁与底部，以及收腰、杯底放大图，未见明显穿壁或竖直缺口；几何贴合仍为摄影素材上的二维近似。
- 内壁与底部可用区域改变后，模拟粒子总预算由 19351 变为 19703；粒子不是秒数。人生进度依旧由原生日和最高年龄计算。新总预算下暂停、流动及尺寸变化时粒子数量保持稳定。
- 原有验收通过：静止重复绘制和暂停画布一致，沙流帧改变而数量稳定；减少动态效果、网格切换、390px 手机宽度及原生全屏通过，顶部留白不变，底部完整。
- `npm run check`：0 errors / warnings / hints；`npm run build`：通过。脚本中的裁切路径截取在结束时恢复原方法，生产代码无调试入口。

## 上腔左侧贴边补正

2026-11-17；用户指出左侧仍有亮缝后，读取当前共享预览，按同一约 36% 进度复现并保存左右局部图 `hourglass-wall/observed-upper-pair.png`，同时把真实裁切路径叠加到玻璃素材上，保存 `observed-wall-overlay.png`。

- 读取实际杯壁和沙体裁切掩模，在 y=105、110、115、125、145、170、200 的左右边界完全重合，证明该亮缝来自几何与素材的对齐偏差。原始结果为 `upper-contact-observed.json`。
- 原实现用右壁镜像生成左壁，而摄影素材上腔左侧轮廓并非镜像。补正左侧采样位置，独立生成左壁曲线，并让模拟和显示共同使用校准后的左右边界。
- 原有 `hourglass-wall/verify.mjs` 新增摄影素材对齐断言，在 y=105、125、145、170 附近寻找素材壁沿的暗线，检查裁切边界位于暗线内侧 0.25–2.5 个模拟单位。修改前距离为 4.125、4.5、5.75、3.625，失败；修改后为 0.875、1、2、0.625，通过。这是指定素材、固定采样位置的回归检查，不是通用玻璃内壁识别。
- 修改前证据为 `left-contact-before.json` / `left-contact-before.png`；修改后为 `current.json` / `current-0.35.png` 及 `current-shoulder.png`。放大查看确认上腔左侧亮缝收窄，保留玻璃壁沿，未见新折角。
- 总预算仍为 19703；多进度沙量分配、静止、动画、暂停、减少动态效果、手机和全屏验收通过。`npm run check` 无错误、警告及提示，`npm run build` 通过。仅本地更新。

## 下腔圆滑杯底

2026-11-17；用户确认继续优化下方后，将下腔最宽处至内底面的原分段侧壁／浅封底，改为一整段三次 Bezier。入口保持垂直切线，底面中心水平相接；承托面从 y=474 调整到 y=462，露出底座玻璃。

- 同一 `hourglass-wall/verify.mjs` 新增实际裁切掩模的杯底采样，要求中心底面落在 y=458–464，左右距中心约 35.5 单位的位置均至少高于中心 1 单位，以同时检查底座留白和杯底曲率。修改前中心 y=473.875、两侧 y=473，断言失败；修改后中心 y=461.875、两侧 y=460.125，通过。
- 杯肚与收腰的连续性、上腔左壁素材对齐断言保持通过。底面强曲率区域用横向底面采样检查，侧壁斜率检查保留到 y=430，不再将已移除的 y=455 节点视为连接点。
- 修改前截图与数据为 `hourglass-wall/lower-before-*`，修改后为 `current-*`。人工检查 1%、35%、100% 的完整画面和 `current-floor.png`，底部收口圆滑，玻璃底座可见，未见明显穿壁、竖切口或杯底硬折角。内底面仍是对摄影素材的二维拟合，不是光学内腔测量。
- 可用容量变化后总预算为 18722；各固定进度仍满足 `round(progress * total)`。原有 `hourglass-antialias/verify.mjs` 通过：真实进度分配、动画数量稳定、暂停、减少动态效果、视图切换、390px 手机布局及原生全屏。此前确认的顶部留白保持通过。
- `npm run check`：0 errors / warnings / hints；`npm run build`：通过。仅本地更新，未部署。
