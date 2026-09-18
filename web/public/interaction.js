/* Shared, delegated interactions for static and React pages. */
(()=>{
 if(window.worldforgeInteractions)return;window.worldforgeInteractions=true;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 const setMenu=(menu,open)=>{menu.dataset.expanded=String(open);const toggle=menu.querySelector('.notch-toggle');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label','Navigation');};
 document.addEventListener('pointerover',e=>{const menu=e.target.closest('.notch-menu');if(menu&&fine.matches&&!menu.contains(e.relatedTarget))setMenu(menu,true);});
 document.addEventListener('pointerout',e=>{const menu=e.target.closest('.notch-menu');if(menu&&fine.matches&&!menu.contains(e.relatedTarget))setMenu(menu,false);});
 document.addEventListener('focusin',e=>{const menu=e.target.closest('.notch-menu');if(menu)setMenu(menu,true);});
 document.addEventListener('focusout',e=>{const menu=e.target.closest('.notch-menu');if(menu&&!menu.contains(e.relatedTarget))setMenu(menu,false);});
 document.addEventListener('click',e=>{
   const menu=e.target.closest('.notch-menu');
   document.querySelectorAll('.notch-menu[data-expanded=true]').forEach(other=>{if(other!==menu)setMenu(other,false);});
   // Hover/focus already opens the desktop menu. Touch opens on tap.
   if(e.target.closest('.notch-toggle')&&menu)setMenu(menu,true);
   if(menu&&e.target.closest('a'))setMenu(menu,false);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.notch-menu[data-expanded=true]').forEach(menu=>{menu.querySelector('button').focus();setMenu(menu,false);});hideCursor();});
 const cursor=document.createElement('div');cursor.className='magnetic-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<i></i><b></b>';document.body.append(cursor);
 let target=null,frame=0,last=null;
 function resetTarget(){if(target){target.style.removeProperty('translate');target=null;}}
 function hideCursor(){cursor.classList.remove('visible');document.documentElement.classList.remove('custom-pointer');resetTarget();}
 function update(){
   frame=0;if(!last)return;const e=last;
   // Preserve native editing, resizing, video and 3D viewport pointers.
   if(!fine.matches||motion.matches||e.pointerType!=='mouse'||e.target.closest('input,textarea,select,canvas,video,dialog,[role=separator]')){hideCursor();return;}
   const next=e.target.closest('.notch-menu a,.notch-toggle,.pill-button,.quiet-link,.ai-connection-button,.maker-link');
   if(next!==target){resetTarget();target=next;}
   let dx=0,dy=0;
   if(target){const r=target.getBoundingClientRect();dx=Math.max(-5,Math.min(5,(e.clientX-r.left-r.width/2)*.12));dy=Math.max(-4,Math.min(4,(e.clientY-r.top-r.height/2)*.12));target.style.translate=dx+'px '+dy+'px';}
   cursor.style.setProperty('--x',e.clientX+'px');cursor.style.setProperty('--y',e.clientY+'px');cursor.style.setProperty('--mx',dx+'px');cursor.style.setProperty('--my',dy+'px');cursor.classList.toggle('over-control',!!target);cursor.classList.add('visible');document.documentElement.classList.add('custom-pointer');
 }
 document.addEventListener('pointermove',e=>{last=e;if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 document.addEventListener('pointerdown',()=>cursor.classList.add('pressed'));
 document.addEventListener('pointerup',()=>cursor.classList.remove('pressed'));
 document.documentElement.addEventListener('pointerleave',hideCursor);window.addEventListener('blur',hideCursor);document.addEventListener('scroll',hideCursor,true);motion.addEventListener('change',hideCursor);fine.addEventListener('change',hideCursor);
})();
