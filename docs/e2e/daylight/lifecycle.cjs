const fs=require('fs');
(async()=>{const port=fs.readFileSync((process.env.SKY_CDP_PROFILE || '/tmp/lifecount-daylight-cdp')+'/DevToolsActivePort','utf8').split('\n')[0];const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else if(m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m)};
const call=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const ev=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});


const results=[];
const check=async(name,expr)=>{const r=await ev(expr);results.push({name,value:r.result?.value,error:r.exceptionDetails});if(r.result?.value!==true)throw Error(name+JSON.stringify(r));};
await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('lifecount-settings-v1',JSON.stringify({birthday:'1995-01-01',displayAge:85,countryId:'cn',presetId:'cn-undergraduate-work',locale:'en',unit:'week',visualMode:'daylight'}));window.testProgress=.5;Date.now=()=>Date.parse('1995-01-01T00:00:00Z')+(Date.parse('2080-01-01T00:00:00Z')-Date.parse('1995-01-01T00:00:00Z'))*window.testProgress;`});
await call('Page.navigate',{url:'http://localhost:4321/lifecount/?lang=en'});await wait(5000);
const shot=async()=>(await call('Page.captureScreenshot')).result.data;
let a=await shot();await wait(1500);let b=await shot();results.push({name:'reduced motion static',value:a===b});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await wait(500);a=await shot();await wait(1800);b=await shot();results.push({name:'cloud animation changes image',value:a!==b});
await ev('document.querySelector("[data-lifecount-settings]").click()');await wait(500);a=await shot();await wait(1500);b=await shot();results.push({name:'settings pause static',value:a===b});
await ev('document.querySelector("[data-lifecount-settings-cancel]").click();window.testProgress=1');await wait(1600);a=await shot();await wait(1500);b=await shot();results.push({name:'end static',value:a===b});
await check('English seconds','document.querySelector("[data-lifecount-visual-summary]").textContent.includes("seconds")');
await call('Page.addScriptToEvaluateOnNewDocument',{source:'const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes("webgl")?null:original.call(this,type,...args)}'});
await call('Page.reload');await wait(5000);
await check('WebGL unavailable fallback','document.querySelector("[data-lifecount-visual-stage]").dataset.skyRenderer==="fallback"');
await check('fallback menu usable','(()=>{document.querySelector("[data-lifecount-visual-trigger]").click();return !document.querySelector("[data-lifecount-visual-menu]").hidden})()');
fs.writeFileSync('docs/e2e/daylight/lifecycle-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
