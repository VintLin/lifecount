"""Static reference-matched wax sculpture. Geometry, not image compositing or fluid simulation."""
import bpy,math,random,argparse,json
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parent
ap=argparse.ArgumentParser();ap.add_argument('--output',default='reference-terminal.png');ap.add_argument('--size',type=int,default=800);ap.add_argument('--progress',type=float,default=1);ap.add_argument('--asset',action='store_true');args=ap.parse_args()
p=max(0,min(1,args.progress))
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=96;s.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='METAL'
s.cycles.device='GPU';s.cycles.max_bounces=10;s.cycles.transmission_bounces=6
s.render.resolution_x=s.render.resolution_y=args.size;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.film_transparent=True
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
s.world=bpy.data.worlds.new('White studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(1,1,1,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.8

def wax_material(name,rough,trans,color):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;b=n.get('Principled BSDF')
 b.inputs['Base Color'].default_value=(*color,1);b.inputs['Roughness'].default_value=rough;b.inputs['IOR'].default_value=1.44;b.inputs['Transmission Weight'].default_value=trans;b.inputs['Subsurface Weight'].default_value=.15;b.inputs['Subsurface Radius'].default_value=(1,.6,.3);b.inputs['Subsurface Scale'].default_value=.07;b.inputs['Coat Weight'].default_value=.3;b.inputs['Coat Roughness'].default_value=.12
 noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=65;noise.inputs['Detail'].default_value=2;bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.07;bump.inputs['Distance'].default_value=.003;l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],b.inputs['Normal'])
 return m
solid=wax_material('Cooled ivory wax',.23,.32,(.76,.59,.33));setting=wax_material('Setting creamy wax',.17,.50,(.79,.61,.33));liquid=wax_material('Still wet translucent wax',.12,.60,(.83,.68,.40))

def mesh(name,verts,faces,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);me.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 return ob
def deposit_growth(ob,name):
 if not args.asset:return ob
 if name.startswith('Thin deposited base'):start=.04+int(name.split()[-1])*.044;duration=.24
 elif name=='Central puddle':start=0.;duration=.75
 elif name.startswith('Folded mound'):start=.18+int(name.split()[-1])*.054;duration=.28
 elif name.startswith('Rounded flow ridge'):start=.30+int(name.split()[-1])*.06;duration=.22
 else:start=.65;duration=.35
 growth=max(0,min(1,(p-start)/duration));growth=growth*growth*(3-2*growth)
 # Deposit position is stable; its footprint spreads, then freezes.
 cx=sum(v.co.x for v in ob.data.vertices)/len(ob.data.vertices);cy=sum(v.co.y for v in ob.data.vertices)/len(ob.data.vertices)
 scale=max(.001,growth**.5)
 for v in ob.data.vertices:
  v.co.x=cx+(v.co.x-cx)*scale;v.co.y=cy+(v.co.y-cy)*scale;v.co.z=min(v.co.z,0)+max(v.co.z,0)*growth
 return ob
# Closed uneven lobes: thicker than a heightfield, with rounded lips and occlusion.
def lobe(name,c,scale,angle,seed,mat):
 verts=[];faces=[];rings=28;segments=72
 for j in range(rings+1):
  phi=math.pi*j/rings
  for i in range(segments):
   t=i*2*math.pi/segments;r=math.sin(phi)*(1+.075*math.sin(3*t+seed)+.035*math.sin(7*t-seed))
   xx=scale[0]*r*math.cos(t);yy=scale[1]*r*math.sin(t)
   zz=scale[2]*math.cos(phi)*(1+.20*math.sin(3*t+seed)*math.sin(phi))+.025*math.sin(t*4+seed)*math.sin(phi)**2
   verts.append((c[0]+xx*math.cos(angle)-yy*math.sin(angle),c[1]+xx*math.sin(angle)+yy*math.cos(angle),max(.002,c[2]+zz)))
 for j in range(rings):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
 return deposit_growth(mesh(name,verts,faces,mat),name)
