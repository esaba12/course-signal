const $ = (id) => document.getElementById(id);
const courseSelect = $('course-select'), termSelect = $('term-select');
const escaped = (value) => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

async function api(path) { const res = await fetch(path); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Request failed'); return data; }

function renderChart(rows) {
  const node = $('chart');
  if (!rows.length) { node.innerHTML = '<p class="muted">No comparable historical observations are available.</p>'; return; }
  const width = 700, height = 255, pad = 38, max = Math.max(...rows.map(r=>r.students))*1.15;
  const barWidth = Math.max(16, Math.min(54, (width-pad*2)/rows.length-10));
  const svg = rows.map((r,i)=>{ const x=pad+i*((width-pad*2)/rows.length)+(width-pad*2)/rows.length/2-barWidth/2; const h=(r.students/max)*(height-pad*2); const y=height-pad-h; return `<rect class="bar ${i===rows.length-1?'latest':''}" x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3"><title>${escaped(r.year_term)}: ${r.students} students</title></rect><text class="label" x="${x+barWidth/2}" y="${height-12}" text-anchor="middle">${escaped(r.year_term.slice(2))}</text>`}).join('');
  node.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="255" aria-hidden="true"><line class="axis" x1="${pad}" x2="${width-pad}" y1="${height-pad}" y2="${height-pad}"/><text class="label" x="${pad}" y="18">${Math.round(max)} students</text>${svg}</svg>`;
}

function renderForecast(data) {
  if (!data.eligible) { $('forecast').innerHTML = `<h3>Estimate unavailable</h3><p class="muted">${escaped(data.reason)}</p>`; $('backtest').innerHTML = '<p class="muted">Backtesting needs more comparable history.</p>'; return; }
  $('forecast').innerHTML = `<div class="forecast-number">${data.estimate}<small> students</small></div><p class="forecast-meta"><strong>${data.target_year} ${escaped(data.term)}</strong> estimate<br>Based on ${data.history_count} prior ${escaped(data.term)} terms<br>Typical historic absolute error: <strong>±${data.typical_absolute_error}</strong></p>`;
  const b=data.latest_backtest;
  $('backtest').innerHTML = `<p class="small">Using only earlier terms, the model estimated <strong>${b.predicted}</strong> students for <strong>${escaped(b.year_term)}</strong>.</p><div class="metric-row"><div class="metric"><strong>${b.actual}</strong><span>Observed</span></div><div class="metric"><strong>${b.absolute_error}</strong><span>Absolute error</span></div></div><p class="small">Method selected by rolling historic error: ${escaped(data.method.replaceAll('_',' '))}.</p>`;
}

function renderStatus(data) {
  if (!data.available) { $('status').innerHTML = `<p class="muted">${escaped(data.message)}</p><p class="small">The dashboard does not continuously monitor Course Explorer. A loaded snapshot will always show its retrieval time.</p>`; return; }
  const sections=(data.sections||[]).map(s=>`<div class="status-item"><span>${escaped(s.section || 'Section')}</span><strong class="${String(s.status).toLowerCase()==='open'?'open':'closed'}">${escaped(s.status)}</strong></div>`).join('');
  $('status').innerHTML = `<p class="small">Retrieved ${escaped(data.fetched_at || 'unknown time')} · cached snapshot</p>${sections || '<p class="muted">No sections in cached snapshot.</p>'}`;
}

async function load() {
  const code=courseSelect.value, term=termSelect.value;
  try { $('error').hidden=true; const [history,forecast,status]=await Promise.all([api(`/api/courses/${encodeURIComponent(code)}/history?term=${term}`),api(`/api/courses/${encodeURIComponent(code)}/forecast?term=${term}`),api(`/api/courses/${encodeURIComponent(code)}/live-status`)]); renderChart(history); renderForecast(forecast); renderStatus(status); $('coverage').textContent = `${history.length} comparable terms`; $('course-title').textContent=history[0]?.course_title||code; }
  catch(error) { $('error').hidden=false; $('error').textContent=error.message; }
}

async function start() {
  try { const courses=await api('/api/courses'); courseSelect.innerHTML=courses.map(c=>`<option value="${escaped(c.code)}">${escaped(c.code)} — ${escaped(c.title||'Course')}</option>`).join(''); const preferred=[...courses].find(c=>c.code==='CS 225'); if(preferred) courseSelect.value=preferred.code; await load(); }
  catch(error) { $('error').hidden=false; $('error').textContent=`Setup required: ${error.message}`; }
}
courseSelect.addEventListener('change',load);termSelect.addEventListener('change',load);$('method-button').onclick=()=>$('method').hidden=false;$('close-method').onclick=()=>$('method').hidden=true;start();

