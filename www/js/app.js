/* ── KASRAT APP ── */
const App = (() => {
  const MUSCLE_LABELS = { chest:'Chest', back:'Back', shoulders:'Delts', arms:'Arms', legs:'Legs', core:'Core' };
  const MUSCLE_CLS = { chest:'chest', back:'back', shoulders:'sho', arms:'arms', legs:'legs', core:'core' };
  const TAB_ORDER = ['home', 'train', 'history', 'stats', 'profile'];

  /* Routine sections (fixed order). Each routine exercise carries a `section`. */
  const SECTIONS = ['Warm Up', 'Mobility', 'Primary', 'Secondary', 'Static Stretch'];
  const SECTION_COLOR = { 'Warm Up':'var(--m-sho)', 'Mobility':'var(--m-arms)', 'Primary':'var(--red)', 'Secondary':'var(--m-back)', 'Static Stretch':'var(--m-legs)' };
  function sectionOf(re) { return SECTIONS.includes(re.section) ? re.section : 'Primary'; }
  function sectionOrder(re) { return SECTIONS.indexOf(sectionOf(re)); }

  /* Set types — inline-selectable, default Normal. */
  const SET_TYPES = [
    { k:'warmup', label:'W', color:'var(--amber)' },
    { k:'normal', label:'N', color:'var(--ink)' },
    { k:'drop', label:'D', color:'var(--blue)' },
    { k:'failure', label:'F', color:'var(--red)' },
  ];
  function stMeta(t) { return SET_TYPES.find(x => x.k === t) || SET_TYPES[1]; }
  // Set-number column: a letter (W/D/F) for special types, otherwise the number.
  function setLabel(set, si) {
    return (set.setType && set.setType !== 'normal') ? stMeta(set.setType).label : (si + 1);
  }
  function setLabelColor(set) {
    return (set.setType && set.setType !== 'normal') ? stMeta(set.setType).color : '';
  }
  function setTypePicker(set, si) {
    return `<div class="row" style="gap:5px;padding:8px 4px 0">
      ${SET_TYPES.map(t => `<button class="sttype${(set.setType||'normal')===t.k?' on':''}" data-action="set-type-pick" data-si="${si}" data-type="${t.k}">${t.label}</button>`).join('')}
      <span class="kik" style="margin-left:auto;align-self:center;color:#8C8678">type</span>
    </div>`;
  }

  // Compact value + label for the home "Latest PR" card, by PR type.
  function latestPRView(pr) {
    if (pr.type === 'max_duration') return { value: fmtTime(pr.value), label: 'hold' };
    if (pr.type === 'max_distance') return { value: `${pr.value}km`, label: 'dist' };
    return { value: pr.value, label: 'est' };
  }

  // PR rows for an exercise's detail modal, covering every PR type we record.
  function prRows(prs, pad) {
    const rows = [];
    if (prs.est1rm)      rows.push(['Est 1RM', `${prs.est1rm.value} kg`, 'var(--green)']);
    if (prs.maxWeight)   rows.push(['Max weight', `${prs.maxWeight.value} kg`, '']);
    if (prs.maxDuration) rows.push(['Longest hold', fmtTime(prs.maxDuration.value), 'var(--green)']);
    if (prs.maxDistance) rows.push(['Longest distance', `${prs.maxDistance.value} km`, 'var(--green)']);
    return rows.map(([label, val, color]) =>
      `<div class="btw" style="padding:${pad}"><span style="font-size:13px;font-weight:500">${label}</span><span class="bign" style="font-size:19px${color?`;color:${color}`:''}">${val}</span></div>`
    ).join('');
  }

  // Chronological est-1RM series for an exercise: one best point per session.
  // Only weight / bodyweight lifts record an est 1RM, so others return empty.
  function e1rmSeries(exId) {
    const ex = Storage.getExerciseById(exId);
    if (!ex || (ex.trackingType !== 'weight_reps' && ex.trackingType !== 'bodyweight')) return [];
    const out = [];
    // getWorkouts() is newest-first; keep each session's best est 1RM.
    Storage.getWorkouts().forEach(w => {
      const we = (w.exercises || []).find(e => e.exerciseId === exId);
      if (!we) return;
      let best = 0;
      (we.sets || []).filter(s => s.isCompleted).forEach(s => {
        if (s.weight > 0 && s.reps > 0) {
          const e1 = Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;  // matches Storage's PR formula
          if (e1 > best) best = e1;
        }
      });
      if (best > 0) out.push({ t: w.startedAt, v: best });
    });
    return out.reverse();  // oldest → newest
  }

  // Minimalist est-1RM line chart. Pure SVG, theme colours, no library.
  function e1rmChart(series) {
    if (series.length < 2) {
      return `<div class="card" style="padding:14px;background:var(--card-2);box-shadow:none;text-align:center">
        <div class="kik" style="color:var(--ink-3)">${series.length ? 'One session logged' : 'No sessions yet'} — log a few more to see your trend</div>
      </div>`;
    }
    const W = 280, H = 76, padL = 8, padR = 6, padT = 10, padB = 8;
    const vals = series.map(p => p.v);
    const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1, n = series.length;
    const x = i => padL + (i / (n - 1)) * (W - padL - padR);
    const y = v => padT + (1 - (v - min) / span) * (H - padT - padB);
    const line = series.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const area = `${padL},${H - padB} ${line} ${x(n - 1).toFixed(1)},${H - padB}`;
    const first = series[0].v, last = series[n - 1].v;
    const delta = Math.round((last - first) * 10) / 10;
    const dColor = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--below)' : 'var(--ink-3)';
    return `<div class="card" style="padding:12px 12px 10px;background:var(--card-2);box-shadow:none">
      <div class="btw" style="margin-bottom:8px">
        <span class="kik" style="color:var(--ink-2)">Est 1RM trend</span>
        <span class="num" style="font-weight:700;font-size:11.5px;color:${dColor}">${delta > 0 ? '+' : ''}${delta} kg</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" style="display:block">
        <defs><linearGradient id="e1rm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--green)" stop-opacity=".18"/>
          <stop offset="1" stop-color="var(--green)" stop-opacity="0"/>
        </linearGradient></defs>
        <polygon points="${area}" fill="url(#e1rm-fill)"/>
        <polyline points="${line}" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        <circle cx="${x(n - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3.2" fill="var(--green)" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="btw" style="margin-top:6px">
        <span class="kik" style="color:var(--ink-3)">${relTime(series[0].t)}</span>
        <span class="kik" style="color:var(--ink-3)">${n} sessions</span>
      </div>
    </div>`;
  }

  /* ── PER-EXERCISE LOGGING MODE (weight / bodyweight / time / distance) ── */
  function logMode(ex) {
    if (!ex) return 'weight';
    if (ex.trackingType === 'time') return 'time';
    if (ex.trackingType === 'distance') return 'distance';
    if (ex.trackingType === 'bodyweight') return 'bodyweight';
    return 'weight';
  }
  // The previous session's reference string for a set, shown under "Prev".
  function prevRef(mode, lastSet) {
    if (!lastSet) return '—';
    if (mode === 'time') return lastSet.durationSec ? fmtTime(lastSet.durationSec) : '—';
    if (mode === 'distance') return lastSet.distance != null ? lastSet.distance + 'km' : '—';
    return `${lastSet.weight||''}×${lastSet.reps||''}`;
  }
  // Traffic-light vs last session, by mode.
  function setLight(mode, set, lastSet) {
    if (!set.isCompleted) return '';
    if (mode === 'time') {
      if (!set.durationSec) return '';
      if (!lastSet || !lastSet.durationSec) return 'var(--green)';
      return set.durationSec > lastSet.durationSec ? 'var(--green)' : set.durationSec === lastSet.durationSec ? 'var(--amber)' : 'var(--below)';
    }
    if (mode === 'distance') {
      if (set.distance == null) return '';
      if (!lastSet || lastSet.distance == null) return 'var(--green)';
      return set.distance > lastSet.distance ? 'var(--green)' : set.distance === lastSet.distance ? 'var(--amber)' : 'var(--below)';
    }
    if (!set.weight || !set.reps) return '';
    if (!lastSet) return 'var(--green)';
    const beatWeight = set.weight > (lastSet.weight||0);
    const beatReps = set.weight === lastSet.weight && set.reps > (lastSet.reps||0);
    const matchAll = set.weight === lastSet.weight && set.reps === lastSet.reps;
    return (beatWeight || beatReps) ? 'var(--green)' : matchAll ? 'var(--amber)' : 'var(--below)';
  }
  // Column headers for the set board.
  function colHeader(mode) {
    const cols = mode === 'time' ? [['Time','flex:1;text-align:center']]
      : mode === 'distance' ? [['Km','flex:1;text-align:center'],['Min','flex:1;text-align:center']]
      : mode === 'bodyweight' ? [['+Kg','flex:1;text-align:center'],['Reps','flex:1;text-align:center']]
      : [['Kg','flex:1;text-align:center'],['Reps','flex:1;text-align:center']];
    return `<span class="kik" style="width:28px">Set</span><span class="kik" style="width:56px">Prev</span>${cols.map(([l,s])=>`<span class="kik" style="${s}">${l}</span>`).join('')}<span class="kik" style="width:26px;text-align:right">✓</span>`;
  }
  const _INP_STYLE = 'text-align:center;background:transparent;border:none;color:var(--led);font-size:20px;font-family:var(--disp);font-weight:800;outline:none;padding:0';
  // Active-row editable inputs for the current set, by mode.
  function activeInputs(mode, set) {
    if (mode === 'time')
      return `<input class="num-inp led" id="inp-duration" type="number" inputmode="numeric" placeholder="sec" value="${set.durationSec||''}" style="flex:2;${_INP_STYLE}">`;
    if (mode === 'distance')
      return `<input class="num-inp led" id="inp-distance" type="number" inputmode="decimal" placeholder="km" value="${set.distance!=null?set.distance:''}" style="flex:1;${_INP_STYLE}"><input class="num-inp led" id="inp-duration" type="number" inputmode="numeric" placeholder="min" value="${set.durationSec?Math.round(set.durationSec/60):''}" style="flex:1;${_INP_STYLE}">`;
    return `<input class="num-inp led" id="inp-weight" type="number" inputmode="decimal" placeholder="${mode==='bodyweight'?'+kg':'kg'}" value="${set.weight||''}" style="flex:1;${_INP_STYLE}"><input class="num-inp led" id="inp-reps" type="number" inputmode="numeric" placeholder="rep" value="${set.reps||''}" style="flex:1;${_INP_STYLE}">`;
  }
  // Read-only cells for completed / upcoming rows, by mode.
  function displayCells(mode, set, lightColor) {
    const hl = lightColor ? `color:${lightColor};font-weight:800` : '';
    if (mode === 'time')
      return `<span class="num" style="flex:2;text-align:center;${hl}">${set.durationSec?fmtTime(set.durationSec):'—'}</span>`;
    if (mode === 'distance')
      return `<span class="num" style="flex:1;text-align:center;${hl}">${set.distance!=null?set.distance:'—'}</span><span class="num" style="flex:1;text-align:center">${set.durationSec?Math.round(set.durationSec/60):'—'}</span>`;
    return `<span class="num" style="flex:1;text-align:center;${hl}">${set.weight||'—'}</span><span class="num" style="flex:1;text-align:center">${set.reps||'—'}</span>`;
  }

  let screenStack = [];
  let activeTab = 'home';
  let statsTab = 'progress';  // 'progress' | 'muscle' — inline toggle in Stats tab
  let expandedRoutines = {};  // routine id -> true when its accordion is open in Train
  let workoutTimerInterval = null;
  let restTimerInterval = null;
  let workoutState = null;
  let _awSaveTimer = null;   // debounced active-workout persistence
  let _libSearchTimer = null; // debounced library search rebuild

  // Persist the active workout shortly after the last keystroke instead of on
  // every one (each save serializes the whole workout to localStorage).
  function saveActiveSoon() {
    clearTimeout(_awSaveTimer);
    _awSaveTimer = setTimeout(() => { if (workoutState) Storage.saveActiveWorkout(workoutState); }, 250);
  }

  /* ────────────────── ICONS ────────────────── */
  function ic(id, size = '') {
    return `<svg${size ? ` style="width:${size};height:${size}"` : ''}><use href="#ic-${id}"/></svg>`;
  }

  /* ────────────────── HTML ESCAPE ────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* ────────────────── TIME HELPERS ────────────────── */
  function fmtTime(secs) {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }
  function fmtDuration(secs) {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  }
  function fmtVol(kg) {
    if (kg >= 1000) return `${(kg/1000).toFixed(1)}k`;
    return `${Math.round(kg)}`;
  }
  function timeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }
  function todayLabel() {
    const labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return labels[new Date().getDay()];
  }
  function clockTime() {
    const d = new Date();
    const h = d.getHours(), m = d.getMinutes();
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function relTime(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    if (diff < 604800) return `${Math.floor(diff/86400)} days ago`;
    return new Date(iso).toLocaleDateString('en-GB', {day:'numeric', month:'short'});
  }

  /* ────────────────── WEEKLY MOTIVATION ────────────────── */
  /* Shown in the status bar; rotates once per (Monday-aligned) week. */
  const MOTIVATION = [
    'Show up for yourself today.',
    'Small lifts, big changes.',
    'Consistency beats intensity.',
    'Stronger than last week.',
    'Discipline is a love language.',
    'Progress, not perfection.',
    'One more rep, one step closer.',
    'Your only competition is yesterday.',
    'Earn it. Then enjoy it.',
    'Build the body, build the mind.',
    'Hard now, proud later.',
    'Every set counts.',
    'Show up. Lift. Repeat.',
    'Make today worth the soreness.',
  ];
  function weeklyMotivation() {
    // Snap to the Monday of the current week, then index by week number (changes weekly).
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    const idx = Math.floor(d.getTime() / (7 * 86400000));
    return MOTIVATION[((idx % MOTIVATION.length) + MOTIVATION.length) % MOTIVATION.length];
  }

  /* ────────────────── PLATE CALCULATOR ────────────────── */
  function plateSide(totalKg) {
    const bar = 20;
    let remain = (totalKg - bar) / 2;
    if (remain <= 0) return [];
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];
    for (const p of plates) {
      while (remain >= p - 0.001) { result.push(p); remain -= p; }
    }
    return result;
  }
  const PLATE_COLORS = { 25:'#C0826E', 20:'#6F8FA8', 15:'#C2A35E', 10:'#5F8B73', 5:'#EAE6DC', 2.5:'#B98A93', 1.25:'#9B9486' };
  function renderBarbell(weight) {
    const side = plateSide(weight);
    const platesHtml = side.map(p => {
      const h = Math.max(10, Math.min(36, 10 + p * 1.1));
      return `<div class="plk" style="height:${h}px;background:${PLATE_COLORS[p]||'#ccc'}"></div>`;
    }).join('');
    return `<div class="barbell">
      <div class="stk">${platesHtml}</div>
      <div class="collar"></div><div class="sleeve" style="flex:1"></div>
    </div>
    <div class="btw" style="margin-top:4px">
      <span class="num" style="font-weight:700;font-size:12px">${weight} kg <span class="dim3" style="font-weight:500">· ${side.join('+')||'bar only'} / side</span></span>
      <span class="kik">plate calc</span>
    </div>`;
  }

  /* ────────────────── SCREEN MANAGEMENT ────────────────── */
  function showScreen(id, push = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) {
      el.classList.add('active');
      el.scrollTop = 0;
      const scroll = el.querySelector('.scroll');
      if (scroll) scroll.scrollTop = 0;
    }
    if (push) {
      if (screenStack[screenStack.length - 1] !== id) screenStack.push(id);
    }
  }

  function popScreen() {
    if (screenStack.length <= 1) return;
    screenStack.pop();
    const id = screenStack[screenStack.length - 1];
    renderScreen(id);
    showScreen(id, false);
  }

  function setActiveTab(tab, dir = 0) {
    if (tab === 'stats' && activeTab !== 'stats') statsTab = 'progress';  // open Stats on Progress
    activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    const tabEl = document.querySelector(`.tab[data-tab="${tab}"]`);
    if (tabEl) tabEl.classList.add('on');
    const tabScreens = { home:'home', train:'train', history:'history', stats:'stats', profile:'profile' };
    if (tabScreens[tab]) {
      const id = tabScreens[tab];
      screenStack = [id];
      renderScreen(id);
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('from-left'));
      // dir < 0 = moving to a previous tab → slide in from the left instead of the right.
      if (dir < 0) {
        const elNew = document.getElementById('screen-' + id);
        if (elNew) { elNew.classList.add('from-left'); void elNew.offsetWidth; }
      }
      showScreen(id, false);
    }
  }

  /* Swipe between the 5 root tabs. dir: +1 = next (swipe left), -1 = prev (swipe right). */
  function swipeTab(dir) {
    // Only when sitting on a tab root (not in a pushed screen, logger, or onboarding).
    if (screenStack.length !== 1 || screenStack[0] !== activeTab) return;
    if (!TAB_ORDER.includes(activeTab)) return;
    const overlay = document.getElementById('modal-overlay');
    if (overlay && getComputedStyle(overlay).display !== 'none') return;
    const i = TAB_ORDER.indexOf(activeTab) + dir;
    if (i < 0 || i >= TAB_ORDER.length) return;
    setActiveTab(TAB_ORDER[i], dir);
  }

  function renderScreen(id) {
    const el = document.getElementById('screen-' + id);
    if (!el) return;
    const renders = {
      home: renderHome,
      train: renderTrain,
      history: renderHistory,
      stats: renderStats,
      profile: renderProfile,
      routines: renderRoutines,
      'routine-editor': renderRoutineEditor,
      library: renderLibrary,
      badges: renderBadges,
      'workout-logger': renderWorkoutLogger,
      'session-summary': renderSessionSummary,
    };
    if (renders[id]) renders[id](el);
  }

  function sbar() {
    return `<div class="sbar"><span style="font-weight:600;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(weeklyMotivation())}</span></div>`;
  }

  function tabBar() {
    const tabs = [
      { id:'home', icon:'home', label:'Home' },
      { id:'train', icon:'dumbbell', label:'Train' },
      { id:'history', icon:'clock', label:'History' },
      { id:'stats', icon:'chart', label:'Stats' },
      { id:'profile', icon:'user', label:'You' },
    ];
    return `<nav id="tab-bar">${tabs.map(t =>
      `<button class="tab${activeTab===t.id?' on':''}" data-tab="${t.id}">${ic(t.icon)}<span>${t.label}</span></button>`
    ).join('')}</nav>`;
  }

  /* ────────────────── EXERCISE DEMO MEDIA ────────────────── */
  // Lazy-load a per-exercise demo clip by convention: assets/exercises/<id>.<ext>.
  // Tries webp → gif → png; reveals on first success, hides the box if none exist.
  // Zero data/code changes to add one later — just drop the file in that folder.
  const EX_MEDIA_EXTS = ['webp', 'gif', 'png'];
  function loadExerciseMedia(exId) {
    const box = document.getElementById('ex-media');
    const img = document.getElementById('ex-media-img');
    if (!box || !img) return;
    let i = 0;
    img.onload = () => { box.style.display = 'block'; };
    img.onerror = () => {
      if (++i < EX_MEDIA_EXTS.length) img.src = `assets/exercises/${exId}.${EX_MEDIA_EXTS[i]}`;
      else box.remove();  // no clip for this exercise → leave the modal text-only
    };
    img.src = `assets/exercises/${exId}.${EX_MEDIA_EXTS[0]}`;
  }

  /* ────────────────── HOME ────────────────── */
  // Paint the decorative rain once into #rain-fx. Pure CSS handles the motion
  // after this; varied speed/length/opacity + mid-flight negative delays give a
  // soft, continuous fall with no popcorn start. Skipped under reduced-motion.
  function paintRain() {
    const layer = document.getElementById('rain-fx');
    if (!layer) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { layer.innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < 26; i++) {
      const left = (Math.random() * 100).toFixed(2);
      const dur = (1.9 + Math.random() * 1.6).toFixed(2);   // 1.9–3.5s — gentle
      const delay = (Math.random() * dur).toFixed(2);        // negative → already mid-fall on load
      const op = (0.10 + Math.random() * 0.20).toFixed(2);   // subtle, never overpowers content
      const h = (10 + Math.random() * 12).toFixed(0);        // 10–22px streak length
      html += `<i style="left:${left}%;height:${h}px;animation-duration:${dur}s;animation-delay:-${delay}s;opacity:${op}"></i>`;
    }
    layer.innerHTML = html;
  }

  function renderHome(el) {
    const user = Storage.getUser();
    const name = (user && user.name) ? user.name : 'there';
    const streak = Storage.getStreak();

    // Weekly progress ring: workouts done this week / target.
    const target = (user && user.weeklyTargetWorkouts) || streak.weeklyTarget || 3;
    const done = streak.currentWeekWorkouts || 0;
    const progress = target > 0 ? Math.min(done / target, 1) : 0;
    const RING_C = 408;                       // 2π·65, matches the design's stroke-dasharray
    const dashoffset = Math.round(RING_C * (1 - progress));

    // Weekly streak line (data-driven, with safe phrasing when there's no streak yet).
    const wkStreak = streak.currentWeeklyStreak || 0;
    const remaining = Math.max(target - done, 0);
    const streakLine = wkStreak > 0
      ? `<b>${wkStreak}-week streak</b> · ${remaining > 0 ? `${remaining} more ${remaining === 1 ? 'workout' : 'workouts'} keeps it going` : 'this week is locked in'}`
      : (done > 0
          ? `<b>${done} of ${target} this week</b> · keep it rolling`
          : `<b>No streak yet</b> · log a workout to start one`);

    // Today's scheduled routine (purely a reminder; Start never restricts).
    const DAY_KEYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const schedule = Storage.getSchedule();
    const todayRoutine = schedule[DAY_KEYS[new Date().getDay()]]
      ? Storage.getRoutineById(schedule[DAY_KEYS[new Date().getDay()]]) : null;

    const active = Storage.getActiveWorkout();
    const hasActiveWorkout = !!active && (active.exercises || []).length > 0;

    // Today card content + Start button wiring (resume > scheduled routine > picker).
    let todayLab, todayName, todayMeta, startLabel, startAction, startData = '';
    if (hasActiveWorkout) {
      todayLab = 'In progress';
      todayName = esc(active.name || 'Active workout');
      todayMeta = 'Pick up where you left off';
      startLabel = 'Resume workout'; startAction = 'resume-workout';
    } else if (todayRoutine) {
      todayLab = 'Today';
      todayName = esc(todayRoutine.name);
      todayMeta = `${(todayRoutine.exercises || []).length} exercises scheduled`;
      startLabel = 'Start workout'; startAction = 'start-routine';
      startData = ` data-id="${todayRoutine.id}"`;
    } else {
      todayLab = 'Today';
      todayName = 'Rest day';
      todayMeta = 'Nothing scheduled — train anyway?';
      startLabel = 'Start workout'; startAction = 'pick-routine';
    }

    el.innerHTML = `
      <div class="rain-fx" id="rain-fx" aria-hidden="true"></div>
      ${sbar()}
      <div class="home-body">
        <div class="home-greet">
          <div class="day">${todayLabel()}</div>
          <div class="home-hello">Good ${timeGreeting().toLowerCase()},<br>${esc(name)}</div>
        </div>

        <div class="home-ringwrap">
          <div class="home-ring">
            <svg width="156" height="156" viewBox="0 0 156 156">
              <defs><linearGradient id="home-ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--amber-ring-1)"/><stop offset="1" stop-color="var(--amber-ring-2)"/></linearGradient></defs>
              <circle cx="78" cy="78" r="65" fill="none" stroke="var(--home-track)" stroke-width="10"/>
              <circle cx="78" cy="78" r="65" fill="none" stroke="url(#home-ring-grad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${dashoffset}"/>
            </svg>
            <div class="ctr"><div class="big">${done}<small>/${target}</small></div><div class="sub">this week</div></div>
          </div>
          <div class="home-line">${streakLine}</div>
        </div>

        <div class="home-today">
          <div class="lab">${todayLab}</div>
          <div class="name">${todayName}</div>
          <div class="meta">${todayMeta}</div>
          <button class="home-start" data-action="${startAction}"${startData}>${ic('bolt')}${startLabel}</button>
        </div>
      </div>`;
    paintRain();
  }

  /* ────────────────── TRAIN ────────────────── */
  function renderTrain(el) {
    const routines = Storage.getRoutines();
    const listHtml = routines.length
      ? routines.map(r => {
          const open = !!expandedRoutines[r.id];
          const exItems = (r.exercises || [])
            .slice()
            .sort((a, b) => sectionOrder(a) - sectionOrder(b))
            .map(re => {
              const ex = Storage.getExerciseById(re.exerciseId);
              if (!ex) return '';
              return `
                <div class="btw" style="padding:8px 0">
                  <div style="min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;font-size:13px">${esc(ex.name)}</div>
                  <span class="num dim" style="font-size:11px;flex:none;margin-left:10px">${re.targetSets||3} × ${re.targetRepRange||'8–10'}</span>
                </div>`;
            }).join('<div class="hair"></div>');

          const body = open ? `
            <div style="padding:4px 14px 14px">
              ${exItems || '<div class="kik" style="padding:8px 0">No exercises yet</div>'}
              <div class="row" style="gap:8px;margin-top:12px">
                <button class="btn ghost" style="flex:1;width:auto;height:44px;font-size:13px" data-action="open-routine" data-id="${r.id}">${ic('grip','15px')}Edit</button>
                <button class="btn" style="flex:1;width:auto;height:44px;font-size:13px" data-action="start-routine" data-id="${r.id}">${ic('bolt','15px')}Start</button>
              </div>
            </div>` : '';

          return `
            <div class="sect" style="margin-bottom:10px">
              <div class="shead" style="cursor:pointer;background:var(--card);padding:12px 14px" data-action="toggle-routine" data-id="${r.id}">
                <div class="mark" style="width:38px;height:38px;border-radius:11px;flex:none">${ic('dumbbell')}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.name)}</div>
                  <div class="kik" style="margin-top:3px">${(r.exercises||[]).length} exercises</div>
                </div>
                <svg class="chev2${open?' op':''}" style="width:15px;height:15px;color:var(--ink-3);flex:none"><use href="#ic-chev"/></svg>
              </div>
              ${body}
            </div>`;
        }).join('')
      : `
      <div class="empty">
        <div class="eico">${ic('dumbbell')}</div>
        <h3>No routines yet</h3>
        <p>Build your first routine to start tracking your workouts.</p>
      </div>`;

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar">
          <div style="flex:1"><div class="kik">Your training</div><div class="t">Workout</div></div>
        </div>
        ${routines.length ? '<div class="kik" style="margin:2px 2px 10px;color:var(--ink-2)">My routines</div>' : ''}
        ${listHtml}
        <button class="btn ghost" style="margin-top:12px" data-action="new-routine">${ic('plus')}New routine</button>
      </div></div>`;
  }

  /* ────────────────── HISTORY ────────────────── */
  function renderHistory(el) {
    const workouts = Storage.getWorkouts();
    const heatmapHtml = buildHeatmap();
    const listHtml = workouts.length ? workouts.slice(0, 20).map(w => {
      const exercises = (w.exercises || []);
      const sets = exercises.reduce((n, e) => n + (e.sets||[]).filter(s=>s.isCompleted).length, 0);
      const vol = exercises.reduce((sum, e) => sum + (e.sets||[]).filter(s=>s.isCompleted).reduce((ss,s)=>ss+(s.weight||0)*(s.reps||0),0), 0);
      const dur = w.durationSec ? fmtDuration(w.durationSec) : '';
      return `
        <div class="card" style="padding:13px;cursor:pointer" data-action="view-workout" data-id="${w.id}">
          <div class="btw">
            <div><div style="font-weight:600;font-size:13.5px">${esc(w.name || 'Workout')}</div><div class="kik" style="margin-top:3px">${relTime(w.startedAt)}${dur ? ' · ' + dur : ''}</div></div>
            ${(w.prs && w.prs.length) ? `<span class="mtag" style="background:var(--green)">${ic('trophy','10px')} ${w.prs.length} PR</span>` : ''}
          </div>
          <div class="perf"></div>
          <div class="btw">
            <span class="num dim" style="font-size:11.5px">${vol ? fmtVol(vol) + ' kg · ' : ''}${sets} sets</span>
            <button class="chip" style="padding:5px 12px;color:var(--red)" data-action="repeat-workout" data-id="${w.id}">Repeat</button>
          </div>
        </div>`;
    }).join('') : `
      <div class="empty">
        <div class="eico">${ic('clock')}</div>
        <h3>No history yet</h3>
        <p>Your completed workouts will appear here. Start your first session!</p>
      </div>`;

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar">
          <div style="flex:1"><div class="kik">${workouts.length} sessions</div><div class="t">History</div></div>
          <button class="iconbtn" data-action="go-calendar">${ic('cal')}</button>
        </div>
        ${workouts.length ? `
        <div class="card" style="margin-bottom:12px">
          <div class="btw" style="margin-bottom:10px"><span class="kik" style="color:var(--ink-2)">Activity</span><span class="kik">17 weeks</span></div>
          <div id="heatmap-root" style="display:flex;gap:3px">${heatmapHtml}</div>
          <div class="row" style="gap:5px;margin-top:10px;justify-content:flex-end"><span class="kik">less</span><i style="width:9px;height:9px;border-radius:2px;background:var(--line-2)"></i><i style="width:9px;height:9px;border-radius:2px;background:#CADBCB"></i><i style="width:9px;height:9px;border-radius:2px;background:#9CC0A4"></i><i style="width:9px;height:9px;border-radius:2px;background:var(--red)"></i><span class="kik">more</span></div>
        </div>` : ''}
        ${workouts.length ? '<div class="kik" style="margin:4px 2px 10px;color:var(--ink-2)">Recent</div>' : ''}
        ${listHtml}
      </div></div>`;
  }

  function ymdLocal(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function buildHeatmap() {
    const workouts = Storage.getWorkouts();
    const dateMap = {};
    // Use local dates so cells line up with the device clock (and the streak math).
    workouts.forEach(w => { const d = ymdLocal(new Date(w.startedAt)); dateMap[d] = (dateMap[d]||0)+1; });
    const lv = ['var(--line-2)','#CADBCB','#9CC0A4','var(--red)'];
    let html = '';
    const today = new Date();
    for (let w = 16; w >= 0; w--) {
      html += '<div style="display:flex;flex-direction:column;gap:3px">';
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const key = ymdLocal(date);
        const cnt = dateMap[key] || 0;
        const lvl = cnt === 0 ? 0 : cnt === 1 ? 1 : cnt === 2 ? 2 : 3;
        html += `<i style="width:9px;height:9px;border-radius:2px;background:${lv[lvl]}"></i>`;
      }
      html += '</div>';
    }
    return html;
  }

  /* ────────────────── STATS ────────────────── */
  function renderStats(el) {
    const tab = statsTab;
    const content = tab === 'muscle' ? muscleBalanceBody() : progressBody();
    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar"><div style="flex:1"><div class="kik">Progress</div><div class="t">Stats</div></div></div>
        <div class="row" style="gap:8px;margin-bottom:16px">
          <button class="chip ${tab==='progress'?'on':''}" data-action="stats-tab" data-tab="progress">Progress</button>
          <button class="chip ${tab==='muscle'?'on':''}" data-action="stats-tab" data-tab="muscle">Muscle Balance</button>
        </div>
        ${content}
      </div></div>`;
  }

  function progressBody() {
    const prs = Storage.getPRs();
    const exercises = Storage.getExercises();
    const prEntries = Object.entries(prs).filter(([_, ep]) => ep.est1rm || ep.maxWeight);
    const listHtml = prEntries.length ? prEntries.map(([exId, ep]) => {
      const ex = exercises.find(e => e.id === exId);
      if (!ex) return '';
      const e1rm = ep.est1rm ? ep.est1rm.value : null;
      return `
        <div class="card" style="padding:12px 13px;cursor:pointer" data-action="exercise-progress" data-id="${exId}">
          <div class="btw">
            <div>
              <div style="font-weight:600;font-size:13.5px">${esc(ex.name)}</div>
              <div class="kik" style="margin-top:2px">${ex.category} · ${ex.equipment}</div>
            </div>
            <div style="text-align:right">
              ${e1rm ? `<div class="bign" style="font-size:20px;color:var(--green)">${e1rm}</div><div class="kik" style="margin-top:2px">est 1RM</div>` : ''}
            </div>
          </div>
        </div>`;
    }).join('') : `
      <div class="empty">
        <div class="eico">${ic('chart')}</div>
        <h3>No data yet</h3>
        <p>Your strength curve appears here after your first few sessions.</p>
      </div>`;

    return `
      ${prEntries.length ? '<div class="kik" style="margin:2px 2px 10px;color:var(--ink-2)">Estimated 1RM by exercise</div>' : ''}
      ${listHtml}`;
  }

  function muscleBalanceBody() {
    const vol = Storage.getMuscleVolume(4);
    const total = Object.values(vol).reduce((a,b) => a+b, 0) || 1;
    const muscles = ['chest','back','shoulders','arms','legs','core'];
    const barRows = muscles.map(m => {
      const pct = Math.round((vol[m] / total) * 100);
      return `
        <div class="row" style="gap:10px;padding:4px 0">
          <i style="width:10px;height:10px;border-radius:3px;background:var(--m-${MUSCLE_CLS[m]});flex-shrink:0"></i>
          <span style="font-weight:500;font-size:12px;width:60px">${MUSCLE_LABELS[m]}</span>
          <div style="flex:1;height:8px;border-radius:4px;background:var(--line-2)">
            <div style="height:100%;border-radius:4px;background:var(--m-${MUSCLE_CLS[m]});width:${pct}%"></div>
          </div>
          <span class="num" style="font-weight:700;font-size:11.5px;width:32px;text-align:right">${pct}%</span>
        </div>`;
    }).join('');

    const insightMuscles = muscles.filter(m => vol[m] === 0);
    const insightHtml = insightMuscles.length ? `
      <div class="card" style="margin-top:10px;padding:0;overflow:hidden;display:flex;align-items:stretch">
        <span style="width:5px;background:var(--m-${MUSCLE_CLS[insightMuscles[0]]})"></span>
        <div style="padding:12px 13px;font-weight:500;font-size:12.5px">${MUSCLE_LABELS[insightMuscles[0]]} volume low this month — add a finisher.</div>
      </div>` : '';

    return `
      <div class="kik" style="margin:2px 2px 10px;color:var(--ink-2)">This month · fractional sets</div>
      <div class="card" style="padding:14px">
        ${barRows}
      </div>
      ${insightHtml}`;
  }

  /* ────────────────── PROFILE ────────────────── */
  let scheduleOpen = false;  // Weekly Schedule accordion (collapsed by default)

  // One profile stat tile. Fixed icon/number heights so all three line up,
  // regardless of icon metrics or a unit suffix. `action` makes it tappable.
  function statBox(icon, value, label, action, unit) {
    return `<div class="card" style="flex:1;min-width:0;padding:14px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px${action ? ';cursor:pointer' : ''}"${action ? ` data-action="${action}"` : ''}>
      <div style="height:18px;display:flex;align-items:center;color:var(--ink-2)">${ic(icon, '17px')}</div>
      <div class="bign" style="font-size:21px;line-height:1;height:21px;display:flex;align-items:baseline;justify-content:center">${value}${unit ? `<span style="font-size:11px;font-weight:700;margin-left:1px">${unit}</span>` : ''}</div>
      <div class="kik" style="white-space:nowrap;display:flex;align-items:center;gap:3px">${label}${action ? ic('chev', '9px') : ''}</div>
    </div>`;
  }

  function renderProfile(el) {
    const user = Storage.getUser();
    const name = user ? user.name : 'You';
    const initial = name.charAt(0).toUpperCase();
    const streak = Storage.getStreak();
    const badges = Storage.getBadges();
    const totalVol = Storage.computeTotalVolume();
    const notifications = Storage.getUser()?.notifications !== false;

    const routines = Storage.getRoutines();
    const schedule = Storage.getSchedule();
    const DAYS = [['MON','Mon'],['TUE','Tue'],['WED','Wed'],['THU','Thu'],['FRI','Fri'],['SAT','Sat'],['SUN','Sun']];
    const scheduledName = (id) => { const r = routines.find(x => x.id === id); return r ? r.name : 'Rest'; };
    const scheduleHtml = DAYS.map(([key,label],i) => `
          ${i>0 ? '<div class="hair"></div>' : ''}
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="edit-schedule-day" data-day="${key}">
            <span style="font-weight:500;font-size:13.5px">${label}</span>
            <span class="num dim" style="font-size:12.5px">${esc(scheduledName(schedule[key]))} ${ic('chev','14px')}</span>
          </div>`).join('');
    const trainingDays = DAYS.filter(([key]) => schedule[key] && routines.find(r => r.id === schedule[key])).length;
    const scheduleSummary = trainingDays > 0 ? `${trainingDays} training day${trainingDays === 1 ? '' : 's'} a week` : 'No training days set yet';

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="row" style="gap:13px;padding:6px 2px 14px">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(150deg,var(--red),#456A55);display:grid;place-items:center;color:#fff;font-family:var(--disp);font-weight:800;font-size:26px;flex:none">${initial}</div>
          <div>
            <div class="title" style="font-size:23px">${esc(name)}</div>
            <div class="num dim" style="font-size:11.5px;margin-top:2px">${streak.totalCompletedWorkouts > 0 ? `${streak.totalCompletedWorkouts} workout${streak.totalCompletedWorkouts === 1 ? '' : 's'} logged` : 'Ready for day one'}</div>
          </div>
        </div>
        <div class="row" style="gap:9px;align-items:stretch">
          ${statBox('flame', streak.currentWeeklyStreak, 'wk streak')}
          ${statBox('trophy', badges.length, 'badges', 'go-badges')}
          ${statBox('dumbbell', fmtVol(totalVol), 'total', null, 'kg')}
        </div>
        <div class="kik" style="margin:15px 2px 8px;color:var(--ink-2)">Weekly Schedule</div>
        <div class="sect">
          <div class="shead" style="cursor:pointer;background:var(--card);padding:12px 14px" data-action="toggle-schedule">
            <div class="mark" style="width:34px;height:34px;border-radius:10px;flex:none">${ic('cal')}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:14px">Training days</div>
              <div class="kik" style="margin-top:3px">${scheduleSummary}</div>
            </div>
            <svg class="chev2${scheduleOpen ? ' op' : ''}" style="width:15px;height:15px;color:var(--ink-3);flex:none"><use href="#ic-chev"/></svg>
          </div>
          ${scheduleOpen ? `<div style="padding:2px 14px 8px">${scheduleHtml}</div>` : ''}
        </div>
        <div class="kik" style="margin:15px 2px 8px;color:var(--ink-2)">Settings</div>
        <div class="card" style="padding:2px 14px">
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="go-library">
            <span style="font-weight:500;font-size:13.5px">Exercise library</span>
            <span class="dim" style="font-size:12.5px">${ic('chev','14px')}</span>
          </div>
          <div class="hair"></div>
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="edit-weekly-target">
            <span style="font-weight:500;font-size:13.5px">Weekly target</span>
            <span class="num dim" style="font-size:12.5px">${user?.weeklyTargetWorkouts || 3} / week ${ic('chev','14px')}</span>
          </div>
          <div class="hair"></div>
          <div class="btw" style="padding:11px 0">
            <div>
              <div style="font-weight:500;font-size:13.5px">Reminders</div>
              <div style="font-size:11px;color:var(--ink-3);margin-top:2px">Nudge on your training days · needs device permission</div>
            </div>
            <div class="toggle-wrap ${notifications ? 'on':'off'}" data-action="toggle-notifications">
              <div class="toggle-knob"></div>
            </div>
          </div>
          <div class="hair"></div>
          <div class="btw" style="padding:11px 0"><span style="font-weight:500;font-size:13.5px">Units</span><span class="num dim" style="font-size:12.5px">kg only</span></div>
          <div class="hair"></div>
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="edit-name">
            <span style="font-weight:500;font-size:13.5px">Display name</span>
            <span class="num dim" style="font-size:12.5px">${esc(name)} ${ic('chev','14px')}</span>
          </div>
        </div>
        <div class="kik" style="margin:13px 2px 8px;color:var(--ink-2)">Backup</div>
        <div class="card" style="padding:2px 14px">
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="export-data">
            <span style="font-weight:500;font-size:13.5px">Export data</span>
            <span class="dim" style="font-size:12.5px">${ic('chev','14px')}</span>
          </div>
        </div>
        <div style="margin-top:24px;text-align:center">
          <button class="chip" style="font-size:10.5px;color:var(--ink-3)" data-action="show-onboarding">Replay intro · your data is kept</button>
        </div>
      </div></div>`;
  }

  /* ────────────────── ROUTINES ────────────────── */
  function renderRoutines(el) {
    renderTrain(el);
  }

  let editingRoutineId = null;
  let editingRoutine = null;
  let collapsedSections = {};  // section name -> true when collapsed (persists across re-renders)

  function renderRoutineEditor(el) {
    if (!editingRoutine) {
      editingRoutine = editingRoutineId ?
        (Storage.getRoutineById(editingRoutineId) || newRoutineDraft()) :
        newRoutineDraft();
    }

    const sectionsHtml = SECTIONS.map(section => {
      const collapsed = !!collapsedSections[section];
      // Indices into editingRoutine.exercises that belong to this section.
      const entries = (editingRoutine.exercises || [])
        .map((re, i) => ({ re, i }))
        .filter(({ re }) => sectionOf(re) === section);

      const rows = entries.map(({ re, i }) => {
        const ex = Storage.getExerciseById(re.exerciseId);
        if (!ex) return '';
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:9px">
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px">${esc(ex.name)}</div>
              <div class="num dim" style="font-size:11px;margin-top:2px">${re.targetSets||3} × ${re.targetRepRange||'8–10'}${re.targetWeight ? ' · ' + re.targetWeight + ' kg' : ''}</div>
            </div>
            <span class="mtag mc-${MUSCLE_CLS[ex.primaryMuscleGroup]||'back'}">${MUSCLE_LABELS[ex.primaryMuscleGroup]||ex.primaryMuscleGroup}</span>
            <button class="iconbtn" style="width:28px;height:28px;box-shadow:none" data-action="remove-exercise" data-idx="${i}">${ic('dots','13px')}</button>
          </div>`;
      }).join('<div class="hair" style="margin:0 9px"></div>');

      const body = collapsed ? '' : `
        <div style="padding:7px">
          ${rows || `<div class="kik" style="padding:9px 9px 6px;color:var(--ink-3)">No exercises in this section</div>`}
          <div style="padding:4px 9px 6px">
            <button class="chip" data-action="add-exercise-to-section" data-section="${section}" style="display:flex;width:100%;justify-content:center">${ic('plus','13px')}Add to ${section}</button>
          </div>
        </div>`;

      return `
        <div class="sect" style="margin-bottom:10px">
          <div class="shead" style="cursor:pointer" data-action="toggle-section" data-section="${section}">
            <svg class="chev2${collapsed?'':' op'}" style="width:13px;height:13px;color:var(--ink-2)"><use href="#ic-chev"/></svg>
            <i style="width:9px;height:9px;border-radius:3px;background:${SECTION_COLOR[section]}"></i>
            <span class="sname">${section}</span>
            <span class="scount" style="margin-left:auto">${entries.length}</span>
          </div>
          ${body}
        </div>`;
    }).join('');

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar">
          <button class="iconbtn" data-action="back">${ic('back')}</button>
          <div style="flex:1">
            <input class="inp" style="padding:8px 12px;font-size:16px;border-radius:10px;height:auto" id="routine-name-inp" value="${esc(editingRoutine.name)}" placeholder="Routine name"/>
          </div>
          <button class="chip on" data-action="save-routine">Save</button>
        </div>
        <div class="kik" style="margin:0 2px 10px;color:var(--ink-2)">Sections · tap to expand</div>
        ${sectionsHtml}
        ${editingRoutine.id ? `<button class="btn ghost" style="margin-top:16px;color:var(--red);border-color:var(--red-soft)" data-action="delete-routine">Delete routine</button>` : ''}
      </div></div>`;

    document.getElementById('routine-name-inp')?.addEventListener('input', e => {
      editingRoutine.name = e.target.value;
    });
  }

  /* ────────────────── LIBRARY ────────────────── */
  let libraryFilter = 'all';
  let libraryQuery = '';
  let libraryMode = 'browse';
  let libraryCallback = null;
  let pickSection = 'Primary';  // target section when adding to a routine

  function _buildLibraryList() {
    const exercises = Storage.getExercises().filter(e => !e.deleted);
    const filtered = exercises.filter(ex => {
      if (libraryFilter !== 'all' && ex.primaryMuscleGroup !== libraryFilter) return false;
      if (libraryQuery && !ex.name.toLowerCase().includes(libraryQuery.toLowerCase())) return false;
      return true;
    });
    const grouped = {};
    filtered.forEach(ex => {
      const g = ex.primaryMuscleGroup || 'other';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(ex);
    });
    const listHtml = Object.entries(grouped).map(([group, exs]) => `
      <div class="kik" style="margin:13px 2px 8px;color:var(--ink-2)">${MUSCLE_LABELS[group]||group}</div>
      <div class="card" style="padding:2px 14px">
        ${exs.map((ex, i) => `
          ${i > 0 ? '<div class="hair"></div>' : ''}
          <div class="btw" style="padding:11px 0;cursor:pointer" data-action="${libraryMode==='browse'?'view-exercise':'pick-exercise'}" data-id="${ex.id}">
            <div>
              <div style="font-weight:600;font-size:13.5px">${esc(ex.name)}</div>
              <div class="kik" style="margin-top:3px">${ex.equipment} · ${ex.category}</div>
            </div>
            <div class="row" style="gap:5px">
              <span class="mtag mc-${MUSCLE_CLS[ex.primaryMuscleGroup]||'back'}">${MUSCLE_LABELS[ex.primaryMuscleGroup]||ex.primaryMuscleGroup}</span>
              ${ex.isCustom ? '<span class="kik" style="color:var(--ink-3)">Custom</span>' : ''}
            </div>
          </div>`).join('')}
      </div>`).join('');
    return listHtml || `<div class="empty"><div class="eico">${ic('search')}</div><h3>No results</h3><p>Try a different search or filter.</p></div>`;
  }

  function updateLibraryList(el) {
    const listEl = el.querySelector('#lib-list');
    if (listEl) listEl.innerHTML = _buildLibraryList();
    const muscles = ['chest','back','shoulders','arms','legs','core'];
    el.querySelectorAll('[data-action="filter-library"]').forEach(c => {
      c.classList.toggle('on', c.dataset.filter === libraryFilter);
    });
  }

  function renderLibrary(el) {
    const exercises = Storage.getExercises().filter(e => !e.deleted);
    const muscles = ['chest','back','shoulders','arms','legs','core'];

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar">
          <button class="iconbtn" data-action="back">${ic('back')}</button>
          <div style="flex:1"><div class="kik">${exercises.length} exercises</div><div class="t">Library</div></div>
          <button class="iconbtn accent" data-action="new-custom-exercise">${ic('plus')}</button>
        </div>
        <div class="search-bar">
          ${ic('search')}
          <input type="search" id="lib-search" placeholder="Search exercises" value="${esc(libraryQuery)}">
        </div>
        <div class="row" style="gap:7px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">
          <button class="chip${libraryFilter==='all'?' on':''}" data-action="filter-library" data-filter="all">All</button>
          ${muscles.map(m=>`<button class="chip${libraryFilter===m?' on':''}" data-action="filter-library" data-filter="${m}">${MUSCLE_LABELS[m]}</button>`).join('')}
        </div>
        <div id="lib-list">${_buildLibraryList()}</div>
      </div></div>`;

    const searchInp = document.getElementById('lib-search');
    if (searchInp) {
      searchInp.addEventListener('input', e => {
        libraryQuery = e.target.value;
        // Rebuilding the full list is heavy with 200+ exercises — debounce it.
        clearTimeout(_libSearchTimer);
        _libSearchTimer = setTimeout(() => updateLibraryList(el), 160);
      });
      searchInp.focus();
    }
  }

  /* ────────────────── WORKOUT LOGGER ────────────────── */
  // A fresh routine is pre-loaded with these so it is never empty on first use.
  function defaultRoutineExercises() {
    return [
      { exerciseId: 'pushup',          section: 'Warm Up',   targetSets: 2, targetRepRange: '12–15', targetWeight: null },
      { exerciseId: 'bench_press',     section: 'Primary',   targetSets: 4, targetRepRange: '6–8',   targetWeight: 60 },
      { exerciseId: 'barbell_row',     section: 'Primary',   targetSets: 4, targetRepRange: '8–10',  targetWeight: 50 },
      { exerciseId: 'ohp',             section: 'Primary',   targetSets: 3, targetRepRange: '8–10',  targetWeight: 40 },
      { exerciseId: 'barbell_curl',    section: 'Secondary', targetSets: 3, targetRepRange: '10–12', targetWeight: 25 },
      { exerciseId: 'tricep_pushdown', section: 'Secondary', targetSets: 3, targetRepRange: '12–15', targetWeight: 20 },
    ];
  }
  function newRoutineDraft() {
    return { id: null, name: 'New Routine', exercises: defaultRoutineExercises() };
  }

  function buildWorkoutExercise(exerciseId, order, numSets = 3) {
    const ex = Storage.getExerciseById(exerciseId);
    const lastSets = Storage.getLastSessionNumbers(exerciseId);
    const sets = Array.from({ length: numSets }, (_, si) => ({
      id: Storage.uid(),
      setNumber: si + 1,
      weight: null, reps: null,
      durationSec: null,
      setType: 'normal',
      isCompleted: false,
      restSec: ex?.category === 'compound' ? 180 : 90,
    }));
    return { exerciseId, order, notes: '', sets, lastSets };
  }

  function buildNewWorkout(routine) {
    const id = Storage.uid();
    const src = (routine ? routine.exercises || [] : [])
      // Drop any exercise whose id no longer resolves so it can't break the logger.
      .filter(re => Storage.getExerciseById(re.exerciseId))
      // Order by section, preserving each exercise's existing order within.
      .map((re, i) => ({ re, i }))
      .sort((a, b) => sectionOrder(a.re) - sectionOrder(b.re) || a.i - b.i);
    const exercises = src.map(({ re }, i) => {
      const we = buildWorkoutExercise(re.exerciseId, i, re.targetSets || 3);
      we.section = sectionOf(re);
      return we;
    });
    return {
      id, routineId: routine?.id || null,
      name: routine?.name || 'Workout',
      startedAt: new Date().toISOString(),
      exercises,
    };
  }

  function renderWorkoutLogger(el) {
    const w = workoutState;
    if (!w) return;
    const curEx = w.exercises[w.currentExIdx];
    const ex = curEx ? Storage.getExerciseById(curEx.exerciseId) : null;
    if (!ex) {
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);flex-shrink:0">
          <button class="iconbtn" style="width:32px;height:32px" data-action="pause-workout">${ic('back')}</button>
          <div style="font-weight:700;font-size:13.5px;flex:1">${esc(w.name)}</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px">
          <div class="empty">
            <div class="eico">${ic('dumbbell')}</div>
            <h3>No exercises yet</h3>
            <p>Add your first exercise to start logging sets.</p>
          </div>
          <button class="btn" style="margin-top:4px;max-width:260px" data-action="add-exercise-to-workout">${ic('plus')}Add exercise</button>
          <button class="btn out" style="margin-top:10px;max-width:260px" data-action="pause-workout">${ic('back')}Go back</button>
        </div>`;
      return;
    }

    const elapsed = Math.floor((Date.now() - new Date(w.startedAt).getTime() - (w._pausedOffset || 0)) / 1000);

    const mode = logMode(ex);

    const setRows = curEx.sets.map((set, si) => {
      const isActive = si === w.currentSetIdx;
      const lastSet = curEx.lastSets ? curEx.lastSets[si] : null;
      const prevStr = prevRef(mode, lastSet);
      const lightColor = setLight(mode, set, lastSet);

      if (isActive && !set.isCompleted) {
        return `
          <div class="score" style="padding:10px 6px;margin-top:6px;position:relative;overflow:hidden">
            <span style="position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--led)"></span>
            <div class="row" style="padding-left:4px">
              <span style="width:28px;font-weight:700;color:#fff;font-size:12px">${setLabel(set, si)}</span>
              <span class="num" style="width:52px;font-size:11px;color:#9B9486">${prevStr}</span>
              ${activeInputs(mode, set)}
              <span style="width:26px;text-align:right"><i style="display:inline-block;width:15px;height:15px;border-radius:50%;border:2px solid #5f5a50"></i></span>
            </div>
            ${setTypePicker(set, si)}
          </div>`;
      }
      return `
        <div class="card" style="padding:9px 6px;${si<w.currentSetIdx?'opacity:.65;':''}margin-top:6px;border-radius:12px;position:relative;overflow:hidden;${set.isCompleted&&lightColor?`box-shadow:none`:''}">
          ${lightColor ? `<span style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${lightColor}"></span>` : ''}
          <div class="row" style="padding-left:${lightColor?'4px':'0'}">
            <span style="width:28px;font-weight:700;font-size:12px;${setLabelColor(set)?`color:${setLabelColor(set)}`:''}">${setLabel(set, si)}</span>
            <span class="num dim3" style="width:52px;font-size:11px">${prevStr}</span>
            ${displayCells(mode, set, lightColor)}
            <span style="width:26px;text-align:right">${set.isCompleted ? `${ic('check','14px')}` : ''}</span>
          </div>
        </div>`;
    }).join('');

    const weight = curEx.sets[w.currentSetIdx]?.weight || 0;
    const barbellCard = (mode === 'weight' && weight >= 20) ? `
      <div class="card" style="margin-top:12px;padding:11px 12px">
        ${renderBarbell(weight)}
      </div>` : '';

    const allDone = w.exercises.every(we => we.sets.every(s => s.isCompleted));
    const curExDone = curEx.sets.every(s => s.isCompleted);

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);flex-shrink:0">
        <button class="iconbtn" style="width:32px;height:32px" data-action="pause-workout">${ic('back')}</button>
        <div style="font-weight:700;font-size:13.5px;flex:1">${esc(w.name)}</div>
        <div class="score" style="padding:6px 10px;display:flex;align-items:center;gap:5px">
          ${ic('clock','12px')}
          <span class="led" id="workout-timer" style="font-size:13px">${fmtTime(elapsed)}</span>
        </div>
      </div>
      <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        <div class="scroll" style="padding-top:10px">
          <div class="btw" style="align-items:flex-start">
            <div>
              <div class="title" style="font-size:22px">${esc(ex.name)}</div>
              <div class="kik" style="margin-top:5px">${MUSCLE_LABELS[ex.primaryMuscleGroup]||''} · ${ex.equipment} · Set ${w.currentSetIdx+1} of ${curEx.sets.length}</div>
            </div>
            <button class="iconbtn" style="width:32px;height:32px" data-action="exercise-options">${ic('dots')}</button>
          </div>
          <div style="margin-top:12px">
            <div class="row" style="padding:0 6px 7px">
              ${colHeader(mode)}
            </div>
            ${setRows}
          </div>
          ${barbellCard}
          ${mode === 'weight' ? `
          <div class="row" style="gap:7px;margin-top:12px">
            <button class="chip" data-action="weight-step" data-step="1.25">+1.25</button>
            <button class="chip" data-action="weight-step" data-step="2.5">+2.5</button>
            <button class="chip" data-action="weight-step" data-step="5">+5</button>
          </div>` : ''}
          <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
            ${w.exercises.map((we, i) => {
              const tex = Storage.getExerciseById(we.exerciseId);
              const done = we.sets.filter(s=>s.isCompleted).length;
              return `<button class="chip${i===w.currentExIdx?' on':''}" data-action="jump-exercise" data-idx="${i}" style="font-size:10.5px">${tex?.name.split(' ')[0]||'Ex'} ${done}/${we.sets.length}</button>`;
            }).join('')}
          </div>
        </div>
        <div style="padding:10px 16px;border-top:1px solid var(--line);display:flex;gap:9px;flex-shrink:0">
          ${allDone ? `
            <button class="btn" style="flex:1" data-action="finish-workout">${ic('check')}Finish workout</button>
          ` : curExDone ? `
            <button class="btn out" style="flex:1;height:48px" data-action="add-set-to-ex">${ic('plus')}Add set</button>
            <button class="btn" style="flex:1;height:48px" data-action="finish-workout">${ic('check')}Finish workout</button>
          ` : `
            <button class="btn out" style="flex:1;height:48px" data-action="start-rest-timer">${ic('rest')}Rest ${fmtTime(curEx.sets[w.currentSetIdx]?.restSec||90)}</button>
            <button class="btn" style="flex:1.3;height:48px" data-action="log-set">${ic('check')}Log set</button>
          `}
        </div>
      </div>`;

    startWorkoutTimer();

    document.getElementById('inp-weight')?.addEventListener('input', e => {
      curEx.sets[w.currentSetIdx].weight = parseFloat(e.target.value) || null;
      saveActiveSoon();
      const weightVal = parseFloat(e.target.value) || 0;
      const barbellArea = el.querySelector('.barbell')?.closest('.card');
      if (barbellArea && ex.trackingType === 'weight_reps' && weightVal >= 20) {
        barbellArea.innerHTML = renderBarbell(weightVal);
      }
    });
    document.getElementById('inp-reps')?.addEventListener('input', e => {
      curEx.sets[w.currentSetIdx].reps = parseInt(e.target.value) || null;
      saveActiveSoon();
    });
    document.getElementById('inp-distance')?.addEventListener('input', e => {
      curEx.sets[w.currentSetIdx].distance = parseFloat(e.target.value) || null;
      saveActiveSoon();
    });
    document.getElementById('inp-duration')?.addEventListener('input', e => {
      const v = parseFloat(e.target.value) || null;
      // time mode stores seconds directly; distance mode's duration field is minutes
      curEx.sets[w.currentSetIdx].durationSec = v == null ? null : (mode === 'distance' ? Math.round(v * 60) : Math.round(v));
      saveActiveSoon();
    });
  }

  function startWorkoutTimer() {
    clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(() => {
      const el = document.getElementById('workout-timer');
      if (!el || !workoutState) { clearInterval(workoutTimerInterval); return; }
      const elapsed = Math.floor((Date.now() - new Date(workoutState.startedAt).getTime() - (workoutState._pausedOffset || 0)) / 1000);
      el.textContent = fmtTime(elapsed);
    }, 1000);
  }

  /* ────────────────── SESSION SUMMARY ────────────────── */
  function renderSessionSummary(el) {
    const w = workoutState;
    if (!w) return;
    const newPRs = workoutState._newPRs || [];
    const allSets = (w.exercises||[]).reduce((acc, we) => acc.concat(we.sets.filter(s=>s.isCompleted)), []);
    const totalVol = allSets.reduce((sum, s) => sum + (s.weight||0)*(s.reps||0), 0);
    const elapsed = w.durationSec != null ? w.durationSec : (w.endedAt ? Math.floor((new Date(w.endedAt)-new Date(w.startedAt))/1000) : 0);

    el.innerHTML = `
      <div class="scroll" style="padding-top:8px">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:#4E775F;padding:18px 14px;text-align:center;position:relative;overflow:hidden">
            <div class="rays" style="--ry:44%;opacity:.55"></div>
            <div style="position:relative">
              <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(150deg,#E8C36B,#CC9B66);display:grid;place-items:center;margin:0 auto 10px;animation:popScale .7s cubic-bezier(.34,1.4,.5,1) both">${ic('trophy','26px')}</div>
              <div class="title" style="font-size:28px;color:#fff">Good lift!</div>
              <div style="font-weight:600;font-size:11.5px;color:#d9f3e1;margin-top:4px">${esc(w.name)}${newPRs.length ? ` · ${newPRs.length} PR${newPRs.length>1?'s':''}` : ''}</div>
            </div>
          </div>
          <div style="padding:14px">
            <div class="row" style="text-align:center">
              <div style="flex:1"><div class="bign" style="font-size:22px">${fmtDuration(elapsed)}</div><div class="kik" style="margin-top:3px">time</div></div>
              <div style="width:1px;height:30px;background:var(--line)"></div>
              <div style="flex:1"><div class="bign" style="font-size:22px">${fmtVol(totalVol)}<span class="dim3" style="font-size:11px;font-weight:700"> kg</span></div><div class="kik" style="margin-top:3px">volume</div></div>
              <div style="width:1px;height:30px;background:var(--line)"></div>
              <div style="flex:1"><div class="bign" style="font-size:22px">${allSets.length}</div><div class="kik" style="margin-top:3px">sets</div></div>
            </div>
            ${newPRs.length ? `
            <div class="perf"></div>
            <div class="row" style="gap:8px;margin-bottom:9px">${ic('trophy','16px')}<span style="font-weight:700;font-size:13px">${newPRs.length} personal record${newPRs.length>1?'s':''}</span></div>
            ${newPRs.slice(0,3).map(pr=>`
              <div class="btw" style="padding:3px 0">
                <span style="font-weight:500;font-size:12.5px">${esc(pr.exerciseName)} · ${pr.type==='est_1rm'?'est 1RM':pr.type==='max_duration'?'longest hold':pr.type==='max_distance'?'longest distance':'heaviest'}</span>
                <span class="num" style="font-weight:800;color:var(--green)">${pr.type==='max_duration'?fmtTime(pr.value):pr.type==='max_distance'?pr.value+' km':pr.value+' kg'}</span>
              </div>
              <div class="hair"></div>`).join('')}` : ''}
          </div>
        </div>
        <div style="padding:12px 0 14px"><button class="btn ink" data-action="done-summary">${ic('check')}Done</button></div>
      </div>`;
  }

  /* ────────────────── BADGES ────────────────── */
  function renderBadges(el) {
    const badges = Storage.getBadges();
    const streak = Storage.getStreak();
    const nextGoals = [
      { key:'workouts_10', label:'10 Workouts', target:10, progress: streak.totalCompletedWorkouts, icon:'trophy', color:'var(--ink-2)' },
      { key:'workouts_25', label:'25 Workouts', target:25, progress: streak.totalCompletedWorkouts, icon:'trophy', color:'var(--ink-2)' },
      { key:'workouts_50', label:'50 Workouts', target:50, progress: streak.totalCompletedWorkouts, icon:'trophy', color:'var(--red)' },
      { key:'streak_4wk', label:'4-Wk Streak', target:4, progress: streak.currentWeeklyStreak, icon:'flame', color:'var(--warm)' },
    ];
    const earned = new Set(badges.map(b=>b.key));
    const next = nextGoals.find(g => !earned.has(g.key));
    const pct = next ? Math.min(100, Math.round((next.progress/next.target)*100)) : 100;

    el.innerHTML = `
      ${sbar()}
      <div class="body"><div class="scroll">
        <div class="appbar">
          <button class="iconbtn" data-action="back">${ic('back')}</button>
          <div style="flex:1"><div class="kik">${badges.length} earned</div><div class="t">Achievements</div></div>
        </div>
        ${next ? `
        <div class="card" style="padding:14px;margin-bottom:14px">
          <div class="row" style="gap:12px">
            <div style="width:46px;height:46px;border-radius:16px;background:var(--card-2);border:1.5px dashed var(--line-2);display:grid;place-items:center;flex:none">${ic(next.icon,'24px')}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:14px">${next.label}</div><div class="kik" style="margin-top:3px">${next.target - next.progress} more to unlock</div></div>
          </div>
          <div style="height:9px;border-radius:5px;background:var(--line-2);margin-top:12px">
            <div style="width:${pct}%;height:100%;border-radius:5px;background:var(--red);transition:width .6s ease"></div>
          </div>
          <div class="btw" style="margin-top:6px"><span class="num" style="font-weight:700;font-size:11px">${next.progress} / ${next.target}</span><span class="kik">process &gt; outcome</span></div>
        </div>` : ''}
        <div class="kik" style="margin:4px 2px 10px;color:var(--ink-2)">Earned</div>
        ${badges.length ? `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          ${badges.map(b=>`
            <div style="text-align:center">
              <div style="aspect-ratio:1;border-radius:15px;background:var(--card);box-shadow:var(--sh-sm);display:grid;place-items:center">${ic(b.icon,'23px')}</div>
              <div class="kik" style="margin-top:6px;font-size:8.5px">${b.label}</div>
            </div>`).join('')}
        </div>` : `
        <div class="empty">
          <div class="eico">${ic('trophy')}</div>
          <h3>No badges yet</h3>
          <p>Complete workouts to unlock your first achievement.</p>
        </div>`}
      </div></div>`;
  }

  /* ────────────────── TUTORIAL / WALKTHROUGH ────────────────── */
  const TUTORIAL = [
    { icon: 'dumbbell', title: 'Welcome to Kasrat', text: 'Your training, tracked — every set, every session, on your device.' },
    { icon: 'grip',     title: 'Build your routines', text: 'Group lifts into Warm-Up, Primary, Secondary and more.' },
    { icon: 'bolt',     title: 'Log in seconds', text: 'Weight × reps, plate math, set types, and an auto rest timer.' },
    { icon: 'chart',    title: 'Watch your progress', text: 'PRs, weekly streaks and muscle balance keep you motivated.' },
    { icon: 'search',   title: '200+ exercises', text: 'A full library — plus add your own custom moves anytime.' },
  ];
  let tutStep = 0;

  function startTutorial() {
    tutStep = 0;
    renderTutorial();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-tutorial')?.classList.add('active');
  }

  function renderTutorial() {
    const screen = document.getElementById('screen-tutorial');
    if (!screen) return;
    const s = TUTORIAL[tutStep];
    const isLast = tutStep === TUTORIAL.length - 1;
    screen.innerHTML = `
      <div class="body" style="padding:0">
        <div class="btw" style="padding:14px 18px 0">
          <span></span>
          <button class="chip" data-action="tut-skip" style="box-shadow:none;background:transparent;color:var(--ink-3)">Skip</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 32px">
          <div class="mark anim-pop" style="width:84px;height:84px;border-radius:26px;margin-bottom:26px">${ic(s.icon, '40px')}</div>
          <div class="title" style="font-size:27px;line-height:1.1">${s.title}</div>
          <div class="dim" style="margin-top:12px;font-size:14px;line-height:1.5;max-width:280px">${s.text}</div>
        </div>
        <div style="padding:14px 18px 28px">
          <div class="row" style="gap:6px;justify-content:center;margin-bottom:16px">
            ${TUTORIAL.map((_, i) => `<i class="odot${i === tutStep ? ' on' : ''}" data-action="tut-go" data-i="${i}"></i>`).join('')}
          </div>
          <button class="btn" data-action="tut-next">${isLast ? ic('bolt') : ''}${isLast ? 'Get Started' : 'Next'}</button>
        </div>
      </div>`;
  }

  function tutNav(dir) {
    const ni = tutStep + dir;
    if (ni < 0 || ni >= TUTORIAL.length) return;
    tutStep = ni;
    renderTutorial();
  }

  function finishTutorial() {
    document.getElementById('screen-tutorial')?.classList.remove('active');
    onbStep = 1;
    renderOnboarding();
    document.querySelectorAll('.screen').forEach(sc => sc.classList.remove('active'));
    document.getElementById('screen-onboarding')?.classList.add('active');
  }

  /* ────────────────── ONBOARDING ────────────────── */
  let onbStep = 1;
  let onbName = '';
  let onbGoal = 3;

  function renderOnboarding() {
    const screen = document.getElementById('screen-onboarding');
    if (!screen) return;
    screen.classList.add('active');

    const steps = {
      1: `
        <div class="mark" style="width:56px;height:56px;margin-bottom:22px">${ic('dumbbell')}</div>
        <div class="title" style="font-size:28px;line-height:1.08">Let's get<br>you lifting.</div>
        <div class="dim" style="margin-top:11px;font-size:13px">No email, no password — your training lives on your device.</div>
        <div style="margin-top:28px">
          <div class="kik" style="margin-bottom:9px">What should we call you?</div>
          <input class="inp" id="onb-name" type="text" placeholder="Your name" value="${esc(onbName)}" autocomplete="off">
        </div>`,
      2: `
        <div class="kik">Your goal</div>
        <div class="title" style="font-size:26px;line-height:1.12;margin-top:6px">How many days<br>a week?</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:24px">
          ${[1,2,3,4,5,6,7].map(n=>`<button class="goalt${onbGoal===n?' on':''}" data-action="set-goal" data-goal="${n}"><div class="gn">${n}</div><small>DAY${n>1?'S':''}</small></button>`).join('')}
        </div>
        <div class="dim" style="margin-top:18px;font-size:12.5px;line-height:1.5">This becomes your weekly streak goal. Change it anytime — raising it never breaks your streak.</div>`,
    };

    const isLast = onbStep === 2;
    screen.innerHTML = `
      <div class="body" style="padding:0">
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 22px">
          ${steps[onbStep] || ''}
        </div>
        <div style="padding:14px 18px 24px">
          <div class="row" style="gap:6px;justify-content:center;margin-bottom:14px">
            ${[1,2].map(i=>`<i class="odot${onbStep===i?' on':''}"></i>`).join('')}
          </div>
          <button class="btn" id="onb-continue">${isLast ? ic('bolt') : ''}${isLast ? 'Get started' : 'Continue'}</button>
          ${onbStep > 1 ? '<button class="chip" style="width:100%;margin-top:8px;justify-content:center;display:flex" data-action="onb-back">Back</button>' : ''}
        </div>
      </div>`;

    const nameInp = document.getElementById('onb-name');
    if (nameInp) { nameInp.focus(); nameInp.addEventListener('input', e => { onbName = e.target.value; }); }
    document.getElementById('onb-continue')?.addEventListener('click', onbNext);
  }

  function onbNext() {
    if (onbStep === 1) {
      if (!onbName.trim()) { document.getElementById('onb-name')?.focus(); return; }
      onbStep = 2; renderOnboarding();
    } else {
      finishOnboarding();
    }
  }

  function finishOnboarding() {
    Storage.saveUser({ name: onbName.trim() || 'Lifter', weeklyTargetWorkouts: onbGoal });
    Storage.setOnboarded();
    const onbScreen = document.getElementById('screen-onboarding');
    if (onbScreen) onbScreen.classList.remove('active');
    setActiveTab('home');
  }

  /* ────────────────── REST TIMER ────────────────── */
  let restRemaining = 0;
  let restPaused = false;

  function startRestTimer(seconds, onDone) {
    clearInterval(restTimerInterval);
    restRemaining = seconds;
    restPaused = false;
    const el = document.getElementById('rest-timer-screen');
    if (!el) return;
    el.style.display = 'flex';
    el.style.flexDirection = 'column';

    function updateDisplay() {
      el.innerHTML = `
        <div class="btw" style="padding:14px 16px;flex-shrink:0">
          <span class="kik" style="color:var(--ink-2)">Rest clock</span>
          <span style="font-weight:700;font-size:10px;letter-spacing:.04em;color:var(--red)">AUTO-STARTED</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 16px;gap:14px">
          <div style="width:100%;background:var(--dark);border-radius:20px;padding:24px 16px;text-align:center">
            <div class="kik" style="color:#8C8678">Remaining</div>
            <div class="led" style="font-size:76px;line-height:.82;margin-top:6px">${fmtTime(restRemaining)}</div>
            <div style="width:78%;height:7px;border-radius:5px;background:#3a352d;margin:13px auto 0">
              <div style="width:${Math.round((1-restRemaining/seconds)*100)}%;height:100%;border-radius:5px;background:var(--led);transition:width .5s linear"></div>
            </div>
            <div class="kik" style="color:#8C8678;margin-top:9px">of ${fmtTime(seconds)}</div>
          </div>
          <div class="row" style="gap:7px;color:var(--ink-2)">${ic('vibe','14px')}<span style="font-weight:500;font-size:11.5px">Buzzes when done — even if locked</span></div>
        </div>
        <div style="padding:4px 16px 20px;display:flex;gap:9px;flex-shrink:0">
          <button class="btn out" style="flex:1;height:48px" id="rest-pause">${ic(restPaused?'bolt':'pause')}${restPaused?'Resume':'Pause'}</button>
          <button class="btn" style="flex:1;height:48px" id="rest-skip">${ic('skip')}Skip</button>
        </div>`;
      document.getElementById('rest-skip')?.addEventListener('click', () => {
        clearInterval(restTimerInterval);
        el.style.display = 'none';
        if (onDone) onDone();
      });
      document.getElementById('rest-pause')?.addEventListener('click', () => {
        restPaused = !restPaused;
        updateDisplay();
      });
    }
    updateDisplay();
    restTimerInterval = setInterval(() => {
      if (restPaused) return;
      restRemaining--;
      if (restRemaining <= 0) {
        clearInterval(restTimerInterval);
        el.style.display = 'none';
        if (navigator.vibrate) navigator.vibrate([400, 100, 400]);
        if (onDone) onDone();
      } else { updateDisplay(); }
    }, 1000);
  }

  /* ────────────────── MODALS / PICKERS ────────────────── */
  function showModal(html, onDismiss) {
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-box');
    overlay.style.display = 'flex';
    box.innerHTML = html;
    overlay._dismiss = onDismiss;
  }

  function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.style.display = 'none';
    if (overlay._dismiss) overlay._dismiss();
  }

  function showRoutinePicker(onPick) {
    const routines = Storage.getRoutines();
    const html = `
      <div class="kik" style="margin-bottom:12px">Choose a routine</div>
      ${routines.length ? routines.map(r=>`<button class="chip" style="width:100%;display:flex;margin-bottom:8px;justify-content:flex-start" data-action="modal-pick-routine" data-id="${r.id}">${esc(r.name)}</button>`).join('') : '<div class="dim" style="font-size:13px;margin-bottom:12px">No routines yet</div>'}
      <button class="btn ghost" style="margin-top:4px" data-action="modal-close">Cancel</button>
      <button class="btn out" style="margin-top:8px" data-action="modal-empty-workout">${ic('dumbbell')}Empty workout</button>`;
    showModal(html, null);
    window._routinePickCallback = onPick;
  }

  /* ────────────────── GLOBAL EVENT DELEGATION ────────────────── */
  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'back') { popScreen(); return; }
    if (action === 'modal-close') { hideModal(); return; }

    /* NAVIGATION */
    if (action === 'go-library') { libraryMode='browse'; libraryFilter='all'; libraryQuery=''; renderScreen('library'); screenStack.push('library'); showScreen('library'); return; }
    if (action === 'stats-tab') { statsTab = btn.dataset.tab; renderScreen('stats'); return; }
    if (action === 'go-badges') { renderScreen('badges'); screenStack.push('badges'); showScreen('badges'); return; }
    if (action === 'go-stats') { setActiveTab('stats'); return; }

    /* HOME ACTIONS */
    if (action === 'start-routine') {
      const routine = Storage.getRoutineById(btn.dataset.id);
      startWorkout(routine); return;
    }
    if (action === 'pick-routine' || action === 'start-quick') {
      showRoutinePicker(r => startWorkout(r)); return;
    }
    if (action === 'resume-workout') {
      const w = Storage.getActiveWorkout();
      if (w) {
        if (w._pausedAt) {
          w._pausedOffset = (w._pausedOffset || 0) + (Date.now() - w._pausedAt);
          delete w._pausedAt;
        }
        workoutState = w;
        workoutState.currentExIdx = workoutState.currentExIdx || 0;
        workoutState.currentSetIdx = workoutState.currentSetIdx || 0;
        openWorkoutLogger();
      }
      return;
    }

    /* MODAL ROUTINE PICK */
    if (action === 'modal-pick-routine') {
      hideModal();
      const routine = Storage.getRoutineById(btn.dataset.id);
      if (window._routinePickCallback) { window._routinePickCallback(routine); delete window._routinePickCallback; }
      return;
    }
    if (action === 'modal-empty-workout') {
      hideModal();
      if (window._routinePickCallback) { window._routinePickCallback(null); delete window._routinePickCallback; }
      return;
    }

    /* WORKOUT ACTIONS */
    if (action === 'log-set') { logCurrentSet(); return; }
    if (action === 'finish-workout') { finishWorkout(); return; }
    if (action === 'pause-workout') {
      if (workoutState) {
        workoutState._pausedAt = Date.now();
        Storage.saveActiveWorkout(workoutState);
      }
      clearInterval(workoutTimerInterval);
      // Tear down any running rest timer too, or its full-screen overlay stays
      // pinned over Home and keeps counting after we leave the logger.
      clearInterval(restTimerInterval);
      const restEl = document.getElementById('rest-timer-screen');
      if (restEl) restEl.style.display = 'none';
      document.getElementById('screen-workout-logger').classList.remove('active');
      setActiveTab('home'); return;
    }
    if (action === 'start-rest-timer') {
      const curEx = workoutState?.exercises[workoutState.currentExIdx];
      const secs = curEx?.sets[workoutState.currentSetIdx]?.restSec || 90;
      startRestTimer(secs, () => {});
      return;
    }
    if (action === 'jump-exercise') {
      const idx = parseInt(btn.dataset.idx);
      if (workoutState) {
        workoutState.currentExIdx = idx;
        workoutState.currentSetIdx = workoutState.exercises[idx].sets.findIndex(s=>!s.isCompleted);
        if (workoutState.currentSetIdx < 0) workoutState.currentSetIdx = workoutState.exercises[idx].sets.length - 1;
        renderScreen('workout-logger');
      }
      return;
    }
    if (action === 'weight-step') {
      const step = parseFloat(btn.dataset.step);
      const inp = document.getElementById('inp-weight');
      if (inp && workoutState) {
        const cur = parseFloat(inp.value) || 0;
        const newVal = Math.round((cur + step) * 100) / 100;
        inp.value = newVal;
        workoutState.exercises[workoutState.currentExIdx].sets[workoutState.currentSetIdx].weight = newVal;
        Storage.saveActiveWorkout(workoutState);
        const barbellCard = document.querySelector('.barbell')?.closest('.card');
        if (barbellCard && newVal >= 20) barbellCard.innerHTML = renderBarbell(newVal);
      }
      return;
    }

    /* TRAIN */
    if (action === 'toggle-routine') {
      const id = btn.dataset.id;
      expandedRoutines[id] = !expandedRoutines[id];
      renderScreen('train');
      return;
    }
    if (action === 'open-routine') {
      editingRoutineId = btn.dataset.id;
      editingRoutine = Storage.getRoutineById(btn.dataset.id);
      collapsedSections = {};
      renderScreen('routine-editor'); screenStack.push('routine-editor'); showScreen('routine-editor'); return;
    }
    if (action === 'new-routine') {
      editingRoutineId = null; editingRoutine = newRoutineDraft();
      collapsedSections = {};
      renderScreen('routine-editor'); screenStack.push('routine-editor'); showScreen('routine-editor'); return;
    }
    if (action === 'save-routine') {
      const nameInp = document.getElementById('routine-name-inp');
      if (nameInp) editingRoutine.name = nameInp.value;
      const saved = Storage.saveRoutine(editingRoutine);
      editingRoutineId = saved.id;
      popScreen();
      renderScreen('train');
      return;
    }
    if (action === 'delete-routine') {
      if (!editingRoutine || !editingRoutine.id) return;
      showModal(`
        <div class="kik" style="margin-bottom:12px">Delete routine?</div>
        <div style="font-size:13.5px;color:var(--ink-2);line-height:1.5;margin-bottom:14px">"${esc(editingRoutine.name)}" will be removed. Your logged workout history is kept.</div>
        <button class="btn" style="background:var(--red)" data-action="confirm-delete-routine">Delete</button>
        <button class="btn ghost" style="margin-top:8px" data-action="modal-close">Cancel</button>`);
      return;
    }
    if (action === 'confirm-delete-routine') {
      const id = editingRoutine && editingRoutine.id;
      if (id) Storage.deleteRoutine(id);
      editingRoutine = null; editingRoutineId = null;
      hideModal();
      popScreen();
      renderScreen('train');
      return;
    }
    if (action === 'toggle-section') {
      const s = btn.dataset.section;
      collapsedSections[s] = !collapsedSections[s];
      renderScreen('routine-editor');
      return;
    }
    if (action === 'add-exercise-to-section') {
      pickSection = btn.dataset.section || 'Primary';
      libraryMode = 'pick'; libraryFilter = 'all'; libraryQuery = '';
      renderScreen('library'); screenStack.push('library'); showScreen('library'); return;
    }
    if (action === 'add-exercise-to-workout') {
      if (!workoutState) return;
      hideModal();
      libraryMode = 'workout-add'; libraryFilter = 'all'; libraryQuery = '';
      renderScreen('library'); screenStack.push('library'); showScreen('library'); return;
    }
    if (action === 'pick-exercise') {
      const exId = btn.dataset.id;
      if (libraryMode === 'workout-add' && workoutState) {
        workoutState.exercises.push(buildWorkoutExercise(exId, workoutState.exercises.length));
        workoutState.currentExIdx = workoutState.exercises.length - 1;
        workoutState.currentSetIdx = 0;
        Storage.saveActiveWorkout(workoutState);
        popScreen();
        renderScreen('workout-logger');
      } else if (libraryMode === 'pick' && editingRoutine) {
        editingRoutine.exercises = editingRoutine.exercises || [];
        editingRoutine.exercises.push({ exerciseId: exId, section: pickSection, targetSets: 3, targetRepRange: '8–10', targetWeight: null });
        popScreen();
        renderScreen('routine-editor');
      }
      return;
    }
    if (action === 'remove-exercise') {
      const idx = parseInt(btn.dataset.idx);
      if (editingRoutine) { editingRoutine.exercises.splice(idx, 1); renderScreen('routine-editor'); }
      return;
    }
    if (action === 'filter-library') {
      libraryFilter = btn.dataset.filter;
      const libScreen = document.getElementById('screen-library');
      if (libScreen) updateLibraryList(libScreen);
      return;
    }

    /* HISTORY */
    if (action === 'repeat-workout') {
      const w = Storage.getWorkoutById(btn.dataset.id);
      if (!w) return;
      // Repeat the *actual* past session — not the (possibly edited or deleted)
      // routine template — so ad-hoc and orphaned workouts repeat correctly.
      const template = {
        id: w.routineId || null,
        name: w.name || 'Workout',
        exercises: (w.exercises || []).map(we => ({
          exerciseId: we.exerciseId,
          section: we.section,
          targetSets: (we.sets || []).length || 3,
        })),
      };
      startWorkout(template); return;
    }

    /* PROFILE */
    if (action === 'toggle-notifications') {
      const user = Storage.getUser();
      if (!user) return;
      // `notifications` defaults to on (undefined !== false), so flip the
      // *displayed* state, not the raw value — otherwise the first tap is a no-op.
      user.notifications = !(user.notifications !== false);
      Storage.saveUser(user);
      btn.classList.toggle('on', user.notifications);
      btn.classList.toggle('off', !user.notifications);
      return;
    }
    if (action === 'export-data') {
      const data = Storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `kasrat-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      return;
    }
    if (action === 'edit-weekly-target') {
      const user = Storage.getUser() || {};
      const cur = user.weeklyTargetWorkouts || 3;
      const html = `
        <div class="kik" style="margin-bottom:12px">Weekly workout target</div>
        ${[1,2,3,4,5,6,7].map(n=>`<button class="chip${cur===n?' on':''}" style="width:100%;display:flex;margin-bottom:8px;justify-content:center" data-action="set-weekly-target" data-n="${n}">${n} workout${n>1?'s':''} / week</button>`).join('')}
        <button class="btn ghost" style="margin-top:4px" data-action="modal-close">Cancel</button>`;
      showModal(html); return;
    }
    if (action === 'set-weekly-target') {
      const n = parseInt(btn.dataset.n);
      const user = Storage.getUser() || {};
      user.weeklyTargetWorkouts = n;
      Storage.saveUser(user);
      hideModal();
      renderScreen('profile');
      return;
    }
    if (action === 'toggle-schedule') { scheduleOpen = !scheduleOpen; renderScreen('profile'); return; }
    if (action === 'edit-schedule-day') {
      const day = btn.dataset.day;
      const DAY_LABELS = { MON:'Monday', TUE:'Tuesday', WED:'Wednesday', THU:'Thursday', FRI:'Friday', SAT:'Saturday', SUN:'Sunday' };
      const schedule = Storage.getSchedule();
      const cur = schedule[day] || '';
      const opts = [{ id:'', name:'Rest' }].concat(Storage.getRoutines().map(r => ({ id:r.id, name:r.name })));
      const html = `
        <div class="kik" style="margin-bottom:12px">${DAY_LABELS[day] || day}</div>
        ${opts.map(o => `<button class="chip${cur===o.id?' on':''}" style="width:100%;display:flex;margin-bottom:8px;justify-content:flex-start" data-action="set-schedule-day" data-day="${day}" data-id="${o.id}">${esc(o.name)}</button>`).join('')}
        <button class="btn ghost" style="margin-top:4px" data-action="modal-close">Cancel</button>`;
      showModal(html); return;
    }
    if (action === 'set-schedule-day') {
      const schedule = Storage.getSchedule();
      schedule[btn.dataset.day] = btn.dataset.id || null;
      Storage.saveSchedule(schedule);
      hideModal();
      renderScreen('profile');
      return;
    }
    if (action === 'edit-name') {
      const user = Storage.getUser() || {};
      const html = `
        <div class="kik" style="margin-bottom:12px">Display name</div>
        <input class="inp" id="name-edit-inp" type="text" value="${esc(user.name||'')}" placeholder="Your name">
        <button class="btn" style="margin-top:12px" data-action="save-name">Save</button>
        <button class="btn ghost" style="margin-top:8px" data-action="modal-close">Cancel</button>`;
      showModal(html); return;
    }
    if (action === 'save-name') {
      const inp = document.getElementById('name-edit-inp');
      if (inp) {
        const user = Storage.getUser() || {};
        user.name = inp.value.trim() || user.name;
        Storage.saveUser(user);
        hideModal();
        renderScreen('profile');
      }
      return;
    }
    if (action === 'show-onboarding') {
      onbStep = 1; onbName = Storage.getUser()?.name || ''; onbGoal = Storage.getUser()?.weeklyTargetWorkouts || 3;
      renderOnboarding();
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-onboarding').classList.add('active');
      return;
    }

    /* ONBOARDING */
    if (action === 'set-goal') {
      onbGoal = parseInt(btn.dataset.goal);
      renderOnboarding(); return;
    }
    if (action === 'onb-back') { if (onbStep > 1) { onbStep--; renderOnboarding(); } return; }

    /* TUTORIAL */
    if (action === 'tut-next') { if (tutStep >= TUTORIAL.length - 1) finishTutorial(); else tutNav(1); return; }
    if (action === 'tut-skip') { finishTutorial(); return; }
    if (action === 'tut-go') { const i = parseInt(btn.dataset.i); if (!isNaN(i)) { tutStep = i; renderTutorial(); } return; }

    /* STUBS FOR UNIMPLEMENTED DESTINATIONS */
    if (action === 'go-notifications') {
      showModal(`<div class="kik" style="margin-bottom:10px">Notifications</div><div style="font-size:13.5px;color:var(--ink-2);line-height:1.6">Enable push notifications in your device settings to receive workout reminders.</div><button class="btn" style="margin-top:14px" data-action="modal-close">Got it</button>`);
      return;
    }
    if (action === 'go-calendar') {
      showModal(`<div class="kik" style="margin-bottom:10px">Calendar view</div><div style="font-size:13.5px;color:var(--ink-2);line-height:1.6">Full calendar view coming soon. Use the heatmap above to review past activity.</div><button class="btn" style="margin-top:14px" data-action="modal-close">Got it</button>`);
      return;
    }
    if (action === 'view-workout') {
      const w = Storage.getWorkoutById(btn.dataset.id);
      if (!w) return;
      const sets = (w.exercises||[]).reduce((n,e)=>n+(e.sets||[]).filter(s=>s.isCompleted).length,0);
      const exList = (w.exercises||[]).map(we=>{
        const ex = Storage.getExerciseById(we.exerciseId);
        const done = (we.sets||[]).filter(s=>s.isCompleted);
        if (!ex) return '';
        return `<div class="btw" style="padding:7px 0"><span style="font-weight:500;font-size:13px">${esc(ex.name)}</span><span class="kik">${done.length} sets</span></div><div class="hair"></div>`;
      }).join('');
      showModal(`<div style="font-weight:700;font-size:16px;margin-bottom:4px">${esc(w.name||'Workout')}</div><div class="kik" style="margin-bottom:12px">${relTime(w.startedAt)} · ${sets} sets</div>${exList}<button class="btn" style="margin-top:12px" data-action="modal-close">Close</button>`);
      return;
    }
    if (action === 'view-exercise') {
      const ex = Storage.getExerciseById(btn.dataset.id);
      if (!ex) return;
      const prs = Storage.getPRs()[ex.id] || {};
      // Demo clip placeholder: hidden until a matching file loads, removed if none exists.
      const mediaHtml = `<div id="ex-media" style="display:none;margin-bottom:14px;border-radius:14px;overflow:hidden;background:var(--card-2);aspect-ratio:4/3">
        <img id="ex-media-img" alt="${esc(ex.name)} demonstration" style="width:100%;height:100%;object-fit:cover;display:block">
      </div>`;
      showModal(`<div style="font-weight:700;font-size:16px;margin-bottom:4px">${esc(ex.name)}</div><div class="kik" style="margin-bottom:12px">${ex.equipment} · ${ex.category} · ${MUSCLE_LABELS[ex.primaryMuscleGroup]||ex.primaryMuscleGroup}</div>${mediaHtml}${prRows(prs, '0 0 8px')||'<div class="kik" style="margin-bottom:8px">No records yet</div>'}<button class="btn" style="margin-top:12px" data-action="modal-close">Close</button>`);
      loadExerciseMedia(ex.id);
      return;
    }
    if (action === 'exercise-progress') {
      const ex = Storage.getExerciseById(btn.dataset.id);
      if (!ex) return;
      const prs = Storage.getPRs()[ex.id] || {};
      const series = e1rmSeries(ex.id);
      const chart = series.length ? e1rmChart(series) + '<div style="height:14px"></div>' : '';
      showModal(`<div style="font-weight:700;font-size:16px;margin-bottom:12px">${esc(ex.name)} — Progress</div>${chart}${prRows(prs, '7px 0')||'<div class="kik" style="padding:12px 0">No data yet — log sets to track progress.</div>'}<button class="btn" style="margin-top:12px" data-action="modal-close">Close</button>`);
      return;
    }
    if (action === 'new-custom-exercise') {
      showModal(`
        <div class="kik" style="margin-bottom:12px">New custom exercise</div>
        <input class="inp" id="cex-name" type="text" placeholder="Exercise name" style="margin-bottom:10px">
        <div class="kik" style="margin-bottom:8px">Primary muscle</div>
        <div class="row" style="gap:8px;margin-bottom:14px;flex-wrap:wrap">
          ${['chest','back','shoulders','arms','legs','core'].map(m=>`<button class="chip${m==='chest'?' on':''}" style="font-size:11px" data-action="cex-muscle" data-muscle="${m}">${MUSCLE_LABELS[m]}</button>`).join('')}
        </div>
        <button class="btn" style="margin-top:4px" data-action="save-custom-exercise">Add exercise</button>
        <button class="btn ghost" style="margin-top:8px" data-action="modal-close">Cancel</button>`);
      document.getElementById('cex-name')?.focus();
      return;
    }
    if (action === 'cex-muscle') {
      document.querySelectorAll('[data-action="cex-muscle"]').forEach(b => b.classList.toggle('on', b === btn));
      return;
    }
    if (action === 'save-custom-exercise') {
      const nameInp = document.getElementById('cex-name');
      const muscleBtn = document.querySelector('[data-action="cex-muscle"].on');
      const name = nameInp?.value.trim();
      if (!name) { nameInp?.focus(); return; }
      const muscle = muscleBtn?.dataset.muscle || 'chest';
      Storage.saveExercise({ name, primaryMuscleGroup: muscle, secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'weight_reps', isCustom: true });
      hideModal();
      const libScreen = document.getElementById('screen-library');
      if (libScreen) { renderLibrary(libScreen); }
      return;
    }
    if (action === 'exercise-options') {
      if (!workoutState) return;
      const curEx = workoutState.exercises[workoutState.currentExIdx];
      const ex = curEx ? Storage.getExerciseById(curEx.exerciseId) : null;
      if (!ex) return;
      showModal(`
        <div class="kik" style="margin-bottom:12px">${esc(ex.name)}</div>
        <button class="chip" style="width:100%;display:flex;margin-bottom:8px;justify-content:flex-start" data-action="add-set-to-ex">Add set</button>
        <button class="chip" style="width:100%;display:flex;margin-bottom:8px;justify-content:flex-start" data-action="add-exercise-to-workout">Add another exercise</button>
        <button class="btn ghost" style="margin-top:4px" data-action="modal-close">Cancel</button>`);
      return;
    }
    if (action === 'set-type-pick') {
      if (!workoutState) return;
      const si = parseInt(btn.dataset.si);
      const curEx = workoutState.exercises[workoutState.currentExIdx];
      if (curEx && curEx.sets[si]) {
        curEx.sets[si].setType = btn.dataset.type;
        Storage.saveActiveWorkout(workoutState);
        renderScreen('workout-logger');
      }
      return;
    }
    if (action === 'add-set-to-ex') {
      if (!workoutState) return;
      const curEx = workoutState.exercises[workoutState.currentExIdx];
      const lastSet = curEx.sets[curEx.sets.length - 1] || {};
      curEx.sets.push({ id: Storage.uid(), setNumber: curEx.sets.length + 1, weight: lastSet.weight || null, reps: lastSet.reps || null, durationSec: null, setType: 'normal', isCompleted: false, restSec: lastSet.restSec || 90 });
      // Focus the new set so it's immediately editable (also clears the
      // "completed exercise" dead-end where no set was active).
      workoutState.currentSetIdx = curEx.sets.length - 1;
      Storage.saveActiveWorkout(workoutState);
      hideModal();
      renderScreen('workout-logger');
      return;
    }

    /* SUMMARY */
    if (action === 'done-summary') {
      workoutState = null;
      document.getElementById('screen-workout-logger').classList.remove('active');
      document.getElementById('screen-session-summary').classList.remove('active');
      setActiveTab('home'); return;
    }
  }

  /* ────────────────── WORKOUT FLOW ────────────────── */
  function startWorkout(routine) {
    const existing = Storage.getActiveWorkout();
    // Only resume an existing session if it actually has logged content — a
    // leftover empty/contentless session must never hijack a freshly chosen routine.
    const hasContent = existing && (existing.exercises || []).some(e =>
      (e.sets || []).some(s => s.isCompleted));
    if (hasContent) {
      workoutState = existing;
    } else {
      workoutState = buildNewWorkout(routine);
      workoutState.currentExIdx = 0;
      workoutState.currentSetIdx = 0;
    }
    Storage.saveActiveWorkout(workoutState);
    openWorkoutLogger();
  }

  function openWorkoutLogger() {
    const screen = document.getElementById('screen-workout-logger');
    screen.classList.add('active');
    renderScreen('workout-logger');
    screenStack = ['workout-logger'];
  }

  function logCurrentSet() {
    if (!workoutState) return;
    const curEx = workoutState.exercises[workoutState.currentExIdx];
    const curSet = curEx.sets[workoutState.currentSetIdx];
    const mode = logMode(Storage.getExerciseById(curEx.exerciseId));

    if (mode === 'time') {
      const d = document.getElementById('inp-duration');
      if (!d) return;
      curSet.durationSec = parseInt(d.value) || null;
    } else if (mode === 'distance') {
      const dist = document.getElementById('inp-distance');
      const dur = document.getElementById('inp-duration');
      if (!dist) return;
      curSet.distance = parseFloat(dist.value) || null;
      curSet.durationSec = (dur && dur.value) ? Math.round((parseFloat(dur.value) || 0) * 60) || null : null;
    } else {
      const weightInp = document.getElementById('inp-weight');
      const repsInp = document.getElementById('inp-reps');
      if (!weightInp || !repsInp) return;
      curSet.weight = parseFloat(weightInp.value) || null;
      curSet.reps = parseInt(repsInp.value) || null;
    }
    curSet.isCompleted = true;
    Storage.saveActiveWorkout(workoutState);

    const secs = curSet.restSec || 90;

    const nextSetIdx = workoutState.currentSetIdx + 1;
    if (nextSetIdx < curEx.sets.length) {
      workoutState.currentSetIdx = nextSetIdx;
    } else {
      const nextExIdx = workoutState.currentExIdx + 1;
      if (nextExIdx < workoutState.exercises.length) {
        workoutState.currentExIdx = nextExIdx;
        workoutState.currentSetIdx = 0;
      }
    }

    Storage.saveActiveWorkout(workoutState);
    renderScreen('workout-logger');
    // Don't pop a rest timer over the finish screen once everything's logged.
    const allDone = workoutState.exercises.every(we => we.sets.every(s => s.isCompleted));
    if (!allDone) startRestTimer(secs, () => { renderScreen('workout-logger'); });
  }

  function finishWorkout() {
    if (!workoutState) return;
    clearTimeout(_awSaveTimer);   // cancel any pending debounced save so it can't resurrect the cleared active workout
    clearInterval(workoutTimerInterval);
    clearInterval(restTimerInterval);
    document.getElementById('rest-timer-screen').style.display = 'none';

    workoutState.endedAt = new Date().toISOString();
    const pausedMs = (workoutState._pausedOffset || 0) + (workoutState._pausedAt ? Date.now() - workoutState._pausedAt : 0);
    workoutState.durationSec = Math.max(0, Math.floor((new Date(workoutState.endedAt) - new Date(workoutState.startedAt) - pausedMs) / 1000));

    const newPRs = Storage.checkAndUpdatePRs(workoutState);
    workoutState.prs = newPRs;
    workoutState._newPRs = newPRs;
    Storage.saveWorkout(workoutState);
    Storage.clearActiveWorkout();
    Storage.checkAndUnlockBadges();

    const summaryScreen = document.getElementById('screen-session-summary');
    summaryScreen.classList.add('active');
    renderSessionSummary(summaryScreen);
  }

  /* ────────────────── INIT ────────────────── */
  function init() {
    const onboarded = Storage.isOnboarded();
    if (!onboarded) {
      onbStep = 1; onbName = ''; onbGoal = 3;
      startTutorial();   // first run: walkthrough, then name + goal onboarding
    } else {
      setActiveTab('home');
    }

    document.addEventListener('click', handleClick);
    document.getElementById('tab-bar')?.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (tab && tab.dataset.tab) setActiveTab(tab.dataset.tab);
    });
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) hideModal();
    });

    // Swipe left/right to move between root tabs.
    const appEl = document.getElementById('app');
    let sx = 0, sy = 0, st = 0;
    appEl?.addEventListener('touchstart', e => {
      const t = e.changedTouches[0];
      sx = t.clientX; sy = t.clientY; st = Date.now();
    }, { passive: true });
    appEl?.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
      // Quick, mostly-horizontal flick.
      if (dt < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
        const tut = document.getElementById('screen-tutorial');
        if (tut && tut.classList.contains('active')) tutNav(dx < 0 ? 1 : -1);
        else swipeTab(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