# Grounded foundation: flat underside below z=0, tapered top crossing the floor.
# The small buried thickness survives voxel fusion; no underside can curl upward.
def grounded_lobe(name,c,scale,angle,seed,mat):
 verts=[];faces=[];rings=32;segments=96
 for j in range(rings+1):
  r=j/rings
  for i in range(segments):
   t=i*2*math.pi/segments;edge=1+.075*math.sin(3*t+seed)+.035*math.sin(7*t-seed)
   xx=scale[0]*r*edge*math.cos(t);yy=scale[1]*r*edge*math.sin(t)
   top=-.016+2*scale[2]*(1-r*r)**1.25*(1+.08*math.sin(4*t+seed)*r*r)
   verts.append((c[0]+xx*math.cos(angle)-yy*math.sin(angle),c[1]+xx*math.sin(angle)+yy*math.cos(angle),top))
 for j in range(rings):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;faces.append((a,a+segments,b+segments,b))
 bottom=len(verts);verts.append((c[0],c[1],-.045))
 for i in range(segments):
  a=rings*segments+i;b=rings*segments+(i+1)%segments
  low=len(verts);verts.extend([(verts[a][0],verts[a][1],-.045),(verts[b][0],verts[b][1],-.045)])
  faces.extend([(a,low,low+1,b),(bottom,low+1,low)])
 return deposit_growth(mesh(name,verts,faces,mat),name)
rng=random.Random(185)
# Broad flat foundation, irregular overlapping front lobes.
for i in range(12):
 a=i*2*math.pi/12;rad=.94+rng.uniform(-.12,.12);sx=rng.uniform(.43,.61);sy=rng.uniform(.27,.43);h=rng.uniform(.025,.055)
 grounded_lobe('Thin deposited base %02d'%i,(math.cos(a)*rad,math.sin(a)*rad*.64,h),(sx,sy,h),a+rng.uniform(-.5,.5),i,solid if i%3 else setting)
grounded_lobe('Central puddle',(0,0,.055),(.96,.61,.055),0,18,liquid)
# Asymmetrical raised heaps; no repeated concentric terraces.
for i,(x,y,sx,sy,h,a) in enumerate([(-.68,-.27,.47,.28,.12,.3),(-.22,-.46,.39,.26,.15,-.7),(.36,-.40,.48,.24,.10,.3),(.82,-.13,.35,.24,.12,-.5),(-.92,.12,.31,.25,.13,.8),(-.43,.29,.36,.21,.17,-.5),(.34,.29,.42,.25,.16,.4),(.95,.20,.28,.20,.08,.8)]):
 lobe('Folded mound %02d'%i,(x,y,h*.65+.045),(sx*1.10,sy*1.05,h*.75),a,i+.8,setting if i%2 else solid)
# Free-standing curled wax walls, with an actual underside and overhang.
def fold(name,start,end,radius,base,rise,phase,mat):
 verts=[];faces=[];nu=100;nv=18
 for i in range(nu+1):
  u=i/nu;a=start+(end-start)*u;envelope=math.sin(math.pi*u)**.55
  for j in range(nv+1):
   v=j/nv
   rr=radius+.12*math.sin(3*a+phase)+.17*v+.12*math.sin(math.pi*v)*envelope
   z=base+rise*envelope*(.80+.20*math.sin(6*a+phase))*math.sin(v*math.pi*.92)+.075*math.sin(5*a+2*v+phase)*v*envelope
   verts.append((rr*math.cos(a)+.10*v,rr*.78*math.sin(a),z))
 for i in range(nu):
  for j in range(nv):a=i*(nv+1)+j;faces.append((a,a+nv+1,a+nv+2,a+1))
 ob=deposit_growth(mesh(name,verts,faces,mat),name);thick=ob.modifiers.new('Wax shell thickness','SOLIDIFY');thick.thickness=.027;thick.offset=0;bev=ob.modifiers.new('Soft rolled rim','BEVEL');bev.width=.012;bev.segments=3
