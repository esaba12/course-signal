const $ = (id) => document.getElementById(id);
const courseSelect = $('course-select');
const termSelect = $('term-select');
const escaped = (value) => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

async function api(path) {
  const response = await fetch(path);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function renderChart(rows) {
  const node = $('chart');
  if (!rows.length) {
    node.innerHTML = '<p class="loading">No comparable historical observations are available.</p>';
    $('chart-summary').textContent = 'No comparable history is available for this selection.';
    $('history-table').innerHTML = '';
    return;
  }
  const width = 700, height = 255, pad = 42;
  const max = Math.max(...rows.map((row) => row.students)) * 1.15;
  const band = (width - pad * 2) / rows.length;
  const barWidth = Math.max(16, Math.min(48, band - 9));
  const bars = rows.map((row, index) => {
    const x = pad + index * band + (band - barWidth) / 2;
    const barHeight = (row.students / max) * (height - pad * 2);
    const y = height - pad - barHeight;
    return `<rect class="bar ${index === rows.length - 1 ? 'latest' : ''}" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3"><title>${escaped(row.year_term)}: ${row.students} students receiving a final grade</title></rect><text class="label" x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle">${escaped(row.year_term.slice(2))}</text>`;
  }).join('');
  node.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="255" aria-hidden="true"><line class="axis" x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}"/><text class="label" x="${pad}" y="18">Peak: ${Math.round(max / 1.15)} students</text>${bars}</svg>`;
  const first = rows[0], latest = rows.at(-1);
  $('chart-summary').textContent = `${rows.length} comparable terms, from ${first.year_term} to ${latest.year_term}. Latest observed completed-grade headcount: ${latest.students}.`;
  $('history-table').innerHTML = `<table class="data-table"><thead><tr><th scope="col">Term</th><th scope="col">Students receiving final grade</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escaped(row.year_term)}</td><td>${row.students}</td></tr>`).join('')}</tbody></table>`;
}

function renderTrend(rows) {
  if (rows.length < 2) {
    $('trend-summary').innerHTML = '<p class="loading">At least two comparable terms are needed to describe a change.</p>';
    return;
  }
  const previous = rows.at(-2), latest = rows.at(-1);
  const delta = latest.students - previous.students;
  const percent = Math.round(Math.abs(delta) / Math.max(previous.students, 1) * 100);
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const color = direction === 'down' ? 'trend-down' : '';
  const words = direction === 'flat' ? 'unchanged from' : `${percent}% ${direction} from`;
  $('trend-summary').innerHTML = `<div class="trend-line"><span class="trend-arrow ${color}" aria-hidden="true">${arrow}</span><div class="summary-number">${latest.students}<small> students</small></div></div><p class="summary-meta">${words} ${previous.year_term}. This is observed completed-grade headcount.</p>`;
}

function renderForecast(data) {
  if (!data.eligible) {
    $('forecast').innerHTML = `<h3>Estimate unavailable</h3><p class="summary-meta">${escaped(data.reason)}</p>`;
    $('backtest').innerHTML = '<p class="loading">Backtesting needs more comparable history.</p>';
    return;
  }
  $('forecast').innerHTML = `<div class="summary-number">${data.estimate}<small> students</small></div><p class="summary-meta"><strong>${data.target_year} ${escaped(data.term)}</strong> estimate · ${data.history_count} prior ${escaped(data.term)} terms · typical historic error <strong>±${data.typical_absolute_error}</strong>.</p>`;
  const backtest = data.latest_backtest;
  $('backtest').innerHTML = `<p class="summary-meta">Latest holdout: predicted <strong>${backtest.predicted}</strong> for ${escaped(backtest.year_term)} before its observed result was used.</p><div class="backtest-metrics"><div class="metric"><strong>${backtest.actual}</strong><span>Observed</span></div><div class="metric"><strong>${backtest.absolute_error}</strong><span>Absolute error</span></div></div><p class="summary-meta">Method: ${escaped(data.method.replaceAll('_', ' '))}.</p>`;
}

function renderStatus(data) {
  const badge = $('status-badge');
  if (!data.available) {
    $('live-dot').className = 'status-dot status-unavailable';
    $('live-status-title').textContent = 'Live overlay unavailable';
    $('live-status-detail').textContent = 'No verified snapshot for this course';
    badge.className = 'badge badge-unavailable';
    badge.textContent = 'Unavailable';
    $('status').innerHTML = `<p class="summary-meta">${escaped(data.message)}</p><p class="summary-meta">The dashboard does not continuously monitor Course Explorer. A verified snapshot will always show its retrieval time.</p>`;
    return;
  }
  $('live-dot').className = 'status-dot status-ready';
  $('live-status-title').textContent = 'Verified cached overlay';
  $('live-status-detail').textContent = `Retrieved ${data.fetched_at || 'at an unknown time'}`;
  badge.className = 'badge badge-ready';
  badge.textContent = 'Cached';
  const sections = (data.sections || []).map((section) => {
    const state = String(section.status).toLowerCase();
    const icon = state === 'open' ? '●' : '●';
    return `<div class="status-item"><span>${escaped(section.section || 'Section')}${section.crn ? ` · CRN ${escaped(section.crn)}` : ''}</span><strong class="status-state ${state === 'open' ? 'open' : 'closed'}"><span aria-hidden="true">${icon}</span>${escaped(section.status)}</strong></div>`;
  }).join('');
  $('status').innerHTML = `<p class="summary-meta">Retrieved ${escaped(data.fetched_at || 'unknown time')} · intentionally cached</p>${sections || '<p class="summary-meta">No sections were included in this snapshot.</p>'}`;
}

function renderFreshness(health) {
  const run = health?.ingestion;
  $('history-status').textContent = run?.ingested_at ? `Source processed ${new Date(run.ingested_at).toLocaleDateString()}` : 'Source record available';
}

function renderPlanningNote(rows, forecast) {
  const latest = rows.at(-1);
  if (!latest || !forecast.eligible) return;
  $('planning-note').textContent = `For ${courseSelect.value}, the visible ${termSelect.value}-to-${termSelect.value} history ends at ${latest.students} completed grades. Use the ${forecast.target_year} estimate as a prompt to review curriculum, staffing, rooms, and student-support context—not as an action by itself.`;
}

async function load() {
  const code = courseSelect.value;
  const term = termSelect.value;
  try {
    $('error').hidden = true;
    const [history, forecast, status, health] = await Promise.all([
      api(`/api/courses/${encodeURIComponent(code)}/history?term=${term}`),
      api(`/api/courses/${encodeURIComponent(code)}/forecast?term=${term}`),
      api(`/api/courses/${encodeURIComponent(code)}/live-status`),
      api('/api/health')
    ]);
    renderChart(history);
    renderTrend(history);
    renderForecast(forecast);
    renderStatus(status);
    renderFreshness(health);
    renderPlanningNote(history, forecast);
    $('coverage').textContent = `${history.length} comparable terms`;
    $('course-title').textContent = history[0]?.course_title || code;
  } catch (error) {
    $('error').hidden = false;
    $('error').textContent = error.message;
  }
}

async function start() {
  try {
    const courses = await api('/api/courses');
    courseSelect.innerHTML = courses.map((course) => `<option value="${escaped(course.code)}">${escaped(course.code)} — ${escaped(course.title || 'Course')}</option>`).join('');
    const preferred = courses.find((course) => course.code === 'CS 225');
    if (preferred) courseSelect.value = preferred.code;
    await load();
  } catch (error) {
    $('error').hidden = false;
    $('error').textContent = `Setup required: ${error.message}`;
  }
}

courseSelect.addEventListener('change', load);
termSelect.addEventListener('change', load);
$('method-button').addEventListener('click', () => $('method').showModal());
$('close-method').addEventListener('click', () => $('method').close());
start();
