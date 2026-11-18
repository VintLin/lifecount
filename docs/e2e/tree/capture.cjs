const fs = require("fs");
(async () => {
  const port = fs
    .readFileSync(
      (process.env.SKY_CDP_PROFILE || "/tmp/lifecount-daylight-cdp") +
        "/DevToolsActivePort",
      "utf8",
    )
    .split("\n")[0];
  const tab = await (
    await fetch("http://127.0.0.1:" + port + "/json/new?about:blank", {
      method: "PUT",
    })
  ).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map(),
    errors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) {
      pending.get(m.id)?.(m);
      pending.delete(m.id);
    } else if (
      m.method === "Runtime.exceptionThrown" ||
      (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    )
      errors.push(m);
  };
  const call = (method, params = {}) =>
    new Promise((r) => {
      pending.set(++id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const ev = async (expression) =>
    (
      await call("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
    ).result;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const out = __dirname;
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `localStorage.setItem('lifecount-settings-v1',JSON.stringify({birthday:'2000-04-01',displayAge:80,countryId:'cn',presetId:'cn-undergraduate-work',locale:'zh-CN',unit:'week',visualMode:'grid'}));window.treeDate=Date.parse('2000-04-01T00:00:00');Date.now=()=>window.treeDate;`,
  });
  await call("Page.navigate", {
    url: "http://localhost:4321/lifecount/?lang=zh-CN",
  });
  await wait(2000);
  await ev(
    "document.querySelector('[data-lifecount-visual-trigger]').click();document.querySelector('[data-visual-mode=tree][role=option]').click()",
  );
  const canvas = "document.querySelector('.lifecount-tree-canvas')";
  const drawing = async () => (await ev(canvas + ".toDataURL()")).result.value;
  for (const [name, date] of Object.entries({
    seedling: "2000-04-01",
    spring: "2040-04-02",
    summer: "2040-07-02",
    fall: "2040-10-25",
    winter: "2040-12-24",
    dead: "2081-04-01",
    mobile: "2040-04-02",
  })) {
    if (name === "mobile")
      await call("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: false,
      });
    await ev(
      "window.treeDate=Date.parse('" +
        date +
        "T12:00:00');window.treeDate+=((210000-window.treeDate%210000)+52500)%210000",
    );
    await wait(1150);
    if (
      !(
        await ev(
          canvas +
            "?.clientWidth > 0 && document.documentElement.scrollWidth===innerWidth",
        )
      ).result.value
    )
      throw Error(name);
    const shot = await call("Page.captureScreenshot");
    fs.writeFileSync(
      out + "/" + name + ".png",
      Buffer.from(shot.result.data, "base64"),
    );
  }
  const still = await drawing();
  await wait(1100);
  if (still !== (await drawing())) throw Error("reduced motion moved");
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await wait(400);
  if (still === (await drawing())) throw Error("weather did not animate");
  for (let i = 0; i < 16; i++) {
    fs.writeFileSync(
      "/tmp/lc-tree-frame-" + String(i).padStart(2, "0") + ".png",
      Buffer.from((await drawing()).split(",")[1], "base64"),
    );
    await wait(120);
  }
  await ev(
    'document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))',
  );
  if ((await ev("!!" + canvas)).result.value || errors.length)
    throw Error(JSON.stringify(errors));
  ws.close();
})();
