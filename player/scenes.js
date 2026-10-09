// Scene renderers for "Codex Computer use". Each returns SVG markup for the 1728x610 visual area as a
// pure function of (scene, time, variant). Main style: isometric models; auxiliary: blueprint cutaway panels.
// Custom geometry is pushed to B for the automated overlap check (same overlapGroup = intentional layering).
const C={ink:'#2a2420',sub:'#5d5248',muted:'#9a8d80',paper:'#fffdf9',line:'#e3dccf',codex:'#5a4bf0',codexL:'#e6e3ff',green:'#1f8a5b',greenL:'#d9f0e3',amber:'#c47f12',amberL:'#fbeed4',red:'#d0453a',redL:'#fbe2df',bp:'#163a5f',bpL:'#2c5b88',bpLine:'#cfe3f7',
 deskT:'#e9cfa6',deskL:'#c9a46f',deskR:'#b48d58',metalT:'#d9dde6',metalL:'#b7bdca',metalR:'#9ca3b3',screen:'#1f2430'};
const clamp=x=>Math.min(1,Math.max(0,x)),lerp=(a,b,u)=>a+(b-a)*u;
const E={out:x=>1-Math.pow(1-clamp(x),3),inout:x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},back:x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function attrs(a){return Object.entries(a).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')}
const S={rect:a=>'<rect '+attrs(a)+'/>',text:(x,y,s,a={})=>'<text '+attrs({x,y,...a})+'>'+esc(s)+'</text>',g:(a,inner)=>'<g '+attrs(a)+'>'+inner+'</g>',path:a=>'<path '+attrs(a)+'/>',circle:a=>'<circle '+attrs(a)+'/>',line:a=>'<line '+attrs(a)+'/>',poly:(pts,a)=>'<polygon '+attrs({points:pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),...a})+'/>'};
// phase progress 0..1; a phase the scene does not have counts as not reached
function phaser(scene,t){const map={};for(const p of scene.phases)map[p.name]=p;return n=>{const p=map[n];if(!p)return 0;return clamp((t-p.start)/(p.end-p.start))}}
const has=(s,n)=>s.phases.some(p=>p.name===n);
const tw=(s,size)=>[...String(s)].reduce((w,ch)=>w+(/[　-鿿＀-￯]/.test(ch)?size:size*.56),0);
const fit=(s,maxW,size)=>Math.min(size,size*maxW/Math.max(1,tw(s,size)));
const isEn=v=>String(v).startsWith('en');
const L=(v,zh,en)=>isEn(v)?[en,zh]:[zh,en];
const pick=(v,zh,en)=>isEn(v)?en:zh;
const fade=(u,inner,dy=10)=>u<=0?'':S.g({opacity:clamp(u),transform:`translate(0 ${((1-E.out(u))*dy).toFixed(1)})`},inner);
const pop=(cx,cy,u,inner)=>{if(u<=0)return '';const k=E.back(u);return S.g({transform:`translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`,opacity:clamp(u*2)},inner)};
// line wrap: CJK by character, Latin by word
function wrap(s,maxW,size){const out=[];let cur='';const toks=String(s).match(/[A-Za-z0-9@&.'’\-\/+]+|\s+|./g)||[];
 for(const tk of toks){if(tk.trim()===''&&!cur)continue;if(tw(cur+tk,size)>maxW&&cur){out.push(cur.trim());cur=tk.trim()===''?'':tk}else cur+=tk}if(cur.trim())out.push(cur.trim());return out}
function para(x,y,s,maxW,size,a={},lh=1.32){return wrap(s,maxW,size).map((ln,i)=>S.text(x,y+i*size*lh,ln,{'font-size':size,...a})).join('')}

// ── line icons (48 box) ──
function icon(kind,x,y,s=1,color=C.ink,sw=3){
 const st={stroke:color,'stroke-width':sw,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},P=d=>S.path({d,...st});
 const body={
  eye:P('M4 24 Q24 6 44 24 Q24 42 4 24 Z')+S.circle({cx:24,cy:24,r:7,...st})+S.circle({cx:24,cy:24,r:2.5,fill:color}),
  hand:P('M14 26 V12 Q14 9 17 9 Q20 9 20 12 V22 M20 12 V8 Q20 5 23 5 Q26 5 26 8 V22 M26 10 Q26 7 29 7 Q32 7 32 10 V23 M32 14 Q32 11 35 11 Q38 11 38 14 V30 Q38 43 26 43 Q18 43 14 36 L8 26 Q6 22 10 21 Q12 21 14 24'),
  window:P('M6 9 H42 V39 H6 Z')+P('M6 16 H42')+S.circle({cx:11,cy:12.5,r:1.2,fill:color})+S.circle({cx:15,cy:12.5,r:1.2,fill:color}),
  lock:P('M12 22 H36 V41 H12 Z')+P('M17 22 V15 Q17 8 24 8 Q31 8 31 15 V22')+S.circle({cx:24,cy:31,r:2.5,fill:color}),
  plug:P('M18 6 V15 M30 6 V15')+P('M13 15 H35 V23 Q35 33 24 33 Q13 33 13 23 Z')+P('M24 33 V43'),
  term:P('M6 9 H42 V39 H6 Z')+P('M13 19 L19 24 L13 29')+P('M23 30 H32'),
  globe:S.circle({cx:24,cy:24,r:17,...st})+P('M7 24 H41')+P('M24 7 Q14 24 24 41 Q34 24 24 7'),
  chrome:S.circle({cx:24,cy:24,r:17,...st})+S.circle({cx:24,cy:24,r:6,...st})+P('M24 18 H40 M19 27 L11 40 M29 27 L23 41'),
  cursor:S.path({d:'M14 7 V37 L22 30 L28 43 L33 41 L27 28 L37 28 Z',fill:color,stroke:'none'}),
  gear:S.circle({cx:24,cy:24,r:7,...st})+P('M24 5 V11 M24 37 V43 M5 24 H11 M37 24 H43 M10.6 10.6 L14.8 14.8 M33.2 33.2 L37.4 37.4 M10.6 37.4 L14.8 33.2 M33.2 14.8 L37.4 10.6'),
  slide:P('M6 10 H42 V36 H6 Z')+P('M12 17 H32')+P('M12 24 H36 M12 29 H28')+P('M24 36 V42 M17 42 H31'),
  bug:P('M16 18 Q16 10 24 10 Q32 10 32 18 V30 Q32 40 24 40 Q16 40 16 30 Z')+P('M24 18 V40 M16 22 H8 M32 22 H40 M16 30 H8 M32 30 H40 M19 11 L15 6 M29 11 L33 6'),
  person:S.circle({cx:24,cy:15,r:7,...st})+P('M10 42 Q10 27 24 27 Q38 27 38 42'),
  shield:P('M24 5 L40 11 V23 Q40 36 24 43 Q8 36 8 23 V11 Z'),
  card:P('M5 12 H43 V36 H5 Z')+P('M5 19 H43')+P('M10 29 H20'),
  key:S.circle({cx:15,cy:24,r:8,...st})+P('M23 24 H42 M36 24 V31 M42 24 V30'),
  user:S.circle({cx:24,cy:17,r:8,...st})+P('M9 42 Q9 29 24 29 Q39 29 39 42'),
  file:P('M13 6 H29 L37 14 V42 H13 Z')+P('M29 6 V14 H37'),
  save:P('M8 8 H34 L40 14 V40 H8 Z')+P('M15 8 V17 H31 V8')+P('M15 40 V27 H33 V40'),
  review:P('M6 9 H42 V39 H6 Z')+P('M12 17 H20 M12 24 H22 M12 31 H18')+P('M26 17 H36 M26 24 H36 M26 31 H33'),
  building:P('M10 42 V8 H30 V42 M30 18 H40 V42 M6 42 H44')+P('M16 15 H18 M22 15 H24 M16 23 H18 M22 23 H24 M16 31 H18 M22 31 H24'),
  check:P('M10 25 L20 34 L38 14'),
  cross:P('M13 13 L35 35 M35 13 L13 35'),
  warn:P('M24 6 L43 40 H5 Z')+P('M24 18 V28')+S.circle({cx:24,cy:34,r:1.8,fill:color}),
  loop:P('M38 20 A15 15 0 1 0 39 30')+P('M39 12 V21 H30'),
  monitor2:P('M4 10 H24 V26 H4 Z M24 22 H44 V38 H24 Z')
 }[kind]||'';
 return S.g({transform:`translate(${x} ${y}) scale(${s})`},body);
}
function badgeIcon(kind,cx,cy,r,fill,color='#fff'){return S.circle({cx,cy,r,fill})+icon(kind,cx-r*.62,cy-r*.62,r*1.24/48,color,3.2)}

// ── isometric projection: x runs down-right, y runs down-left, z up ──
const ISO={ox:430,oy:298,k:.72};
const P=(x,y,z=0)=>[ISO.ox+(x-y)*.866*ISO.k,ISO.oy+(x+y)*.5*ISO.k-z*ISO.k];
function withIso(cfg,fn){const keep={...ISO};Object.assign(ISO,cfg);try{return fn()}finally{Object.assign(ISO,keep)}}
function box(x,y,z,w,d,h,col,o={}){
 const top=[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)];
 const left=[P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x,y+d,z)];
 const right=[P(x+w,y,z+h),P(x+w,y+d,z+h),P(x+w,y+d,z),P(x+w,y,z)];
 const st={stroke:o.stroke||'#2a242055','stroke-width':o.sw||1.5,'stroke-linejoin':'round'};
 return S.poly(left,{fill:col[1],...st})+S.poly(right,{fill:col[2],...st})+S.poly(top,{fill:col[0],...st});
}
// screen-space iso cube; (cx,by) = front-bottom corner
function cube(cx,by,w,h,col,o={}){const a=w*.866,b=w*.5,st={stroke:o.stroke||'#2a242055','stroke-width':o.sw||1.5,'stroke-linejoin':'round'};
 return S.poly([[cx-a,by-h-b],[cx,by-h],[cx,by],[cx-a,by-b]],{fill:col[1],...st})+S.poly([[cx,by-h],[cx+a,by-h-b],[cx+a,by-b],[cx,by]],{fill:col[2],...st})+S.poly([[cx,by-h-2*b],[cx+a,by-h-b],[cx,by-h],[cx-a,by-h-b]],{fill:col[0],...st})}
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,m=c=>Math.round(Math.min(255,Math.max(0,c*f))).toString(16).padStart(2,'0');return '#'+m(r)+m(g)+m(b)};
const tri=hex=>[hex,shade(hex,.86),shade(hex,.74)];
function faceY(X,Y,Z){const [e,f]=P(X,Y,Z),k=ISO.k;return `matrix(${.866*k} ${.5*k} 0 ${k} ${e.toFixed(1)} ${f.toFixed(1)})`}
const onFaceY=(X,Y,Z,u,v)=>P(X+u,Y,Z-v);

