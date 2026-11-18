# 天光验收 · 2026-11-18

实际页面：localhost:4321/lifecount/。独立 Chrome headless / SwiftShader，未操作用户浏览器、未修改用户缓存。

- initial-results.json：1440×900 清晨/正午/日落/夜晚均满视口，无横向溢出，无运行异常。
- interaction-results.json：14 项通过。设置最高年龄联动、名人网格隔离、Me 恢复、沙漏/蜡烛切换、单一 canvas、390×844、设置边界、Escape 滚动恢复、缓存写入。
- lifecycle-results.json：7 项通过。截图逐字节比较验证减少动态效果/设置打开/100% 静止，正常云动画产生画面差异；英文秒数与 WebGL 失败回退可用。唯一 console error 来自刻意禁用 WebGL 的场景，非正常流程错误。
- npm run check：18 files，0 errors / warnings / hints。
- npm run build：成功。Three.js 按需包超过 500KB，有体积警告。
- gallery.html：四个时段实际截图切换；mobile.png：窄屏实拍。

## 重复执行

从项目根目录运行，保持现有开发服务可访问。使用专门的临时 Chrome profile，下面脚本会写入测试缓存和模拟日期，不能连接个人浏览器。

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --no-first-run --use-angle=swiftshader --enable-unsafe-swiftshader --remote-debugging-port=0 --user-data-dir=/tmp/lifecount-daylight-cdp about:blank
```

另一终端顺序执行（先截图，再交互，最后故障注入）：

```sh
node docs/e2e/daylight/capture.cjs
node docs/e2e/daylight/interactions.cjs
node docs/e2e/daylight/lifecycle.cjs
```

可设置 SKY_CDP_PROFILE 指向另一个专用临时 profile。完成后关闭该独立 Chrome 进程。

画面使用程序大气散射与程序云，并非真实天气、摄影视频或地点天文模拟。此次未部署、未 commit/push。
