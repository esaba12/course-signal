const $ = (id) => document.getElementById(id);
const courseSelect = $('course-select');
const termSelect = $('term-select');
const courseSearch = $('course-search');
const escaped = (value) => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const state = { institution: null, courses: [], primary: '', selected: [], data: new Map(), review: {}, reviewCourse: '' };

const THEMES = {
  signal: { name: 'Signal', description: 'Course Signal default', orange: '#f65f0a', orangeDark: '#ba3e00', orangeSoft: '#fff0e5', teal: '#006b82', tealSoft: '#e4f2f3', ink: '#16212c' },
  indigo: { name: 'Indigo', description: 'Academic blue', orange: '#536dfe', orangeDark: '#304ffe', orangeSoft: '#e9edff', teal: '#4455a5', tealSoft: '#eef0ff', ink: '#1c2440' },
  teal: { name: 'Teal', description: 'Modern green-blue', orange: '#00897b', orangeDark: '#00695c', orangeSoft: '#e3f6f2', teal: '#006b67', tealSoft: '#e4f5f2', ink: '#132d2d' },
  gold: { name: 'Gold', description: 'Warm institutional', orange: '#b7791f', orangeDark: '#7a4d0d', orangeSoft: '#fff3d6', teal: '#87631f', tealSoft: '#fff7e6', ink: '#302518' },
};

function setTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.signal;
  const root = document.documentElement;
  root.style.setProperty('--orange', theme.orange);
  root.style.setProperty('--orange-dark', theme.orangeDark);
  root.style.setProperty('--orange-soft', theme.orangeSoft);
  root.style.setProperty('--teal', theme.teal);
  root.style.setProperty('--teal-soft', theme.tealSoft);
  root.style.setProperty('--ink', theme.ink);
  root.style.setProperty('--brand', theme.orange);
  root.style.setProperty('--brand-dark', theme.orangeDark);
  root.dataset.theme = themeId;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.ink);
  localStorage.setItem('course-signal-theme', themeId);
  document.querySelectorAll('[data-theme-id]').forEach(button => {
    const selected = button.dataset.themeId === themeId;
    button.setAttribute('aria-checked', String(selected));
  });
}

function closeDialog(id) { $(id)?.close(); }

function initEntry() {
  const themeOptions = $('theme-options');
  themeOptions.innerHTML = Object.entries(THEMES).map(([id, theme]) => `<button type="button" class="theme-option" data-theme-id="${id}" role="radio" aria-checked="false"><span class="theme-swatch" style="background:${theme.orange}"></span><strong>${theme.name}</strong><small>${theme.description}</small></button>`).join('');
  themeOptions.addEventListener('click', event => {
    const option = event.target.closest('[data-theme-id]');
    if (option) setTheme(option.dataset.themeId);
  });
  setTheme(localStorage.getItem('course-signal-theme') || 'signal');

  const enterDemo = () => { window.location.assign('/dashboard.html'); };
  $('enter-demo').addEventListener('click', enterDemo);
  $('continue-demo').addEventListener('click', enterDemo);
  $('open-access').addEventListener('click', () => $('access-dialog').showModal());
  $('open-request').addEventListener('click', () => $('request-dialog').showModal());
  $('open-intake').addEventListener('click', () => $('intake-dialog').showModal());
  $('close-access').addEventListener('click', () => closeDialog('access-dialog'));
  $('close-request').addEventListener('click', () => closeDialog('request-dialog'));
  $('close-intake').addEventListener('click', () => closeDialog('intake-dialog'));

  $('submit-request').addEventListener('click', () => {
    const required = ['request-name', 'request-organization', 'request-email'].map(id => $(id).value.trim());
    if (!required[0] || !required[1] || !required[2].includes('@')) return;
    $('request-confirmation').hidden = false;
  });

  const selectedFiles = new Set();
  const updateIntake = () => {
    document.querySelectorAll('[data-sample-file]').forEach(button => button.classList.toggle('is-selected', selectedFiles.has(button.dataset.sampleFile)));
    $('show-findings').disabled = selectedFiles.size === 0;
  };
  document.querySelectorAll('[data-sample-file]').forEach(button => button.addEventListener('click', () => { selectedFiles.add(button.dataset.sampleFile); updateIntake(); }));
  $('intake-files').addEventListener('change', event => { Array.from(event.target.files || []).forEach(file => selectedFiles.add(file.name)); updateIntake(); });
  $('show-findings').addEventListener('click', () => { $('intake-findings').hidden = false; $('show-findings').textContent = 'Findings ready'; });
}

