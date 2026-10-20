import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {createBuilding as createBank} from './model.js';
import {createBuilding as createHotel} from './kent-hotel/model.js';
import {createBuilding as createOttoman} from './osmanli-bankasi/model.js';

const $=id=>document.getElementById(id);
try{await start();}catch(error){console.error(error);$('loading').textContent='Ortak görünüm açılamadı: '+error.message;}

async function start(){
 const [bankRes,hotelRes,ottomanRes]=await Promise.all([fetch('./building-data.json'),fetch('./kent-hotel/building-data.json'),fetch('./osmanli-bankasi/building-data.json')]);
 if(!bankRes.ok||!hotelRes.ok||!ottomanRes.ok)throw new Error('Bina geometrisi yüklenemedi');
 const [bankData,hotelData,ottomanData]=await Promise.all([bankRes.json(),hotelRes.json(),ottomanRes.json()]);
 const host=$('stage'),scene=new T.Scene();scene.background=new T.Color('#e6e8dc');
 const camera=new T.OrthographicCamera(-45,45,27,-27,.1,500);camera.up.set(0,0,1);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.26;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 $('canvas').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','İş Bankası, Kent Hotel ve seçilebilir tarihî Osmanlı Bankası modelleri; döndürmek için sürükleyin');
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minZoom=.45;controls.maxZoom=4;controls.minPolarAngle=.03;controls.maxPolarAngle=Math.PI*.48;controls.enablePan=false;controls.target.set(0,-10,10);
 let dirty=true,transition=null,focus='both';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 controls.addEventListener('change',()=>dirty=true);controls.addEventListener('start',()=>{transition=null;});
 scene.add(new T.HemisphereLight('#f9f7ed','#9ba99d',2.7));
 const sun=new T.DirectionalLight('#fff3dc',3);sun.position.set(27,35,50);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=80;sun.shadow.camera.bottom=-80;sun.shadow.camera.near=1;sun.shadow.camera.far=180;sun.shadow.normalBias=.03;scene.add(sun);scene.add(sun.target);

 // DGN footprints share a metre frame. The lost Ottoman Bank uses an explicitly estimated placement.
 const midpoint=[(bankData.origin[0]+hotelData.origin[0])/2,(bankData.origin[1]+hotelData.origin[1])/2];
 function wrapper(data,building){const outer=new T.Group();outer.position.set(data.origin[0]-midpoint[0],data.origin[1]-midpoint[1],0);outer.rotation.z=Math.atan2(data.basis[1],data.basis[0]);outer.add(building.group);scene.add(outer);return outer;}
 const bank=createBank(bankData),hotel=createHotel(hotelData),ottoman=createOttoman(ottomanData,'bank'),club=createOttoman(ottomanData,'club');
 const bankOuter=wrapper(bankData,bank),hotelOuter=wrapper(hotelData,hotel),ottomanOuter=wrapper(ottomanData,ottoman),clubOuter=wrapper(ottomanData,club);
 ottomanOuter.visible=false;clubOuter.visible=false;
 const historicBase=new T.Mesh(new T.CylinderGeometry(20.5,20.7,.28,80),new T.MeshStandardMaterial({color:'#d9c7aa',roughness:1}));historicBase.rotation.x=Math.PI/2;historicBase.position.set(ottomanOuter.position.x,ottomanOuter.position.y,-.27);historicBase.receiveShadow=true;historicBase.visible=false;scene.add(historicBase);

 const ground=new T.Mesh(new T.PlaneGeometry(1000,1000),new T.MeshStandardMaterial({color:'#e6e8dc',roughness:1}));ground.position.z=-.12;ground.receiveShadow=true;scene.add(ground);
 const block=new T.Mesh(new T.BoxGeometry(85,52,.45),new T.MeshStandardMaterial({color:'#d9dcd0',roughness:1}));block.position.set(0,-8,-.42);block.rotation.z=Math.atan2(bankData.basis[1],bankData.basis[0]);block.receiveShadow=true;scene.add(block);
 const street=new T.Mesh(new T.BoxGeometry(95,12,.07),new T.MeshStandardMaterial({color:'#aebaba',roughness:1}));street.position.set(0,16,-.12);street.rotation.z=Math.atan2(bankData.basis[1],bankData.basis[0]);street.receiveShadow=true;scene.add(street);
 const curb=new T.Mesh(new T.BoxGeometry(95,.25,.12),new T.MeshStandardMaterial({color:'#f3f0e3',roughness:1}));curb.position.set(0,9.85,-.03);curb.rotation.z=street.rotation.z;scene.add(curb);

 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const halfW=w<640?39:44;camera.left=-halfW;camera.right=halfW;camera.top=halfW*h/w;camera.bottom=-halfW*h/w;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(host);resize();
 const positions={both:new T.Vector3(0,-9,13),bank:new T.Vector3(bankOuter.position.x,-6,10),hotel:new T.Vector3(hotelOuter.position.x,-11,14),ottoman:new T.Vector3(ottomanOuter.position.x,ottomanOuter.position.y,6),club:new T.Vector3(clubOuter.position.x,clubOuter.position.y,7)};
 function setFocus(name,animate=true){focus=name;const historic=name==='ottoman'||name==='club';ottomanOuter.visible=name==='ottoman';clubOuter.visible=name==='club';historicBase.visible=historic;bankOuter.visible=!historic;hotelOuter.visible=!historic;block.visible=!historic;street.visible=!historic;curb.visible=!historic;$('historic-notice').hidden=!historic;const mobile=host.clientWidth<640;$('historic-notice').textContent=mobile?(name==='club'?'KULÜP · 1930 · TAHMİNÎ':'OSMANLI BANKASI · 1940 · TAHMİNÎ'):(name==='club'?'1930 KULÜP DÖNEMİ · KUBBE VE MERDİVEN 1934’TE KALDIRILDI · TAHMİNÎ PLAN':'1940’LAR BANKA DÖNEMİ · 1934 TADİLATI SONRASI · TAHMİNÎ PLAN');document.querySelectorAll('[data-focus]').forEach(b=>{const active=b.dataset.focus===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const target=positions[name],position=new T.Vector3(target.x,target.y+(historic?(name==='club'?76:-76):92),target.z+(historic?19:27)),zoom=name==='both'?(mobile?1.8:.82):historic?(mobile?2.55:1.1):(mobile?2.2:1.15);if(!animate||reduced){camera.position.copy(position);controls.target.copy(target);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();dirty=true;}else transition={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),toTarget:target,z0:camera.zoom,z1:zoom};}
 setFocus('both',false);
 let lastMobile=host.clientWidth<640;new ResizeObserver(()=>{const mobile=host.clientWidth<640;if(mobile!==lastMobile){lastMobile=mobile;setFocus(focus,false);}}).observe(host);
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>setFocus(b.dataset.focus));
 function zoom(factor){transition=null;camera.zoom=T.MathUtils.clamp(camera.zoom*factor,.45,4);camera.updateProjectionMatrix();dirty=true;}
 $('plus').onclick=()=>zoom(1.2);$('minus').onclick=()=>zoom(1/1.2);$('reset').onclick=()=>setFocus('both');

 const fullscreenButton=$('fullscreen');let fallbackFullscreen=false,previousOverflow='';
 function syncFullscreen(active,fallback=false){host.classList.toggle('is-fullscreen',active);fallbackFullscreen=active&&fallback;document.body.style.overflow=fallbackFullscreen?'hidden':previousOverflow;fullscreenButton.setAttribute('aria-pressed',String(active));fullscreenButton.setAttribute('aria-label',active?'Tam ekrandan çık':'Tam ekran');fullscreenButton.innerHTML=active?'× <span>Çık</span>':'⛶ <span>Tam ekran</span>';resize();}
 fullscreenButton.onclick=async()=>{if(host.classList.contains('is-fullscreen')){if(document.fullscreenElement===host){try{await document.exitFullscreen();}catch{syncFullscreen(false);}}else syncFullscreen(false);return;}previousOverflow=document.body.style.overflow;if(window.innerWidth<640){syncFullscreen(true,true);return;}try{if(!host.requestFullscreen)throw new Error('Fullscreen API unavailable');await host.requestFullscreen({navigationUI:'hide'});syncFullscreen(true);}catch{syncFullscreen(true,true);}};
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===host)syncFullscreen(true);else if(!fallbackFullscreen)syncFullscreen(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fallbackFullscreen)syncFullscreen(false);});

 function frame(now){requestAnimationFrame(frame);if(document.hidden)return;if(transition){let t=Math.min(1,(now-transition.start)/700);t=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,t);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,t);camera.zoom=T.MathUtils.lerp(transition.z0,transition.z1,t);camera.updateProjectionMatrix();dirty=true;if(t===1)transition=null;}controls.update();if(!dirty)return;renderer.render(scene,camera);dirty=false;}
 requestAnimationFrame(frame);$('loading').remove();
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();$('loading').textContent='Grafik bağlamı kesildi. Sayfayı yenileyin.';});
}
