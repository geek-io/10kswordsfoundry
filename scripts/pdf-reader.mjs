const base=new URL('../assets/vendor/pdf-reader/',import.meta.url);
export function pdfPages(range,total){
 const selected=new Set();
 if(!String(range).trim()){if(total>20)throw Error('Choose a page range of up to 20 pages.');return Array.from({length:total},(_,i)=>i+1);}
 for(const part of String(range).split(',')){
  const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m)throw Error('Use page numbers such as 12-14, 18.');
  const a=Number(m[1]),b=Number(m[2]??m[1]);if(a<1||b<a||b>total||b-a>=20)throw Error(`Choose up to 20 pages between 1 and ${total}.`);
  for(let n=a;n<=b;n++)selected.add(n);
 }
 if(selected.size>20)throw Error('Read at most 20 pages at a time.');return [...selected].sort((a,b)=>a-b);
}
// Column-aware reading (0.2.41). The 2.1 rulebook sets most pages in two columns; pdf.js returns runs in drawing order,
// which interleaves them. With a page width, text is laid out by position: left column top to bottom, then the right.
const box=item=>{const t=item.transform??[1,0,0,1,0,0],h=Math.abs(item.height||t[3]||10);return {str:String(item.str),x:t[4],y:t[5],w:Math.max(0,item.width??0),h};};
function pdfLines(boxes){
 const rows=[];
 for(const b of [...boxes].sort((a,b)=>b.y-a.y||a.x-b.x)){const row=rows.at(-1);if(row&&Math.abs(row.y-b.y)<=Math.max(3,Math.min(row.h,b.h)*0.45))row.items.push(b);else rows.push({y:b.y,h:b.h,items:[b]});}
 return rows.map(row=>row.items.sort((a,b)=>a.x-b.x).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean);
}
/** The x of a vertical gutter near the middle of the page that almost no text crosses, or null on a one-column page. */
export function pdfGutter(boxes,width){
 const wide=boxes.filter(b=>b.w>0);if(wide.length<12||!(width>0))return null;
 let best=null;
 for(let x=Math.round(width*0.35);x<=Math.round(width*0.65);x++){
  const crossing=wide.filter(b=>b.x<x-1&&b.x+b.w>x+1).length;
  if(!best||crossing<best.crossing)best={crossing,from:x,to:x};else if(crossing===best.crossing&&x===best.to+1)best.to=x;
 }
 if(!best)return null;
 const x=(best.from+best.to)/2,left=wide.filter(b=>b.x+b.w<=x+1).length,right=wide.filter(b=>b.x>=x-1).length;
 return best.crossing>wide.length*0.12||left<wide.length*0.15||right<wide.length*0.15?null:x;
}
export function pdfColumnText(items,width){
 const boxes=items.filter(i=>'str' in i&&String(i.str).trim()).map(box),gutter=pdfGutter(boxes,width);
 if(gutter===null)return pdfLines(boxes).join('\n');
 const out=[];let left=[],right=[];
 const flush=()=>{out.push(...pdfLines(left),...pdfLines(right));left=[];right=[];};
 // A run that crosses the gutter is a full-width heading or paragraph: it closes the columns above it.
 for(const b of [...boxes].sort((a,b)=>b.y-a.y||a.x-b.x)){if(b.x<gutter-1&&b.x+b.w>gutter+1){flush();out.push(b.str.trim());}else (b.x+b.w/2<gutter?left:right).push(b);}
 flush();return out.join('\n');
}
export function pdfText(items,width){
 if(width>0)return pdfColumnText(items,width);
 let text='',lastY;for(const item of items){if(!('str' in item))continue;
  const y=item.transform?.[5];if(lastY!==undefined&&Math.abs(y-lastY)>3&&!text.endsWith('\n'))text+='\n';
  text+=item.str+(item.hasEOL?'\n':' ');lastY=y;
 }return text.replace(/[ \t]+\n/g,'\n').trim();
}
export async function extractPdf(file,{range='',forceOCR=false,columns=false,progress=()=>{},cancelled=()=>false}={}){
 if(file.size>250*1024*1024)throw Error('Choose a PDF smaller than 250 MB.');
 const pdfjs=await import(new URL('pdfjs/pdf.mjs',base));
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs/pdf.worker.mjs',base).href;
 let worker,doc;const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,cMapUrl:new URL('pdfjs/cmaps/',base).href,cMapPacked:true,standardFontDataUrl:new URL('pdfjs/standard_fonts/',base).href,wasmUrl:new URL('pdfjs/wasm/',base).href});
 try{
  doc=await task.promise;const pages=pdfPages(range,doc.numPages),texts=[];
  for(const n of pages){
   if(cancelled())throw Error('PDF reading cancelled.');progress(`Reading page ${n} (${pages.indexOf(n)+1}/${pages.length})…`);
   const page=await doc.getPage(n);let text=pdfText((await page.getTextContent()).items,columns?page.getViewport({scale:1}).width:0);
   if(forceOCR||text.replace(/\s/g,'').length<30){
    progress(`Recognizing text on page ${n}…`);
    if(!worker){const {default:Tesseract}=await import(new URL('tesseract/tesseract.esm.min.js',base));worker=await Tesseract.createWorker('eng',1,{workerPath:new URL('tesseract/worker.min.js',base).href,corePath:new URL('core/tesseract-core-lstm.wasm.js',base).href,langPath:new URL('lang',base).href,workerBlobURL:false,logger:m=>{if(m.status==='recognizing text')progress(`OCR page ${n}: ${Math.round(m.progress*100)}%`);}});}
    const initial=page.getViewport({scale:1}),scale=Math.min(2,Math.sqrt(12000000/(initial.width*initial.height))),viewport=page.getViewport({scale});
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    try{await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;text=(await worker.recognize(canvas)).data.text;}finally{canvas.width=canvas.height=0;}
   }
   texts.push(text);page.cleanup();
  }
  if(cancelled())throw Error('PDF reading cancelled.');return texts.join('\n\n');
 }finally{await worker?.terminate();await task.destroy();}
}
export async function readPdf(){
 if(this.busy)return;this.rememberDraft();const state=this.importDrafts[this.tab];
 const file=this.element.querySelector('[name="pdf.file"]')?.files?.[0];if(!file)return ui.notifications.warn('Choose a PDF first.');
 const range=this.element.querySelector('[name="pdf.pages"]').value,forceOCR=this.element.querySelector('[name="pdf.ocr"]').checked,columns=!!this.element.querySelector('[name="pdf.columns"]')?.checked;
 this.pdfColumns=columns;
 this.busy=true;this.pdfCancelled=false;
 const progress=message=>{const el=this.element.querySelector('[data-pdf-status]');if(el)el.textContent=message;};
 try{const text=await extractPdf(file,{range,forceOCR,columns,progress,cancelled:()=>this.pdfCancelled});
  if(!text.trim())throw Error('No text was found. Try Force OCR or a different page range.');
  state.content=[state.content,text].filter(Boolean).join('\n\n');state.format='text';state.review='';state.names=[];state.status='PDF text added. Correct any recognition errors, then Preview entries.';
 }catch(error){ui.notifications.error(error.message);state.status=error.message;}
 finally{this.busy=false;await this.render({force:true});}
}
export function cancelPdf(){this.pdfCancelled=true;const el=this.element.querySelector('[data-pdf-status]');if(el)el.textContent='Cancelling after the current page…';}
