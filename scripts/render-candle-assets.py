"""Rebuild the approved 3D candle lifecycle assets with the isolated bpy environment.
Run: /tmp/lifecount-candle-bpy/bin/python scripts/render-candle-assets.py
"""
import subprocess,sys,json,time
from PIL import Image
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/images/candle/v4';TMP=Path('/tmp/lifecount-candle-assets-v4');TMP.mkdir(exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
scene=ROOT/'docs/prototypes/candle-continuous-3d/reference-terminal.py';start=time.time()
def render(i):
 dest=OUT/f'{i:03d}.webp';png=TMP/f'{i:03d}.png'
 if not dest.exists():
  result=subprocess.run([sys.executable,str(scene),'--asset','--progress',str(i/100),'--size','1536','--output',str(png)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);(TMP/f'{i:03d}.log').write_text(result.stdout)
  if result.returncode:raise RuntimeError(f'Frame {i}, render exit {result.returncode}: '+result.stdout[-1800:])
  subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','color=white:s=1536x1536','-i',str(png),'-filter_complex','[0:v][1:v]overlay=shortest=1:format=auto','-frames:v','1',str(TMP/f'{i:03d}-white.png')],check=True)
  with Image.open(TMP/f'{i:03d}-white.png') as image:image.convert('RGB').save(dest,'WEBP',quality=95,method=6)
 return i
with ThreadPoolExecutor(max_workers=1) as pool:
 for i in pool.map(render,range(101)):print(i,'/100',round(time.time()-start),'s',flush=True)
(OUT/'manifest.json').write_text(json.dumps({'version':4,'frames':101,'size':1536,'progress':'index / 100','rendering':'Cycles geometry; continuous life progress, no thermal fluid simulation','groundShadow':False,'samples':96,'wick':'five bound fibres converging into one tip, height .16, flame root .13','terminal':'grounded approved wax sculpture, no flame','bytes':sum(p.stat().st_size for p in OUT.glob('*.webp'))},indent=2))
