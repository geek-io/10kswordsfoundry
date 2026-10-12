export function registerStrikeColors(){
 Hooks.on('renderChatMessageHTML',(message,html)=>{
  if(!(message.rolls??[]).some(r=>/d6.*cs>=4/.test(r.formula)))return;
  html.classList.add('swords-roll');
  for(const die of html.querySelectorAll('.dice-tooltip .die')){
   if(die.classList.contains('discarded')||die.classList.contains('rerolled'))continue;
   const value=Number(die.textContent.trim());if(value===6){die.classList.add('swords-perfect');die.title='Perfect Strike (6)';}else if(value===4||value===5){die.classList.add('swords-strike');die.title='Strike (4 or 5)';}
  }
 });
}
