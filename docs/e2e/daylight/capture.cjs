const fs=require('fs');
(async()=>{const port=fs.readFileSync((process.env.SKY_CDP_PROFILE || '/tmp/lifecount-daylight-cdp')+'/DevToolsActivePort','utf8').split('\n')[0];const tab=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}else if(m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m)};
const call=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const ev=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('lifecount-settings-v1',JSON.stringify({birthday:'1995-01-01',displayAge:85,countryId:'cn',presetId:'cn-undergraduate-work',locale:'zh-CN',unit:'week',visualMode:'daylight'}));window.testProgress=.29;Date.now=()=>Date.parse('1995-01-01T00:00:00Z')+(Date.parse('2080-01-01T00:00:00Z')-Date.parse('1995-01-01T00:00:00Z'))*window.testProgress;`});
await call('Page.navigate',{url:'http://localhost:4321/lifecount/?lang=zh-CN'});await wait(6000);
const states=[];for(const [name,p] of [['dawn',.27],['noon',.5],['sunset',.74],['night',.95]]){
 await ev('window.testProgress='+p);await wait(1800);
 states.push({name,...(await ev(`(()=>{const s=document.querySelector('[data-lifecount-visual-stage]'),c=s.querySelector('.lifecount-daylight-canvas');return {engine:s.dataset.skyRenderer,rect:s.getBoundingClientRect().toJSON(),progress:c?.dataset.progress,tone:document.querySelector('[data-lifecount]').dataset.skyTone,scrollWidth:document.documentElement.scrollWidth}})()`)).result?.value});
 const shot=await call('Page.captureScreenshot');fs.writeFileSync('docs/e2e/daylight/'+name+'.png',Buffer.from(shot.result.data,'base64'));
}
fs.writeFileSync('docs/e2e/daylight/initial-results.json',JSON.stringify({states,errors},null,2));console.log(JSON.stringify({states,errors}));ws.close();
})();
