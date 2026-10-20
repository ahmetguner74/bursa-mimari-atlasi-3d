import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {createBuilding} from './model.js';
const $=id=>document.getElementById(id);
try{await start();}catch(e){console.error(e);$('loading').textContent='3B görünüm açılamadı: '+e.message;}
async function start(){
 const res=await fetch('building-data.json');if(!res.ok)throw new Error('Geometri yüklenemedi');const D=await res.json();
 const host=$('stage'),scene=new T.Scene();scene.background=new T.Color('#e7e8dd');
 const camera=new T.OrthographicCamera(-25,25,22,-22,.1,800);camera.up.set(0,0,1);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 $('canvas').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','İş Bankası üç boyutlu modeli; döndürmek için sürükleyin');
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minZoom=.45;controls.maxZoom=4;controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI*.48;controls.enablePan=false;controls.autoRotateSpeed=.45;controls.target.set(0,-4,7);
 let dirty=true,comparison=false,context=false,golden=false,transition=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 controls.addEventListener('change',()=>dirty=true);controls.addEventListener('start',()=>{transition=null;});
 scene.add(new T.HemisphereLight('#f9f5e8','#a8b5a2',2.6));const sun=new T.DirectionalLight('#fff4dd',3.1);sun.position.set(22,28,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;sun.shadow.camera.near=1;sun.shadow.camera.far=150;sun.shadow.radius=3;sun.shadow.normalBias=.035;sun.shadow.bias=-.0004;scene.add(sun);scene.add(sun.target);
 const bank=createBuilding(D);scene.add(bank.group);
 let modelTriangles=0;bank.group.traverse(o=>{if(o.isMesh&&o.parent!==bank.interpreted)modelTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});
 $('export').onclick=async()=>{const button=$('export');button.disabled=true;button.textContent='Model hazırlanıyor…';try{const {GLTFExporter}=await import('./vendor/GLTFExporter.js');const clone=bank.group.clone();clone.children.at(-1).visible=false;const root=new T.Group();root.rotation.x=-Math.PI/2;root.add(clone);root.name='IsBankasi_Bursa_interpretive_model';root.userData={sourceId:D.identity.sourceId,crs:'local metres, glTF Y-up',originED50TM30:[D.origin[0]+419580,D.origin[1]+4450150],widthM:D.width,heightInferredM:D.height,notice:'DGN footprint. Photo-proportioned facade; roof interior and rear are interpretive. Not a measured architectural survey.',sources:['https://dergipark.org.tr/tr/download/article-file/202905','https://www.bursadakultur.org/images/anitsal.jpg','https://commons.wikimedia.org/wiki/File:I%C5%9Fbankas%C4%B1,bursa_-_panoramio.jpg','https://commons.wikimedia.org/wiki/File:%C4%B0%C5%9F_Bankas%C4%B1_Binas%C4%B1,_Bursa_2017-06-25_17.01.48_1791496710.jpg']};const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='Is-Bankasi-Bursa.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);button.textContent='3B modeli indir (.glb) ↓';}catch(e){console.error(e);button.textContent='İndirme başarısız; yeniden dene';}finally{button.disabled=false;}};
 const sourceGeo=new T.BufferGeometry();sourceGeo.setAttribute('position',new T.Float32BufferAttribute(D.sourceMesh.flat(),3));sourceGeo.computeVertexNormals();const source=new T.Mesh(sourceGeo,new T.MeshStandardMaterial({color:'#bebcab',roughness:1}));source.castShadow=true;source.receiveShadow=true;source.visible=false;scene.add(source);
 const baseMat=new T.MeshStandardMaterial({color:'#d4d7c5',roughness:1});const base=new T.Mesh(new T.CylinderGeometry(24,24.4,.65,96),baseMat);base.rotation.x=Math.PI/2;base.position.set(0,-3,-.47);base.receiveShadow=true;scene.add(base);
 const floor=new T.Mesh(new T.PlaneGeometry(1000,1000),new T.MeshStandardMaterial({color:'#e7e8dd',roughness:1}));floor.position.z=-.82;floor.receiveShadow=true;scene.add(floor);
 const plinth=new T.Mesh(new T.BoxGeometry(23,16,.16),new T.MeshStandardMaterial({color:'#dedccf',roughness:1}));plinth.position.set(0,-5.3,-.06);plinth.receiveShadow=true;scene.add(plinth);
 // Subtle paving joints are display staging, not a surveyed sidewalk.
 const lines=[];for(let x=-11.5;x<12;x+=1.3)lines.push(x,2.6,.025,x,1,.025);const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(lines,3));const paving=new T.LineSegments(pg,new T.LineBasicMaterial({color:'#c7cabc'}));scene.add(paving);
 const surroundings=new T.Group();surroundings.visible=false;scene.add(surroundings);
 const gs=D.context.map(i=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(i.vertices.flat(),3));g.computeVertexNormals();return g;});const contextMesh=new T.Mesh(mergeGeometries(gs),new T.MeshStandardMaterial({color:'#c7c9bc',roughness:1}));contextMesh.castShadow=true;contextMesh.receiveShadow=true;surroundings.add(contextMesh);
 // Local CBS centerlines, displayed schematically. Width is a style attribute.
 const rv=[];for(const r of D.roads){for(let i=0;i<r.points.length-1;i++){const a=r.points[i],b=r.points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(!l)continue;const nx=-dy/l*r.width/2,ny=dx/l*r.width/2;rv.push(a[0]+nx,a[1]+ny,-.2,a[0]-nx,a[1]-ny,-.2,b[0]-nx,b[1]-ny,-.2,a[0]+nx,a[1]+ny,-.2,b[0]-nx,b[1]-ny,-.2,b[0]+nx,b[1]+ny,-.2);}}
 const roadg=new T.BufferGeometry();roadg.setAttribute('position',new T.Float32BufferAttribute(rv,3));roadg.computeVertexNormals();surroundings.add(new T.Mesh(roadg,new T.MeshStandardMaterial({color:'#a6b3b4',roughness:1,side:T.DoubleSide})));
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const half=Math.max(innerWidth<640?23:22,20*h/w);camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(host);resize();
 const fullscreenButton=$('fullscreen');let fallbackFullscreen=false,previousOverflow='';
 function syncFullscreen(active,fallback=false){
  host.classList.toggle('is-fullscreen',active);
  fallbackFullscreen=active&&fallback;
  document.body.style.overflow=fallbackFullscreen?'hidden':previousOverflow;
  fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.setAttribute('aria-label',active?'Tam ekrandan çık':'Tam ekran');
  fullscreenButton.title=active?'Tam ekrandan çık':'Tam ekran';
  fullscreenButton.innerHTML=active?'× <span>Çık</span>':'⛶ <span>Tam ekran</span>';
  resize();
 }
 fullscreenButton.onclick=async()=>{
  if(host.classList.contains('is-fullscreen')){
   if(document.fullscreenElement===host){try{await document.exitFullscreen();}catch{syncFullscreen(false);}}
   else syncFullscreen(false);
   return;
  }
  previousOverflow=document.body.style.overflow;
  if(window.innerWidth<640){syncFullscreen(true,true);return;}
  try{
   if(!host.requestFullscreen)throw new Error('Fullscreen API unavailable');
   await host.requestFullscreen({navigationUI:'hide'});
   syncFullscreen(true);
  }catch{syncFullscreen(true,true);}
 };
 document.addEventListener('fullscreenchange',()=>{
  if(document.fullscreenElement===host)syncFullscreen(true);
  else if(!fallbackFullscreen)syncFullscreen(false);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fallbackFullscreen)syncFullscreen(false);});
 function view(name,animate=true){const mobile=host.clientWidth<500;const target=new T.Vector3(0,-4,7);const poses={perspective:[-32,46,31],front:[0,55,8.2],roof:[0,-3,72]};const p=new T.Vector3(...poses[name]);let zoom=mobile?1.02:1.3;if(name==='front')zoom=mobile?1.03:1.18;if(context)zoom=.45;
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
 if(!animate||reduced){camera.position.copy(p);controls.target.copy(target);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();dirty=true;}else transition={start:performance.now(),from:camera.position.clone(),to:p,fromTarget:controls.target.clone(),toTarget:target,z0:camera.zoom,z1:zoom};}
 view('perspective',false);
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
 function toggle(id,handler){$(id).onclick=()=>{const yes=$(id).getAttribute('aria-pressed')!=='true';$(id).setAttribute('aria-pressed',String(yes));handler(yes);dirty=true;};}
 toggle('compare',yes=>{comparison=yes;$('split-control').hidden=!yes;$('split-line').hidden=!yes;$('split-labels').hidden=!yes;});
 toggle('context',yes=>{context=yes;surroundings.visible=yes;base.visible=!yes;plinth.visible=!yes;paving.visible=!yes;view('perspective');$('view-hint').textContent=yes?'DGN kütleleri · CBS yolları (stil genişliği)':'Sürükle: döndür · Tekerlek: yakınlaş';});
 toggle('rotate',yes=>{controls.autoRotate=yes;});
 toggle('evidence',yes=>{bank.interpreted.visible=yes;$('view-hint').textContent=yes?'Kehribar: çatı içi ve arka cephe yorum alanları':context?'DGN kütleleri · CBS yolları (stil genişliği)':'Sürükle: döndür · Tekerlek: yakınlaş';});
 toggle('light',yes=>{golden=yes;sun.color.set(yes?'#ffcc8e':'#fff4dd');sun.position.set(yes?-27:22,yes?18:28,yes?20:40);renderer.toneMappingExposure=yes?1.05:1.25;$('light').textContent=yes?'☀ Gün ışığı':'☀ Altın saat';});
 function zoom(factor){transition=null;camera.zoom=T.MathUtils.clamp(camera.zoom*factor,.45,4);camera.updateProjectionMatrix();dirty=true;}
 $('plus').onclick=()=>zoom(1.2);$('minus').onclick=()=>zoom(1/1.2);$('reset').onclick=()=>view('perspective');$('split').oninput=()=>{ $('split-line').style.left=$('split').value+'%';dirty=true;};
 $('sources').onclick=()=>$('source-dialog').showModal();$('close').onclick=()=>$('source-dialog').close();$('source-dialog').addEventListener('click',e=>{if(e.target===$('source-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
 function frame(now){requestAnimationFrame(frame);if(document.hidden)return;if(transition){let t=Math.min(1,(now-transition.start)/700);t=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.zoom=T.MathUtils.lerp(transition.z0,transition.z1,t);camera.updateProjectionMatrix();dirty=true;if(t===1)transition=null;}controls.update();if(!dirty&&!controls.autoRotate)return;
 const w=host.clientWidth,h=host.clientHeight;renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);bank.group.visible=true;source.visible=false;renderer.render(scene,camera);
 if(comparison){const cut=Math.round(w*Number($('split').value)/100);renderer.setScissorTest(true);renderer.setScissor(0,0,cut,h);source.visible=true;bank.group.visible=false;renderer.render(scene,camera);renderer.setScissorTest(false);source.visible=false;bank.group.visible=true;}
 dirty=false;$('status').textContent=`${context?'Çevre açık · ':''}${comparison?'Karşılaştırma · ':''}Bina: ${Math.round(modelTriangles).toLocaleString('tr-TR')} üçgen`;
 }requestAnimationFrame(frame);$('loading').remove();
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('status').textContent='Grafik bağlamı kesildi. Sayfayı yenileyin.';});
}


