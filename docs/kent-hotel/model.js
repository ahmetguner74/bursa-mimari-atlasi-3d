import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Source eave outline and heights are DGN-derived. All facade module sizes are visual estimates.
export function createBuilding(D){
 const group=new T.Group(), interpreted=new T.Group(), buckets=new Map();
 const panel=new T.MeshStandardMaterial({color:'#687d74',roughness:.82,side:T.DoubleSide});
 const band=new T.MeshStandardMaterial({color:'#76887b',roughness:.86});
 const lip=new T.MeshStandardMaterial({color:'#a5aa97',roughness:.91});
 const shadow=new T.MeshStandardMaterial({color:'#263b3a',roughness:.98,side:T.DoubleSide});
 const glass=new T.MeshStandardMaterial({color:'#466278',metalness:.35,roughness:.22});
 const glassAlt=new T.MeshStandardMaterial({color:'#647c84',metalness:.27,roughness:.3});
 const frame=new T.MeshStandardMaterial({color:'#684b3a',roughness:.58});
 const curtain=new T.MeshStandardMaterial({color:'#c6cad0',roughness:.92});
 const stone=new T.MeshStandardMaterial({color:'#b5b2a6',roughness:.92});
 const darkStone=new T.MeshStandardMaterial({color:'#777b70',roughness:.9});
 const wood=new T.MeshStandardMaterial({color:'#493a31',roughness:.88});
 const red=new T.MeshStandardMaterial({color:'#a84d43',roughness:.9});
 const metal=new T.MeshStandardMaterial({color:'#404a48',metalness:.45,roughness:.48});
 const leaf=new T.MeshStandardMaterial({color:'#6b8062',roughness:1});
 const amber=new T.MeshStandardMaterial({color:'#d69950',transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide});

 function add(geometry,material,pos=[0,0,0],rot=[0,0,0]){
  const temp=new T.Object3D();temp.position.set(...pos);temp.rotation.set(...rot);temp.updateMatrix();geometry.applyMatrix4(temp.matrix);
  if(!geometry.attributes.normal)geometry.computeVertexNormals();
  if(!geometry.attributes.uv)geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
  if(geometry.index)geometry=geometry.toNonIndexed();
  if(!buckets.has(material))buckets.set(material,[]);buckets.get(material).push(geometry);
 }
 function box(x,y,z,w,d,h,m=panel){add(new T.BoxGeometry(w,d,h),m,[x,y,z]);}
 function sign(text,x,y,z,w,h,color='#e9ece8',size=108){
  const cv=document.createElement('canvas');cv.width=2048;cv.height=256;
  const c=cv.getContext('2d');c.clearRect(0,0,2048,256);c.fillStyle=color;c.font=`500 ${size}px Arial, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,1024,134);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});
  add(new T.PlaneGeometry(w,h).scale(-1,1,1),mat,[x,y,z],[Math.PI/2,0,0]);
 }

 // 1146 is the upper hotel block; 1148 is its shallow street-level shop/terrace.
 const shell=new T.BufferGeometry();shell.setAttribute('position',new T.Float32BufferAttribute(D.sourceMesh.flat(),3));shell.computeVertexNormals();add(shell,panel);
 const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute(D.roof.flat(2),3));roof.computeVertexNormals();roof.translate(0,0,.025);add(roof,darkStone);
 const podiumShell=new T.BufferGeometry();podiumShell.setAttribute('position',new T.Float32BufferAttribute(D.podiumMesh.flat(),3));podiumShell.computeVertexNormals();add(podiumShell,stone);
 const W=D.width,U=D.upperWidth,H=D.facadeHeight,Y=D.upperFrontY,X=.48814;
 const upperBox=(x,y,z,w,d,h,m=panel)=>box(x+X,y+Y,z,w,d,h,m);
 const upperSign=(s,x,y,z,w,h,c,size)=>sign(s,x+X,y+Y,z,w,h,c,size);

 // North street facade: muted green spandrels, continuous glazing and brown mullions.
 upperBox(0,.11,(H+4.6)/2,U-.08,.22,H-4.6,shadow);
 for(const z of [6.45,9.75,13.05,16.35,19.65,24.25])upperBox(0,.28,z,U,.39,.9,band);
 for(const z of [6.14,9.44,12.74,16.04,19.34,23.99])upperBox(0,.38,z,U+.22,.52,.095,lip);
 const rowBottoms=[6.9,10.2,13.5,16.8,20.1];
 const count=9, bay=(U-.52)/count;
 rowBottoms.forEach((bottom,row)=>{
  for(let i=0;i<count;i++){
   const x=-U/2+.26+bay*(i+.5),ww=bay-.11,hh=row===4?2.03:1.93;
   upperBox(x,.35,bottom+hh/2,ww,.075,hh,(i+row)%4===0?glassAlt:glass);
   upperBox(x-ww/2,.425,bottom+hh/2,.065,.09,hh,frame);
   upperBox(x+ww/2,.425,bottom+hh/2,.065,.09,hh,frame);
   upperBox(x,.43,bottom,.92*ww,.095,.055,frame);
   upperBox(x,.43,bottom+hh,.92*ww,.095,.055,frame);
   upperBox(x+ww*.18,.45,bottom+hh/2,.052,.095,hh,frame);
   if((i+row*2)%5===1)upperBox(x-ww*.29,.39,bottom+hh/2,ww*.19,.035,hh*.84,curtain);
  }
 });
 upperBox(0,.24,24.62,U+.35,.8,.46,lip);
 upperBox(0,-.35,24.5,U,.24,.18,darkStone);
 // Separate upper sign is original typography, not a photographic decal.
 upperSign('K E N T   H O T E L',0,.72,23.1,U*.76,.77,'#e0e2d5',195);

 // Ground-floor retail frontage with a deep, shaded public-facing arcade.
 box(0,.18,1.68,W,.25,3.36,stone);
 const shops=[[-7.35,3.15],[-1.64,7.85],[6.45,5.95]];
 shops.forEach(([x,w],k)=>{
  box(x,.38,1.74,w,.075,2.84,k===2?glass:glassAlt);
  for(const dx of [-w/2,0,w/2])box(x+dx,.49,1.74,.1,.19,3.02,darkStone);
  box(x,.48,.33,w,.18,.1,metal);box(x,.48,3.13,w,.18,.1,metal);
  if(k!==2){box(x+.04,.53,1.65,.1,.08,2.45,metal);box(x+.47,.56,1.45,.08,.08,.12,metal);}
 });
 for(const x of [-W/2+.2,-5.35,2.28,W/2-.18])box(x,.67,2.27,.47,.67,4.54,stone);
 box(0,.62,3.74,W+.5,1.35,.2,darkStone);
 box(0,1.07,4.08,W+.45,.32,.95,wood);
 sign('KENT HOTEL',-7.28,1.27,4.08,3.15,.62,'#e9e9df',195);
 sign("COLIN'S",-1.5,1.27,4.08,5.7,.65,'#f0ece2',205);
 sign('simit sarayı',6.14,1.27,4.08,5.35,.7,'#f15850',205);
 sign('KENT HOTEL',-7.35,.6,2.97,2.3,.23,'#d5d7cc',105);

 // Restaurant terrace, red fabric awning and planter line shown in supplied views.
 box(0,-3.6,5.45,W,.22,1.7,shadow);
 box(0,-2.0,5.93,W+.7,3.8,.11,red);
 box(0,-.06,5.78,W+.7,.11,.35,red);
 box(0,.94,4.87,W+.55,.35,.29,wood);
 for(let k=0;k<6;k++)box(-W/2+.4+k*(W-.8)/5,-.06,5.28,.09,.12,1.22,metal);
 for(let k=0;k<18;k++){
  const x=-W/2+.28+k*(W-.56)/17;
  add(new T.IcosahedronGeometry(.19,0),leaf,[x,.94,5.1]);
 }
 box(0,.19,6.37,W+.35,.66,.2,lip);

 // Modest openings on the slanted east side; placement is interpretive.
 const sideA=[9.70131,-7.51036],sideB=[9.86765,-29.51357];
 const sdx=sideB[0]-sideA[0],sdy=sideB[1]-sideA[1],slen=Math.hypot(sdx,sdy);
 const tx=sdx/slen,ty=sdy/slen,nx=-ty,ny=tx,angle=Math.atan2(sdy,sdx);
 function sideBox(t,z,w,h,offset,mat){const x=sideA[0]+sdx*t+nx*offset,y=sideA[1]+sdy*t+ny*offset;add(new T.BoxGeometry(w,.08,h),mat,[x,y,z],[0,0,angle]);}
 for(const t of [.12,.25,.38,.51])for(const z of [7.9,10.7,13.5,16.3,19.1]){
  sideBox(t,z,1.22,1.5,.19,glassAlt);
  sideBox(t,z+.77,1.34,.065,.27,frame);
  sideBox(t,z-.77,1.34,.065,.27,frame);
  sideBox(t,z,.045,1.52,.27,frame);
 }

 // Roof and rear geometry are marked separately because these views lack facade evidence.
 const roofHint=roof.clone();roofHint.translate(0,0,.09);interpreted.add(new T.Mesh(roofHint,amber));
 const rearHint=new T.Mesh(new T.BoxGeometry(U*.82,.12,13),amber);rearHint.position.set(0,-29,10);interpreted.add(rearHint);

 for(const [mat,items] of buckets){
  const merged=mergeGeometries(items,false);if(!merged)throw new Error('Geometry merge failed');
  const mesh=new T.Mesh(merged,mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 }
 interpreted.visible=false;group.add(interpreted);
 return {group,interpreted};
}
