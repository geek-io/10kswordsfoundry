// Foundry v14 moves tokens with WASD and pans the map with the arrow keys.
// These system keybindings let the arrow keys move the selected token(s) one grid space at a time.
// With nothing selected the key falls through, so the arrows still pan the map.
// Players can rebind or clear them under Configure Controls.
const DIRECTIONS={Up:[0,-1],Down:[0,1],Left:[-1,0],Right:[1,0]};
const held=[];
// Directions pressed since the last move; kept even if the key is released before the move runs.
const pending=[];
let lastMove=0,timer=null;
function movableLayer(){
 if(!globalThis.canvas?.ready)return null;
 const layer=canvas.activeLayer;
 return layer?.options?.keyboardMovableObjects&&layer.controlled?.length?layer:null;
}
function step(rotate){
 timer=null;lastMove=Date.now();
 const layer=movableLayer();
 const keys=[...new Set([...pending,...held])];pending.length=0;
 if(!layer||!keys.length)return;
 let dx=0,dy=0;for(const key of keys){dx+=DIRECTIONS[key][0];dy+=DIRECTIONS[key][1];}
 dx=Math.sign(dx);dy=Math.sign(dy);
 const grid=canvas.grid;
 const diagonals=(grid.type!==CONST.GRID_TYPES.SQUARE)||(grid.diagonals!==CONST.GRID_DIAGONALS.ILLEGAL);
 if(!diagonals&&dx&&dy){const [x,y]=DIRECTIONS[keys.at(-1)];dx=x;dy=y;}
 if(!dx&&!dy)return;
 layer.moveMany({dx,dy,rotate}).catch(error=>ui.notifications.warn(error.message));
}
function onDown(context,key){
 if(!movableLayer())return false;
 if(!held.includes(key))held.push(key);
 if(!pending.includes(key))pending.push(key);
 // Wait 50 ms to catch a second arrow for diagonals, and move at most once per 100 ms while a key repeats.
 if(!timer)timer=setTimeout(()=>step(context.isShift),Math.max(50,lastMove+100-Date.now()));
 return true;
}
function onUp(context,key){
 const index=held.indexOf(key);if(index>=0)held.splice(index,1);
 return false;
}
export function registerArrowMovement(){
 for(const key of Object.keys(DIRECTIONS)){
  game.keybindings.register('10kswordsfoundry',`arrowMove${key}`,{
   name:`Move selected token ${key.toLowerCase()} (arrow key)`,
   hint:'Moves the selected token one grid space. With no token selected the arrow keys pan the map as usual.',
   editable:[{key:`Arrow${key}`}],
   onDown:context=>onDown(context,key),
   onUp:context=>onUp(context,key),
   reservedModifiers:['Shift'],
   repeat:true,
   precedence:CONST.KEYBINDING_PRECEDENCE.PRIORITY
  });
 }
}
