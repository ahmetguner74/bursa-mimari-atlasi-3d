import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {createBuilding as createBank} from './model.js';
import {createBuilding as createHotel} from './kent-hotel/model.js';
import {createBuilding as createOttoman} from './osmanli-bankasi/model.js?v=stairs-1';
import {createBuilding as createUluCami} from './ulucami/model.js';

const $=id=>document.getElementById(id);
try{await start();}catch(error){console.error(error);$('loading').textContent='Ortak görünüm açılamadı: '+error.message;}

async function start(){
 const [bankRes,hotelRes,ottomanRes,uluRes,planRes]=await Promise.all([fetch('./building-data.json'),fetch('./kent-hotel/building-data.json'),fetch('./osmanli-bankasi/building-data.json'),fetch('./ulucami/building-data.json'),fetch('./dgn-underlay.json?v=all-models-2')]);
 if([bankRes,hotelRes,ottomanRes,uluRes,planRes].some(response=>!response.ok))throw new Error('Sahne verisi yüklenemedi');
 const [bankData,hotelData,ottomanData,uluData,planData]=await Promise.all([bankRes.json(),hotelRes.json(),ottomanRes.json(),uluRes.json(),planRes.json()]);
 const host=$('stage'),scene=new T.Scene();scene.background=new T.Color('#e6e8dc');
 const camera=new T.OrthographicCamera(-128,128,72,-72,.1,700);camera.up.set(0,0,1);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.26;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 $('canvas').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','İş Bankası, Kent Hotel, Osmanlı Bankası, Ulu Cami ve Çinili Çeşme modelleri aynı DGN sahnesinde; döndürmek için sürükleyin');
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minZoom=.28;controls.maxZoom=16;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI*.48;controls.enablePan=false;
 let dirty=true,transition=null,focus='all',historicEra='ottoman';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 controls.addEventListener('change',()=>dirty=true);controls.addEventListener('start',()=>{transition=null;});
 scene.add(new T.HemisphereLight('#f9f7ed','#9ba99d',2.7));
 const sun=new T.DirectionalLight('#fff3dc',3);sun.position.set(27,35,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-180;sun.shadow.camera.right=180;sun.shadow.camera.top=170;sun.shadow.camera.bottom=-170;sun.shadow.camera.near=1;sun.shadow.camera.far=330;sun.shadow.normalBias=.03;scene.add(sun);scene.add(sun.target);

 // DGN footprints share a metre frame. The lost Ottoman Bank uses an explicitly estimated placement.
 const midpoint=[(bankData.origin[0]+hotelData.origin[0])/2,(bankData.origin[1]+hotelData.origin[1])/2];
 function wrapper(data,building){const outer=new T.Group();outer.position.set(data.origin[0]-midpoint[0],data.origin[1]-midpoint[1],0);outer.rotation.z=Math.atan2(data.basis[1],data.basis[0]);outer.add(building.group);scene.add(outer);return outer;}
 const bank=createBank(bankData),hotel=createHotel(hotelData),ottoman=createOttoman(ottomanData,'bank'),club=createOttoman(ottomanData,'club'),ulu=createUluCami(uluData);
 const bankOuter=wrapper(bankData,bank),hotelOuter=wrapper(hotelData,hotel),ottomanOuter=wrapper(ottomanData,ottoman),clubOuter=wrapper(ottomanData,club);
 const uluOrigin=uluData.coordinateSystem.localOrigin,uluEast=uluData.coordinateSystem.basisEast;
 const uluOuter=new T.Group();uluOuter.position.set(uluOrigin[0]-midpoint[0],uluOrigin[1]-midpoint[1],0);uluOuter.rotation.z=Math.atan2(uluEast[1],uluEast[0]);uluOuter.add(ulu.group);scene.add(uluOuter);
 const fountainPoint=uluOuter.localToWorld(new T.Vector3(...uluData.fountain.modelCentreLocal,0));
 const fountainPin=$('fountain-pin'),pinAnchor=fountainPoint.clone().add(new T.Vector3(0,0,5));
 clubOuter.visible=false;

 const ground=new T.Mesh(new T.PlaneGeometry(1000,1000),new T.MeshStandardMaterial({color:'#e6e8dc',roughness:1}));ground.position.z=-.12;ground.receiveShadow=true;scene.add(ground);
 // All 2D plan coordinates are the original DGN metre XY, flattened beneath the 3D buildings.
 const underlay=new T.Group();scene.add(underlay);
 const roofFill=new T.MeshBasicMaterial({color:'#f4f3e9',transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const roofStroke=new T.LineBasicMaterial({color:'#87988d',transparent:true,opacity:.38,depthWrite:false,toneMapped:false});
 const lineMaterials={curb:new T.LineBasicMaterial({color:'#728f87',transparent:true,opacity:.50,depthWrite:false,toneMapped:false}),wall:new T.LineBasicMaterial({color:'#8c9e91',transparent:true,opacity:.27,depthWrite:false,toneMapped:false}),retaining_wall:new T.LineBasicMaterial({color:'#8c9e91',transparent:true,opacity:.27,depthWrite:false,toneMapped:false}),stairs:new T.LineBasicMaterial({color:'#9da99c',transparent:true,opacity:.18,depthWrite:false,toneMapped:false})};
 const planPoint=point=>new T.Vector3(point[0]-midpoint[0],point[1]-midpoint[1],-.108);
 const path=(ring,material)=>{const geometry=new T.BufferGeometry().setFromPoints(ring.map(planPoint));const line=new T.Line(geometry,material);underlay.add(line);};
 for(const roof of planData.roofs){const outer=roof.outer;const shape=new T.Shape();shape.moveTo(outer[0][0]-midpoint[0],outer[0][1]-midpoint[1]);for(const point of outer.slice(1))shape.lineTo(point[0]-midpoint[0],point[1]-midpoint[1]);for(const ring of roof.holes){const hole=new T.Path();hole.moveTo(ring[0][0]-midpoint[0],ring[0][1]-midpoint[1]);for(const point of ring.slice(1))hole.lineTo(point[0]-midpoint[0],point[1]-midpoint[1]);shape.holes.push(hole);}const fill=new T.Mesh(new T.ShapeGeometry(shape),roofFill);fill.position.z=-.112;underlay.add(fill);path(outer,roofStroke);for(const ring of roof.holes)path(ring,roofStroke);}
 for(const line of planData.lines)path(line.points,lineMaterials[line.kind]);

 function resize(){const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);renderer.setSize(w,h);const halfW=w<640?112:128;camera.left=-halfW;camera.right=halfW;camera.top=halfW*h/w;camera.bottom=-halfW*h/w;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(host);resize();
 const positions={all:new T.Vector3(-30,39,5),bank:new T.Vector3(bankOuter.position.x,bankOuter.position.y,10),hotel:new T.Vector3(hotelOuter.position.x,hotelOuter.position.y,14),ottoman:new T.Vector3(ottomanOuter.position.x,ottomanOuter.position.y,7),club:new T.Vector3(clubOuter.position.x,clubOuter.position.y,7),ulu:new T.Vector3(uluOuter.position.x,uluOuter.position.y,8),fountain:new T.Vector3(fountainPoint.x,fountainPoint.y,2)};
 function setFocus(name,animate=true){
  focus=name;if(name==='ottoman'||name==='club')historicEra=name;
  ottomanOuter.visible=historicEra==='ottoman';clubOuter.visible=historicEra==='club';
  const historic=name==='ottoman'||name==='club',mobile=host.clientWidth<640;
  $('historic-notice').hidden=!historic;
  $('historic-notice').textContent=mobile?(name==='club'?'KULÜP · 1930 · TAHMİNÎ':'OSMANLI BANKASI · 1940 · TAHMİNÎ'):(name==='club'?'1930 KULÜP DÖNEMİ · KUBBE VE MERDİVEN 1934’TE KALDIRILDI · TAHMİNÎ PLAN':'1940’LAR BANKA DÖNEMİ · 1934 TADİLATI SONRASI · TAHMİNÎ PLAN');
  document.querySelectorAll('[data-focus]').forEach(b=>{const active=b.dataset.focus===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const target=positions[name];
  const offsets={all:mobile?[-230,15,210]:[-210,150,185],bank:[0,96,48],hotel:[0,96,48],ottoman:[0,-92,42],club:[0,92,42],ulu:[24,135,80],fountain:[-32,-48,30]};
  const [dx,dy,dz]=offsets[name],position=new T.Vector3(target.x+dx,target.y+dy,target.z+dz);
  const zoom=name==='all'?(mobile?1.48:.92):name==='ulu'?(mobile?1.25:1.65):name==='fountain'?(mobile?11:12):historic?(mobile?4.5:3.4):(mobile?5:3.8);
  if(!animate||reduced){camera.position.copy(position);controls.target.copy(target);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();dirty=true;}
  else transition={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),toTarget:target,z0:camera.zoom,z1:zoom};
 }
 setFocus('all',false);
 let lastMobile=host.clientWidth<640;new ResizeObserver(()=>{const mobile=host.clientWidth<640;if(mobile!==lastMobile){lastMobile=mobile;setFocus(focus,false);}}).observe(host);
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>setFocus(b.dataset.focus));
 fountainPin.onclick=()=>setFocus('fountain');
 function zoom(factor){transition=null;camera.zoom=T.MathUtils.clamp(camera.zoom*factor,.28,16);camera.updateProjectionMatrix();dirty=true;}
 $('plus').onclick=()=>zoom(1.2);$('minus').onclick=()=>zoom(1/1.2);$('reset').onclick=()=>setFocus('all');

 const fullscreenButton=$('fullscreen');let fallbackFullscreen=false,previousOverflow='';
 function syncFullscreen(active,fallback=false){host.classList.toggle('is-fullscreen',active);fallbackFullscreen=active&&fallback;document.body.style.overflow=fallbackFullscreen?'hidden':previousOverflow;fullscreenButton.setAttribute('aria-pressed',String(active));fullscreenButton.setAttribute('aria-label',active?'Tam ekrandan çık':'Tam ekran');fullscreenButton.innerHTML=active?'× <span>Çık</span>':'⛶ <span>Tam ekran</span>';resize();}
 fullscreenButton.onclick=async()=>{if(host.classList.contains('is-fullscreen')){if(document.fullscreenElement===host){try{await document.exitFullscreen();}catch{syncFullscreen(false);}}else syncFullscreen(false);return;}previousOverflow=document.body.style.overflow;if(window.innerWidth<640){syncFullscreen(true,true);return;}try{if(!host.requestFullscreen)throw new Error('Fullscreen API unavailable');await host.requestFullscreen({navigationUI:'hide'});syncFullscreen(true);}catch{syncFullscreen(true,true);}};
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===host)syncFullscreen(true);else if(!fallbackFullscreen)syncFullscreen(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fallbackFullscreen)syncFullscreen(false);});

 function updatePin(){const p=pinAnchor.clone().project(camera),x=(p.x+1)*host.clientWidth/2,y=(1-p.y)*host.clientHeight/2;fountainPin.hidden=focus!=='all'||p.z<-1||p.z>1||x<20||x>host.clientWidth-20||y<35||y>host.clientHeight-85;if(!fountainPin.hidden){fountainPin.style.left=x+'px';fountainPin.style.top=y+'px';}}
 function frame(now){requestAnimationFrame(frame);if(document.hidden)return;if(transition){let t=Math.min(1,(now-transition.start)/700);t=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.zoom=T.MathUtils.lerp(transition.z0,transition.z1,t);camera.updateProjectionMatrix();dirty=true;if(t===1)transition=null;}controls.update();if(!dirty)return;updatePin();renderer.render(scene,camera);dirty=false;}
 requestAnimationFrame(frame);$('loading').remove();
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();$('loading').textContent='Grafik bağlamı kesildi. Sayfayı yenileyin.';});
}