async function api(path) {
  const response = await fetch(path);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function reviewKey() { return `course-signal-review:${state.institution.id}`; }
function loadReview() {
  try { state.review = JSON.parse(localStorage.getItem(reviewKey()) || '{}'); } catch (_) { state.review = {}; }
}
function saveReviewStore() { localStorage.setItem(reviewKey(), JSON.stringify(state.review)); }
function unit() { return state.institution.measurement.value_unit || 'observations'; }

function updateUrl() {
  const params = new URLSearchParams();
  params.set('course', state.primary);
  params.set('courses', state.selected.join(','));
  params.set('term', termSelect.value);
  history.replaceState(null, '', `${location.pathname}?${params}`);
}

function renderCourseSearch() {
  const query = courseSearch.value.trim().toLowerCase();
  const matches = state.courses.filter(course => !query || `${course.code} ${course.title}`.toLowerCase().includes(query)).slice(0, 8);
  const results = $('course-results');
  if (!query || !matches.length) { results.hidden = true; results.innerHTML = ''; return; }
  results.hidden = false;
  results.innerHTML = matches.map(course => `<button type="button" class="course-result" role="option" data-course="${escaped(course.code)}"><strong>${escaped(course.code)}</strong><span>${escaped(course.title || 'Course')}</span></button>`).join('');
}

function renderChips() {
  $('compare-chips').innerHTML = state.selected.map(code => {
    const course = state.courses.find(item => item.code === code);
    return `<span class="compare-chip ${code === state.primary ? 'active' : ''}"><button type="button" data-focus="${escaped(code)}" aria-label="Focus ${escaped(code)}">${escaped(code)}</button>${code === state.primary ? '<span class="chip-label">focus</span>' : `<button type="button" class="chip-remove" data-remove="${escaped(code)}" aria-label="Remove ${escaped(code)}">×</button>`}</span>`;
  }).join('');
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
  const maxValue = Math.max(...rows.map(row => row.students), 1);
  const max = maxValue * 1.15;
  const band = (width - pad * 2) / rows.length;
  const barWidth = Math.max(16, Math.min(48, band - 9));
  const bars = rows.map((row, index) => {
    const x = pad + index * band + (band - barWidth) / 2;
    const barHeight = (row.students / max) * (height - pad * 2);
    const y = height - pad - barHeight;
    return `<rect class="bar ${index === rows.length - 1 ? 'latest' : ''}" data-term-index="${index}" tabindex="0" role="button" aria-label="Inspect ${escaped(row.year_term)}" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3"><title>${escaped(row.year_term)}: ${row.students} ${escaped(state.institution.measurement.short_label)}</title></rect><text class="label" x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle">${escaped(row.year_term.slice(2))}</text>`;
  }).join('');
  node.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="255" aria-hidden="true"><line class="axis" x1="${pad}" x2="${width - pad}" y1="${height - pad}" y2="${height - pad}"/><text class="label" x="${pad}" y="18">Peak: ${Math.round(maxValue)} ${escaped(unit())}</text>${bars}</svg>`;
  node.querySelectorAll('[data-term-index]').forEach(bar => {
    bar.addEventListener('click', () => renderTermDetail(rows[Number(bar.dataset.termIndex)]));
    bar.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); renderTermDetail(rows[Number(bar.dataset.termIndex)]); } });
  });
  const first = rows[0], latest = rows.at(-1);
  $('chart-summary').textContent = `${rows.length} comparable terms, from ${first.year_term} to ${latest.year_term}. Latest observed ${state.institution.measurement.label.toLowerCase()}: ${latest.students}.`;
  $('history-table').innerHTML = `<table class="data-table"><thead><tr><th scope="col">Term</th><th scope="col">${escaped(state.institution.measurement.label)}</th><th scope="col"><span class="sr-only">Inspect</span></th></tr></thead><tbody>${rows.map((row, index) => `<tr><td>${escaped(row.year_term)}</td><td>${row.students}</td><td><button class="table-action" type="button" data-table-index="${index}">Inspect</button></td></tr>`).join('')}</tbody></table>`;
  $('history-table').querySelectorAll('[data-table-index]').forEach(button => button.addEventListener('click', () => renderTermDetail(rows[Number(button.dataset.tableIndex)])));
}

function renderTermDetail(row) {
  if (!row) return;
  $('term-detail').innerHTML = `<strong>${escaped(row.year_term)}</strong><span>${row.students} ${escaped(state.institution.measurement.short_label)}</span><small>Source rows: ${row.source_row_count}. This observed value is not a capacity or waitlist measure.</small>`;
}

function renderTrend(rows) {
  if (rows.length < 2) { $('trend-summary').innerHTML = '<p class="loading">At least two comparable terms are needed to describe a change.</p>'; return; }
  const previous = rows.at(-2), latest = rows.at(-1), delta = latest.students - previous.students;
  const percent = Math.round(Math.abs(delta) / Math.max(previous.students, 1) * 100);
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const words = direction === 'flat' ? 'unchanged from' : `${percent}% ${direction} from`;
  $('trend-summary').innerHTML = `<div class="trend-line"><span class="trend-arrow ${direction === 'down' ? 'trend-down' : ''}" aria-hidden="true">${arrow}</span><div class="summary-number">${latest.students}<small> ${escaped(unit())}</small></div></div><p class="summary-meta">${words} ${previous.year_term}. Observed ${escaped(state.institution.measurement.label.toLowerCase())}.</p>`;
}

function renderForecast(data) {
  if (!data.eligible) { $('forecast').innerHTML = `<h3>Estimate unavailable</h3><p class="summary-meta">${escaped(data.reason)}</p>`; $('backtest').innerHTML = '<p class="loading">Backtesting needs more comparable history.</p>'; return; }
  $('forecast').innerHTML = `<div class="summary-number">${data.estimate}<small> ${escaped(unit())}</small></div><p class="summary-meta"><strong>${data.target_year} ${escaped(data.term)}</strong> estimate · ${data.history_count} prior ${escaped(data.term)} terms · typical historic error <strong>±${data.typical_absolute_error}</strong>.</p>`;
  const backtest = data.latest_backtest;
  $('backtest').innerHTML = `<p class="summary-meta">Latest holdout: predicted <strong>${backtest.predicted}</strong> for ${escaped(backtest.year_term)} before its observed result was used.</p><div class="backtest-metrics"><div class="metric"><strong>${backtest.actual}</strong><span>Observed</span></div><div class="metric"><strong>${backtest.absolute_error}</strong><span>Absolute error</span></div></div><p class="summary-meta">Method: ${escaped(data.method.replaceAll('_', ' '))}.</p>`;
}

function renderStatus(data) {
  const badge = $('status-badge');
  if (!data.available) {
    $('live-dot').className = 'status-dot status-unavailable'; $('live-status-title').textContent = 'Current overlay unavailable'; $('live-status-detail').textContent = 'No verified snapshot for this course'; badge.className = 'badge badge-unavailable'; badge.textContent = 'Unavailable';
    $('status').innerHTML = `<p class="summary-meta">${escaped(data.message)}</p><p class="summary-meta">A verified current-status snapshot, when enabled, always shows its retrieval time.</p>`; return;
  }
  $('live-dot').className = 'status-dot status-ready'; $('live-status-title').textContent = 'Verified cached overlay'; $('live-status-detail').textContent = `Retrieved ${data.fetched_at || 'at an unknown time'}`; badge.className = 'badge badge-ready'; badge.textContent = 'Cached';
  const sections = (data.sections || []).map(section => `<div class="status-item"><span>${escaped(section.section || 'Section')}${section.crn ? ` · CRN ${escaped(section.crn)}` : ''}</span><strong class="status-state ${String(section.status).toLowerCase() === 'open' ? 'open' : 'closed'}">● ${escaped(section.status)}</strong></div>`).join('');
  $('status').innerHTML = `<p class="summary-meta">Retrieved ${escaped(data.fetched_at || 'unknown time')} · intentionally cached</p>${sections || '<p class="summary-meta">No sections were included in this snapshot.</p>'}`;
}

function renderComparison() {
  const cards = state.selected.map(code => {
    const item = state.data.get(code);
    if (!item) return `<article class="comparison-card"><h3>${escaped(code)}</h3><p class="loading">Loading…</p></article>`;
    const latest = item.history.at(-1), forecast = item.forecast;
    return `<article class="comparison-card ${code === state.primary ? 'is-primary' : ''}"><div class="comparison-card-heading"><div><span class="kicker">${code === state.primary ? 'FOCUS' : 'COMPARISON'}</span><h3>${escaped(code)}</h3><p>${escaped(item.course?.title || latest?.course_title || '')}</p></div><button type="button" class="table-action" data-review="${escaped(code)}">${state.review[code] ? 'Edit review' : 'Add to review'}</button></div><dl><div><dt>Latest</dt><dd>${latest ? `${latest.students} ${escaped(unit())}` : '—'}</dd></div><div><dt>Estimate</dt><dd>${forecast.eligible ? `${forecast.estimate} ${escaped(unit())}` : 'Unavailable'}</dd></div><div><dt>History</dt><dd>${forecast.history_count} terms</dd></div><div><dt>Typical error</dt><dd>${forecast.eligible ? `±${forecast.typical_absolute_error}` : '—'}</dd></div></dl></article>`;
  });
  $('comparison-grid').innerHTML = cards.join('') || '<p class="loading">Select another course to compare.</p>';
  $('comparison-grid').querySelectorAll('[data-review]').forEach(button => button.addEventListener('click', () => openReview(button.dataset.review)));
}

function renderReviewList() {
  const entries = Object.entries(state.review);
  $('review-count').textContent = `${entries.length} saved`;
  $('review-list').innerHTML = entries.length ? entries.map(([code, entry]) => `<article class="review-item"><div><strong>${escaped(code)}</strong><span class="review-status">${escaped(entry.status || 'saved')}</span><p>${escaped(entry.note || 'No note yet.')}</p></div><div class="review-actions"><button class="table-action" type="button" data-review-edit="${escaped(code)}">Edit</button><button class="table-action" type="button" data-review-remove="${escaped(code)}">Remove</button></div></article>`).join('') : '<p class="summary-meta">No courses saved for review.</p>';
  $('review-list').querySelectorAll('[data-review-edit]').forEach(button => button.addEventListener('click', () => openReview(button.dataset.reviewEdit)));
  $('review-list').querySelectorAll('[data-review-remove]').forEach(button => button.addEventListener('click', () => { delete state.review[button.dataset.reviewRemove]; saveReviewStore(); renderReviewList(); renderComparison(); }));
}

function openReview(code) {
  state.reviewCourse = code;
  const entry = state.review[code] || {};
  $('review-course-label').textContent = `${code} · ${state.institution.name}`;
  $('review-status').value = entry.status || 'saved'; $('review-note').value = entry.note || '';
  $('review-dialog').showModal();
}

function saveReview() {
  state.review[state.reviewCourse] = { status: $('review-status').value, note: $('review-note').value.trim(), updated_at: new Date().toISOString() };
  saveReviewStore(); renderReviewList(); renderComparison(); $('review-dialog').close();
}

function exportCsv() {
  const rows = [['Institution', 'Course', 'Term', state.institution.measurement.label, 'Estimate', 'Typical error', 'Review status', 'Note']];
  state.selected.forEach(code => {
    const item = state.data.get(code); if (!item) return;
    item.history.forEach(row => rows.push([state.institution.name, code, row.year_term, row.students, item.forecast.eligible ? item.forecast.estimate : '', item.forecast.eligible ? item.forecast.typical_absolute_error : '', state.review[code]?.status || '', state.review[code]?.note || '']));
  });
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `course-signal-${state.institution.id}-${termSelect.value.toLowerCase()}.csv`; link.click(); URL.revokeObjectURL(link.href);
}

async function loadCourse(code) {
  if (state.data.has(code)) return state.data.get(code);
  const [history, forecast, course] = await Promise.all([api(`/api/courses/${encodeURIComponent(code)}/history?term=${encodeURIComponent(termSelect.value)}`), api(`/api/courses/${encodeURIComponent(code)}/forecast?term=${encodeURIComponent(termSelect.value)}`), Promise.resolve(state.courses.find(item => item.code === code))]);
  const item = { history, forecast, course }; state.data.set(code, item); return item;
}

async function load() {
  try {
    $('error').hidden = true; state.data.clear();
    state.primary = courseSelect.value; if (!state.selected.includes(state.primary)) state.selected.unshift(state.primary);
    state.selected = state.selected.filter(code => state.courses.some(course => course.code === code));
    updateUrl(); renderChips();
    const [primary, status, health] = await Promise.all([loadCourse(state.primary), api(`/api/courses/${encodeURIComponent(state.primary)}/live-status`), api('/api/health')]);
    renderChart(primary.history); renderTrend(primary.history); renderForecast(primary.forecast); renderStatus(status); renderFreshness(health); renderPlanningNote(primary.history, primary.forecast); $('coverage').textContent = `${primary.history.length} comparable terms`; $('course-title').textContent = primary.history[0]?.course_title || state.primary;
    await Promise.all(state.selected.filter(code => code !== state.primary).map(loadCourse)); renderComparison(); renderReviewList();
  } catch (error) { $('error').hidden = false; $('error').textContent = error.message; }
}

function renderFreshness(health) { const run = health?.ingestion; $('history-status').textContent = run?.ingested_at ? `Source processed ${new Date(run.ingested_at).toLocaleDateString()}` : 'Source record available'; }
function renderPlanningNote(rows, forecast) { const latest = rows.at(-1); if (!latest || !forecast.eligible) return; $('planning-note').textContent = `For ${state.primary}, the visible ${termSelect.value}-to-${termSelect.value} history ends at ${latest.students} ${state.institution.measurement.short_label}. Use the ${forecast.target_year} estimate as a prompt to review local planning context—not as an action by itself.`; }

async function start() {
  try {
    state.institution = await api('/api/institution'); document.title = state.institution.dashboard_title; loadReview();
    $('site-title').innerHTML = `${escaped(state.institution.dashboard_title.replace(' Course Signal', ''))} <em>Course Signal</em>`; $('institution-name').textContent = state.institution.name; $('course-help').textContent = `Choose a course at ${state.institution.name}.`; $('measurement-title').textContent = state.institution.measurement.label; $('chart-description').textContent = state.institution.measurement.description; $('modal-measurement').textContent = state.institution.measurement.description; $('source-detail').textContent = `${state.institution.source.display_name} · ${state.institution.source.kind}`;
    termSelect.innerHTML = state.institution.terms.map(term => `<option>${escaped(term)}</option>`).join('');
    const courses = await api('/api/courses'); state.courses = courses;
    const params = new URLSearchParams(location.search); const requestedTerm = params.get('term'); if (requestedTerm && state.institution.terms.includes(requestedTerm)) termSelect.value = requestedTerm;
    const requested = (params.get('courses') || '').split(',').filter(Boolean); const preferred = params.get('course') || state.institution.default_course; state.primary = courses.some(course => course.code === preferred) ? preferred : courses[0]?.code; state.selected = [...new Set([state.primary, ...requested])].filter(Boolean).filter(code => courses.some(course => course.code === code));
    courseSelect.innerHTML = courses.map(course => `<option value="${escaped(course.code)}">${escaped(course.code)} — ${escaped(course.title || 'Course')}</option>`).join(''); courseSelect.value = state.primary;
    await load();
  } catch (error) { $('error').hidden = false; $('error').textContent = `Setup required: ${error.message}`; }
}

if (document.body.classList.contains('landing-page')) {
  initEntry();
}

if (courseSelect) {
  setTheme(localStorage.getItem('course-signal-theme') || 'signal');
  courseSelect.addEventListener('change', load);
  termSelect.addEventListener('change', load);
  courseSearch.addEventListener('input', renderCourseSearch);
  $('course-results').addEventListener('click', event => { const button = event.target.closest('[data-course]'); if (!button) return; const code = button.dataset.course; if (!state.selected.includes(code)) state.selected.push(code); courseSearch.value = ''; renderCourseSearch(); renderChips(); load(); });
  $('compare-chips').addEventListener('click', event => { const focus = event.target.closest('[data-focus]'); const remove = event.target.closest('[data-remove]'); if (focus) { courseSelect.value = focus.dataset.focus; load(); } if (remove) { state.selected = state.selected.filter(code => code !== remove.dataset.remove); renderChips(); renderComparison(); } });
  $('copy-link').addEventListener('click', async () => { updateUrl(); await navigator.clipboard.writeText(location.href); $('copy-link').textContent = 'Link copied'; setTimeout(() => { $('copy-link').textContent = 'Copy view link'; }, 1600); });
  $('export-csv').addEventListener('click', exportCsv);
  $('method-button').addEventListener('click', () => $('method').showModal()); $('close-method').addEventListener('click', () => $('method').close());
  $('close-review').addEventListener('click', () => $('review-dialog').close()); $('save-review').addEventListener('click', saveReview);
  start();
}