fold('High curled right wall',-.1,1.65,.47,.11,.34,.7,setting)
fold('Collapsed left wall',1.9,3.7,.48,.10,.24,2.1,solid)
fold('Front folded lip',3.6,5.35,.37,.12,.18,1.5,setting)
# Raised viscous ridges, flattened into the mounds at either end.
for i in range(7):
 a=3.5+i*.32;r=.62+i*.045
 lobe('Rounded flow ridge %02d'%i,(r*math.cos(a),r*.64*math.sin(a),.10+rng.uniform(0,.04)),(.20,.065,.055),a+.5,i,liquid)
# Continuous shrinking body and attached drip paths, driven solely by life progress.
height=3.5*(1-p)**1.06
if args.asset and p<.999:
 import numpy as np
 from skimage.measure import marching_cubes
 ax=np.linspace(-.75,.75,100,dtype=np.float32);az=np.linspace(-.04,3.7,230,dtype=np.float32);X,Y,Z=np.meshgrid(ax,ax,az,indexing='ij');R=np.hypot(X,Y);A=np.arctan2(Y,X)
 rim=height+min(1,p*8)*(.04*np.sin(3*A)+.025*np.sin(7*A))
 top=rim-.15*(1-np.minimum(R/.49,1)**3)*min(1,p*10)
 da=R-(.49+.007*np.sin(A*7+Z*3));db=Z-top
 field=np.maximum(.5*(da+db+np.sqrt((da-db)**2+.035**2)),-.015-Z)
 for i in range(11):
  age=max(0,p-(.035+.50*((i*.618)%1)))
  if not age:continue
  a=i*2*math.pi/11;head=max(.025,height-age*(3.5+i%4));width=.025*min(1,age/.05)
  radius=width+.055*np.exp(-((Z-head-.025)/.08)**2)*min(1,age/.04)
  drip=np.maximum(np.sqrt((X-.49*math.cos(a))**2+(Y-.49*math.sin(a))**2+np.maximum(head-Z,0)**2)-radius,Z-height)
  k=.025;h=np.clip(.5+.5*(drip-field)/k,0,1);field=drip*(1-h)+field*h-k*h*(1-h)
 vs,fs,_,_=marching_cubes(field,0,spacing=(float(ax[1]-ax[0]),float(ax[1]-ax[0]),float(az[1]-az[0])));vs+=np.array([ax[0],ax[0],az[0]])
 mesh('Burning body',vs.tolist(),fs.tolist(),solid)
# Fuse touching pieces into continuous wax; retain the open shell cavities.
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in bpy.context.selected_objects:o.select_set(False)
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
# Apply shell thickness before joining and voxel fusion.
for o in objects:
 bpy.context.view_layer.objects.active=o
 for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();wax=bpy.context.object
rem= wax.modifiers.new('Fused contact regions','REMESH');rem.mode='VOXEL';rem.voxel_size=.014;rem.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=rem.name)
sm=wax.modifiers.new('Soften fused seams','SMOOTH');sm.factor=.75;sm.iterations=4
if args.asset:
 bpy.ops.object.modifier_apply(modifier=sm.name)
 # Fill low underside gaps created while deposits are still forming.
 for vertex in wax.data.vertices:
  if 0 < vertex.co.z < .09 and vertex.normal.z < -.15:vertex.co.z=-.012
 wax.data.update()
 ground_group=wax.vertex_groups.new(name='Ground transition')
 for v in wax.data.vertices:
  if v.co.z<.13:ground_group.add([v.index],max(0,min(1,(.13-v.co.z)/.13)),'REPLACE')
 blend=wax.modifiers.new('Round grounded contact','SMOOTH');blend.vertex_group=ground_group.name;blend.factor=.85;blend.iterations=5;bpy.ops.object.modifier_apply(modifier=blend.name)
 for v in wax.data.vertices:
  if v.co.z<.003:v.co.z=min(v.co.z,-.005)
 wax.data.update()
