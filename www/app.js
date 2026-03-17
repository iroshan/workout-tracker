
const PLAN = {
  mon: { label: 'Monday', type: 'strength', title: 'Resistance A', items: [
    { name: 'Goblet squat', kind: 'strength', rep_low: 8, rep_high: 15 },
    { name: 'Single-arm floor press', kind: 'strength', rep_low: 8, rep_high: 12 },
    { name: 'Single-arm row', kind: 'strength', rep_low: 10, rep_high: 15 },
    { name: 'Romanian deadlift', kind: 'strength', rep_low: 10, rep_high: 15 }
  ]},
  tue: { label: 'Tuesday', type: 'zone2', title: 'Zone 2', items: [
    { name: 'Zone 2 cardio', kind: 'cardio', target_minutes: 40, target_hr: '130-145' }
  ]},
  wed: { label: 'Wednesday', type: 'strength', title: 'Resistance B', items: [
    { name: 'Split squat', kind: 'strength', rep_low: 8, rep_high: 12 },
    { name: 'Hip thrust / sofa glute bridge', kind: 'strength', rep_low: 10, rep_high: 15 },
    { name: 'Push-up or floor press', kind: 'strength', rep_low: 8, rep_high: 15 },
    { name: 'Chest-supported row', kind: 'strength', rep_low: 10, rep_high: 15 }
  ]},
  thu: { label: 'Thursday', type: 'intervals', title: 'Intervals', items: [
    { name: 'Intervals', kind: 'cardio', target_minutes: 28, target_hr: 'hard' }
  ]},
  fri: { label: 'Friday', type: 'strength', title: 'Resistance C', items: [
    { name: 'Romanian deadlift', kind: 'strength', rep_low: 10, rep_high: 15 },
    { name: 'Reverse lunge', kind: 'strength', rep_low: 8, rep_high: 12 },
    { name: 'Standing overhead press', kind: 'strength', rep_low: 8, rep_high: 12 },
    { name: 'Reverse fly', kind: 'strength', rep_low: 12, rep_high: 15 }
  ]},
  sat: { label: 'Saturday', type: 'zone2', title: 'Long Zone 2', items: [
    { name: 'Long Zone 2 walk / ruck', kind: 'cardio', target_minutes: 60, target_hr: '130-145' }
  ]},
  sun: { label: 'Sunday', type: 'rest', title: 'Rest Day', items: [
    { name: 'Recovery / mobility', kind: 'recovery' }
  ]}
};

let currentDay = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
let editingSessionId = null;
const STORE_KEY = 'workout-tracker-offline-v1';

const dayTabs = document.getElementById('dayTabs');
const dayTitle = document.getElementById('dayTitle');
const daySubtitle = document.getElementById('daySubtitle');
const dayBadge = document.getElementById('dayBadge');
const exerciseList = document.getElementById('exerciseList');
const sessionDate = document.getElementById('sessionDate');
const durationMinutes = document.getElementById('durationMinutes');
const avgHr = document.getElementById('avgHr');
const energy = document.getElementById('energy');
const soreness = document.getElementById('soreness');
const sessionNotes = document.getElementById('sessionNotes');
const saveStatus = document.getElementById('saveStatus');
const recentList = document.getElementById('recentList');
const detailDrawer = document.getElementById('detailDrawer');
const drawerBody = document.getElementById('drawerBody');
const editBanner = document.getElementById('editBanner');
const editSessionIdLabel = document.getElementById('editSessionId');
const deleteButton = document.getElementById('deleteSession');

