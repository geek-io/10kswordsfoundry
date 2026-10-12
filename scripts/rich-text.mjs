export function editorValue(value="") {
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value;
  return value ? `<p>${value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/\n\s*\n/g,'</p><p>').replaceAll('\n','<br>')}</p>` : "";
}
export async function enriched(value,document) {
  return foundry.applications.ux.TextEditor.implementation.enrichHTML(foundry.utils.cleanHTML(editorValue(value)),{secrets:document.isOwner,relativeTo:document});
}
