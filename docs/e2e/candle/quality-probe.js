(async () => {
 const {createCandle}=await import('/lifecount/src/scripts/visuals/candle.ts');
 const canvas=document.createElement('canvas');canvas.style.cssText='width:672px;height:557px;position:fixed;top:0;left:0;z-index:9999;background:white';document.body.append(canvas);
 const draws=[];const original=CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas===canvas||args[0] instanceof ImageBitmap)draws.push({target:this.canvas===canvas?'display':'buffer',sourceWidth:args[0].width,alpha:this.globalAlpha,destinationWidth:args.length===5?args[3]:null});return original.apply(this,args)};
 let renderer;try {
  await new Promise((resolve,reject)=>{renderer=createCandle(canvas,window.candleQualityBase||'/lifecount/images/candle/v4/',s=>{if(s==='ready')resolve();if(s==='error')reject(Error('Asset loading failed'))});renderer.update(.7652657703691,false);renderer.suspend(true)});
  const bmp=await createImageBitmap(await(await fetch((window.candleQualityBase||'/lifecount/images/candle/v4/')+'076.webp')).blob());
  const probe=document.createElement('canvas');probe.width=probe.height=bmp.width;const pc=probe.getContext('2d');pc.fillStyle='white';pc.fillRect(0,0,bmp.width,bmp.height);pc.drawImage(bmp,0,0);
  const pix=pc.getImageData(0,0,bmp.width,bmp.height).data;let edgeTint=0;
  for(let y=0;y<bmp.height;y++)for(let x=0;x<bmp.width;x++)if(x<4||y<4||x>=bmp.width-4||y>=bmp.height-4){const i=(y*bmp.width+x)*4;if(Math.min(pix[i],pix[i+1],pix[i+2])<250)edgeTint++;}
  const display=draws.filter(d=>d.target==='display').sort((a,b)=>b.destinationWidth-a.destinationWidth)[0], blended=draws.some(d=>d.target==='buffer'&&d.alpha>0&&d.alpha<1);
  const result={dpr:devicePixelRatio,canvasPixels:[canvas.width,canvas.height],sourcePixels:bmp.width,drawnPixels:display.destinationWidth,upscale:display.destinationWidth/display.sourceWidth,blended,edgeTint,pass:display.destinationWidth<=display.sourceWidth&&!blended&&edgeTint===0};
  bmp.close();window.candleQualityResult=result;return result;
 }finally{CanvasRenderingContext2D.prototype.drawImage=original;renderer?.destroy();canvas.remove();}
})()
