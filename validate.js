
// Make content sections collapsible and collapsed by default.
document.querySelectorAll('main > .card').forEach(card=>{
 if(card.id==='reportOptions')return;
 const heading=card.querySelector(':scope > h2');
 if(!heading)return;
 const intro=card.querySelector(':scope > p.intro');
 const details=document.createElement('details'); details.className='section-collapse';
 const summary=document.createElement('summary'); summary.textContent=heading.textContent;
 details.appendChild(summary);
 if(intro){details.appendChild(intro);}
 const content=document.createElement('div'); content.className='section-content';
 [...card.children].forEach(child=>{if(child!==heading && child!==intro)content.appendChild(child)});
 details.appendChild(content);
 card.replaceChildren(details);
});
const $=id=>document.getElementById(id);
const ids=['dateTime','incidentStart','incidentEnd','reporter','agency','contact','summary','location','type','hazards','access','casualties','services','updates','colocate','communicate','coordinate','risk','ssa','decisions','hotHidden','hotObvious','hotTypical','hotActions','hotNotified','whatDoing','whatBehaviour','whatAlone','whatThreat','securityRisk','securityActions'];
const radios=['major','hotH','hotO','hotT','whatW','whatH','whatA','whatT'];
const storageKey='jesipIncidentAssessment.v3';
function val(id){return ($(id)?.value||'').trim()}
function formatDateTime(value){if(!value)return '';const m=value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);return m?`${m[3]}/${m[2]}/${m[1].slice(-2)} ${m[4]}:${m[5]}`:value}
function formatTime(value){return value?value.slice(0,5):''}
function radio(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||'Not recorded'}
function field(label,id){const v=val(id);return v?`${label}: ${v}`:''}
function sectionEnabled(name){if(name==='details')return true;return document.querySelector(`.report-section[value="${name}"]`)?.checked!==false}
function compact(lines){return lines.filter(Boolean)}
function buildReport(){
 const lines=[];
 if(sectionEnabled('details')){
  lines.push('','INCIDENT DETAILS',(val('dateTime')?`Reported: ${formatDateTime(val('dateTime'))}`:''),(val('incidentStart')?`Incident start time: ${formatTime(val('incidentStart'))}`:''),(val('incidentEnd')?`Incident conclusion / stood down time: ${formatTime(val('incidentEnd'))}`:'Incident conclusion / stood down time: ONGOING'),field('Reporter / call sign / headcode','reporter'),field('Organisation / agency / operator','agency'),field('Contact / radio channel / phone number','contact'),field('Initial incident summary','summary'));
 }
 if(sectionEnabled('methane')){
  const methane=compact([field('E — Exact location','location'),field('T — Type of incident','type'),field('H — Hazards present or suspected','hazards'),field('A — Access and egress','access'),field('N — Number and severity of casualties','casualties'),field('E — Emergency services present / required','services'),field('Further information / updates','updates')]);
  const major=document.querySelector('input[name="major"]:checked')?.value;
  if(major && major!=='Unknown') methane.unshift(`M — Major incident status: ${major}`);
  if(methane.length)lines.push('','M/ETHANE REPORT',...methane);
 }
 if(sectionEnabled('jesip')){
  const jesip=compact([field('Co-locate','colocate'),field('Communicate','communicate'),field('Co-ordinate','coordinate'),field('Jointly understand risk','risk'),field('Shared situational awareness','ssa'),field('Actions / decisions / owner','decisions')]);
  if(jesip.length)lines.push('','JESIP PRINCIPLES / SHARED UNDERSTANDING',...jesip);
 }
 if(sectionEnabled('hot')){
  const hot=[];
  [['H — Hidden','hotH','hotHidden'],['O — Obviously suspicious','hotO','hotObvious'],['T — Typical','hotT','hotTypical']].forEach(([label,r,id])=>{const answer=radio(r);const observation=field('Observations / context',id);if(observation || (answer && answer!=='Unknown'))hot.push(`${label}${answer&&answer!=='Unknown'?': '+answer:''}`,observation)});
  hot.push(field('Actions taken','hotActions'),field('Who was notified / when','hotNotified'));
  const clean=compact(hot);if(clean.length)lines.push('','HOT ASSESSMENT — SUSPICIOUS ITEM',...clean);
 }
 if(sectionEnabled('what')){
  const what=compact([field('W — What are they doing?','whatDoing'),field('H — How are they behaving?','whatBehaviour'),field('A — Are they alone or with others?','whatAlone'),field('T — What threat do they pose?','whatThreat'),field('Overall security concern / rationale','securityRisk'),field('Immediate actions / escalation','securityActions')]);
  if(what.length)lines.push('','WHAT SECURITY ASSESSMENT',...what);
 }
 return lines.length>1?lines.join('\n'):'No completed information in the selected report sections.';
}
function state(){const s={};ids.forEach(id=>s[id]=$(id).value);radios.forEach(n=>s['radio:'+n]=radio(n));return s}
function applyState(s){if(!s)return;ids.forEach(id=>{if(s[id]!==undefined)$(id).value=s[id]});radios.forEach(n=>{const el=[...document.querySelectorAll(`input[name="${n}"]`)].find(x=>x.value===s['radio:'+n]);if(el)el.checked=true});updatePreview()}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state()));const stamp='Auto-saved on this device · '+new Date().toLocaleTimeString();$('saveStatus').textContent=stamp;if($('topSaveStatus'))$('topSaveStatus').textContent=stamp;}catch(e){$('saveStatus').textContent='Unable to save in this browser';if($('topSaveStatus'))$('topSaveStatus').textContent='Auto-save unavailable in this browser';}}
function updatePreview(){$('preview').textContent=buildReport();save()}
ids.forEach(id=>$(id).addEventListener('input',updatePreview));
radios.forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(el=>el.addEventListener('change',updatePreview)));
document.querySelectorAll('.report-section').forEach(el=>el.addEventListener('change',updatePreview));
async function copyReport(){const text=buildReport();try{await navigator.clipboard.writeText(text);alert('Report copied to clipboard.')}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();alert(ok?'Report copied to clipboard.':'Copy was blocked. Use the report preview to select and copy.');}}
$('copyBtn').addEventListener('click',copyReport);
$('emailBtn').addEventListener('click',()=>{const subject=encodeURIComponent('HOT / What Incident Aid Memoire — '+(val('location')||'Location not recorded'));const body=encodeURIComponent(buildReport());location.href=`mailto:?subject=${subject}&body=${body}`;});
$('pdfBtn').addEventListener('click',()=>{updatePreview();window.print()});
$('saveBtn').addEventListener('click',()=>{save();$('saveStatus').textContent='Saved on this device · '+new Date().toLocaleTimeString();if($('topSaveStatus'))$('topSaveStatus').textContent='Saved on this device · '+new Date().toLocaleTimeString();});
$('restoreBtn').addEventListener('click',()=>{try{applyState(JSON.parse(localStorage.getItem(storageKey)||'null'));$('saveStatus').textContent='Saved form restored';}catch(e){alert('No saved form was found.')}});
$('clearBtn').addEventListener('click',()=>{if(!confirm('Clear every field and replace the saved form? This cannot be undone.'))return;ids.forEach(id=>$(id).value='');radios.forEach(n=>{const def=document.querySelector(`input[name="${n}"][value="${n==='major'||n==='hotH'||n==='hotO'||n==='hotT'||n==='whatW'||n==='whatH'||n==='whatA'||n==='whatT'?'Unknown':''}"]`);if(def)def.checked=true});$('dateTime').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);updatePreview();});
const updateModal=$('updateModal');
function openUpdateModal(){const now=new Date(Date.now()-new Date().getTimezoneOffset()*60000);$('updateEntryTime').value=now.toISOString().slice(11,16);$('updateEntryText').value='';updateModal.hidden=false;$('updateEntryText').focus()}
function closeUpdateModal(){updateModal.hidden=true}
$('addUpdateBtn').addEventListener('click',openUpdateModal);
$('closeUpdateModal').addEventListener('click',closeUpdateModal);
$('cancelUpdate').addEventListener('click',closeUpdateModal);
updateModal.addEventListener('click',e=>{if(e.target===updateModal)closeUpdateModal()});
$('submitUpdate').addEventListener('click',()=>{const detail=$('updateEntryText').value.trim();if(!detail){alert('Enter update details before submitting.');$('updateEntryText').focus();return}const time=$('updateEntryTime').value||'Time not recorded';const existing=$('updates').value.trim();$('updates').value=existing?existing+'\n'+time+' — '+detail:time+' — '+detail;closeUpdateModal();updatePreview()});
const dt=new Date(Date.now()-new Date().getTimezoneOffset()*60000);$('dateTime').value=dt.toISOString().slice(0,16);$('incidentStart').value=dt.toISOString().slice(11,16);
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved)applyState(saved);else updatePreview()}catch(e){updatePreview()}
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