wickZ=max(.105,height-.10) if args.asset else .105
# Compact multi-fibre wick: full body, all outer fibres converge into one tip.
char=bpy.data.materials.new('Burnt wick');char.use_nodes=True;bs=char.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.012,.008,.005,1);bs.inputs['Roughness'].default_value=.9
for k in range(5):
 cu=bpy.data.curves.new('Bound wick fibre','CURVE');cu.dimensions='3D';cu.bevel_depth=.024 if k==0 else .009;cu.bevel_resolution=4;cu.use_fill_caps=True
 sp=cu.splines.new('POLY');sp.points.add(31)
 for i,point in enumerate(sp.points):
  t=i/31;u=max(0,min(1,(t-.45)/.55));gather=u*u*(3-2*u)
  orbit=0 if k==0 else .023*(1-gather);angle=(k-1)*math.pi/2+2*t
  point.co=(.009*math.sin(t*math.pi*.8)+orbit*math.cos(angle),.003*math.sin(t*math.pi)+orbit*math.sin(angle),wickZ+.16*t,1)
  point.radius=(1-.32*gather) if k==0 else (1-.8*gather)
 ob=bpy.data.objects.new('Bound charred wick fibre',cu);bpy.context.collection.objects.link(ob);cu.materials.append(char)
# Flame: tapered emissive mesh, transparent grazing edge, with gentle glow.
if p<1:
 flameScale=min(1,max(0,(1-p)/.10));fv=[];ff=[];rings=36;segments=40
 for j in range(rings):
  t=j/(rings-1);r=.085*(math.sin(math.pi*t)**.72)*(1-.6*t)*flameScale;z=wickZ+.13+.48*t*flameScale
  for i in range(segments):
   a=i*2*math.pi/segments;fv.append((r*math.cos(a)+.035*t*t*math.sin(p*25),r*.72*math.sin(a),z))
 for j in range(rings-1):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;ff.append((a,b,b+segments,a+segments))
 fm=bpy.data.meshes.new('Flame');fm.from_pydata(fv,[],ff);fo=bpy.data.objects.new('Flame',fm);bpy.context.collection.objects.link(fo)
 for poly in fm.polygons:poly.use_smooth=True
 fmat=bpy.data.materials.new('Warm flame');fmat.use_nodes=True;fn=fmat.node_tree.nodes;fn.clear();fl=fmat.node_tree.links;out=fn.new('ShaderNodeOutputMaterial');em=fn.new('ShaderNodeEmission');em.inputs['Color'].default_value=(1,.18,.015,1);em.inputs['Strength'].default_value=2.5;trans=fn.new('ShaderNodeBsdfTransparent');mix=fn.new('ShaderNodeMixShader');lw=fn.new('ShaderNodeLayerWeight');ramp=fn.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.15;ramp.color_ramp.elements[1].position=.8;color=fn.new('ShaderNodeValToRGB');color.color_ramp.elements[0].color=(1,.87,.52,1);color.color_ramp.elements[1].color=(1,.20,.015,1);fl.new(lw.outputs['Facing'],color.inputs[0]);fl.new(lw.outputs['Facing'],ramp.inputs[0]);opacity=fn.new('ShaderNodeMath');opacity.operation='MULTIPLY_ADD';opacity.inputs[1].default_value=.35;opacity.inputs[2].default_value=.65;fl.new(ramp.outputs['Color'],opacity.inputs[0]);fl.new(opacity.outputs[0],mix.inputs[0]);fl.new(em.outputs[0],mix.inputs[1]);fl.new(trans.outputs[0],mix.inputs[2]);fl.new(mix.outputs[0],out.inputs['Surface']);fo.data.materials.append(fmat)
 innerMesh=bpy.data.meshes.new('Flame inner core');innerMesh.from_pydata([(x*.48,y*.48,wickZ+.13+(z-wickZ-.13)*.82) for x,y,z in fv],[],ff)
 inner=bpy.data.objects.new('Flame white core',innerMesh);bpy.context.collection.objects.link(inner)
 for poly in innerMesh.polygons:poly.use_smooth=True
 innerMat=fmat.copy();innerMat.name='White hot flame';innerMat.node_tree.nodes.get('Emission').inputs['Color'].default_value=(1,.82,.46,1);innerMat.node_tree.nodes.get('Emission').inputs['Strength'].default_value=9;innerMat.node_tree.nodes.get('Math').inputs[1].default_value=1;innerMat.node_tree.nodes.get('Math').inputs[2].default_value=0;inner.data.materials.append(innerMat)
 light=bpy.data.lights.new('Flame warmth','POINT');light.energy=4*flameScale;light.color=(1,.42,.13);light.shadow_soft_size=.12;lo=bpy.data.objects.new('Flame warmth',light);bpy.context.collection.objects.link(lo);lo.location=(0,0,wickZ+.3)