function loadSessions(){ return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
function saveSessions(items){ localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function labelForType(type){ if(type==='strength') return 'Strength'; if(type==='zone2') return 'Zone 2'; if(type==='intervals') return 'Intervals'; return 'Recovery'; }
function resetForm(){ editingSessionId = null; editBanner.hidden = true; deleteButton.hidden = true; saveStatus.textContent = ''; sessionDate.value = todayISO(); durationMinutes.value=''; avgHr.value=''; energy.value=''; soreness.value=''; sessionNotes.value=''; setDay(currentDay); }
function buildTabs(){ dayTabs.innerHTML = Object.entries(PLAN).map(([key, day]) => `<button class="day-tab ${key===currentDay?'active':''}" data-key="${key}">${day.label.slice(0,3)}</button>`).join(''); dayTabs.querySelectorAll('.day-tab').forEach(btn => btn.addEventListener('click', () => { currentDay = btn.dataset.key; setDay(currentDay); })); }
function setDay(key){ currentDay = key; buildTabs(); const day = PLAN[key]; dayTitle.textContent = `${day.label} — ${day.title}`; daySubtitle.textContent = day.type === 'strength' ? 'Log your sets and get progression suggestions.' : 'Log the session and save it on the device.'; dayBadge.textContent = labelForType(day.type); renderExercises(day); }
function renderExercises(day){ exerciseList.innerHTML = day.items.map(item => { if(item.kind==='strength'){ return `<article class="exercise-card" data-name="${item.name}"><h3>${item.name}</h3><div class="exercise-sub">Target ${item.rep_low}-${item.rep_high} reps.</div><div class="triple"><div class="field"><label>Set 1</label><input type="number" class="set1"></div><div class="field"><label>Set 2</label><input type="number" class="set2"></div><div class="field"><label>Set 3</label><input type="number" class="set3"></div></div><div class="quad"><div class="field"><label>RIR</label><input type="number" min="0" max="6" class="rir"></div><div class="field"><label>Load (kg)</label><input type="number" step="0.5" min="0" class="load"></div><div class="field"><label>Form</label><select class="formq"><option value="good">Good</option><option value="ok">Okay</option><option value="poor">Poor</option></select></div><div class="field"><label>Suggestion</label><div class="suggestion js-suggestion">Enter reps to get guidance.</div></div></div></article>`; } if(item.kind==='cardio') return `<article class="exercise-card" data-name="${item.name}"><h3>${item.name}</h3><div class="exercise-sub">Target ${item.target_minutes || '-'} min${item.target_hr ? `, HR ${item.target_hr}` : ''}.</div></article>`; return `<article class="exercise-card" data-name="${item.name}"><h3>${item.name}</h3><div class="exercise-sub">Recovery / mobility.</div></article>`; }).join(''); attachSuggestionEvents(day); }
function calcSuggestion(item, s1, s2, s3, rir, form){ const vals=[s1,s2,s3].filter(v => Number.isFinite(v)); if(!vals.length) return 'Enter reps to get a progression suggestion.'; const minSet=Math.min(...vals), avg=vals.reduce((a,b)=>a+b,0)/vals.length; if(form==='poor') return 'Hold the same setup and improve form before progressing.'; if(minSet>=item.rep_high && (Number.isNaN(rir)||rir>=2)) return 'Progress next session: add load first, then pause or tempo if load is limited.'; if(avg>=item.rep_high-1 && !Number.isNaN(rir) && rir<=1) return 'Stay at the same load and own the top of the range with cleaner reps.'; if(minSet<item.rep_low) return 'Below target range: keep the same setup or regress slightly so all sets land in range.'; return 'Stay here and try to add 1 rep to one or more sets next time.'; }
function attachSuggestionEvents(day){ [...exerciseList.querySelectorAll('.exercise-card')].forEach((card, idx) => { const item = day.items[idx]; if(item.kind !== 'strength') return; const update = () => { const s1=parseInt(card.querySelector('.set1').value||''); const s2=parseInt(card.querySelector('.set2').value||''); const s3=parseInt(card.querySelector('.set3').value||''); const rir=parseInt(card.querySelector('.rir').value||''); const form=card.querySelector('.formq').value; card.querySelector('.js-suggestion').textContent = calcSuggestion(item, s1, s2, s3, rir, form); }; card.querySelectorAll('input,select').forEach(el => { el.addEventListener('input', update); el.addEventListener('change', update); }); }); }
function getPayload(){ const day = PLAN[currentDay]; const exercises = [...exerciseList.querySelectorAll('.exercise-card')].map((card, idx) => ({ exercise_name: day.items[idx].name, set1_reps: parseInt(card.querySelector('.set1')?.value || '') || null, set2_reps: parseInt(card.querySelector('.set2')?.value || '') || null, set3_reps: parseInt(card.querySelector('.set3')?.value || '') || null, rir: parseInt(card.querySelector('.rir')?.value || '') || null, load_kg: parseFloat(card.querySelector('.load')?.value || '') || null, form_quality: card.querySelector('.formq')?.value || null, suggestion: card.querySelector('.js-suggestion')?.textContent || '' })); return { id: editingSessionId || Date.now(), session_date: sessionDate.value, day_key: currentDay, day_type: day.type, duration_minutes: parseInt(durationMinutes.value || '') || null, avg_hr: parseInt(avgHr.value || '') || null, energy: parseInt(energy.value || '') || null, soreness: parseInt(soreness.value || '') || null, notes: sessionNotes.value.trim(), exercises, updated_at: new Date().toISOString() }; }
function saveSession(){ const payload = getPayload(); const items = loadSessions(); const idx = items.findIndex(x => x.id === payload.id); if(idx >= 0) items[idx] = payload; else items.unshift(payload); saveSessions(items); saveStatus.textContent = `${idx >= 0 ? 'Updated' : 'Saved'} session #${payload.id}`; resetForm(); loadDashboard(); loadTrends(); }
function deleteSession(){ if(!editingSessionId) return; if(!confirm(`Delete session #${editingSessionId}?`)) return; saveSessions(loadSessions().filter(x => x.id !== editingSessionId)); saveStatus.textContent='Deleted.'; detailDrawer.hidden=true; resetForm(); loadDashboard(); loadTrends(); }
function populateForm(detail){ editingSessionId = detail.id; editSessionIdLabel.textContent = detail.id; editBanner.hidden = false; deleteButton.hidden = false; currentDay = detail.day_key; setDay(currentDay); sessionDate.value=detail.session_date||todayISO(); durationMinutes.value=detail.duration_minutes||''; avgHr.value=detail.avg_hr||''; energy.value=detail.energy||''; soreness.value=detail.soreness||''; sessionNotes.value=detail.notes||''; const cards=[...exerciseList.querySelectorAll('.exercise-card')]; (detail.exercises||[]).forEach((ex, idx)=>{ const card=cards[idx]; if(!card) return; if(card.querySelector('.set1')) card.querySelector('.set1').value=ex.set1_reps||''; if(card.querySelector('.set2')) card.querySelector('.set2').value=ex.set2_reps||''; if(card.querySelector('.set3')) card.querySelector('.set3').value=ex.set3_reps||''; if(card.querySelector('.rir')) card.querySelector('.rir').value=ex.rir||''; if(card.querySelector('.load')) card.querySelector('.load').value=ex.load_kg||''; if(card.querySelector('.formq')) card.querySelector('.formq').value=ex.form_quality||'good'; if(card.querySelector('.js-suggestion')) card.querySelector('.js-suggestion').textContent=ex.suggestion||'Enter reps to get guidance.'; }); }
function startOfWeek(d){ const date=new Date(d); const day=(date.getDay()+6)%7; date.setDate(date.getDate()-day); date.setHours(0,0,0,0); return date; }
function loadDashboard(){ const items=loadSessions(); const start=startOfWeek(new Date()); const end=new Date(start); end.setDate(end.getDate()+7); const sessions=items.filter(s => { const d=new Date(s.session_date + 'T00:00:00'); return d>=start && d<end; }); const energyVals=sessions.map(s=>s.energy).filter(v => v!=null); const sorenessVals=sessions.map(s=>s.soreness).filter(v => v!=null); document.getElementById('statTotal').textContent=sessions.length; document.getElementById('statStrength').textContent=sessions.filter(s=>s.day_type==='strength').length; document.getElementById('statZone2').textContent=sessions.filter(s=>s.day_type==='zone2').reduce((a,b)=>a+(b.duration_minutes||0),0); document.getElementById('statIntervals').textContent=sessions.filter(s=>s.day_type==='intervals').length; document.getElementById('statEnergy').textContent=energyVals.length?(energyVals.reduce((a,b)=>a+b,0)/energyVals.length).toFixed(1):'0'; document.getElementById('statSoreness').textContent=sorenessVals.length?(sorenessVals.reduce((a,b)=>a+b,0)/sorenessVals.length).toFixed(1):'0'; recentList.innerHTML=items.slice().sort((a,b)=>(b.session_date+b.id).localeCompare(a.session_date+a.id)).slice(0,12).map(s=>`<article class="recent-card" data-id="${s.id}"><strong>${s.session_date} · ${s.day_key.toUpperCase()} · ${labelForType(s.day_type)}</strong><div class="sub">${s.duration_minutes || '-'} min · HR ${s.avg_hr || '-'} · energy ${s.energy || '-'} · soreness ${s.soreness || '-'}</div><div class="sub">${s.notes ? s.notes.slice(0,100) : 'No notes'}</div><div class="recent-actions"><button class="btn btn-light small js-view">View</button><button class="btn btn-light small js-edit">Edit</button></div></article>`).join(''); recentList.querySelectorAll('.recent-card').forEach(card => { const id=Number(card.dataset.id); card.querySelector('.js-view').addEventListener('click', e => { e.stopPropagation(); openDetail(id); }); card.querySelector('.js-edit').addEventListener('click', e => { e.stopPropagation(); const found=loadSessions().find(x => x.id===id); if(found){ populateForm(found); window.scrollTo({top:0, behavior:'smooth'}); } }); card.addEventListener('click', ()=>openDetail(id)); }); }
function makeBarChart(el, data, valueKey, colorClass){ const width=640, height=170, left=28, right=8, top=10, bottom=30; const innerW=width-left-right; const innerH=height-top-bottom; const max=Math.max(1,...data.map(d=>d[valueKey]||0)); const barW=innerW/Math.max(1,data.length)-6; let bars='', labels='', grid=''; [0.25,0.5,0.75,1].forEach(f=>{ const y=top+innerH-innerH*f; grid += `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" class="chart-grid"></line>`; }); data.forEach((d,i)=>{ const val=d[valueKey]||0; const h=innerH*(val/max); const x=left+i*(innerW/data.length)+3; const y=top+innerH-h; bars += `<rect x="${x}" y="${y}" width="${Math.max(8,barW)}" height="${h}" rx="4" class="${colorClass}"></rect>`; labels += `<text x="${x+Math.max(8,barW)/2}" y="${height-10}" text-anchor="middle" class="chart-label">${d.label}</text>`; }); el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" class="chart-wrap" preserveAspectRatio="none">${grid}${bars}${labels}</svg>`; }
function loadTrends(){ const items=loadSessions(); const data=[]; for(let weeksBack=7; weeksBack>=0; weeksBack--){ const ref=new Date(); ref.setDate(ref.getDate()-7*weeksBack); const start=startOfWeek(ref); const end=new Date(start); end.setDate(end.getDate()+7); const sessions=items.filter(s=>{ const d=new Date(s.session_date + 'T00:00:00'); return d>=start && d<end; }); data.push({ label:start.toLocaleDateString(undefined,{day:'2-digit', month:'short'}), total_sessions:sessions.length, zone2_minutes:sessions.filter(s=>s.day_type==='zone2').reduce((a,b)=>a+(b.duration_minutes||0),0) }); } makeBarChart(document.getElementById('sessionsChart'), data, 'total_sessions', 'chart-bar-a'); makeBarChart(document.getElementById('zone2Chart'), data, 'zone2_minutes', 'chart-bar-b'); }
function openDetail(id){ const data=loadSessions().find(x=>x.id===id); if(!data) return; drawerBody.innerHTML=`<div class="detail-group"><strong>${data.session_date} · ${data.day_key.toUpperCase()}</strong><div>${data.duration_minutes || '-'} min · HR ${data.avg_hr || '-'} · energy ${data.energy || '-'} · soreness ${data.soreness || '-'}</div><div style="margin-top:8px;color:var(--muted)">${data.notes || ''}</div><div class="recent-actions"><button class="btn btn-light small" id="drawerEdit">Edit</button></div></div>${(data.exercises || []).map(ex => `<div class="detail-group"><strong>${ex.exercise_name}</strong><div>Sets: ${ex.set1_reps || '-'} / ${ex.set2_reps || '-'} / ${ex.set3_reps || '-'}</div><div>RIR: ${ex.rir || '-'} · Load: ${ex.load_kg || '-'} kg · Form: ${ex.form_quality || '-'}</div><div style="margin-top:8px;color:var(--muted)">${ex.suggestion || ''}</div></div>`).join('')}`; detailDrawer.hidden=false; document.getElementById('drawerEdit').addEventListener('click', ()=>{ populateForm(data); detailDrawer.hidden=true; window.scrollTo({top:0, behavior:'smooth'}); }); }
function exportJson(){ const blob=new Blob([JSON.stringify(loadSessions(), null, 2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='workout-tracker-export.json'; a.click(); URL.revokeObjectURL(url); }
function importJson(file){ const reader=new FileReader(); reader.onload=()=>{ try{ const data=JSON.parse(reader.result); if(!Array.isArray(data)) throw new Error('Invalid data'); saveSessions(data); loadDashboard(); loadTrends(); saveStatus.textContent='Import complete.'; } catch(e){ saveStatus.textContent='Import failed.'; } }; reader.readAsText(file); }

document.getElementById('openToday').addEventListener('click', ()=>{ currentDay=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]; setDay(currentDay); });
document.getElementById('saveSession').addEventListener('click', saveSession);
document.getElementById('deleteSession').addEventListener('click', deleteSession);
document.getElementById('cancelEdit').addEventListener('click', resetForm);
document.getElementById('closeDrawer').addEventListener('click', ()=> detailDrawer.hidden=true);
document.getElementById('exportJson').addEventListener('click', exportJson);
document.getElementById('importJson').addEventListener('change', e => { if(e.target.files[0]) importJson(e.target.files[0]); });

resetForm();
loadDashboard();
loadTrends();
