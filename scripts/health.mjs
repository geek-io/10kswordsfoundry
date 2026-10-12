// Rules 2.0.3 pp.38, 67: extra maximum Health adds Hale levels, KO is not extra HP.
export function healthSutra(health = {value:6,max:6}) {
  const max = Math.max(0, Math.trunc(Number(health.max) || 0));
  const value = Math.max(0, Math.min(max, Math.trunc(Number(health.value) || 0)));
  const label = remaining => remaining === 0 ? "Knocked Out" : remaining === 1 ? "Critical" : remaining <= 3 ? "Bloody" : "Hale";
  const penalty = value === 1 ? -3 : value > 1 && value <= 3 ? -1 : 0;
  return {value, max, penalty, status:label(value), knockedOut:value === 0,
    boxes:Array.from({length:max}, (_,index) => {
      const remaining = max-index;
      const wounded = value < remaining;
      return {label:label(remaining), penalty:remaining === 1 ? -3 : remaining <= 3 ? -1 : 0,
        wounded, selected:value===remaining, tone:remaining===1?"critical":remaining<=3?"bloody":"hale", value:remaining};
    })};
}

export function armorTrack(armor={value:0,max:0}) {
 const max=Math.max(0,Math.trunc(Number(armor.max)||0)),value=Math.max(0,Math.min(max,Math.trunc(Number(armor.value)||0)));
 return {max,value,boxes:Array.from({length:max},(_,index)=>({value:index+1,filled:index<value,selected:index+1===value}))};
}