# A faint static smoke wisp for the just-extinguished reference state.
smoke=bpy.data.materials.new('Faint residual smoke');smoke.use_nodes=True;ns=smoke.node_tree.nodes;ns.clear();out=ns.new('ShaderNodeOutputMaterial');vol=ns.new('ShaderNodeVolumePrincipled');vol.inputs['Density'].default_value=.26;vol.inputs['Color'].default_value=(.55,.52,.48,1);smoke.node_tree.links.new(vol.outputs['Volume'],out.inputs['Volume'])
cu=bpy.data.curves.new('Residual smoke path','CURVE');cu.dimensions='3D';cu.bevel_depth=.033;cu.bevel_resolution=4;cu.use_fill_caps=True;sp=cu.splines.new('POLY');sp.points.add(79)
for i,pt in enumerate(sp.points):
 t=i/79;pt.co=(.055*math.sin(t*13)+.13*t*math.sin(t*6),.02*math.sin(t*10),.35+1.45*t,1);pt.radius=(.25+1.5*math.sin(math.pi*t)**.7)
ob=bpy.data.objects.new('Residual smoke',cu);bpy.context.collection.objects.link(ob);cu.materials.append(smoke);ob.hide_render=args.asset
# White ground and rectangular reflections matching a product photograph.
floor=bpy.data.materials.new('White ground');floor.diffuse_color=(1,1,1,1)
bpy.ops.mesh.primitive_plane_add(size=200);bpy.context.object.data.materials.append(floor);bpy.context.object.is_shadow_catcher=True;bpy.context.object.hide_render=args.asset
for name,loc,power,size,sizey in [('Key',(-3,-4,6),400,3,4),('Side',(3,-1,4),260,2,3),('Back',(-1,3,5),350,3,2)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='RECTANGLE';d.size=size;d.size_y=sizey;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.2))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('Reference camera');ob=bpy.data.objects.new('Reference camera',cam);bpy.context.collection.objects.link(ob);target=Vector((0,0,1.22));ob.location=(0,-8,4.05);ob.rotation_euler=(target-ob.location).to_track_quat('-Z','Y').to_euler();cam.type='ORTHO';cam.ortho_scale=3.5;s.camera=ob
if args.asset:
 target=Vector((0,0,1.65-.43*p));ob.location=(0,-8,4.48-.43*p);ob.rotation_euler=(target-ob.location).to_track_quat('-Z','Y').to_euler();cam.ortho_scale=4.55-1.05*p+.30*max(0,1-p/.08)**2
s.render.filepath=str(P/args.output)
if not args.asset:bpy.ops.wm.save_as_mainfile(filepath=str(P/'reference-terminal.blend'))
bpy.ops.render.render(write_still=True)
print(json.dumps({'output':s.render.filepath,'objects':len(bpy.data.objects),'method':'explicit 3D lobes and curved thick shells; no fluid solver'}),flush=True)