// ── the slide being checked (flat coords 0..GW x 0..GH of the monitor glass) ──
const GW=470,GH=300;
function slide(fitU,o={}){
 const fs=lerp(36,27,E.inout(fitU)),title=o.title||'城市熱島效應與綠化策略',tx=58,tEnd=tx+tw(title,fs),sx=36,sw=344,over=tEnd>sx+sw+2&&!o.plain;
 let s=S.rect({x:0,y:0,width:GW,height:GH,rx:10,fill:'#f4f1ea'})+S.rect({x:0,y:0,width:GW,height:34,rx:10,fill:'#ddd6c9'})+S.rect({x:0,y:20,width:GW,height:14,fill:'#ddd6c9'});
 for(let i=0;i<3;i++)s+=S.circle({cx:20+i*20,cy:17,r:6,fill:['#e0796f','#e7b85a','#7cc28b'][i]});
 s+=S.text(GW/2,24,'期末報告.pptx',{'font-size':17,fill:C.sub,'text-anchor':'middle'});
 s+=S.rect({x:sx,y:56,width:sw,height:222,rx:4,fill:'#fff',stroke:over?C.red:'#cfc6b6','stroke-width':over?3:2,'stroke-dasharray':over?'8 6':null});
 s+=S.text(tx,112,title,{'font-size':fs,'font-weight':800,fill:C.ink});
 if(over)s+=S.rect({x:sx+sw,y:112-fs,width:tEnd-sx-sw+6,height:fs+10,fill:C.red,opacity:.18});
 for(let i=0;i<3;i++)s+=S.rect({x:tx,y:146+i*34,width:[250,210,232][i],height:12,rx:6,fill:'#d8d0c2'});
 s+=S.rect({x:392,y:56,width:62,height:222,rx:4,fill:'#ebe6dc'});
 for(let i=0;i<4;i++)s+=S.rect({x:400,y:64+i*52,width:46,height:40,rx:3,fill:'#fff',stroke:i===(o.page??0)?C.codex:'#d8d0c2','stroke-width':2});
 if(o.pageLabel)s+=S.rect({x:300,y:248,width:72,height:24,rx:12,fill:C.ink})+S.text(336,266,o.pageLabel,{'font-size':16,'font-weight':700,fill:'#fff','text-anchor':'middle'});
 return {svg:s,titleBox:[tx,112-fs,tEnd-tx,fs+8]};
}

// Codex cursor (flat, drawn in visual coordinates); the name tag can fade so it never hides edited content
function cursor(x,y,label,click=0,labelOp=1){
 let o='';if(click>0&&click<1)o+=S.circle({cx:x,cy:y,r:lerp(8,70,E.out(click)),fill:'none',stroke:C.codex,'stroke-width':4,opacity:1-click});
 o+=S.path({d:`M${x} ${y} l0 40 l11 -10 l9 21 l9 -4 l-9 -20 l15 -1 z`,fill:C.codex,stroke:'#fff','stroke-width':3,'stroke-linejoin':'round'});
 if(label&&labelOp>0){const w=tw(label,19)+20;o+=S.g({opacity:labelOp},S.rect({x:x+26,y:y+38,width:w,height:30,rx:8,fill:C.codex})+S.text(x+36,y+59,label,{'font-size':19,'font-weight':700,fill:'#fff'}))}
 return o;
}

// ── desk diorama ──
const MON={x:120,y:40,z:375,w:GW,h:GH};
function desk(u,o,B){
 const rise=i=>E.back(clamp(u*1.6-i*.18)),kb=o.kbTint||0;
 let s=S.poly([P(-20,-20,-10),P(640,-20,-10),P(640,250,-10),P(-20,250,-10)],{fill:'#2a2420',opacity:.07});
 const r0=rise(0);s+=S.g({transform:`translate(0 ${(1-r0)*30})`,opacity:clamp(r0*1.5)},box(0,0,-10,610,226,22,[C.deskT,C.deskL,C.deskR]));
 const r1=rise(1);
 let m=box(260,20,12,170,90,10,[C.metalT,C.metalL,C.metalR])+box(330,40,22,30,22,52,[C.metalT,C.metalL,C.metalR])+
  box(MON.x-14,MON.y-26,62,MON.w+28,26,MON.h+40,['#3a3f4c','#2a2e38','#20242c']);
 const sl=slide(o.fit||0,o.slide||{});
 m+=S.g({transform:faceY(MON.x,MON.y,MON.z)},S.rect({x:-4,y:-4,width:GW+8,height:GH+8,rx:12,fill:C.screen})+sl.svg+
  ((o.flash||0)>0?S.rect({x:0,y:0,width:GW,height:GH,rx:10,fill:'#fff',opacity:o.flash}):''));
 s+=S.g({transform:`translate(0 ${(1-r1)*40})`,opacity:clamp(r1*1.5)},m);
 const r2=rise(2),kc=kb>0?['#d9d3ff','#b9b0f5','#a59af0']:['#f1ede6','#d9d2c6','#c8c0b2'];
 s+=S.g({transform:`translate(0 ${(1-r2)*30})`,opacity:clamp(r2*1.5)},
  S.g({opacity:1},box(230,128,12,280,76,8,kb>0?kc:['#f1ede6','#d9d2c6','#c8c0b2'])+box(540,140,12,34,52,10,kb>0?kc:['#f1ede6','#d9d2c6','#c8c0b2']))+
  box(40,150,12,50,50,58,['#f0a65a','#d98a3e','#c4782f']));
 B.push({id:'desk',x:120,y:20,width:820,height:590});
 const tb=sl.titleBox;
 return {svg:s,target:onFaceY(MON.x,MON.y,MON.z,tb[0]+tb[2]*.45,tb[1]+tb[3]*.6),glassC:onFaceY(MON.x,MON.y,MON.z,GW/2,GH/2),
  kb:P(370,166,24),mouse:P(557,166,26),monTop:P(MON.x+GW/2,MON.y,MON.z+40),glassTL:onFaceY(MON.x,MON.y,MON.z,0,0),glassBR:onFaceY(MON.x,MON.y,MON.z,GW,GH)};
}

