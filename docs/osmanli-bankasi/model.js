import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Two dated interpretations of one lost building. The 1934 alteration removed
// the Koza-facing dome and stairs and added the Art Deco street entrance.
export function createBuilding(D,era='bank'){
 const club=era==='club';
 const group=new T.Group(),interpreted=new T.Group(),buckets=new Map();
 const plaster=new T.MeshStandardMaterial({color:'#d5d2c2',roughness:.94,side:T.DoubleSide});
 const ivory=new T.MeshStandardMaterial({color:'#e5e0cf',roughness:.9,side:T.DoubleSide});
 const trim=new T.MeshStandardMaterial({color:'#bdb9a7',roughness:.92,side:T.DoubleSide});
 const stone=new T.MeshStandardMaterial({color:'#b2aa95',roughness:.96,side:T.DoubleSide});
 const darkStone=new T.MeshStandardMaterial({color:'#8b8778',roughness:.97,side:T.DoubleSide});
 const roofMat=new T.MeshStandardMaterial({color:'#777d75',roughness:.92,side:T.DoubleSide});
 const tile=new T.MeshStandardMaterial({color:'#827b6e',roughness:.98,side:T.DoubleSide});
 const glass=new T.MeshStandardMaterial({color:'#354f50',metalness:.12,roughness:.44,side:T.DoubleSide});
 const shadow=new T.MeshStandardMaterial({color:'#253330',roughness:.94,side:T.DoubleSide});
 const iron=new T.MeshStandardMaterial({color:'#404641',metalness:.28,roughness:.72,side:T.DoubleSide});
 const amber=new T.MeshStandardMaterial({color:'#c68a50',transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide});

 function add(geometry,material,pos=[0,0,0],rot=[0,0,0]){
  const t=new T.Object3D();t.position.set(...pos);t.rotation.set(...rot);t.updateMatrix();geometry.applyMatrix4(t.matrix);
  if(!geometry.attributes.normal)geometry.computeVertexNormals();
  if(!geometry.attributes.uv)geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
  if(geometry.index)geometry=geometry.toNonIndexed();
  if(!buckets.has(material))buckets.set(material,[]);buckets.get(material).push(geometry);
 }
 function box(x,y,z,w,d,h,m=plaster){add(new T.BoxGeometry(w,d,h),m,[x,y,z]);}
 function line(x1,y1,z1,x2,y2,z2,r,mat=trim){const a=new T.Vector3(x1,y1,z1),b=new T.Vector3(x2,y2,z2),d=b.clone().sub(a);const mesh=new T.CylinderGeometry(r,r,d.length(),6);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());mesh.applyQuaternion(q);add(mesh,mat,a.add(b).multiplyScalar(.5).toArray());}
 function sheet(points,mat){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();add(g,mat);}
 function faceShape(shape,x,y,z,mat){add(new T.ShapeGeometry(shape),mat,[x,y,z],[Math.PI/2,0,0]);}
 function label(text,x,y,z,w,h,color='#435047',size=130){const cv=document.createElement('canvas');cv.width=2048;cv.height=256;const c=cv.getContext('2d');c.clearRect(0,0,2048,256);c.fillStyle=color;c.font=`600 ${size}px Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,1024,132);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});add(new T.PlaneGeometry(w,h).scale(-1,1,1),mat,[x,y,z],[Math.PI/2,0,0]);}

 // The street wing's volume is estimated in both states. Its detailed facade
 // is documented only after the 1934 alteration.
 box(0,-6.25,3.24,18.5,8.5,6.48,plaster);
 if(!club){
 box(0,-10.53,.48,18.5,.13,.96,stone);
 for(const x of [-9.05,-3.2,3.2,9.05])box(x,-10.63,6.77,.35,.54,x===-9.05||x===9.05?1.5:1.2,ivory);
 for(const x of [-6.15,0,6.15])box(x,-10.66,6.43,x===0?5.7:5.5,.24,.35,ivory);
 box(0,-10.71,7.27,5.8,.54,.2,ivory);
 for(const x of [-9.15,-3.18,3.18,9.15])box(x,-10.79,3.52,.29,.23,6.92,ivory);
 // Repeated Art Deco portal frames and a dark recessed double door.
 for(let k=0;k<4;k++){
  const w=5.65-k*.47,top=6.45-k*.38,th=.11;
  for(const s of [-1,1])box(s*w/2,-10.84-k*.06,top/2,.12,.13,top,ivory);
  box(0,-10.84-k*.06,top,w,.13,th,ivory);
 }
 box(0,-10.86,2.02,2.45,.07,4.04,shadow);
 for(const x of [-1.05,0,1.05])box(x,-10.94,1.96,.055,.1,3.72,iron);
 for(const z of [.44,3.45])box(0,-10.95,z,2.5,.09,.055,iron);
 label('OSMANLI BANKASI',0,-10.99,4.79,2.3,.27,'#35423d',130);
 // Street-window bars are visible, but individual spacing is interpretive.
 for(const cx of [-6.05,6.05]){
  box(cx,-10.69,2.42,3.42,.06,3.15,shadow);
  box(cx,-10.76,2.42,3.1,.045,2.9,glass);
  for(const dx of [-1.15,-.38,.38,1.15])box(cx+dx,-10.85,2.42,.075,.08,3.1,iron);
  for(const z of [1.15,2.25,3.35])box(cx,-10.86,z,3.16,.085,.075,iron);
  box(cx,-10.82,4.17,3.72,.28,.22,ivory);
  box(cx,-10.82,.83,3.72,.28,.24,stone);
 }
 }
 // Roof behind the low street front: coarse hipped mass, without invented tile texture.
 const sy=-6.25,zE=6.65,zR=8.3;
 sheet([[ -9.3,-10.7,zE],[-6.8,sy,zR],[6.8,sy,zR],[-9.3,-10.7,zE],[6.8,sy,zR],[9.3,-10.7,zE],[-9.3,-1.8,zE],[9.3,-1.8,zE],[6.8,sy,zR],[-9.3,-1.8,zE],[6.8,sy,zR],[-6.8,sy,zR],[-9.3,-10.7,zE],[-9.3,-1.8,zE],[-6.8,sy,zR],[9.3,-10.7,zE],[6.8,sy,zR],[9.3,-1.8,zE]],tile);
 // Central link and older Koza Han-facing wing: footprint and heights are estimates.
 box(0,-.5,2.65,6,3,5.3,plaster);
 box(0,8,5.35,17,14,10.7,plaster);
 box(0,8,2.1,17.25,14.2,4.2,stone);
 box(0,8,4.27,17.5,14.3,.22,darkStone);
 box(0,8,10.62,17.8,14.3,.24,stone);
 // Staggered rustication bands on the photographed Koza-facing wall.
 for(const z of [.65,1.34,2.05,2.77,3.5,4.19])box(0,15.13,z,17.1,.11,.065,darkStone);
 for(const x of [-8.35,-3.35,3.35,8.35])box(x,15.19,7.49,.38,.3,6.35,ivory);
 for(const z of [4.65,9.62,10.34])box(0,15.19,z,17.15,.3,.18,trim);
 for(let i=0;i<36;i++)box(-8.33+i*.476,15.23,10.58,.2,.31,.18,ivory);

 function lancet(cx,y,z0,w,h,front=1){
  const pointed=(width,height)=>{const s=new T.Shape();s.moveTo(-width/2,0);s.lineTo(width/2,0);s.lineTo(width/2,height-.55);s.lineTo(0,height);s.lineTo(-width/2,height-.55);s.closePath();return s;};
  const outerY=y+front*.16,glassY=y+front*.19;
  faceShape(pointed(w+.2,h+.19),cx,outerY,z0-.09,ivory);
  faceShape(pointed(w,h),cx,glassY,z0,glass);
  box(cx,glassY+front*.03,z0+.06,w+.25,.055,.12,stone);
  for(const side of [-1,1])box(cx+side*(w/2+.06),outerY+front*.03,z0+(h-.5)/2,.08,.08,h-.5,stone);
 }
 // Three narrow neo-Gothic lancets per side, as in the 1930 archive photograph.
 for(const bay of [-5.8,5.8]){
  box(bay,15.15,7.14,3.9,.24,4.16,trim);
  for(const delta of [-1.03,0,1.03])lancet(bay+delta,15.31,5.62,.72,2.9);
  box(bay,15.41,5.42,3.85,.4,.27,stone);
  for(const delta of [-1.05,0,1.05]){
   box(bay+delta,15.26,2.56,.67,.07,2.7,shadow);
   box(bay+delta,15.3,2.56,.52,.07,2.47,glass);
   box(bay+delta,15.35,2.57,.06,.08,2.53,iron);
  }
 }
 // The central pointed porch, staircase and dome survive in the 1930 image.
 if(club){
 box(0,15.25,7.75,5.7,.38,6.0,stone);
 const archBack=new T.Shape();archBack.moveTo(-2.3,0);archBack.lineTo(2.3,0);archBack.lineTo(2.3,4.65);archBack.lineTo(0,6.55);archBack.lineTo(-2.3,4.65);archBack.closePath();
 faceShape(archBack,0,15.49,4.0,ivory);
 const inner=new T.Shape();inner.moveTo(-1.66,0);inner.lineTo(1.66,0);inner.lineTo(1.66,4.1);inner.lineTo(0,5.7);inner.lineTo(-1.66,4.1);inner.closePath();
 faceShape(inner,0,15.53,4.0,shadow);
 for(const x of [-1.83,1.83])box(x,15.57,6.4,.18,.2,4.7,ivory);
 box(0,15.64,5.33,2.25,.1,2.55,glass);
 box(0,15.7,5.35,.09,.12,2.45,iron);
 // The upper landing meets the raised door; each tread descends away from it.
 const landingTop=4,landingEdge=16.55,tread=.42,riser=landingTop/12;
 box(0,16.05,landingTop/2,5.05,1,landingTop,stone);
 for(let i=0;i<11;i++){
  const top=landingTop-(i+1)*riser;
  box(0,landingEdge+(i+.5)*tread,top/2,5.05,tread,top,stone);
 }
 for(const x of [-2.3,2.3])line(x,15.72,4.46,x,landingEdge+11*tread,.72,.05,iron);

 // Square drum and onion dome, traced from the archival front photograph.
 box(0,10.0,11.55,6.7,6.7,2.2,ivory);
 for(const x of [-3.15,3.15])for(const y of [6.95,13.05])box(x,y,11.35,.28,.28,2.1,stone);
 const domeProfile=[[0,0],[1.15,.25],[2.38,1.0],[3.05,2.1],[3.32,3.25],[3.23,4.24],[2.76,5.04],[1.9,5.86],[.85,6.58],[.22,7.02],[0,7.17]].map(p=>new T.Vector2(...p));
 add(new T.LatheGeometry(domeProfile,32),roofMat,[0,10,12.55],[Math.PI/2,0,0]);
 for(let j=0;j<16;j++){const theta=j*Math.PI/8;for(const [radius,z] of [[3.22,15.75],[2.76,17.45]]){
  const x=radius*Math.cos(theta),y=10+radius*Math.sin(theta);add(new T.SphereGeometry(.043,5,4),darkStone,[x,y,z]);
 }}
 box(0,10,19.73,.09,.09,.55,iron);add(new T.SphereGeometry(.13,8,6),iron,[0,10,20.05]);
 }else{
  // The exact post-1934 shopfront is unknown; its glazing and chimney are
  // conservative shapes representing the documented change, not a survey.
  box(0,15.25,5.45,5.7,.35,10.4,plaster);
  box(0,15.47,2.1,4.25,.1,3.72,shadow);
  box(0,15.52,2.1,3.75,.1,3.5,glass);
  for(const x of [-1.85,0,1.85])box(x,15.59,2.1,.095,.1,3.55,iron);
  box(0,15.61,4.02,4.42,.19,.2,stone);
  box(0,15.61,.25,4.42,.19,.34,stone);
  box(0,10.4,11.23,1.5,1.5,1.18,roofMat);
 }
 // Side faces are intentionally quiet, because no orthographic survey survives.
 for(const side of [-1,1])for(const y of [3.4,7.2,11])for(const z of [2.15,6.5]){
  box(side*8.62,y,z,.055,.83,1.4,glass);box(side*8.69,y,z,.065,1.04,.08,stone);
 }
 // Amber overlay explicitly marks estimated roofs and unobserved connecting plan.
 const hint1=new T.Mesh(new T.BoxGeometry(6.05,3.05,5.4),amber);hint1.position.set(0,-.5,2.7);interpreted.add(hint1);
 const hint2=new T.Mesh(new T.BoxGeometry(17.9,14.9,.12),amber);hint2.position.set(0,8,10.9);interpreted.add(hint2);
 if(club){const unknownStreet=new T.Mesh(new T.BoxGeometry(18.6,.12,6.5),amber);unknownStreet.position.set(0,-10.56,3.25);interpreted.add(unknownStreet);}
 for(const [mat,parts] of buckets){const merged=mergeGeometries(parts,false);if(!merged)throw new Error('Geometry merge failed');const mesh=new T.Mesh(merged,mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 interpreted.visible=false;group.add(interpreted);
 return {group,interpreted};
}
