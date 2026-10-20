import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {createBuilding} from './model.js';

const $=id=>document.getElementById(id);
try{await start();}catch(error){console.error(error);$('loading').textContent='3B görünüm açılamadı: '+error.message;}

async function start(){
 const response=await fetch('./building-data.json');if(!response.ok)throw Error('DGN verisi yüklenemedi');
 const D=await response.json(),host=$('stage');
 const scene=new T.Scene();scene.background=new T.Color('#dce7e5');
 const camera=new T.OrthographicCamera(-55,55,55,-55,.1,800);camera.up.set(0,0,1);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 $('canvas').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Bursa Ulu Cami üç boyutlu modelini döndürmek için sürükleyin');
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minZoom=.45;controls.maxZoom=8;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI*.49;controls.autoRotateSpeed=.28;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let dirty=true,transition=null,currentView='north';controls.addEventListener('change',()=>dirty=true);controls.addEventListener('start',()=>transition=null);
 scene.add(new T.HemisphereLight('#fff9ed','#98a7a8',2));const sun=new T.DirectionalLight('#fff0d3',2.65);sun.position.set(-65,55,95);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-95;sun.shadow.camera.right=95;sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;sun.shadow.camera.near=1;sun.shadow.camera.far=230;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
 const building=createBuilding(D);scene.add(building.group);
 const paving=document.createElement('canvas');paving.width=paving.height=512;const ctx=paving.getContext('2d');
 ctx.fillStyle='#c6c4b6';ctx.fillRect(0,0,512,512);
 for(let row=0;row<16;row++)for(let col=0;col<16;col++){const n=(row*37+col*53)%7,v=191+n*3;ctx.fillStyle=`rgb(${v},${v-2},${v-9})`;ctx.fillRect(col*32+1,row*32+1,30,30);}
 const tex=new T.CanvasTexture(paving);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(4,4);tex.colorSpace=T.SRGBColorSpace;
 const plaza=new T.Mesh(new T.PlaneGeometry(135,125),new T.MeshStandardMaterial({map:tex,roughness:1}));plaza.position.set(0,0,-.16);plaza.receiveShadow=true;scene.add(plaza);
 const floor=new T.Mesh(new T.PlaneGeometry(1000,1000),new T.MeshStandardMaterial({color:'#cfd1c8',roughness:1}));floor.position.z=-.21;floor.receiveShadow=true;scene.add(floor);
 function resize(){const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);renderer.setSize(w,h);const half=Math.max(48,50*h/w);camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(host);resize();
 const full=$('fullscreen');let fallback=false,oldOverflow='';
 function syncFull(active,css=false){host.classList.toggle('is-fullscreen',active);fallback=active&&css;document.body.style.overflow=fallback?'hidden':oldOverflow;full.setAttribute('aria-pressed',String(active));full.setAttribute('aria-label',active?'Tam ekrandan çık':'Tam ekran');full.title=active?'Tam ekrandan çık':'Tam ekran';full.innerHTML=active?'× <span>Çık</span>':'⛶ <span>Tam ekran</span>';resize();}
 full.onclick=async()=>{if(host.classList.contains('is-fullscreen')){if(document.fullscreenElement===host){try{await document.exitFullscreen();}catch{syncFull(false);}}else syncFull(false);return;}oldOverflow=document.body.style.overflow;if(window.innerWidth<640){syncFull(true,true);return;}try{if(!host.requestFullscreen)throw Error('Fullscreen API');await host.requestFullscreen({navigationUI:'hide'});syncFull(true);}catch{syncFull(true,true);}};
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===host)syncFull(true);else if(!fallback)syncFull(false);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fallback)syncFull(false);});
 function view(name,animate=true){
   currentView=name;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
   const poses={north:[24,142,69],east:[135,0,35],south:[-52,-137,75],roof:[0,0,155],fountain:[-70,-98,35]};
   const goals={north:[0,1,15],east:[0,0,22],south:[0,0,13],roof:[0,0,12],fountain:[D.fountain.modelCentreLocal[0],D.fountain.modelCentreLocal[1],3]};
   const pos=new T.Vector3(...poses[name]),tar=new T.Vector3(...goals[name]);
   const zoom=name==='fountain'?(host.clientWidth<500?5.8:6.2):(host.clientWidth<500?(name==='roof'?.77:name==='east'?1.06:.88):(name==='roof'?1.02:name==='east'?1.05:1.15));
   if(!animate||reduced){camera.position.copy(pos);controls.target.copy(tar);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();dirty=true;}
   else transition={start:performance.now(),from:camera.position.clone(),to:pos,fromTarget:controls.target.clone(),toTarget:tar,z0:camera.zoom,z1:zoom};
 }
 const fountainMode=new URLSearchParams(location.search).get('focus')==='cesme';
 if(fountainMode){
   document.body.classList.add('fountain-mode');
   document.title='Mecidiye Çeşme-i Âlîsi · Bursa Mimari Atlası';
   $('intro-eyebrow').textContent='ÇİNİLİ ÇEŞME · 1903 / 1994';
   $('intro-title').textContent='Mecidiye Çeşme-i Âlîsi';
   $('intro-subtitle').innerHTML='Ulu Cami güneybatısında<br><strong>dört yüzlü Çinili Çeşme</strong>';
   $('intro-description').textContent='1903 tarihli çeşme 1959–60’ta kaldırıldı, 1993–94’te yeniden yapıldı. Görünüş bugünkü yeniden yapımı esas alır; mermer yalak, Kütahya çinileri, ahşap payandalar ve bakır saçak kaynaklara göre modellendi.';
   document.querySelector('.numbers').innerHTML='<div><b>1903</b><small>ilk yapım</small><span>resmî envanter</span></div><div><b>1994</b><small>yeniden yapım</small><span>bugünkü görünüş</span></div>';
   document.querySelector('.tag').innerHTML='<i></i> K.E. KONUMU + M5 BAĞLAM';
   host.setAttribute('aria-label','Mecidiye Çinili Çeşme ve Bursa Ulu Cami üç boyutlu modeli');
 }
 const requestedView=new URLSearchParams(location.search).get('view');
 view(fountainMode?'fountain':(['north','east','south','roof'].includes(requestedView)?requestedView:'north'),false);
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
 function toggle(id,action){$(id).onclick=()=>{const active=$(id).getAttribute('aria-pressed')!=='true';$(id).setAttribute('aria-pressed',String(active));action(active);dirty=true;};}
 toggle('roof',yes=>{building.interpreted.visible=yes;$('view-hint').textContent=yes?'Kubbeler ve cephe: mimari yorum':'Yalnız DGN oturumu ve kotu';});
 toggle('site',yes=>{building.markerGroup.visible=yes;$('view-hint').textContent=yes?'Halkalar: minare DGN sembol noktaları':'Sürükle: döndür · Tekerlek: yakınlaş';});
 toggle('rotate',yes=>{controls.autoRotate=yes;});
 toggle('light',yes=>{sun.color.set(yes?'#ffd092':'#fff0d3');sun.position.set(yes?65:-65,yes?-45:55,yes?55:95);renderer.toneMappingExposure=yes?1.08:1.22;$('light').textContent=yes?'☀ Gün ışığı':'☀ Altın saat';});
 function zoom(f){transition=null;camera.zoom=T.MathUtils.clamp(camera.zoom*f,.45,8);camera.updateProjectionMatrix();dirty=true;}$('plus').onclick=()=>zoom(1.2);$('minus').onclick=()=>zoom(1/1.2);$('reset').onclick=()=>view(currentView);
 $('sources').onclick=()=>$('source-dialog').showModal();$('close').onclick=()=>$('source-dialog').close();
 $('export').onclick=async()=>{const button=$('export');button.disabled=true;button.textContent='Model hazırlanıyor…';try{const {GLTFExporter}=await import('./vendor/GLTFExporter.js');const copy=building.group.clone(true);copy.traverse(o=>{if(o.isLine||o.name==='Kaynak konum işaretleri')o.visible=false;});copy.getObjectByName('Mimari yorum').visible=true;const root=new T.Group();root.rotation.x=-Math.PI/2;root.name='Bursa_Ulu_Cami_ve_Mecidiye_Cinili_Cesme';root.add(copy);root.userData={sourceIds:D.identity.sourceIds,originM5Local:D.coordinateSystem.localOrigin,basisEast:D.coordinateSystem.basisEast,basisNorth:D.coordinateSystem.basisNorth,units:'metres',notice:'M5 footprint and derived roof top; architectural detail and fountain placement/size are interpretations',sources:['https://alanbaskanligi.bursa.bel.tr/ulu-cami/','https://www.kulturportali.gov.tr/turkiye/bursa/kulturenvanteri/ulu-cami-cinili-cesme','https://kulturenvanteri.com/yer/mecidiye-cesme-i-alisi-bursa/']};const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='Bursa-Ulu-Cami-M5-yorum.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);button.textContent='3B modeli indir (.glb) ↓';}catch(e){console.error(e);button.textContent='İndirme başarız; yeniden dene';}finally{button.disabled=false;}};
 $('export-fountain').onclick=async()=>{
   const button=$('export-fountain');button.disabled=true;button.textContent='Çeşme hazırlanıyor…';
   try{
     const {GLTFExporter}=await import('./vendor/GLTFExporter.js');
     const root=new T.Group();root.name='Mecidiye_Cinili_Cesme_1994_yeniden_yapim';root.rotation.x=-Math.PI/2;
     const copy=building.fountainGroup.clone(true);copy.position.set(0,0,0);root.add(copy);
     root.userData={inventoryId:D.fountain.inventoryId,inventoryMarkerWgs84LonLat:D.fountain.inventoryMarkerWgs84LonLat,units:'metres',notice:'1994 reconstruction; size, tile motifs and model centre are interpretations',source:D.fountain.source};
     const bytes=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
     const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='Mecidiye-Cinili-Cesme-Bursa.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
     button.textContent='Yalnız çeşmeyi indir (.glb) ↓';
   }catch(e){console.error(e);button.textContent='İndirme başarısız; yeniden dene';}
   finally{button.disabled=false;}
 };
 let triangles=0;building.group.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});$('status').textContent=`M5 kaynak + yorum · ${Math.round(triangles).toLocaleString('tr-TR')} üçgen`;
 function frame(now){requestAnimationFrame(frame);if(document.hidden)return;if(transition){let t=Math.min(1,(now-transition.start)/700);t=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.zoom=T.MathUtils.lerp(transition.z0,transition.z1,t);camera.updateProjectionMatrix();dirty=true;if(t===1)transition=null;}controls.update();if(!dirty&&!controls.autoRotate)return;renderer.render(scene,camera);dirty=false;}requestAnimationFrame(frame);$('loading').remove();
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('status').textContent='Grafik bağlamı kesildi. Sayfayı yenileyin.';});
}
