import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// All dimensions in metres. Facade dimensions are photo-proportioned, not surveyed.
export function createBuilding(D){
 const group=new T.Group(), buckets=new Map(), interpreted=new T.Group();
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=512;stoneCanvas.height=512;
 const c=stoneCanvas.getContext('2d');let seed=7341;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 c.fillStyle='#d3c4a5';c.fillRect(0,0,512,512);
 for(let row=0;row<8;row++)for(let col=-1;col<5;col++){const x=col*128+(row%2)*64,y=row*64;const v=Math.floor(rand()*13);c.fillStyle=`rgb(${207+v},${194+v},${168+v})`;c.fillRect(x+1,y+1,126,62);for(let k=0;k<180;k++){c.fillStyle=rand()>.5?'#fff1':'#443b2910';c.fillRect(x+rand()*126,y+rand()*62,1+rand()*2,1);}}
 const tex=new T.CanvasTexture(stoneCanvas);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
 const stone=new T.MeshStandardMaterial({map:tex,color:'#ede1c9',roughness:.92});
 const trim=new T.MeshStandardMaterial({color:'#d9cfb8',roughness:.88});
 const darkstone=new T.MeshStandardMaterial({color:'#b7a98b',roughness:1});
 const glass=new T.MeshStandardMaterial({color:'#576d73',metalness:.3,roughness:.26});
 const lightglass=new T.MeshStandardMaterial({color:'#8b9e9c',metalness:.3,roughness:.3});
 const frame=new T.MeshStandardMaterial({color:'#575d59',roughness:.7});
 const rail=new T.MeshStandardMaterial({color:'#354c48',metalness:.3,roughness:.5});
 const shadow=new T.MeshStandardMaterial({color:'#776d58',roughness:1});
 const roofMat=new T.MeshStandardMaterial({color:'#ada491',roughness:1,side:T.DoubleSide});
 const amber=new T.MeshStandardMaterial({color:'#c18a4c',transparent:true,opacity:.36,depthWrite:false});
 function add(g,m,pos=[0,0,0],rot=[0,0,0]){const obj=new T.Mesh(g,m);obj.position.set(...pos);obj.rotation.set(...rot);obj.updateMatrix();g.applyMatrix4(obj.matrix);if(m===stone){const p=g.attributes.position,n=g.attributes.normal,uv=[];for(let i=0;i<p.count;i++){const axis=Math.abs(n.getX(i))>Math.abs(n.getY(i));uv.push((axis?p.getY(i):p.getX(i))/5.2,p.getZ(i)/3.0);}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));}if(g.index)g=g.toNonIndexed();if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(g);}
 function box(x,y,z,w,d,h,m=stone){add(new T.BoxGeometry(w,d,h),m,[x,y,z]);}
 function planeShape(shape,depth,y=0,m=stone){add(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}),m,[0,y,0],[Math.PI/2,0,0]);}
 function rect(x,z,w,h){const p=new T.Path();p.moveTo(x-w/2,z);p.lineTo(x+w/2,z);p.lineTo(x+w/2,z+h);p.lineTo(x-w/2,z+h);p.closePath();return p;}
 const W=D.width,H=D.height;
 // Main sides preserve the actual six-edge survey outline. Front is rebuilt with openings.
 const fp=D.footprint;
 for(let i=0;i<fp.length-1;i++){const a=fp[i],b=fp[i+1];if(Math.abs(a[1])<.01&&Math.abs(b[1])<.01)continue;const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);add(new T.BoxGeometry(len,.38,H-.2),stone,[(a[0]+b[0])/2,(a[1]+b[1])/2,(H-.2)/2],[0,0,Math.atan2(dy,dx)]);}
 // North frontage: three arched loggia bays, two glazed middle levels, narrow side wings.
 const facade=new T.Shape();facade.moveTo(-W/2,3.75);facade.lineTo(W/2,3.75);facade.lineTo(W/2,H-.15);facade.lineTo(6,H-.15);facade.lineTo(6,H+.32);facade.lineTo(-6,H+.32);facade.lineTo(-6,H-.15);facade.lineTo(-W/2,H-.15);facade.closePath();
 const centers=[-7.25,-3.65,0,3.65,7.25];
 const edges=[-W/2,...centers.flatMap(x=>[x-1.415,x+1.415]),W/2]; for(let i=0;i<edges.length-1;i+=2)box((edges[i]+edges[i+1])/2,-.25,1.875,edges[i+1]-edges[i],.55,3.75);
 const bays=[-3.65,0,3.65];
 bays.forEach(x=>{facade.holes.push(rect(x,4.65,3.05,2.8));facade.holes.push(rect(x,7.85,3.05,2.8));const a=new T.Path();a.moveTo(x-1.52,10.95);a.lineTo(x+1.52,10.95);a.lineTo(x+1.52,12.65);a.absarc(x,12.65,1.52,0,Math.PI,false);a.lineTo(x-1.52,10.95);facade.holes.push(a);});
 for(const x of [-7.25,7.25])for(const z of [4.8,8,11.4])facade.holes.push(rect(x,z,1.28,1.85));
 planeShape(facade,.55,.02);
 // Recessed portico wall and glazing; tangible depth replaces painted-on windows.
 box(0,-1.7,1.9,W-.5,.3,3.8,darkstone);
 centers.forEach((x,i)=>{box(x,-1.52,1.82,2.15,.08,2.65,i===2?glass:shadow);for(let k=-4;k<=4;k++)box(x+k*.19,-1.43,1.82,.035,.045,2.65,rail);box(x,-1.42,1.82,2.2,.07,.055,rail);box(x,-1.42,2.8,2.2,.07,.06,rail);});
 box(0,-.8,.05,W+0.25,2.1,.1,trim);
 function windowFront(x,z,w,h,y=-.16){box(x,y,z+h/2,w,.085,h,glass);for(const dx of [-w/2,0,w/2])box(x+dx,y+.055,z+h/2,.065,.065,h,frame);for(const dz of [0,h*.72,h])box(x,y+.055,z+dz,w,.065,.065,frame);box(x,y+.12,z-.065,w+.2,.35,.13,trim);}
 for(const x of bays){for(const z of [4.65,7.85]){windowFront(x,z,3.05,2.8);for(const dx of [-.76,.76])box(x+dx,-.09,z+1.4,.04,.06,2.8,frame);box(x,-.085,z+.8,3,.07,.05,frame);}windowFront(x,11.05,2.65,2.4,-1.48);}
 for(const x of [-7.25,7.25])for(const z of [4.8,8,11.4])windowFront(x,z,1.28,1.85);
 // Upper open loggia, deep shade behind the arches.
 box(0,-1.65,12.6,11.7,.24,3.6,shadow);bays.forEach(x=>windowFront(x,11.15,2.45,2.25,-1.48));
 for(const x of bays){box(x,-.65,10.92,3.1,1.35,.14,trim);box(x,.07,11.8,3.05,.065,.06,rail);box(x,.07,11.04,3.05,.065,.055,rail);for(let k=-7;k<=7;k++)box(x+k*.2,.07,11.41,.037,.048,.76,rail);}
 // Arch voussoirs modelled as individual segments, independently generated.
 for(const x of bays){for(let j=0;j<15;j++){let a=j*Math.PI/15,b=(j+1)*Math.PI/15-.012;const s=new T.Shape();s.moveTo(x+1.53*Math.cos(a),12.65+1.53*Math.sin(a));s.absarc(x,12.65,1.53,a,b,false);s.lineTo(x+1.85*Math.cos(b),12.65+1.85*Math.sin(b));s.absarc(x,12.65,1.85,b,a,true);s.closePath();planeShape(s,.15,.14,j%3===0?darkstone:trim);}for(const dx of [-1.68,1.68]){box(x+dx,.1,12.58,.48,.78,.16,trim);box(x+dx,.08,12.43,.37,.66,.13,trim);}}
 // Cornices and narrow stone mullion accents.
 box(0,.14,4.43,12,.65,.19,trim);box(0,.19,4.29,12.2,.7,.14,darkstone);
 box(0,.05,H+.37,12.3,.8,.15,trim);box(0,.08,H+.23,12.15,.65,.12,darkstone);
 for(const x of [-7.5,7.5])box(x,.03,H-.09,3.3,.7,.17,trim);
 // Side wall details follow the surveyed west-edge direction.
 // Explicit interpolation to avoid imposing a rectangle on the footprint.
 function sideX(y){return -W/2+(-9.6355+W/2)*(-y/12.33661);}
 for(const y of [-2.65,-6.2,-9.6])for(const z of [4.7,7.9,11.25]){const x=sideX(y)-.23;box(x,y,z+.85,.085,1.18,1.7,glass);for(const dy of [-.65,0,.65])box(x-.07,y+dy,z+.85,.07,.07,1.85,frame);for(const zz of [z,z+1.3,z+1.75])box(x-.07,y,zz,.075,1.38,.07,trim);}
 for(const z of [4.6,7.85,11.1]){let x=sideX(-6.2);box(x-.5,-6.2,z,1.45,3.8,.18,trim);for(const y of [-7.8,-4.6]){box(x-.4,y,z-.37,.75,.22,.65,darkstone);}box(x-1.15,-6.2,z+.85,.065,3.8,.06,rail);for(let k=-9;k<=9;k++)box(x-1.15,-6.2+k*.2,z+.43,.04,.035,.85,rail);for(const y of [-8.05,-4.35])box(x-.65,y,z+.85,1.05,.05,.055,rail);}
 // Rear/east openings intentionally restrained and identified as interpretive.
 for(const x of [-6,-2,2,6])for(const z of [5,8.2,11.4]){box(x,-12.49,z+.8,1.1,.075,1.6,glass);box(x,-12.55,z-.03,1.3,.22,.12,trim);}
 for(const y of [-2.8,-6.2,-9.5])for(const z of [5,8.2,11.4])box(y<-8?10.06:9.25,y,z+.8,.09,1.1,1.6,glass);
 const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(D.roof.flat(2),3));rg.computeVertexNormals();add(rg,roofMat);
 // Low parapets: shape evidence exists, depth and concealed roof details are interpreted.
 for(let i=0;i<fp.length-1;i++){const a=fp[i],b=fp[i+1];if(Math.abs(a[1])<.01&&Math.abs(b[1])<.01)continue;const len=Math.hypot(b[0]-a[0],b[1]-a[1]);add(new T.BoxGeometry(len,.3,.35),trim,[(a[0]+b[0])/2,(a[1]+b[1])/2,H+.03],[0,0,Math.atan2(b[1]-a[1],b[0]-a[0])]);}
 // Sign is original canvas typography, never a sampled photographic texture.
 function sign(text,z,width,size){const cv=document.createElement('canvas');cv.width=2048;cv.height=160;const cx=cv.getContext('2d');cx.fillStyle='#344943';cx.font=`${size}px Georgia`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,1024,80);const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:T.DoubleSide});add(new T.PlaneGeometry(width,.59).scale(-1,1,1),m,[0,.32,z],[Math.PI/2,0,0]);}
 sign('T Ü R K İ Y E  İ Ş  B A N K A S I',14.82,10.6,102);sign('TÜRKİYE İŞ BANKASI',4.04,10.6,127);
 // Flag size and cloth shape are visual choices.
 box(0,-.1,12.2,.035,.035,2.7,rail);const flag=new T.Shape();flag.moveTo(0,0);flag.lineTo(.64,-.05);flag.lineTo(.62,-1.07);flag.lineTo(0,-1);flag.closePath();planeShape(flag,.015,.24,new T.MeshStandardMaterial({color:'#a04438',side:T.DoubleSide}));
 // Move the flag geometry from local drafting coordinates to the loggia.
 const flagMat=[...buckets.keys()].at(-1);for(const g of buckets.get(flagMat))g.translate(.06,0,12.65);
 // Evidence tint: unseen roof and rear surface only, disabled by default.
 const eg=rg.clone();eg.translate(0,0,.08);interpreted.add(new T.Mesh(eg,amber));const eb=new T.Mesh(new T.BoxGeometry(18,.1,14),amber);eb.position.set(0,-12.62,7);interpreted.add(eb);
 for(const [m,gs] of buckets){const standard=gs.map(g=>{g.deleteAttribute('uv1');if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!g.attributes.normal)g.computeVertexNormals();return g;});const g=mergeGeometries(standard,false);const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 interpreted.visible=false;group.add(interpreted);return {group,interpreted};
}