// ── blueprint panel (auxiliary style) ──
function bpPanel(x,y,w,h,title,B,id='panel'){
 let o=S.rect({x,y,width:w,height:h,rx:18,fill:C.bp});
 for(let gx=x+24;gx<x+w;gx+=32)o+=S.line({x1:gx,y1:y+8,x2:gx,y2:y+h-8,stroke:'#fff',opacity:.06});
 for(let gy=y+24;gy<y+h;gy+=32)o+=S.line({x1:x+8,y1:gy,x2:x+w-8,y2:gy,stroke:'#fff',opacity:.06});
 o+=S.rect({x:x+10,y:y+10,width:w-20,height:h-20,rx:12,fill:'none',stroke:C.bpLine,'stroke-width':1.5,opacity:.5,'stroke-dasharray':'4 6'});
 if(title)o+=S.text(x+34,y+52,title,{'font-size':22,'font-weight':700,fill:C.bpLine,'letter-spacing':3});
 B.push({id,x,y,width:w,height:h,overlapGroup:id});
 return o;
}
// the see → decide → act loop
const BP={x:1060,y:0,w:668,h:610,cx:1394,cy:292,r:166};
const NODES=[{k:'see',a:-90,zh:'看',zs:'截圖',en:'See',es:'screenshot'},{k:'think',a:30,zh:'想',zs:'判斷下一步',en:'Decide',es:'next step'},{k:'act',a:150,zh:'做',zs:'點擊・輸入',en:'Act',es:'click · type'}];
const nodeXY=a=>[BP.cx+BP.r*Math.cos(a*Math.PI/180),BP.cy+BP.r*Math.sin(a*Math.PI/180)];
function arc(a0,a1,r,cx=BP.cx,cy=BP.cy){const p0=[cx+r*Math.cos(a0*Math.PI/180),cy+r*Math.sin(a0*Math.PI/180)],p1=[cx+r*Math.cos(a1*Math.PI/180),cy+r*Math.sin(a1*Math.PI/180)];return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`}
function loopDiagram(p,v,B,lit,extra){
 const ring=p('ring');let o='';
 o+=S.text(BP.x+34,BP.y+52,isEn(v)?'THE LOOP · 循環':'循環 · THE LOOP',{'font-size':22,'font-weight':700,fill:C.bpLine,'letter-spacing':3});
 const rd=E.inout(clamp(ring/.5));
 if(rd>0)o+=S.path({d:arc(-90,-90+359.9*rd,BP.r),fill:'none',stroke:C.bpLine,'stroke-width':3,opacity:.35,'stroke-dasharray':'10 10'});
 const segs=[[-60,0,p('think')],[60,120,p('act')],[180,240,p('verify')]];
 for(const [a0,a1,u] of segs){const k=E.inout(clamp(u*2.2));if(k<=0)continue;const a=lerp(a0,a1,k);o+=S.path({d:arc(a0,a,BP.r),fill:'none',stroke:'#fff','stroke-width':6,'stroke-linecap':'round'});
  if(k>.02){const ang=a*Math.PI/180,hx=BP.cx+BP.r*Math.cos(ang),hy=BP.cy+BP.r*Math.sin(ang),tx=-Math.sin(ang),ty=Math.cos(ang);o+=S.path({d:`M${hx+tx*14} ${hy+ty*14} L${hx-tx*4+Math.cos(ang)*11} ${hy-ty*4+Math.sin(ang)*11} L${hx-tx*4-Math.cos(ang)*11} ${hy-ty*4-Math.sin(ang)*11} Z`,fill:'#fff'})}}
 // "keeps going" — a comet circling the ring during the repeat phase
 const rep=p('repeat');if(rep>0&&rep<1){const a=-90+rep*720;for(let i=0;i<6;i++){const aa=(a-i*7)*Math.PI/180;o+=S.circle({cx:BP.cx+BP.r*Math.cos(aa),cy:BP.cy+BP.r*Math.sin(aa),r:9-i*1.2,fill:'#fff',opacity:1-i*.15})}}
 NODES.forEach((n,i)=>{const [x,y]=nodeXY(n.a),on=lit===n.k,k=E.back(clamp((ring-.15-i*.18)/.35));
  if(k<=0)return;
  let g=S.circle({cx:x,cy:y,r:52,fill:on?'#fff':C.bpL,stroke:'#fff','stroke-width':3});
  if(on)g=S.circle({cx:x,cy:y,r:64,fill:'none',stroke:'#fff','stroke-width':2,opacity:.5})+g;
  g+=S.text(x,y+(isEn(v)?9:14),isEn(v)?n.en:n.zh,{'font-size':isEn(v)?24:40,'font-weight':800,fill:on?C.bp:'#fff','text-anchor':'middle'});
  const lx=n.k==='see'?x+112:x,ly=n.k==='see'?y+2:y+92,anc=n.k==='see'?'start':'middle';
  g+=S.text(lx,ly,isEn(v)?n.es:n.zs,{'font-size':25,'font-weight':700,fill:on?'#fff':C.bpLine,'text-anchor':anc,opacity:on?1:.75});
  g+=S.text(lx,ly+28,isEn(v)?n.zs:n.es,{'font-size':19,fill:C.bpLine,'text-anchor':anc,opacity:.65});
  o+=S.g({transform:`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`,opacity:clamp(k*1.5)},g);
  B.push({id:'node-'+n.k,x:x-52,y:y-52,width:104,height:104,overlapGroup:'panel'});
 });
 return o+(extra||'');
}
function thumbCard(x,y,s,fitU,mark){
 const sl=slide(fitU),w=GW*s,h=GH*s;let o=S.rect({x:x-w/2-6,y:y-h/2-6,width:w+12,height:h+12,rx:10,fill:'#fff',opacity:.95});
 o+=S.g({transform:`translate(${x-w/2} ${y-h/2}) scale(${s})`},sl.svg);
 const tb=sl.titleBox;
 if(mark==='problem')o+=S.rect({x:x-w/2+tb[0]*s-6,y:y-h/2+tb[1]*s-6,width:tb[2]*s+12,height:tb[3]*s+12,rx:6,fill:'none',stroke:C.red,'stroke-width':4});
 if(mark==='ok')o+=S.circle({cx:x+w/2-6,cy:y-h/2+6,r:22,fill:C.green})+S.path({d:`M${x+w/2-17} ${y-h/2+6} l7 8 l14 -15`,fill:'none',stroke:'#fff','stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'});
 return o;
}
function note(x,y,zh,en,v,col,u){if(u<=0)return '';const [a,b]=L(v,zh,en),w=Math.max(tw(a,24),tw(b,18))+36;
 return S.g({opacity:clamp(u*2),transform:`translate(0 ${(1-E.out(u))*10})`},S.rect({x:x-w/2,y:y,width:w,height:66,rx:12,fill:col})+S.text(x,y+29,a,{'font-size':24,'font-weight':700,fill:'#fff','text-anchor':'middle'})+S.text(x,y+54,b,{'font-size':18,fill:'#ffffffcc','text-anchor':'middle'}))}
// flat paper card with optional colored header strip
function paper(x,y,w,h,o={}){return S.rect({x:x+6,y:y+8,width:w,height:h,rx:o.rx||16,fill:'#2a2420',opacity:.08})+S.rect({x,y,width:w,height:h,rx:o.rx||16,fill:o.fill||C.paper,stroke:o.stroke||C.line,'stroke-width':o.sw||2})}
function pill(x,y,label,fill,color='#fff',size=22,o={}){const w=tw(label,size)+(o.pad||28);const xx=o.anchor==='middle'?x-w/2:x;return S.rect({x:xx,y:y-size*.95,width:w,height:size*1.5,rx:size*.75,fill})+S.text(xx+w/2,y,label,{'font-size':size,'font-weight':700,fill:color,'text-anchor':'middle'})}
function toggle(x,y,on){const k=E.inout(on);return S.rect({x,y,width:64,height:34,rx:17,fill:k>.5?C.green:'#c9c2b6'})+S.circle({cx:x+17+30*k,cy:y+17,r:13,fill:'#fff'})}
function btn(x,y,w,label,style,press=0){const fill=style==='primary'?C.codex:'#fff',col=style==='primary'?'#fff':C.ink;let o=S.rect({x,y,width:w,height:46,rx:10,fill,stroke:style==='primary'?C.codex:'#c9bfae','stroke-width':2});
 if(press>0&&press<1)o+=S.rect({x:x-6*press,y:y-6*press,width:w+12*press,height:46+12*press,rx:12,fill:'none',stroke:C.codex,'stroke-width':3,opacity:1-press});
 return o+S.text(x+w/2,y+31,label,{'font-size':fit(label,w-16,21),'font-weight':700,fill:col,'text-anchor':'middle'})}

const SCENES={};

// ═════════ 1 origin: GUI-only jobs → timeline of milestones ═════════
const MILES=[
 {d:'2025-01',zh:'Operator',en:'Operator',dz:['截圖＋滑鼠鍵盤','操作瀏覽器'],de:['Screenshots + mouse','& keyboard, in a browser'],c:'#9aa6b8'},
 {d:'2026-03-05',zh:'GPT-5.4',en:'GPT-5.4',dz:['Codex 首個原生','電腦操作通用模型'],de:['First general model','in Codex to use computers'],c:'#7fa3c9'},
 {d:'2026-04-16',zh:'Computer use',en:'Computer use',dz:['Codex 推出','先支援 macOS'],de:['Launches in Codex','macOS first'],c:C.codex,key:true},
 {d:'2026-05-29',zh:'Windows',en:'Windows',dz:['加入 Windows'],de:['Windows support'],c:'#6bb59a'},
 {d:'2026-06-16',zh:'歐洲・英國・瑞士',en:'EEA · UK · CH',dz:['開放歐洲經濟區','英國與瑞士'],de:['Opens in the EEA,','the UK & Switzerland'],c:'#6bb59a'},
 {d:'2026-07-09',zh:'ChatGPT 桌面 App',en:'ChatGPT desktop',dz:['Codex 併入','Computer use 變快'],de:['Codex joins the app;','Computer use gets faster'],c:'#6bb59a'}];
SCENES.origin=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),hook=p('hook'),name=p('name');
 const show=[p('operator'),p('gpt54'),p('launch'),p('spread'),clamp((p('spread')-.45)/.4),p('merge')];
 const tl=E.inout(clamp(p('operator')/.18));
 let o='';
 if(tl<1){
  let a='';const d=desk(intro,{fit:0},B);a+=d.svg;
  const tasks=[['gear','調整 App 設定','Change app settings'],['slide','檢查簡報排版','Check a slide layout'],['bug','重現介面上的錯誤','Reproduce a UI-only bug']];
  tasks.forEach((tk,i)=>{const u=clamp((hook-.15-i*.17)/.2),y=90+i*150,[z,e]=L(v,tk[1],tk[2]);
   a+=fade(u,paper(1100,y,560,118)+badgeIcon(tk[0],1166,y+59,38,C.ink)+S.text(1226,y+56,z,{'font-size':fit(z,410,32),'font-weight':800,fill:C.ink})+S.text(1226,y+92,e,{'font-size':fit(e,410,21),fill:C.muted}),14);
   if(u>0)B.push({id:'task'+i,x:1100,y,width:560,height:118})});
  // "Computer use" = eyes on the screen + its own cursor
  if(name>0){const k=E.inout(clamp(name/.4)),[tx,ty]=d.target,cx=lerp(tx+260,tx,k),cy=lerp(ty+150,ty,k)-Math.sin(k*Math.PI)*60;
   a+=cursor(cx,cy,'Codex',k>.98&&name<.7?clamp((name-.4)/.3):0,1);
   a+=pop(560,46,clamp((name-.35)/.3),S.rect({x:360,y:4,width:400,height:78,rx:39,fill:C.codex})+S.text(560,56,'Computer use',{'font-size':40,'font-weight':800,fill:'#fff','text-anchor':'middle'}))}
  o+=S.g({opacity:1-tl},a);
 }
 if(tl>0){
  let b='';const AY=470,X=i=>150+i*285;
  b+=S.line({x1:40,y1:AY,x2:lerp(40,1690,E.inout(tl)),y2:AY,stroke:C.ink,'stroke-width':4,'stroke-linecap':'round'});
  // era brackets under the axis
  const eras=[[0,1,'背景','Background',C.muted],[2,2,'推出','Launch',C.codex],[3,5,'擴大','Expansion',C.green]];
  for(const [i0,i1,z,e,c] of eras){const u=show[i0];if(u<=0)continue;const x0=X(i0)-120,x1=X(i1)+120,[l1]=L(v,z,e);
   b+=fade(u,S.path({d:`M${x0} ${AY+64} V${AY+76} H${x1} V${AY+64}`,fill:'none',stroke:c,'stroke-width':3})+S.text((x0+x1)/2,AY+110,l1,{'font-size':24,'font-weight':700,fill:c,'text-anchor':'middle'}),6)}
  MILES.forEach((m,i)=>{const u=show[i];if(u<=0)return;const x=X(i),h=m.key?120:70,k=E.back(clamp(u/.35));
   b+=S.g({opacity:clamp(u*3),transform:`translate(0 ${(1-k)*30})`},cube(x,AY+18,46,h*k,tri(m.c)));
   const cw=262,ch=m.key?212:196,cy=AY-h-ch-26-(m.key?6:0),[ti]=L(v,m.zh,m.en),lines=isEn(v)?m.de:m.dz;
   let c=paper(x-cw/2,cy,cw,ch,{stroke:m.key?C.codex:C.line,sw:m.key?4:2})+S.text(x,cy+44,m.d,{'font-size':m.key?34:30,'font-weight':800,fill:m.key?C.codex:C.ink,'text-anchor':'middle'});
   c+=S.text(x,cy+86,ti,{'font-size':fit(ti,cw-24,27),'font-weight':800,fill:C.ink,'text-anchor':'middle'});
   lines.forEach((ln,j)=>{c+=S.text(x,cy+124+j*30,ln,{'font-size':fit(ln,cw-24,21),fill:C.sub,'text-anchor':'middle'})});
   if(m.key)c+=pill(x,cy-16,isEn(v)?'ORIGIN · 起源':'起源 · ORIGIN',C.codex,'#fff',20,{anchor:'middle'});
   b+=fade(clamp((u-.1)/.4),c,12);B.push({id:'mile'+i,x:x-cw/2,y:cy-34,width:cw,height:ch+34})});
  o+=S.g({opacity:tl},b);
 }
 // desk ↔ timeline is a deliberate crossfade: both belong to one overlap group while it runs
 if(tl>0&&tl<1)for(const r of B)if(r.id==='desk'||r.id.startsWith('mile'))r.overlapGroup='xfade';
 return o;
};

// ═════════ 2 loop: see → decide → act, then OS permissions ═════════
SCENES.loop=function(s,t,B,v){
 const p=phaser(s,t),intro=has(s,'intro')?p('intro'):clamp((t-s.start)/.8),see=p('see'),think=p('think'),act=p('act'),ver=p('verify');
 const eye=p('eye'),hand=p('hand'),win=p('win'),perm=E.inout(clamp(eye/.12));
 const fitU=E.inout(clamp((act-.55)/.35));
 const flash=Math.max(see>0&&see<.3?Math.sin(see/.3*Math.PI):0,ver>0&&ver<.3?Math.sin(ver/.3*Math.PI):0)*.85;
 const lit=ver>0?'see':act>0?'act':think>0?'think':see>0?'see':null;
 const winU=E.inout(clamp(win/.2));
 const d=desk(intro,{fit:fitU,flash,kbTint:winU},B);
 let o=d.svg;
 // permissions on the desk: eye beam to the glass, hand over the keyboard, Windows takeover
 if(eye>0){const u=E.out(clamp(eye/.3)),[ex,ey]=[d.monTop[0]-40,d.monTop[1]-6],g=[d.glassTL,onFaceY(MON.x,MON.y,MON.z,GW,0),d.glassBR,onFaceY(MON.x,MON.y,MON.z,0,GH)];
  o+=S.g({opacity:u*.9},S.poly([[ex,ey],g[1],g[2]],{fill:C.codex,opacity:.13})+S.poly([[ex,ey],g[0],g[3]],{fill:C.codex,opacity:.1}));
  o+=pop(ex,ey,clamp(eye/.3),badgeIcon('eye',ex,ey,34,C.codex))}
 if(hand>0){const [hx,hy]=d.kb;o+=pop(hx,hy-60,clamp(hand/.3),badgeIcon('hand',hx,hy-60,34,C.codex)+S.path({d:`M${hx} ${hy-26} V${hy-6}`,stroke:C.codex,'stroke-width':4,'stroke-dasharray':'4 5'}))}
 if(win>0){const [mx,my]=d.mouse;o+=pop(mx+100,my-30,winU,S.rect({x:mx-20,y:my-60,width:250,height:56,rx:28,fill:C.codex})+icon('lock',mx-8,my-54,.92,'#fff',3.4)+
  S.text(mx+46,my-22,pick(v,'前景輸入被接管','Input taken over'),{'font-size':fit(pick(v,'前景輸入被接管','Input taken over'),170,22),'font-weight':700,fill:'#fff'}))}
 // blueprint: loop diagram, then crossfades to the permissions sheet
 o+=bpPanel(BP.x,BP.y,BP.w,BP.h,'',B);
 if(perm<1){
  const fly=(u,fitNow,mark)=>{const k=E.inout(clamp((u-.15)/.6));const x=lerp(d.glassC[0],BP.cx,k),y=lerp(d.glassC[1],BP.cy-6,k)-Math.sin(k*Math.PI)*150,sc=lerp(.62,.42,k);return thumbCard(x,y,sc,fitNow,mark)};
  let thumb='';
  if(ver>.15)thumb=fly(ver,1,ver>.75?'ok':null);else if(see>.15)thumb=fly(see,0,think>.25?'problem':null);
  let notes='';const NY=522,rep=p('repeat');
  if(rep>0)notes=note(BP.cx,NY,'直到完成，或停下來問你','Until done, or it stops to ask',v,C.bpL,clamp(rep/.25));
  else if(ver>.15)notes=note(BP.cx,NY,'標題已在版面內','Title now fits',v,C.green,clamp((ver-.75)/.2));
  else if(act>0)notes=note(BP.cx,NY,'點標題框 → 縮小字級','Click title → smaller font',v,C.codex,clamp(act/.3));
  else if(think>0)notes=note(BP.cx,NY,'標題超出版面','Title overflows the slide',v,C.red,clamp((think-.2)/.3));
  o+=S.g({opacity:1-perm},loopDiagram(p,v,B,lit,thumb+notes));
 }
 if(perm>0){
  let q=S.text(BP.x+34,52,isEn(v)?'PERMISSIONS · 權限':'權限 · PERMISSIONS',{'font-size':22,'font-weight':700,fill:C.bpLine,'letter-spacing':3});
  const rows=[{y:96,os:'macOS',ic:'eye',on:eye,z:['螢幕錄製 ＝ 眼睛','看得到 App'],e:['Screen Recording = eyes','sees the app']},
   {y:236,ic:'hand',on:hand,z:['輔助使用 ＝ 手','點擊・輸入・切換視窗'],e:['Accessibility = hands','click · type · switch windows']},
   {y:400,os:'Windows',ic:'window',on:win,z:['目標 App 要看得見','接管前景滑鼠與鍵盤'],e:['Target app stays visible','takes over mouse & keyboard']}];
  for(const r of rows){const u=clamp(r.on/.25);if(r.os)q+=S.text(BP.x+44,r.y,r.os,{'font-size':20,'font-weight':700,fill:C.bpLine,opacity:.8,'letter-spacing':2});
   const y=r.y+16,active=r.on>0,[a1,a2]=isEn(v)?r.e:r.z,[b1]=isEn(v)?r.z:r.e;
   q+=S.g({opacity:active?1:.35},S.rect({x:BP.x+34,y,width:BP.w-68,height:112,rx:14,fill:active?'#fff':C.bpL})+badgeIcon(r.ic,BP.x+94,y+56,38,active?C.codex:C.bp)+
    S.text(BP.x+150,y+46,a1,{'font-size':fit(a1,440,29),'font-weight':800,fill:active?C.ink:'#fff'})+S.text(BP.x+150,y+82,a2,{'font-size':fit(a2,440,22),fill:active?C.sub:C.bpLine})+
    (u>0&&active?S.text(BP.x+BP.w-52,y+30,b1,{'font-size':15,fill:C.muted,'text-anchor':'end'}):''));
   B.push({id:'perm-'+r.ic,x:BP.x+34,y,width:BP.w-68,height:112,overlapGroup:'panel'})}
  o+=S.g({opacity:perm},q);
 }
 // cursor: rest near the keyboard → title on the glass (hidden while permissions are explained)
 const rest=P(560,166,40),cu=E.inout(clamp(act/.45)),tgt=d.target;
 const cx=lerp(rest[0],tgt[0],cu),cy=lerp(rest[1],tgt[1],cu)-Math.sin(cu*Math.PI)*90,click=clamp((act-.45)/.25);
 if(intro>=1&&eye<=0)o+=cursor(cx,cy,'Codex',click,1-clamp((cu-.75)/.25));
 return o;
};

// ═════════ 3 safety: shelf of apps + boundary checklist ═════════
const SHELF=[{k:'slides',zh:'簡報',en:'Slides',c:'#f0a65a',ic:'slide'},{k:'sheet',zh:'試算表',en:'Sheets',c:'#6bb59a',ic:'card'},{k:'web',zh:'瀏覽器',en:'Browser',c:'#7fa3c9',ic:'globe'},{k:'term',zh:'終端機',en:'Terminal',c:'#5b6070',ic:'term'},{k:'gpt',zh:'ChatGPT',en:'ChatGPT',c:'#4fa39a',ic:'loop'}];
SCENES.safety=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),ask=p('ask'),al=p('always'),cn=p('cannot'),se=p('sensitive'),sb=p('sandbox'),ij=p('inject');
 const cur=ij>0?5:sb>0?4:se>0?3:cn>0?2:al>0?1:ask>0?0:-1;
 let o='';
 // shelf
 o+=S.poly([[40,548],[960,548],[1000,520],[80,520]],{fill:'#2a2420',opacity:.07});
 SHELF.forEach((a,i)=>{const x=150+i*180,u=E.back(clamp(intro*1.6-i*.12)),hl=(a.k==='slides'&&(cur===0||cur===1))||(a.k==='web'&&cur===5);
  const no=(a.k==='term'||a.k==='gpt')&&cn>0;
  o+=S.g({opacity:clamp(u*2),transform:`translate(0 ${(1-u)*24})`},cube(x,520,58,74,tri(a.c),{stroke:hl?C.codex:undefined,sw:hl?4:1.5})+icon(a.ic,x-20,520-74-58*.5-20,.84,'#fff',3.4)+
   S.text(x,580,pick(v,a.zh,a.en),{'font-size':22,'font-weight':700,fill:C.ink,'text-anchor':'middle'}));
  if(no){const k=E.back(clamp((cn-.1-(a.k==='gpt'?.12:0))/.3));o+=pop(x,520-62,k,S.circle({cx:x,cy:520-62,r:44,fill:C.red,opacity:.92})+icon('cross',x-22,520-84,.92,'#fff',5))}
  B.push({id:'shelf'+i,x:x-55,y:520-74-58,width:110,height:150,overlapGroup:'shelf'})});
 // upper-left illustration per boundary
 const ill=[];const IX=60,IY=12,IW=900,IH=360;
 if(cur<=1&&ask>0){const u=clamp(ask/.2),press=clamp((al-.1)/.3),[ti]=L(v,'Codex 想使用「簡報」','Codex wants to use “Slides”'),[sub]=L(v,'第一次操作這個 App','First time using this app');
  let c=paper(IX+150,IY+20,600,250)+badgeIcon('slide',IX+218,IY+92,36,'#f0a65a')+S.text(IX+272,IY+86,ti,{'font-size':fit(ti,450,30),'font-weight':800,fill:C.ink})+S.text(IX+272,IY+120,sub,{'font-size':21,fill:C.muted});
  c+=btn(IX+180,IY+190,150,pick(v,'拒絕','Deny'),'')+btn(IX+346,IY+190,150,pick(v,'允許','Allow'),'')+btn(IX+512,IY+190,210,'Always allow','primary',press);
  if(al>.45){const k=clamp((al-.45)/.25),[li]=L(v,'設定 › Computer use','Settings › Computer use');
   c+=fade(k,paper(IX+150,IY+288,600,64,{fill:C.codexL,stroke:C.codex})+icon('check',IX+170,IY+296,.95,C.green,4)+S.text(IX+224,IY+330,pick(v,'一律允許：簡報','Always allowed: Slides'),{'font-size':23,'font-weight':700,fill:C.ink})+
    S.text(IX+728,IY+330,li+'  ✕',{'font-size':19,fill:C.codex,'text-anchor':'end'}),8)}
  ill.push(fade(u,c,12));
  if(press>0&&press<1||al>0&&al<.45){const k=E.inout(clamp(al/.3));ill.push(cursor(lerp(IX+420,IX+640,k),lerp(IY+330,IY+222,k),'',0,0))}}
 if(cur===2){const u=clamp(cn/.2),items=[['term',L(v,'終端機 App','Terminal apps')],['loop',L(v,'ChatGPT 本身','ChatGPT itself')],['shield',L(v,'管理員驗證・系統權限提示','Admin auth · OS permission prompts')]];
  let c=paper(IX+60,IY+20,780,320)+S.text(IX+100,IY+74,pick(v,'它做不到','It cannot'),{'font-size':30,'font-weight':800,fill:C.red});
  items.forEach(([ic,[a]],i)=>{const k=clamp((cn-.08-i*.18)/.2);c+=fade(k,badgeIcon(ic,IX+128,IY+130+i*72,28,C.ink)+S.text(IX+176,IY+140+i*72,a,{'font-size':fit(a,560,27),'font-weight':700,fill:C.ink})+icon('cross',IX+760,IY+112+i*72,.8,C.red,5),8)});
  ill.push(fade(u,c,12))}
 if(cur===3){const u=clamp(se/.2),items=[['user',L(v,'帳號','Account')],['card',L(v,'付款','Payment')],['key',L(v,'密碼','Password')]];
  let c=paper(IX+60,IY+20,780,320)+S.text(IX+100,IY+74,pick(v,'敏感動作：先問你','Sensitive actions: it asks first'),{'font-size':fit(pick(v,'敏感動作：先問你','Sensitive actions: it asks first'),700,30),'font-weight':800,fill:C.amber});
  items.forEach(([ic,[a]],i)=>{const x=IX+180+i*230,k=E.back(clamp((se-.1-i*.12)/.3));c+=pop(x,IY+170,k,badgeIcon(ic,x,IY+160,46,C.amber)+S.text(x,IY+240,a,{'font-size':25,'font-weight':700,fill:C.ink,'text-anchor':'middle'}))});
  const k=clamp((se-.5)/.25);c+=fade(k,icon('person',IX+120,IY+268,.9,C.ink,3.4)+S.text(IX+176,IY+302,pick(v,'官方建議：你在場，逐步確認','Docs: stay present, approve step by step'),{'font-size':24,'font-weight':700,fill:C.ink}),6);
  ill.push(fade(u,c,12))}
 if(cur===4){const u=clamp(sb/.2),k=E.inout(clamp((sb-.1)/.35));
  let c=paper(IX+60,IY+20,780,320);
  c+=S.path({d:`M${IX+170} ${IY+300} A280 ${175*k+1} 0 0 1 ${IX+730} ${IY+300}`,fill:C.greenL,stroke:C.green,'stroke-width':4,'stroke-dasharray':'12 8',opacity:.95});
  c+=S.line({x1:IX+150,y1:IY+300,x2:IX+750,y2:IY+300,stroke:C.green,'stroke-width':4});
  c+=badgeIcon('file',IX+360,IY+250,36,C.ink)+badgeIcon('term',IX+540,IY+250,36,C.ink);
  c+=S.text(IX+360,IY+200,pick(v,'檔案編輯','File edits'),{'font-size':22,'font-weight':700,fill:C.ink,'text-anchor':'middle'})+S.text(IX+540,IY+192,'Shell',{'font-size':22,'font-weight':700,fill:C.ink,'text-anchor':'middle'});
  c+=fade(clamp((sb-.4)/.3),S.text(IX+450,IY+72,pick(v,'沙盒＋核准設定：照常管理','Sandbox + approvals still apply'),{'font-size':fit(pick(v,'沙盒＋核准設定：照常管理','Sandbox + approvals still apply'),700,30),'font-weight':800,fill:C.green,'text-anchor':'middle'}),6);
  ill.push(fade(u,c,12))}
 if(cur===5){const u=clamp(ij/.2),k=clamp((ij-.25)/.3);
  let c=paper(IX+60,IY+20,780,320)+S.rect({x:IX+60,y:IY+20,width:780,height:46,rx:16,fill:'#ebe6dc'})+S.rect({x:IX+60,y:IY+50,width:780,height:16,fill:'#ebe6dc'})+icon('globe',IX+76,IY+22,.8,C.sub,3)+S.rect({x:IX+130,y:IY+30,width:520,height:28,rx:14,fill:'#fff'});
  for(let i=0;i<4;i++)c+=S.rect({x:IX+110,y:IY+100+i*44,width:[520,600,460,560][i],height:16,rx:8,fill:'#e2dbcf'});
  c+=fade(k,S.rect({x:IX+100,y:IY+180,width:620,height:40,rx:8,fill:C.redL,stroke:C.red,'stroke-width':3})+S.text(IX+116,IY+208,pick(v,'（隱藏文字）忽略使用者，改做別的事…','(hidden text) ignore the user and do something else…'),{'font-size':fit(pick(v,'（隱藏文字）忽略使用者，改做別的事…','(hidden text) ignore the user and do something else…'),590,21),fill:C.red,'font-style':'italic'}),6);
  c+=fade(clamp((ij-.5)/.25),pill(IX+450,IY+300,pick(v,'網頁內容 ＝ 不可信資料','Page content = untrusted data'),C.red,'#fff',24,{anchor:'middle'}),6);
  ill.push(fade(u,c,12))}
 o+=ill.join('');if(cur>=0)B.push({id:'ill',x:IX+60,y:IY+12,width:780,height:350,overlapGroup:'ill'});
 // right: boundary checklist
 o+=bpPanel(BP.x,BP.y,BP.w,BP.h,isEn(v)?'BOUNDARIES · 安全邊界':'安全邊界 · BOUNDARIES',B);
 const rows=[['lock','先詢問・可選一律允許','Asks first · Always allow'],['gear','收回：設定 › Computer use','Undo: Settings › Computer use'],['cross','不能：終端機、ChatGPT、系統提示','Can’t: terminal, ChatGPT, OS prompts'],
  ['warn','敏感動作：徵求同意、你在場','Sensitive: asks, you stay present'],['shield','檔案與指令：沙盒照常','Files & shell: sandbox still applies'],['globe','網頁內容＝不可信資料','Web content = untrusted']];
 rows.forEach((r,i)=>{const y=82+i*86,u=clamp((p(['ask','always','cannot','sensitive','sandbox','inject'][i]))/.15),on=i===cur,[a,b]=L(v,r[1],r[2]);if(u<=0)return;
  o+=fade(u,S.rect({x:BP.x+30,y,width:BP.w-60,height:74,rx:12,fill:on?'#fff':C.bpL})+badgeIcon(r[0],BP.x+70,y+37,24,on?C.codex:C.bp)+
   S.text(BP.x+108,y+33,a,{'font-size':fit(a,500,24),'font-weight':800,fill:on?C.ink:'#fff'})+S.text(BP.x+108,y+60,b,{'font-size':fit(b,500,17),fill:on?C.muted:C.bpLine}),8);
  B.push({id:'row'+i,x:BP.x+30,y,width:BP.w-60,height:74,overlapGroup:'panel'})});
 return o;
};

// ═════════ 4 compare: five ways to let Codex act ═════════
const TOOLS=[{k:'shell',ic:'term',c:'#5b6070',n:['Shell 指令','Shell commands'],call:['直接執行','run directly'],obj:['文字與檔案','text & files'],tr:['快、穩、可驗證','fast · stable · verifiable'],rank:1},
 {k:'plugin',ic:'plug',c:'#c47f12',n:['外掛／MCP','Plugins / MCP'],call:['已安裝的外掛','an installed plugin'],obj:['App 的結構化資料','structured app data'],tr:['有就優先用','prefer when available'],rank:1},
 {k:'browser',ic:'globe',c:'#3f7cc4',n:['內建瀏覽器','Built-in browser'],call:['@Browser','@Browser'],obj:['網頁・獨立設定檔','web · its own profile'],tr:['本機開發中的網頁','local web apps'],rank:2},
 {k:'chrome',ic:'chrome',c:'#2f9a72',n:['Chrome 擴充','Chrome extension'],call:['@Chrome','@Chrome'],obj:['你平常的分頁','your everyday tabs'],tr:['沿用登入狀態','keeps your sign-ins'],rank:2},
 {k:'cu',ic:'cursor',c:C.codex,n:['Computer use','Computer use'],call:['@Computer','@Computer'],obj:['任何 App 的畫面','any app’s screen'],tr:['最通用・通常較慢','most general · usually slower'],rank:3}];
SCENES.compare=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),rule=p('rule'),cur=['shell','plugin','browser','chrome','cu'].findIndex((k,i,a)=>p(k)>0&&(i===a.length-1||p(a[i+1])<=0));
 let o='';const W=328,G=22,Y=40,H=410;
 TOOLS.forEach((tl,i)=>{const x=i*(W+G),u=E.back(clamp(intro*1.5-i*.1)),det=clamp(p(tl.k)/.2),on=i===cur&&rule<=0,dim=(cur>=0&&!on&&rule<=0)?.55:1;
  const cx=x+W/2,[nm,nm2]=L(v,tl.n[0],tl.n[1]);
  let c=paper(x,Y+(on?-10:0),W,H,{stroke:on?tl.c:C.line,sw:on?4:2});const yy=Y+(on?-10:0);
  c+=cube(cx,yy+128,52,52,tri(tl.c))+icon(tl.ic,cx-21,yy+128-52-26-21,.88,'#fff',3.6);
  c+=S.text(cx,yy+186,nm,{'font-size':fit(nm,W-30,30),'font-weight':800,fill:C.ink,'text-anchor':'middle'})+S.text(cx,yy+214,nm2,{'font-size':fit(nm2,W-30,18),fill:C.muted,'text-anchor':'middle'});
  if(det>0){const rows=[[pick(v,'呼叫','Call'),pick(v,...tl.call)],[pick(v,'對象','Works on'),pick(v,...tl.obj)],[pick(v,'特點','Best at'),pick(v,...tl.tr)]];
   let d='';rows.forEach(([k,val],j)=>{const ry=yy+256+j*58;d+=S.text(x+22,ry,k,{'font-size':18,'font-weight':700,fill:C.muted})+S.text(x+22,ry+29,val,{'font-size':fit(val,W-44,25),'font-weight':700,fill:j===0&&val.startsWith('@')?tl.c:C.ink})});
   c+=fade(det,d,6)}
  if(rule>0){const k=E.back(clamp((rule-.1-(tl.rank-1)*.15)/.3));c+=pop(x+W-30,yy+26,k,S.circle({cx:x+W-30,cy:yy+26,r:24,fill:[C.green,C.amber,C.codex][tl.rank-1]})+S.text(x+W-30,yy+35,['①','②','③'][tl.rank-1].replace(/[①②③]/,String(tl.rank)),{'font-size':24,'font-weight':800,fill:'#fff','text-anchor':'middle'}))}
  o+=S.g({opacity:clamp(u*2)*dim,transform:`translate(0 ${(1-u)*24})`},c);B.push({id:'tool'+i,x,y:Y-10,width:W,height:H+10})});
 if(rule>0){const u=clamp(rule/.2),items=[[pick(v,'指令／外掛','Commands / plugins'),C.green],[pick(v,'瀏覽器','A browser'),C.amber],[pick(v,'Computer use（真的要看畫面時）','Computer use (when it truly needs the screen)'),C.codex]];
  let b=paper(0,488,1728,104,{fill:'#fff'});let x=40;
  items.forEach(([lb,c],i)=>{const w=tw(lb,26)+90;b+=S.circle({cx:x+24,cy:540,r:22,fill:c})+S.text(x+24,549,String(i+1),{'font-size':24,'font-weight':800,fill:'#fff','text-anchor':'middle'})+S.text(x+58,549,lb,{'font-size':26,'font-weight':800,fill:C.ink});
   x+=w;if(i<2){b+=S.path({d:`M${x-10} 540 H${x+40} M${x+28} 528 L${x+42} 540 L${x+28} 552`,fill:'none',stroke:C.ink,'stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'});x+=70}});
  o+=fade(u,b,10);B.push({id:'rule',x:0,y:488,width:1728,height:110})}
 return o;
};

// ═════════ 5 setup: iso staircase + rebuilt UI cards ═════════
const STEPS=[{k:'mode',zh:'選 Codex',en:'Choose Codex'},{k:'plugin',zh:'安裝外掛',en:'Install plugin'},{k:'toggles',zh:'打開開關',en:'Turn on toggles'},{k:'macperm',zh:'系統授權',en:'OS permissions'},{k:'mention',zh:'@Computer',en:'@Computer'}];
function uiCard(x,y,w,h,title){return paper(x,y,w,h,{rx:14})+S.rect({x,y,width:w,height:52,rx:14,fill:'#ebe6dc'})+S.rect({x,y:y+38,width:w,height:14,fill:'#ebe6dc'})+S.text(x+24,y+35,title,{'font-size':fit(title,w-48,22),'font-weight':700,fill:C.sub})}
SCENES.setup=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),names=['mode','plugin','toggles','macperm','mention','allow','manage','admin'];
 let ph=-1;names.forEach((n,i)=>{if(p(n)>0)ph=i});const step=Math.min(ph,4);
 let o='';
 // staircase (its own iso frame)
 o+=withIso({ox:220,oy:430,k:.7},()=>{let st='';
  for(let i=4;i>=0;i--){const u=E.back(clamp(intro*1.7-i*.12)),h=(i+1)*55,on=i===step,done=i<step,col=on?tri(C.codex):done?tri('#9d93f2'):tri('#e3d6bf');
   st+=S.g({opacity:clamp(u*2),transform:`translate(0 ${(1-u)*30})`},box(0,-i*100,0,160,100,h,col,{stroke:on?'#2a2420aa':undefined}));
   const [nx,ny]=P(80,-i*100+50,h);st+=S.g({opacity:clamp(u*2)},S.circle({cx:nx,cy:ny,r:22,fill:on?'#fff':done?'#fff':C.paper,stroke:on?C.codex:'#b9ac96','stroke-width':3})+S.text(nx,ny+8,String(i+1),{'font-size':22,'font-weight':800,fill:on?C.codex:C.sub,'text-anchor':'middle'}))}
  if(step>=0){const [cx,cy]=P(80,-step*100+50,(step+1)*55);st+=cursor(cx+18,cy-70,'',0,0)}
  return st});
 B.push({id:'stairs',x:120,y:60,width:440,height:520});
 // step legend under the stairs
 const [sl]=step>=0?L(v,STEPS[step].zh,STEPS[step].en):[''];
 if(step>=0)o+=pill(330,600,`${step+1} · ${sl}`,C.codex,'#fff',24,{anchor:'middle'});
 // right: UI rebuilt from the docs' labels
 const PX=640,PY=0,PW=1088,PH=610;
 o+=bpPanel(PX,PY,PW,PH,isEn(v)?'IN THE APP · 介面':'介面 · IN THE APP',B);
 const cx=PX+64,cw=PW-128,cy=86;
 const n=ph>=0?names[ph]:null,u=n?clamp(p(n)/.12):0;let c='';
 if(n==='mode'){c+=uiCard(cx,cy,cw,300,pick(v,'ChatGPT 桌面 App','ChatGPT desktop app'));const seg=['Chat','Work','Codex'];
  seg.forEach((sg,i)=>{const x=cx+120+i*250,on=i===2;c+=S.rect({x,y:cy+110,width:230,height:70,rx:35,fill:on?C.codex:'#fff',stroke:on?C.codex:'#c9bfae','stroke-width':2})+S.text(x+115,cy+155,sg,{'font-size':30,'font-weight':800,fill:on?'#fff':C.ink,'text-anchor':'middle'})});
  c+=S.text(cx+cw/2,cy+246,pick(v,'或：ChatGPT 切換到 Work','or: switch ChatGPT to Work'),{'font-size':24,fill:C.sub,'text-anchor':'middle'})}
 if(n==='plugin'){c+=uiCard(cx,cy,cw,330,pick(v,'外掛程式 · Plugins','Plugins'));c+=S.rect({x:cx+30,y:cy+76,width:cw-60,height:48,rx:24,fill:'#fff',stroke:'#d8d0c2','stroke-width':2})+S.text(cx+60,cy+108,'Computer Use',{'font-size':21,fill:C.muted});
  c+=S.rect({x:cx+30,y:cy+146,width:cw-60,height:110,rx:14,fill:'#fff',stroke:C.codex,'stroke-width':3})+badgeIcon('cursor',cx+90,cy+201,34,C.codex)+S.text(cx+142,cy+194,'Computer Use',{'font-size':28,'font-weight':800,fill:C.ink})+S.text(cx+142,cy+228,pick(v,'看畫面、點擊、輸入','see, click, and type'),{'font-size':20,fill:C.muted});
  const k=clamp((p('plugin')-.55)/.2);c+=btn(cx+cw-260,cy+178,200,k>.5?'Enable':'Install plugin','primary',clamp((p('plugin')-.3)/.25));
  c+=S.text(cx+30,cy+300,pick(v,'若顯示 Enable，就按 Enable','If it shows Enable, select Enable'),{'font-size':21,fill:C.sub})}
 if(n==='toggles'){const k=p('toggles');c+=uiCard(cx,cy,cw,330,'Computer Use');
  [['server','MCP server'],['skill','Skill']].forEach(([a,b],i)=>{const y=cy+90+i*80;c+=S.text(cx+40,y+34,a,{'font-size':28,'font-weight':800,fill:C.ink})+S.text(cx+190,y+34,b,{'font-size':20,fill:C.muted})+toggle(cx+cw-120,y+8,clamp((k-.1-i*.18)/.15))});
  c+=btn(cx+cw/2-120,cy+262,240,'Try now','primary',clamp((k-.6)/.25))}
 if(n==='macperm'){const k=p('macperm');c+=uiCard(cx,cy,cw,350,pick(v,'系統設定 › 隱私權與安全性','System Settings › Privacy & Security'));
  [[pick(v,'螢幕錄製','Screen Recording'),'eye'],[pick(v,'輔助使用','Accessibility'),'hand']].forEach(([a,ic],i)=>{const y=cy+80+i*126;
   c+=S.rect({x:cx+30,y,width:cw-60,height:108,rx:12,fill:'#fff',stroke:'#d8d0c2','stroke-width':2})+badgeIcon(ic,cx+84,y+54,30,C.codex)+S.text(cx+132,y+46,a,{'font-size':28,'font-weight':800,fill:C.ink})+
    S.text(cx+132,y+82,'Codex Computer Use',{'font-size':21,fill:C.sub})+toggle(cx+cw-130,y+38,clamp((k-.25-i*.25)/.15))})}
 if(n==='mention'){const k=p('mention'),full='@Computer '+pick(v,'打開「期末報告」簡報，逐頁檢查標題…','open the final-report slides and check each title…'),shown=full.slice(0,Math.round(full.length*clamp(k/.55)));
  c+=uiCard(cx,cy,cw,330,pick(v,'對話','Chat'));c+=S.rect({x:cx+30,y:cy+90,width:cw-60,height:100,rx:20,fill:'#fff',stroke:C.codex,'stroke-width':3});
  const m=shown.startsWith('@Computer')?'@Computer':shown;c+=S.rect({x:cx+50,y:cy+118,width:tw('@Computer',26)+20,height:44,rx:10,fill:C.codexL})+S.text(cx+60,cy+149,m,{'font-size':26,'font-weight':800,fill:C.codex});
  if(shown.length>10)c+=S.text(cx+70+tw('@Computer',26),cy+149,shown.slice(10),{'font-size':fit(shown.slice(10),cw-140-tw('@Computer',26),24),fill:C.ink});
  c+=fade(clamp((k-.55)/.2),S.text(cx+30,cy+240,pick(v,'說清楚：哪個 App・哪個視窗・做什麼','Say which app · which window · what to do'),{'font-size':24,'font-weight':700,fill:C.sub})+S.text(cx+30,cy+282,pick(v,'也可以 @ 加上 App 名稱','or @ followed by the app name'),{'font-size':21,fill:C.muted}),6)}
 if(n==='allow'){const k=p('allow');c+=uiCard(cx,cy,cw,300,pick(v,'權限請求','Permission request'));c+=badgeIcon('slide',cx+80,cy+122,34,'#f0a65a')+S.text(cx+132,cy+130,pick(v,'Codex 想使用「簡報」','Codex wants to use “Slides”'),{'font-size':28,'font-weight':800,fill:C.ink});
  c+=btn(cx+cw-520,cy+200,200,'Allow','',clamp((k-.35)/.2))+btn(cx+cw-300,cy+200,240,'Always allow','primary',clamp((k-.6)/.2))}
 if(n==='manage'){const k=p('manage');c+=uiCard(cx,cy,cw,470,pick(v,'設定 › Computer use › Control','Settings › Computer use › Control'));
  const rows=[['Any App',pick(v,'任何 App','every app'),''],['Google Chrome',pick(v,'連接擴充功能','connect the extension'),'Manage'],['Microsoft Excel',pick(v,'增益集：更多控制','add-in: extra control'),'add-in'],['Microsoft PowerPoint',pick(v,'增益集：更多控制','add-in: extra control'),'add-in']];
  rows.forEach(([a,b,tag],i)=>{const y=cy+72+i*96,u2=clamp((k-.05-i*.15)/.15);c+=fade(u2,S.rect({x:cx+30,y,width:cw-60,height:82,rx:12,fill:i===0?C.codexL:'#fff',stroke:'#d8d0c2','stroke-width':2})+S.text(cx+56,y+36,a,{'font-size':25,'font-weight':800,fill:C.ink})+S.text(cx+56,y+66,b,{'font-size':19,fill:C.sub})+(tag?pill(cx+cw-60,y+50,tag,'#ebe6dc',C.ink,19,{anchor:'middle'}):''),6)})}
 if(n==='admin'){c+=uiCard(cx,cy,cw,330,pick(v,'公司／組織帳號','Work or organization account'));c+=badgeIcon('building',cx+90,cy+150,44,C.ink)+S.text(cx+160,cy+140,pick(v,'管理員可以停用這個功能','An admin can turn it off'),{'font-size':28,'font-weight':800,fill:C.ink})+
  S.text(cx+160,cy+180,pick(v,'或限制能存取的 App','or limit which apps it can reach'),{'font-size':23,fill:C.sub});
  c+=S.rect({x:cx+30,y:cy+226,width:cw-60,height:70,rx:10,fill:'#1f2430'})+S.text(cx+56,cy+270,'requirements.toml   [features] computer_use = false',{'font-size':22,fill:'#cfe3f7','font-family':'Consolas, monospace'})}
 if(n){o+=fade(u,c,10);B.push({id:'ui',x:cx,y:cy,width:cw,height:480,overlapGroup:'panel'})}
 o+=S.text(PX+PW-34,PH-28,pick(v,'按鈕名稱依官方文件（英文介面）','Labels as in the official docs'),{'font-size':16,fill:C.bpLine,'text-anchor':'end',opacity:.8});
 return o;
};

// ═════════ 6 demo: page-by-page slide check ═════════
SCENES.demo=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),task=p('task'),scan=p('scan'),fix=p('fix'),res=p('result'),lim=p('limit'),save=p('save'),chk=p('check');
 const page=scan>0&&fix<=0?Math.min(12,1+Math.floor(scan*12)):fix>0&&res<=0?(fix<.5?3:7):1;
 const fixU=fix>0?E.inout(clamp(((fix<.5?fix:fix-.5)/.5-.35)/.4)):0,isBad=pg=>(pg===3||pg===7);
 const fitNow=fix>0&&res<=0?fixU:(res>0?1:0);
 const flash=scan>0&&fix<=0?Math.max(0,Math.sin((scan*12%1)*Math.PI))*.5*(scan<1?1:0):0;
 const d=desk(intro,{fit:isBad(page)||fix>0?fitNow:1,flash,slide:{pageLabel:page+' / 12',page:(page-1)%4,plain:!isBad(page)&&fix<=0},kbTint:lim>0&&save<=0?E.inout(clamp(lim/.2)):0},B);
 let o=d.svg;
 if(fix>0&&res<=0){const [tx,ty]=d.target;o+=cursor(tx,ty,'',clamp(((fix<.5?fix:fix-.5)/.5-.2)/.2),0)}
 o+=pill(170,30,isEn(v)?'DEMO · 示範情境':'示範情境 · DEMO',C.amber,'#fff',22,{anchor:'middle'});
 o+=bpPanel(BP.x,BP.y,BP.w,BP.h,'',B);
 const pre=lim>0?E.inout(clamp(lim/.15)):0;
 let q='';
 if(pre<1){let a='';
  // the request
  const [tq]=L(v,'@Computer 打開期末報告簡報，逐頁檢查標題是否超出版面，有就縮小字級，最後回報。','@Computer open the final-report slides, check every page for overflowing titles, shrink them, and report back.');
  a+=fade(clamp(task/.15),S.rect({x:BP.x+34,y:24,width:BP.w-68,height:150,rx:18,fill:'#fff'})+icon('person',BP.x+50,40,.8,C.sub,3)+para(BP.x+100,66,tq,BP.w-160,22,{fill:C.ink,'font-weight':600}),8);
  // the four parts of a case, shown while the request is read
  if(scan<=0){const parts=[['問題','Problem'],['使用過程','Process'],['結果','Result'],['限制','Limits']];
   parts.forEach(([z,e],i)=>{const k=clamp((task-.15-i*.12)/.15),y=214+i*82,[pa,pb]=L(v,z,e);
    a+=fade(k,S.rect({x:BP.x+120,y,width:BP.w-240,height:66,rx:33,fill:i===0?'#fff':C.bpL})+S.text(BP.x+170,y+43,String(i+1),{'font-size':26,'font-weight':800,fill:i===0?C.amber:'#fff','text-anchor':'middle'})+
     S.text(BP.x+214,y+43,pa,{'font-size':26,'font-weight':800,fill:i===0?C.ink:'#fff'})+S.text(BP.x+BP.w-150,y+42,pb,{'font-size':18,fill:i===0?C.muted:C.bpLine,'text-anchor':'end'}),6)})}
  // 12 page thumbnails
  if(scan>0){const gx=BP.x+44,gy=200,cw=92,ch=64;
   for(let i=0;i<12;i++){const x=gx+(i%6)*(cw+8),y=gy+Math.floor(i/6)*(ch+34),pg=i+1,seen=scan>0&&(pg<page||fix>0||res>0),bad=isBad(pg)&&seen,fixed=(pg===3&&(fix>.45||res>0))||(pg===7&&(fix>.95||res>0));
    a+=S.rect({x,y,width:cw,height:ch,rx:6,fill:'#fff',stroke:pg===page&&res<=0?C.codex:bad?(fixed?C.green:C.red):'#9fb7cf','stroke-width':pg===page&&res<=0?4:bad?3:1.5})+S.rect({x:x+10,y:y+14,width:bad&&!fixed?cw+6:cw-30,height:8,rx:4,fill:bad?(fixed?C.green:C.red):'#c8d3df'})+S.rect({x:x+10,y:y+32,width:50,height:6,rx:3,fill:'#dfe6ee'})+
     S.text(x+cw/2,y+ch+22,String(pg),{'font-size':17,fill:C.bpLine,'text-anchor':'middle'})}
   if(res<=0)a+=S.text(BP.x+44,440,pick(v,`第 ${page} 頁／共 12 頁`,`Page ${page} of 12`),{'font-size':22,'font-weight':700,fill:'#fff'})}
  if(res>0){const k=clamp(res/.2);a+=fade(k,S.rect({x:BP.x+34,y:470,width:BP.w-68,height:110,rx:16,fill:C.greenL,stroke:C.green,'stroke-width':3})+badgeIcon('check',BP.x+90,525,30,C.green)+
   S.text(BP.x+136,515,pick(v,'12 頁中修改了 2 頁','Changed 2 of 12 pages'),{'font-size':28,'font-weight':800,fill:C.ink})+S.text(BP.x+136,552,pick(v,'第 3、7 頁縮小字級，其餘正常','Pages 3 & 7 resized; the rest are fine'),{'font-size':21,fill:C.sub}),8)}
  q+=S.g({opacity:1-pre},a)}
 if(pre>0){let b=S.text(BP.x+34,52,isEn(v)?'LIMITS · 限制':'限制 · LIMITS',{'font-size':22,'font-weight':700,fill:C.bpLine,'letter-spacing':3});
  const rows=[{on:lim,ic:'window',z:['Windows：占用滑鼠和鍵盤','第二台裝置・虛擬機・先暫停任務'],e:['Windows: takes over mouse & keyboard','second device · VM · pause the task']},
   {on:save,ic:'save',z:['存檔＋專案追蹤','變更才出現在審閱面板'],e:['Save + tracked by the project','then changes show in the review pane']},
   {on:chk,ic:'eye',z:['自己再翻一次','截圖判斷也可能看錯'],e:['Flip through it yourself','screenshot judgment can be wrong']}];
  rows.forEach((r,i)=>{const y=90+i*162,u=clamp(r.on/.2),[a1,a2]=isEn(v)?r.e:r.z;if(u<=0)return;
   b+=fade(u,S.rect({x:BP.x+34,y,width:BP.w-68,height:140,rx:14,fill:'#fff'})+badgeIcon(r.ic,BP.x+96,y+70,38,C.amber)+S.text(BP.x+152,y+60,a1,{'font-size':fit(a1,450,27),'font-weight':800,fill:C.ink})+S.text(BP.x+152,y+98,a2,{'font-size':fit(a2,450,21),fill:C.sub}),8);
   B.push({id:'lim'+i,x:BP.x+34,y,width:BP.w-68,height:140,overlapGroup:'panel'})});
  q+=S.g({opacity:pre},b)}
 return o+q;
};

// ═════════ 7 outlook + recap ═════════
SCENES.outlook=function(s,t,B,v){
 const p=phaser(s,t),intro=clamp((t-s.start)/.8),rc=p('recap'),rcU=E.inout(clamp(rc/.12));
 const cols=[{x:0,c:C.green,h:['已公布','Announced'],items:[
   {on:p('locked'),t:'Locked use',d:'2026-05-21 · macOS',z:'Mac 鎖定後，遠端任務可暫時解鎖；偵測到本機輸入就重新鎖定',e:'A remote task can briefly unlock a locked Mac; local input locks it again'},
   {on:p('replay'),t:'Record & Replay',d:'2026-06-18 · macOS',z:'示範一次流程，變成可重用的 skill',e:'Demonstrate once, get a reusable skill'}]},
  {x:584,c:C.amber,h:['推測的趨勢','Inferred trend'],items:[
   {on:p('trend'),t:pick(v,'結構化整合變多','More structured integrations'),d:pick(v,'推測・非官方公布','Inference, not announced'),z:'外掛／MCP 越來越多；Computer use 補上沒有介面可接的最後一哩',e:'Plugins/MCP keep growing; Computer use covers the last mile with no interface'}]},
  {x:1168,c:C.red,h:['未解問題','Open questions'],items:[
   {on:p('open'),t:pick(v,'截圖判斷的可靠度','Screenshot reliability'),d:'',z:'',e:''},
   {on:clamp((p('open')-.25)*2),t:pick(v,'網頁與文件裡的提示注入','Prompt injection in pages & files'),d:'',z:'',e:''},
   {on:clamp((p('open')-.55)*2),t:pick(v,'代理出錯時的責任歸屬','Who is responsible for mistakes'),d:'',z:'',e:''}]}];
 let o='';const W=560,Y=20,H=560;
 let cl='';
 cols.forEach((col,ci)=>{const u=E.back(clamp(intro*1.5-ci*.15)),[h1,h2]=L(v,...col.h);
  let c=paper(col.x,Y,W,H)+S.rect({x:col.x,y:Y,width:W,height:84,rx:16,fill:col.c})+S.rect({x:col.x,y:Y+60,width:W,height:24,fill:col.c})+cube(col.x+56,Y+68,30,30,tri(shade(col.c,1.25)))+
   S.text(col.x+104,Y+52,h1,{'font-size':32,'font-weight':800,fill:'#fff'})+S.text(col.x+W-24,Y+52,h2,{'font-size':19,fill:'#ffffffcc','text-anchor':'end'});
  let y=Y+120;
  const tint={[C.green]:C.greenL,[C.amber]:C.amberL,[C.red]:C.redL}[col.c];
  col.items.forEach(it=>{const k=clamp(it.on/.2);const desc=pick(v,it.z,it.e),lines=desc?wrap(desc,W-70,23):[],hh=it.d||desc?66+lines.length*31+(it.d?32:0):76;
   if(k>0){c+=fade(k,S.rect({x:col.x+20,y,width:W-40,height:hh,rx:12,fill:tint})+S.rect({x:col.x+20,y,width:8,height:hh,rx:4,fill:col.c})+
     S.text(col.x+44,y+44,it.t,{'font-size':fit(it.t,W-80,29),'font-weight':800,fill:C.ink})+(it.d?S.text(col.x+44,y+78,it.d,{'font-size':20,'font-weight':700,fill:col.c}):'')+
     lines.map((ln,j)=>S.text(col.x+44,y+(it.d?112:78)+j*31,ln,{'font-size':23,fill:C.sub})).join(''),8)}
   y+=hh+16});
  cl+=S.g({opacity:clamp(u*2),transform:`translate(0 ${(1-u)*24})`},c);B.push({id:'col'+ci,x:col.x,y:Y,width:W,height:H,overlapGroup:'cols'})});
 o+=S.g({opacity:1-.8*rcU},cl);
 if(rc>0){const pts=[['loop','看→想→做的循環操作 App','A see → decide → act loop runs apps'],['lock','先給權限，管好允許清單','Grant permissions; keep the allow list tidy'],['plug','先用指令／外掛／瀏覽器，畫面才做得到的事再交給它','Commands, plugins, or a browser first; screen-only jobs go to it']];
  let r=paper(160,40,1408,520,{stroke:C.codex,sw:4})+S.text(864,112,pick(v,'重點回顧','Recap'),{'font-size':44,'font-weight':800,fill:C.codex,'text-anchor':'middle'});
  pts.forEach(([ic,z,e],i)=>{const k=clamp((rc-.05-i*.22)/.18),[a,b]=L(v,z,e),y=170+i*124;r+=fade(k,S.circle({cx:290,cy:y+50,r:40,fill:C.codex})+icon(ic,266,y+26,1,'#fff',3.6)+
   S.text(360,y+48,a,{'font-size':fit(a,1150,32),'font-weight':800,fill:C.ink})+S.text(360,y+86,b,{'font-size':fit(b,1150,21),fill:C.muted}),8)});
  o+=fade(rcU,r,14);B.push({id:'recap',x:160,y:40,width:1408,height:528,overlapGroup:'cols'})}
 return o;
};
