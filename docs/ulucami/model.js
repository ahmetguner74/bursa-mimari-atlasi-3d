import * as T from 'three';

// M5 supplies the footprint, roof top and two minaret symbol anchors.
// Architectural surfaces and the fountain are explicitly interpretive.
export function createBuilding(D) {
  const group=new T.Group(); group.name='Bursa Ulu Cami ve Çinili Çeşme';
  const sourceCore=new T.Group(); sourceCore.name='M5 ölçülü oturum'; group.add(sourceCore);
  const interpreted=new T.Group(); interpreted.name='Mimari yorum'; group.add(interpreted);
  const fountainGroup=new T.Group(); fountainGroup.name='Mecidiye Çinili Çeşme · 1994 yeniden yapım'; interpreted.add(fountainGroup);
  const markerGroup=new T.Group(); markerGroup.name='Kaynak konum işaretleri'; markerGroup.visible=false; group.add(markerGroup);
  const mat=(color,roughness=1,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const stone=mat('#b9b7b0'),ashlar=mat('#cbc5b9'),light=mat('#ded9cf'),shadow=mat('#827d73');
  const darkStone=mat('#625f59'),brick=mat('#ae8d74'),brickShade=mat('#8e6d59');
  const lead=mat('#a2aaab',.74,.15),leadDark=mat('#7b8586',.72,.16),glass=mat('#333b39',.86,0);
  const glazing=new T.MeshPhysicalMaterial({color:'#91b3b5',roughness:.18,metalness:.18,transparent:true,opacity:.64,side:T.DoubleSide});
  const timber=mat('#3c3329',.83),timberLight=mat('#645140',.9),metal=mat('#8c7450',.46,.6);
  const marble=mat('#e8e2d7',.83),pink=mat('#bb9791',.88),tileBlue=mat('#386e83',.56),tilePale=mat('#d2d9cb',.72),copper=mat('#6b6655',.69,.22);
  const water=new T.MeshPhysicalMaterial({color:'#6aa9aa',roughness:.17,metalness:.08,transparent:true,opacity:.73,side:T.DoubleSide});
  // Small, deterministic colour variations break the flat CAD appearance.
  // This is generated texture, not a historical photograph.
  function grain(seed,repeat,range){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),image=ctx.createImageData(256,256);
    let state=seed>>>0;const rnd=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
    for(let i=0;i<image.data.length;i+=4){const v=Math.max(0,Math.min(255,241+(rnd()-.5)*range));image.data[i]=v;image.data[i+1]=v;image.data[i+2]=v;image.data[i+3]=255;}
    ctx.putImageData(image,0,0);
    const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeat,repeat);tex.colorSpace=T.SRGBColorSpace;return tex;
  }
  // The user photographs show irregular grey/tan ashlar, not uniform cream stone.
  // This drawn material describes the joints without reusing street-view pixels.
  function masonryTexture(){
    const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');
    q.fillStyle='#99958d';q.fillRect(0,0,512,512);
    let state=271828;const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
    const tones=['#b5b0a6','#c5beb1','#a8a7a0','#d0c5b4','#aaa69e','#bcb7ad'];
    for(let row=0;row<10;row++){
      const top=row*51.2,shift=row%2?47:0;
      for(let x=-shift;x<512;){
        const width=58+rand()*72;
        q.fillStyle=tones[Math.floor(rand()*tones.length)];q.fillRect(x+1.4,top+1.4,width-2.8,48.3);
        q.fillStyle='rgba(67,65,60,.055)';
        for(let k=0;k<36;k++)q.fillRect(x+rand()*width,top+rand()*48,1+rand()*3,1+rand()*2);
        x+=width;
      }
    }
    const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;
    tex.repeat.set(.19,.19);tex.colorSpace=T.SRGBColorSpace;return tex;
  }
  stone.map=masonryTexture();ashlar.map=grain(278,5,13);brick.map=grain(389,3,22);lead.map=grain(512,2,11);
  function add(geo,m,parent=interpreted,name=''){const o=new T.Mesh(geo,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(parent,x,y,z,w,d,h,m,name=''){const o=add(new T.BoxGeometry(w,d,h),m,parent,name);o.position.set(x,y,z);return o;}
  function cyl(parent,x,y,z,rt,rb,h,m,n=24,name=''){const o=add(new T.CylinderGeometry(rt,rb,h,n),m,parent,name);o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o;}
  function ring(parent,x,y,z,r,t,m,n=32){const o=add(new T.TorusGeometry(r,t,8,n),m,parent);o.position.set(x,y,z);return o;}
  function curve(parent,points,r,m,name=''){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*3),r,6,false),m,parent,name);}
  function engrave(parent,segments,color){const geo=new T.BufferGeometry().setFromPoints(segments.map(p=>new T.Vector3(...p)));const o=new T.LineSegments(geo,new T.LineBasicMaterial({color,transparent:true,opacity:.48}));parent.add(o);return o;}

  const h=D.surveyDerived.sourceRoofTopRelativeM;
  const outline=D.surveyDerived.sourceFootprint.map(p=>new T.Vector2(...p));
  const base=add(new T.ExtrudeGeometry(new T.Shape(outline),{depth:h,bevelEnabled:false}),stone,sourceCore,'DGN birleşik oturum / yorumlu zemin kotu');
  base.userData={sourceIds:D.identity.sourceIds,footprintExact:true,roofTopRelativeM:h,facadeHeightSurveyed:false};
  sourceCore.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(outline.map(p=>new T.Vector3(p.x,p.y,h+.04))),new T.LineBasicMaterial({color:'#756853'})));
  const W=D.surveyDerived.roofFrameWidthM,depth=D.surveyDerived.roofFrameDepthM;

  function grilleTexture(){
    const c=document.createElement('canvas');c.width=128;c.height=192;const q=c.getContext('2d');
    q.beginPath();q.moveTo(7,190);q.lineTo(7,48);q.quadraticCurveTo(9,20,64,3);
    q.quadraticCurveTo(119,20,121,48);q.lineTo(121,190);q.closePath();q.clip();
    q.fillStyle='#c8c8bb';q.fillRect(0,0,128,192);
    for(let row=0;row<20;row++)for(let col=0;col<9;col++){
      const xx=13+col*15+(row%2)*7.5,yy=17+row*10;
      q.beginPath();q.ellipse(xx,yy,4.6,3.8,0,0,Math.PI*2);q.fillStyle='#313a39';q.fill();
    }
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
  }
  const grille=new T.MeshBasicMaterial({map:grilleTexture(),transparent:true,alphaTest:.1,side:T.DoubleSide});
  function upperWindow(face,x,z,w,hh){
    box(face,x,.20,z,w,.07,hh,glass,'Üst pencere derinliği');
    const mesh=add(new T.PlaneGeometry(w,hh),grille,face,'Taş kafesli üst pencere');
    mesh.rotation.x=Math.PI/2;mesh.position.set(x,.43,z);
    box(face,x,.36,z-hh/2-.10,w+.32,.32,.20,light);
    for(const s of [-1,1])box(face,x+s*(w/2+.10),.35,z-.12,.20,.34,hh-.18,ashlar);
    curve(face,[[x-w/2-.14,.42,z+hh*.21],[x-w*.36,.42,z+hh*.38],[x,.42,z+hh*.56],[x+w*.36,.42,z+hh*.38],[x+w/2+.14,.42,z+hh*.21]],.105,light,'Üst sivri pencere kemeri');
  }
  function lowerWindow(face,x,z,w,hh){
    box(face,x,.20,z,w,.10,hh,glass,'Alt pencere derinliği');
    box(face,x,.35,z-hh/2-.13,w+.48,.32,.26,light);
    for(const s of [-1,1])box(face,x+s*(w/2+.17),.35,z,.29,.34,hh+.38,ashlar);
    for(let k=-2;k<=2;k++)box(face,x+k*w/6,.41,z,.065,.07,hh-.15,darkStone);
    for(let k=-1;k<=1;k++)box(face,x,.42,z+k*hh/4,w,.07,.06,darkStone);
    curve(face,[[x-w/2-.34,.35,z-hh*.25],[x-w/2-.34,.35,z+hh*.56],[x,.35,z+hh*.85],[x+w/2+.34,.35,z+hh*.56],[x+w/2+.34,.35,z-hh*.25]],.115,shadow,'Alt pencere niş kemeri');
    curve(face,[[x-w/2-.18,.39,z+hh*.47],[x,.39,z+hh*.70],[x+w/2+.18,.39,z+hh*.47]],.065,light);
  }
  function sidePortal(face,x){
    box(face,x,.30,3.25,4.25,.34,6.5,ashlar,'Doğu/batı yan kapı taş sövesi');
    box(face,x,.50,3.0,3.15,.13,5.75,glass,'Yan kapı karanlık açıklığı');
    box(face,x,.60,2.72,3.02,.12,5.42,timber,'Yan kapı kanatları');
    box(face,x,.68,2.72,.08,.12,5.40,timberLight);
    for(const s of [-1,1])box(face,x+s*1.83,.66,3.0,.38,.36,6.05,light);
    curve(face,[[x-2.10,.68,4.9],[x-1.82,.68,6.3],[x,.68,7.12],[x+1.82,.68,6.3],[x+2.10,.68,4.9]],.18,light,'Yan kapı sivri kemeri');
    curve(face,[[x-1.67,.71,5.0],[x,.71,6.60],[x+1.67,.71,5.0]],.12,shadow);
    box(face,x,.65,6.55,4.7,.20,.28,light);
    for(let i=0;i<2;i++)box(face,x,1.17+i*.45,.12+i*.16,5-i*.50,.90,.30,ashlar,'Yan kapı basamağı');
  }
  function portal(face,x){
    box(face,x,.46,8.6,11,1.05,17.2,marble,'Kuzey taçkapı kütlesi');
    for(const s of [-1,1]){box(face,x+s*5.24,1.04,8.5,.61,1.13,17.1,ashlar);box(face,x+s*4.57,1.08,8.5,.30,1.15,15.6,light);}
    box(face,x,1.14,4.45,5.58,.13,8.4,timber,'Ahşap çift kapı');
    box(face,x,1.22,4.4,.16,.25,8.35,timberLight);
    for(const s of [-1,1])for(let z=1.2;z<8.3;z+=1.3)box(face,x+s*1.3,1.23,z,2,.11,.14,timberLight);
    curve(face,[[x-4.55,1.09,9.4],[x-4.55,1.09,12],[x-3.65,1.09,14.55],[x,1.09,16.5],[x+3.65,1.09,14.55],[x+4.55,1.09,12],[x+4.55,1.09,9.4]],.37,light,'Mermer sivri kemer');
    curve(face,[[x-3.65,1.17,9.9],[x-3.4,1.17,12],[x,1.17,15.08],[x+3.4,1.17,12],[x+3.65,1.17,9.9]],.14,shadow);
    for(let row=0;row<4;row++)for(let k=0;k<7-row;k++){const xx=x+(k-(6-row)/2)*(.88+row*.06);box(face,xx,1.19+row*.06,10.15+row*.53,.65,.38,.30,row%2?ashlar:marble);}
    box(face,x,1.1,16.96,9.1,.16,.25,shadow);
    for(let i=0;i<4;i++)box(face,x,2.4+i*.63,.18+i*.17,11.8-i*.35,1.23,.34,marble,'Kuzey giriş basamağı');
  }
  function bayFacade(width,bays,portalIndex=-1,sideDoorIndex=-1){
    const face=new T.Group();interpreted.add(face);
    const joints=[];
    for(let z=.52;z<h;z+=.59){joints.push([-width/2,.065,z],[width/2,.065,z]);for(let x=-width/2+((Math.round(z/.59)%2)?1.1:.45);x<width/2;x+=1.64)joints.push([x,.068,z],[x,.068,Math.min(h,z+.56)]);}
    engrave(face,joints,'#827969');
    box(face,0,.19,.48,width,.34,.96,ashlar);
    box(face,0,.2,h-.38,width,.38,.76,light);
    box(face,0,.24,h+.02,width,.48,.18,darkStone);
    const span=width/bays;
    for(let i=0;i<bays;i++){
      const x=-width/2+(i+.5)*span;
      if(i===portalIndex){const p=new T.Group();p.position.y=1.78;face.add(p);portal(p,x);continue;}
      const aw=Math.min(span*.74,10.7),spring=11.7,peak=15.8;
      curve(face,[[x-aw/2,.23,2.15],[x-aw/2,.23,spring],[x-aw*.37,.23,13.7],[x,.23,peak],[x+aw*.37,.23,13.7],[x+aw/2,.23,spring],[x+aw/2,.23,2.15]],.16,shadow,'Sivri kör kemer');
      curve(face,[[x-aw/2+.43,.29,3.2],[x-aw/2+.43,.29,spring],[x,.29,peak-.72],[x+aw/2-.43,.29,spring],[x+aw/2-.43,.29,3.2]],.07,light);
      box(face,x,.25,2.05,aw+.2,.54,.45,light);
      const offset=span*.18;
      for(const dx of [-offset,offset])upperWindow(face,x+dx,11.78,1.88,3.28);
      if(i===sideDoorIndex)sidePortal(face,x);
      else for(const dx of [-offset,offset])lowerWindow(face,x+dx,3.24,2.12,2.60);
    }
    return face;
  }
  const north=bayFacade(W,5,2);north.position.y=27.45;
  const south=bayFacade(W,5);south.position.y=-29.08;south.rotation.z=Math.PI;
  // East photograph: the side entrance is in the bay nearest the NE minaret.
  // West entrance is kept interpretive pending an equally direct street view.
  const east=bayFacade(depth,4,-1,0);east.position.x=34.79;east.rotation.z=-Math.PI/2;
  const west=bayFacade(depth,4,-1,1);west.position.x=-34.78;west.rotation.z=Math.PI/2;

  // The aerial photographs show lead sheeting between the twenty domes and
  // pale polygonal drums with small ventilating openings.
  box(interpreted,0,0,h+.075,W-.72,depth-.72,.15,leadDark,'Kubbeler arası kurşun çatı');
  const domeR=5.70,drumH=1.35,rise=4.15;
  for(let row=0;row<4;row++)for(let col=0;col<5;col++){
    const x=-W/2+(col+.5)*W/5,y=depth/2-(row+.5)*depth/4,skylight=col===2&&row===1;
    cyl(interpreted,x,y,h+.48,6.08,6.25,.96,lead,8,'Kubbe alt kasnağı');
    cyl(interpreted,x,y,h+drumH/2,domeR,domeR,drumH,ashlar,8,'Sekizgen kubbe kasnağı');
    for(let k=0;k<8;k++){
      const a=(k+.5)*Math.PI/4,vent=box(interpreted,x+(domeR+.025)*Math.cos(a),y+(domeR+.025)*Math.sin(a),h+.80,.52,.05,.62,glass,'Kasnak kafesli menfezi');
      vent.rotation.z=a-Math.PI/2;
      const sill=box(interpreted,x+(domeR+.075)*Math.cos(a),y+(domeR+.075)*Math.sin(a),h+.46,.68,.12,.08,light);
      sill.rotation.z=a-Math.PI/2;
    }
    ring(interpreted,x,y,h+drumH,domeR,.16,light,48);
    const dome=add(new T.SphereGeometry(domeR,40,20,0,Math.PI*2,0,Math.PI/2),skylight?glazing:lead,interpreted,skylight?'Camlı kubbe':'Kurşun kaplı kubbe');
    dome.rotation.x=Math.PI/2;dome.scale.y=rise/domeR;dome.position.set(x,y,h+drumH);
    for(let k=0;k<12;k++){
      const a=k*Math.PI/6,pts=[];
      for(let j=0;j<=12;j++){const t=(.04+j/12*.95)*Math.PI/2;pts.push([x+domeR*Math.sin(t)*Math.cos(a),y+domeR*Math.sin(t)*Math.sin(a),h+drumH+rise*Math.cos(t)+.065]);}
      curve(interpreted,pts,.039,leadDark);
    }
    if(skylight){for(let t=1;t<4;t++){const q=t/4*Math.PI/2;ring(interpreted,x,y,h+drumH+rise*Math.cos(q)+.06,domeR*Math.sin(q),.047,leadDark,48);}}
    else{cyl(interpreted,x,y,h+drumH+rise+.16,.08,.13,.32,metal,12);const bead=add(new T.SphereGeometry(.15,10,8),metal);bead.position.set(x,y,h+drumH+rise+.43);}
  }

  for(let mi=0;mi<D.surveyDerived.minaretSymbols.length;mi++){
    const [x,y]=D.surveyDerived.minaretSymbols[mi].xy,tip=mi===0?50.4:49.8;
    cyl(interpreted,x,y,2.90,1.83,2.79,5.80,ashlar,8,'Minare çokgen taş kaidesi');
    cyl(interpreted,x,y,.21,2.91,2.91,.42,shadow,8,'Minare kaide eteği');
    cyl(interpreted,x,y,6.28,1.61,1.91,1.36,light,8);
    cyl(interpreted,x,y,22.8,1.31,1.52,31.5,brick,32,'Tuğla minare gövdesi');
    const courses=[];for(let z=7.3;z<38;z+=.62)for(let j=0;j<32;j++){const a=j*Math.PI/16,b=(j+1)*Math.PI/16,r=1.5-(z-7.3)/31*.19;courses.push([x+r*Math.cos(a),y+r*Math.sin(a),z],[x+r*Math.cos(b),y+r*Math.sin(b),z]);}
    engrave(interpreted,courses,'#754b3e');
    cyl(interpreted,x,y,38.6,1.78,1.39,1.2,brickShade,24,'Şerefe mukarnas kuşağı');
    for(let tier=0;tier<3;tier++)for(let k=0;k<24;k++){
      const a=k*Math.PI/12,r=1.52+tier*.12;
      const corbel=box(interpreted,x+r*Math.cos(a),y+r*Math.sin(a),38.12+tier*.31,.20,.32,.24,tier%2?brick:brickShade,'Şerefe taş/tuğla çıkması');
      corbel.rotation.z=a-Math.PI/2;
    }
    cyl(interpreted,x,y,39.4,2.05,2.05,.35,marble,32);
    for(let k=0;k<16;k++){const a=k*Math.PI/8;box(interpreted,x+1.84*Math.cos(a),y+1.84*Math.sin(a),40.1,.20,.20,1.15,light);}
    ring(interpreted,x,y,40.65,1.84,.11,marble,48);
    cyl(interpreted,x,y,42.1,1.12,1.20,3.2,brick,28);
    ring(interpreted,x,y,43.73,1.16,.10,light,32);
    // Both supplied minaret photos end in stacked pale stone bulbs, not cones.
    cyl(interpreted,x,y,44.02,1.17,1.08,.48,light,24,'Taş külah alt bileziği');
    const lowerBulb=add(new T.SphereGeometry(1.11,24,16),light,interpreted,'Minare alt taş boğumu');
    lowerBulb.position.set(x,y,45.06);lowerBulb.scale.z=1.05;
    ring(interpreted,x,y,46.04,.72,.10,shadow,28);
    const upperBulb=add(new T.SphereGeometry(.79,24,16),light,interpreted,'Minare üst taş boğumu');
    upperBulb.position.set(x,y,46.86);upperBulb.scale.z=1.18;
    ring(interpreted,x,y,47.65,.57,.07,shadow,28);
    const crown=add(new T.SphereGeometry(.43,20,12),light,interpreted,'Minare taş tepelik');
    crown.position.set(x,y,48.08);crown.scale.z=1.25;
    cyl(interpreted,x,y,(tip+48.45)/2,.04,.04,tip-48.45,metal,10,'Minare alem mili');
    const fin=add(new T.SphereGeometry(.18,10,8),metal);fin.position.set(x,y,tip);
  }

  // The fountain model is the extant 1994 reconstruction, not a measured 1903 original.
  const [fx,fy]=D.fountain.modelCentreLocal;fountainGroup.position.set(fx,fy,0);
  box(fountainGroup,0,0,.22,5.2,5.2,.44,ashlar,'Çeşme taş platformu');
  box(fountainGroup,0,0,.53,4,4,.52,marble,'Dört yüzlü çeşme kaidesi');
  box(fountainGroup,0,0,1.7,3.12,3.12,2.18,marble,'Çeşme merkezi');
  for(let a=0;a<4;a++){
    const face=new T.Group();face.rotation.z=a*Math.PI/2;fountainGroup.add(face);
    box(face,0,1.62,2.02,2.65,.10,1.33,tileBlue,'Kütahya çinili ayna');
    for(let iz=0;iz<3;iz++)for(let ix=-2;ix<=2;ix++){
      const tx=ix*.42+(iz%2)*.18,tz=1.62+iz*.34;
      const motif=box(face,tx,1.71,tz,.13,.03,.13,tilePale,'Çini motif yorumu');motif.rotation.y=Math.PI/4;
    }
    for(const s of [-1,1]){box(face,s*1.10,1.71,2.02,.23,.14,1.22,tilePale);for(let z=1.55;z<2.50;z+=.31)box(face,s*1.1,1.79,z,.20,.035,.045,tileBlue);}
    box(face,0,1.76,2.39,1.45,.12,.47,marble,'Kitabe panosu yorumu');
    box(face,0,1.77,1.53,.20,.19,.14,metal,'Musluk');
    if(a!==1){box(face,0,2.12,.91,2.45,.95,.43,marble,'Mermer yalak');box(face,0,2.14,1.12,2.12,.76,.04,water);for(const s of [-1,1])box(face,s*.94,2.11,.72,.23,.92,.74,marble);}
    else box(face,0,1.75,1.92,.82,.12,1.12,timber,'Doğu bakım kapağı');
    for(const s of [-1,1]){cyl(face,s*1.68,1.67,2.11,.17,.17,2.65,s===1?pink:marble,10);box(face,s*1.68,1.67,3.48,.50,.52,.28,pink);}
    box(face,0,1.62,3.30,3.88,.38,.33,timber);
    for(let k=-1;k<=1;k++)box(face,k,1.85,3.30,.09,.12,.10,metal);
  }
  for(const x of [-1.7,1.7])for(const y of [-1.7,1.7]){box(fountainGroup,x,y,3.24,.25,.25,1.02,timber);curve(fountainGroup,[[x,y,3.53],[x*1.10,y*1.10,3.87],[x*1.33,y*1.33,4.05]],.11,timber);}
  box(fountainGroup,0,0,4.03,5.85,5.85,.20,timber);
  const roofVertices=[];const corners=[[-2.93,-2.93],[2.93,-2.93],[2.93,2.93],[-2.93,2.93]];
  for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];roofVertices.push(a[0],a[1],4.12,b[0],b[1],4.12,0,0,4.81);}
  const roofGeo=new T.BufferGeometry();roofGeo.setAttribute('position',new T.Float32BufferAttribute(roofVertices,3));roofGeo.computeVertexNormals();
  const roof=add(roofGeo,copper,fountainGroup,'Bakır kaplı dört eğimli saçak');roof.material.side=T.DoubleSide;
  box(fountainGroup,0,0,4.08,6.15,.13,.13,metal);box(fountainGroup,0,0,4.08,.13,6.15,.13,metal);
  cyl(fountainGroup,0,0,4.91,.11,.16,.35,metal,12);
  for(const item of D.surveyDerived.minaretSymbols){const [x,y]=item.xy;ring(markerGroup,x,y,.14,2.35,.10,metal);}
  ring(markerGroup,D.fountain.markerLocal[0],D.fountain.markerLocal[1],.16,1.25,.11,tileBlue);
  return {group,sourceCore,interpreted,fountainGroup,markerGroup};
}
