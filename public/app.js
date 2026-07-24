/* =========================================================
   عيادة الدكتورة رانية زياد — الواجهة الأمامية (متصلة بالخادم)
========================================================= */

/* ---------- أيقونات طب الأسنان المخصصة ---------- */
const I = {
  tooth:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 2 8.4 3.2 6.5 3.2 4.6 3.2 3 4.9 3 7.4c0 2.1.7 4 1.2 6.2.4 1.7.5 3.6 1 5.6.3 1.3.6 2.9 1.4 2.9.9 0 1-1.6 1.2-3 .2-1.3.4-2.7 1.3-2.7.9 0 1 1.4 1.2 2.7.2 1.4.3 3 1.2 3 .8 0 1.1-1.6 1.4-2.9.5-2 .6-3.9 1-5.6.5-2.2 1.2-4.1 1.2-6.2 0-2.5-1.6-4.2-3.5-4.2C15.6 3.2 14.5 2 12 2z"/></svg>`,
  dash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><rect x="2.5" y="3.5" width="19" height="14" rx="2.5"/><path d="M2.5 17.5h19M9.5 21h5M12 17.5v3.5"/><path d="M12 6.4c-.9 0-1.3.5-2 .5-.8 0-1.5.6-1.5 1.6 0 .8.3 1.5.5 2.2.15.55.2 1.15.35 1.75.1.45.25.95.55.95.35 0 .4-.55.5-1.05.08-.45.15-.95.55-.95s.47.5.55.95c.1.5.15 1.05.5 1.05.3 0 .45-.5.55-.95.15-.6.2-1.2.35-1.75.2-.7.5-1.4.5-2.2 0-1-.7-1.6-1.5-1.6-.7 0-1.1-.5-2-.5z"/></svg>`,
  patients:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><circle cx="7.5" cy="6" r="3"/><path d="M2.5 20a5 5 0 0 1 10 0"/><path d="M17 3.4c-.7 0-1 .4-1.6.4-.6 0-1.2.5-1.2 1.3 0 .65.25 1.2.4 1.75.12.45.16.95.28 1.45.08.35.2.75.44.75.28 0 .32-.45.4-.85.06-.35.12-.75.44-.75s.38.4.44.75c.08.4.12.85.4.85.24 0 .36-.4.44-.75.12-.5.16-1 .28-1.45.16-.55.4-1.1.4-1.75 0-.8-.55-1.3-1.2-1.3-.55 0-.85-.4-1.52-.4z"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/><path d="M12 12.4c-.7 0-1 .4-1.6.4-.6 0-1.1.5-1.1 1.2 0 .6.2 1.1.35 1.6.1.4.13.85.25 1.3.07.32.17.68.4.68.26 0 .3-.4.37-.77.05-.32.1-.68.4-.68s.35.36.4.68c.07.37.11.77.37.77.23 0 .33-.36.4-.68.13-.45.16-.9.26-1.3.15-.5.34-1 .34-1.6 0-.7-.5-1.2-1.1-1.2-.5 0-.8-.4-1.5-.4z"/></svg>`,
  chart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3C9.8 3 9 4 7.4 4 5.7 4 4.3 5.4 4.3 7.6c0 1.8.6 3.4 1.05 5.2.3 1.35.4 2.9.75 4.5.2.9.45 2 .95 2 .7 0 .8-1.4.95-2.55.2-1.25.35-2.6 1.35-2.6s1.15 1.35 1.35 2.6c.15 1.15.25 2.55.95 2.55.5 0 .75-1.1.95-2 .35-1.6.45-3.15.75-4.5C15.1 11 15.7 9.4 15.7 7.6"/><path d="M15.5 4.5l1.7 1.7L21 2.4"/></svg>`,
  money:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M9.5 3.2c-1.9 0-2.8 1-4.3 1C3.7 4.2 2.5 5.5 2.5 7.5c0 1.65.55 3.15.95 4.75.28 1.25.36 2.7.7 4.15.18.85.42 1.85.88 1.85.65 0 .74-1.3.88-2.35.18-1.15.32-2.4 1.24-2.4s1.06 1.25 1.24 2.4c.14 1.05.23 2.35.88 2.35"/><circle cx="17" cy="15" r="5"/><path d="M17 12.6v4.8M15.6 13.8c0-.6.65-1 1.4-1s1.4.4 1.4 1-.65 1-1.4 1-1.4.4-1.4 1 .65 1 1.4 1 1.4-.4 1.4-1"/></svg>`,
  lab:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M9 2.5h6M10 2.5v6.2L5.5 16.8a2.4 2.4 0 0 0 2.1 3.5h8.8a2.4 2.4 0 0 0 2.1-3.5L14 8.7V2.5"/><path d="M7.3 14.5h9.4"/><circle cx="10" cy="17" r=".9" fill="currentColor" stroke="none"/><circle cx="13.4" cy="18" r=".7" fill="currentColor" stroke="none"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M18 8.6a6 6 0 1 0-12 0c0 5.4-2.4 7-2.4 7h16.8S18 14 18 8.6z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/></svg>`,
  users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><circle cx="9" cy="7" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M17.5 4.2a3 3 0 0 1 0 6M21 20a6 6 0 0 0-3-5.2"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/></svg>`,
  cash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M10 3.2C8.1 3.2 7.2 4.2 5.7 4.2 4.2 4.2 3 5.5 3 7.5c0 1.65.55 3.15.95 4.75.28 1.25.36 2.7.7 4.15.18.85.42 1.9.88 1.9.65 0 .74-1.35.88-2.4.18-1.15.32-2.4 1.24-2.4"/><circle cx="16.5" cy="15.5" r="5"/><path d="M14.5 15.5l1.4 1.4 2.6-2.8"/></svg>`,
  warn:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3.2L2.2 20h19.6L12 3.2z"/><path d="M12 10v4.2M12 17.4v.1"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  chevL:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  chevR:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  key:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="4.5"/><path d="M11.2 11.2L20 20M17 17l2-2M14 14l2-2"/></svg>`,
  doctor:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="16.5" cy="7" r="4"/><path d="M13.7 9.9l-3 3M10.7 12.9l-6 6a1.8 1.8 0 0 1-2.6-2.6l6-6"/></svg>`,
  sec:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="12" rx="2"/><path d="M2.5 16.5v3h19v-3M8 8.5h8M8 12h5"/></svg>`,
  file:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>`,
  trend:`<svg viewBox="0 0 80 30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 24l14-8 12 6 14-14 12 6 12-12"/></svg>`,
  logout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>`,
  backup:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/><path d="M19 2v6h-6"/><path d="M22 12c0-3.17-1.53-5.98-3.9-7.75L19 8"/><path d="M12 8v4l3 1.5"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
};

/* ---------- طبقة الاتصال بالخادم ---------- */
let CSRF = null;
let ME = null;

async function api(method, path, body) {
  const headers = { 'content-type': 'application/json' };
  if (CSRF) headers['x-csrf-token'] = CSRF;
  const res = await fetch('/api' + path, {
    method,
    headers,
    credentials: 'same-origin',        // يرسل كوكي الجلسة
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* استجابة فارغة */ }
  if (!res.ok) {
    const err = new Error(data?.error || 'حدث خطأ في الاتصال');
    err.status = res.status;
    err.code = data?.code;
    err.issues = data?.issues;
    if (res.status === 401 && ME) { hardLogout(); }
    throw err;
  }
  return data;
}
const apiGet = (p) => api('GET', p);
const apiPost = (p, b) => api('POST', p, b);
const apiPatch = (p, b) => api('PATCH', p, b);
const apiPut = (p, b) => api('PUT', p, b);
const apiDel = (p, b) => api('DELETE', p, b);

/* ---------- أدوات مساعدة ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const money = (n) => fmt(n) + ' د.ع';
const initials = (s) => (s || '?').trim().charAt(0);
/** تهريب HTML — يمنع XSS عند العرض */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const AR_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const todayStr = () => new Date().toISOString().slice(0, 10);
function arDate(iso) { if (!iso) return '—'; const d = new Date(iso + 'T00:00'); return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function relLabel(iso) {
  const t = todayStr(); if (iso === t) return 'اليوم';
  const days = Math.round((new Date(iso) - new Date(t)) / 864e5);
  if (days === 1) return 'غداً'; if (days === -1) return 'أمس';
  if (days > 1) return `بعد ${days} يوم`; if (days < -1) return `قبل ${Math.abs(days)} يوم`;
  return arDate(iso);
}
function to12(t) { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'م' : 'ص'; const hh = h > 12 ? h - 12 : (h === 0 ? 12 : h); return `${hh}:${String(m).padStart(2, '0')} ${ap}`; }

function toast(msg, type = 'ok') {
  const t = el('div', 'toast ' + type);
  const ic = type === 'ok' ? I.check : type === 'err' ? I.warn : I.bell;
  t.innerHTML = `<span class="ti">${ic}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; t.style.transform = 'translateX(-40px)'; setTimeout(() => t.remove(), 300); }, 3400);
}

/* ---------- حقل بحث المرضى القابل لإعادة الاستخدام ---------- */
/**
 * Creates a searchable patient picker widget.
 * @param {string} inputId - ID for the hidden input that stores selected patient ID
 * @param {number|null} preselectedId - Pre-selected patient ID (or null)
 * @param {string} preselectedName - Pre-selected patient display name
 * @param {Function} onSelect - Callback called with (patientId, patientObj) when selected
 * @returns {string} HTML string to embed in the form
 */
function patientPickerHTML(inputId, preselectedId, preselectedName) {
  return `<div class="patient-picker" style="position:relative" id="${inputId}_wrap">
    <input type="hidden" id="${inputId}" value="${preselectedId || ''}">
    <div style="position:relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;inset-inline-start:14px;top:50%;transform:translateY(-50%);width:17px;height:17px;color:var(--txt-3);pointer-events:none;z-index:1"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4-4"/></svg>
      <input id="${inputId}_search" autocomplete="off" placeholder="ابحث بالاسم أو رقم الملف…"
        value="${esc(preselectedName || '')}"
        style="padding-inline-start:42px;${preselectedId ? 'color:var(--txt);font-weight:600' : ''}">
    </div>
    <div class="pp-results" id="${inputId}_results" style="display:none;position:absolute;top:100%;inset-inline:0;z-index:60;
      background:var(--bg-2);border:1px solid var(--glass-border);border-radius:14px;box-shadow:var(--shadow);
      max-height:240px;overflow-y:auto;margin-top:4px"></div>
  </div>`;
}

function initPatientPicker(inputId, patients, onSelect) {
  const wrap = $(`#${inputId}_wrap`);
  if (!wrap) return;
  const searchInput = $(`#${inputId}_search`);
  const hiddenInput = $(`#${inputId}`);
  const resultsBox = $(`#${inputId}_results`);
  let debounce;

  function renderResults(query) {
    const q = (query || '').trim().toLowerCase();
    let filtered = patients;
    if (q) {
      filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        String(p.fileNo).includes(q) ||
        (p.phone || '').includes(q)
      );
    }
    resultsBox.innerHTML = '';
    if (!filtered.length) {
      resultsBox.innerHTML = `<div style="padding:16px;text-align:center;color:var(--txt-3);font-size:13px">لا توجد نتائج</div>`;
      resultsBox.style.display = 'block';
      return;
    }
    filtered.slice(0, 30).forEach(p => {
      const r = el('div');
      r.style.cssText = 'display:flex;align-items:center;gap:11px;padding:11px 14px;cursor:pointer;border-bottom:1px solid rgba(3,7,45,.05);transition:.12s';
      r.innerHTML = `<span class="mini-av" style="width:32px;height:32px;font-size:12px;border-radius:9px">${esc(initials(p.fullName))}</span>
        <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px">${esc(p.fullName)}</div>
        <div style="font-size:11.5px;color:var(--txt-3)">#${p.fileNo} ${p.phone ? '• ' + esc(p.phone) : ''}</div></div>`;
      r.onmouseenter = () => r.style.background = 'var(--glass-hi)';
      r.onmouseleave = () => r.style.background = '';
      r.onmousedown = (e) => {
        e.preventDefault(); // Prevent blur from firing first
        hiddenInput.value = p.id;
        searchInput.value = `${p.fullName} — #${p.fileNo}`;
        searchInput.style.color = 'var(--txt)';
        searchInput.style.fontWeight = '600';
        resultsBox.style.display = 'none';
        if (onSelect) onSelect(p.id, p);
      };
      resultsBox.appendChild(r);
    });
    if (filtered.length > 30) {
      resultsBox.innerHTML += `<div style="padding:10px;text-align:center;color:var(--txt-3);font-size:12px">+${filtered.length - 30} نتيجة أخرى — حاول تضييق البحث</div>`;
    }
    resultsBox.style.display = 'block';
  }

  searchInput.onfocus = () => {
    if (!hiddenInput.value) renderResults(searchInput.value);
    else renderResults(''); // Show all when focused with selection
  };

  searchInput.oninput = () => {
    clearTimeout(debounce);
    // Clear selection when user types
    hiddenInput.value = '';
    searchInput.style.color = '';
    searchInput.style.fontWeight = '';
    debounce = setTimeout(() => renderResults(searchInput.value), 150);
  };

  searchInput.onblur = () => {
    setTimeout(() => { resultsBox.style.display = 'none'; }, 200);
  };

  // If we have a preselected value, don't show results initially
  if (hiddenInput.value) {
    searchInput.style.color = 'var(--txt)';
    searchInput.style.fontWeight = '600';
  }
}

/* ---------- مخطط الأسنان ---------- */
const TOOTH_STATES = {
  '':        { c: '#F2F5FC', label: 'سليم' },
  'تقويم':   { c: '#0E4AE4', label: 'يحتاج تقويم' },
  'تنظيف':   { c: '#0FB7C4', label: 'يحتاج تنظيف' },
  'خلع':     { c: '#F0416B', label: 'يحتاج خلع' },
  'حشوات':   { c: '#D9922B', label: 'يحتاج حشوة' },
};
const STATE_CYCLE = ['', 'تقويم', 'تنظيف', 'خلع', 'حشوات'];
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const toothSVG = (color) => `<svg viewBox="0 0 40 52"><path d="M20 3C15.5 3 13.5 5 10 5 6.5 5 4 8 4 12.5c0 3.8 1.2 7 2 11 .7 3.2.9 6.5 1.8 10 .5 2.2 1 4.5 2 4.5 1.6 0 1.8-2.9 2.2-5.2.3-2 .6-4.5 2-4.5s1.7 2.5 2 4.5c.4 2.3.6 5.2 2.2 5.2 1 0 1.5-2.3 2-4.5.9-3.5 1.1-6.8 1.8-10 .8-4 2-7.2 2-11C26 8 23.5 5 20 5c-3.5 0-1.5-2-6-2z" fill="${color}" stroke="rgba(3,7,45,.20)" stroke-width="1"/></svg>`;

/* =====================================================================
   الإقلاع — استعادة الجلسة تلقائياً (بقاء الدخول)
===================================================================== */
async function boot() {
  paintStaticIcons();
  try {
    const data = await apiGet('/auth/me');   // الكوكي يُرسل تلقائياً
    CSRF = data.csrfToken;
    ME = data.user;
    enterApp();
  } catch {
    showLogin();                             // لا جلسة → شاشة الدخول
  }
}

function paintStaticIcons() {
  $('#loginTooth').innerHTML = I.tooth;
  $('#brandTooth').innerHTML = I.tooth;
  const d = $('#rpDoc'), s = $('#rpSec');
  if (d) d.innerHTML = I.doctor;
  if (s) s.innerHTML = I.sec;
}

function showLogin() {
  $('#app').classList.add('hidden');
  $('#loginScreen').classList.remove('hidden');
  $('#luser').value = ''; $('#lpass').value = '';
  setTimeout(() => $('#luser').focus(), 100);
}

function enterApp() {
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#uAv').textContent = initials(ME.fullName.replace('د. ', ''));
  $('#uName').textContent = ME.fullName;
  $('#uRole').textContent = ME.role === 'doctor' ? 'طبيب' : 'سكرتيرة';
  buildNav();
  go('dashboard');
  startClock();
  if (ME.mustChangePassword) setTimeout(openChangePassword, 500);
}

window.doLogin = async function () {
  const username = $('#luser').value.trim();
  const password = $('#lpass').value;
  if (!username || !password) { toast('أدخل اسم المستخدم وكلمة المرور', 'err'); return; }
  const btn = $('#loginBtn'); btn.disabled = true; btn.textContent = 'جاري الدخول…';
  try {
    const data = await apiPost('/auth/login', { username, password });
    CSRF = data.csrfToken; ME = data.user;
    enterApp();
    toast(`مرحباً ${ME.fullName}`, 'ok');
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'تسجيل الدخول';
  }
};

window.doLogout = async function () {
  try { await apiPost('/auth/logout'); } catch { /* تجاهل */ }
  hardLogout();
};
function hardLogout() { CSRF = null; ME = null; showLogin(); }

/* ---------- التنقل ---------- */
const NAV = [
  { id: 'dashboard',    label: 'لوحة التحكم',      icon: 'dash',     roles: ['doctor','secretary'] },
  { id: 'patients',     label: 'المرضى',           icon: 'patients', roles: ['doctor','secretary'] },
  { id: 'appointments', label: 'المواعيد',         icon: 'calendar', roles: ['doctor','secretary'] },
  { id: 'chart',        label: 'مخطط الأسنان',     icon: 'chart',    roles: ['doctor'] },
  { id: 'finance',      label: 'المالية والأقساط', icon: 'money',    roles: ['doctor','secretary'] },
  { id: 'lab',          label: 'المختبر',          icon: 'lab',      roles: ['doctor'] },
  { id: 'alerts',       label: 'التنبيهات',        icon: 'bell',     roles: ['doctor','secretary'], badge: true },
  { id: 'users',        label: 'الحسابات',         icon: 'users',    roles: ['doctor'] },
  { id: 'audit',        label: 'سجل النظام',       icon: 'shield',   roles: ['doctor'] },
  { id: 'backup',       label: 'النسخ الاحتياطي',  icon: 'backup',   roles: ['doctor'] },
];
let currentView = 'dashboard';
let alertCount = 0;

function buildNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  NAV.filter(n => n.roles.includes(ME.role)).forEach(n => {
    const item = el('div', 'nav-item' + (n.id === currentView ? ' active' : ''));
    item.dataset.id = n.id;
    item.innerHTML = `${I[n.icon]}<span>${n.label}</span>`;
    if (n.badge && alertCount > 0) item.innerHTML += `<span class="nav-badge">${alertCount}</span>`;
    item.onclick = () => { go(n.id); if (window.innerWidth <= 1024) toggleSidebar(); };
    nav.appendChild(item);
  });
}
window.toggleSidebar = function () {
  $('#sidebar').classList.toggle('open');
  $('#scrim').classList.toggle('on');
};

const META = {
  dashboard: ['لوحة التحكم', 'نظرة عامة على العيادة'],
  patients: ['المرضى', 'إدارة ملفات المرضى'],
  appointments: ['المواعيد', 'التقويم وحجز المواعيد'],
  chart: ['مخطط الأسنان', 'مخطط تفاعلي لحالة الأسنان'],
  finance: ['المالية والأقساط', 'الإيرادات والمدفوعات'],
  lab: ['المختبر', 'متابعة أعمال المختبر'],
  alerts: ['التنبيهات', 'التنبيهات المهمة'],
  users: ['الحسابات', 'إدارة حسابات الطاقم'],
  audit: ['سجل النظام', 'سجل العمليات والتدقيق'],
  backup: ['النسخ الاحتياطي', 'نسخ احتياطي واستعادة البيانات'],
};

async function go(id) {
  currentView = id;
  $$('#nav .nav-item').forEach(i => i.classList.toggle('active', i.dataset.id === id));
  $('#pgTitle').textContent = META[id][0];
  $('#pgSub').textContent = META[id][1];
  const c = $('#content'); c.innerHTML = '<div class="empty"><div class="spinner"></div></div>'; c.scrollTop = 0;
  const views = { dashboard: viewDashboard, patients: viewPatients, appointments: viewAppointments,
    chart: viewChart, finance: viewFinance, lab: viewLab, alerts: viewAlerts, users: viewUsers, audit: viewAudit, backup: viewBackup };
  try {
    c.innerHTML = '';
    await views[id](c);
  } catch (e) {
    c.innerHTML = '';
    const box = el('div', 'glass'); box.style.padding = '30px';
    box.innerHTML = `<div class="empty">${I.warn}<h4>تعذّر تحميل البيانات</h4><p style="color:var(--txt-3);font-size:13px">${esc(e.message)}</p></div>`;
    const retry = el('button', 'btn btn-primary'); retry.style.cssText = 'margin:0 auto;display:flex';
    retry.textContent = 'إعادة المحاولة'; retry.onclick = () => go(id);
    box.appendChild(retry); c.appendChild(box);
  }
}
window.go = go;

function startClock() {
  const upd = () => {
    const d = new Date();
    $('#clock').textContent = `${AR_DAYS[d.getDay()]} • ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };
  upd(); setInterval(upd, 20000);
}

const emptyState = (txt, icon) => { const e = el('div', 'empty'); e.innerHTML = `${icon}<h4>${esc(txt)}</h4>`; return e; };

/* =========== لوحة التحكم =========== */
async function viewDashboard(c) {
  const d = await apiGet('/dashboard');
  alertCount = d.tomorrowAppointments.length + d.dueInstallments.length + d.followUps.length;
  buildNav();

  const stats = [
    { ic:'teal',  icon:I.patients, val:fmt(d.stats.patientCount), lbl:'إجمالي المرضى', key:'patients' },
    { ic:'blue',  icon:I.calendar, val:fmt(d.stats.todayCount),   lbl:'مرضى اليوم',    key:'today' },
    { ic:'gold',  icon:I.money,    val:money(d.stats.due),  lbl:'الأقساط المتبقية', small:true, key:'due' },
    { ic:'green', icon:I.cash,     val:money(d.stats.paid), lbl:'إجمالي الإيرادات', small:true, key:'revenue' },
  ];
  const sg = el('div', 'grid stat-grid');
  stats.forEach(s => {
    const card = el('div', 'stat glass stat-clickable');
    card.setAttribute('role','button'); card.setAttribute('tabindex','0');
    card.innerHTML = `<div class="ic ${s.ic}">${s.icon}</div>
      <div class="val" style="${s.small ? 'font-size:20px' : ''}">${s.val}</div>
      <div class="lbl">${s.lbl} <span class="stat-arrow">${I.chevL}</span></div>
      <div class="spark ic ${s.ic}" style="background:none;width:80px;height:30px">${I.trend}</div>`;
    card.onclick = () => openStatDetail(s.key, d);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStatDetail(s.key, d); } };
    sg.appendChild(card);
  });
  c.appendChild(sg);

  const cols = el('div', 'grid');
  cols.style.cssText = `grid-template-columns:${window.innerWidth <= 900 ? '1fr' : '1.4fr 1fr'};align-items:start;margin-top:20px`;

  const left = el('div', 'glass'); left.style.padding = '22px';
  left.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <span class="ic blue" style="width:38px;height:38px">${I.calendar}</span>
    <div><div style="font-weight:800;font-size:16px">مواعيد اليوم</div>
    <div style="font-size:12px;color:var(--txt-2)">${AR_DAYS[new Date().getDay()]} • ${arDate(todayStr())}</div></div>
    <button class="btn btn-primary btn-sm" style="margin-inline-start:auto" data-act="openAppointment:">${I.plus} حجز</button></div>`;
  if (d.todayAppointments.length) {
    d.todayAppointments.forEach(ap => {
      const row = el('div', 'alert-item'); row.style.cursor = 'pointer';
      row.onclick = () => openPatient(ap.patientId);
      const st = ap.status === 'قائمة انتظار' ? 'gold' : ap.status === 'حضر' ? 'green' : 'teal';
      const [hh, mm] = ap.appointmentTime.split(':');
      row.innerHTML = `<div class="ai ic blue" style="flex-direction:column;font-size:13px;font-weight:800">${hh}<span style="font-size:9px;opacity:.7">${mm}</span></div>
        <div class="txt"><div class="h">${esc(ap.patientName)}</div><div class="s">${esc(ap.treatmentType)} • ${ap.durationMin} دقيقة</div></div>
        <span class="pill ${st}"><span class="dot"></span>${esc(ap.status)}</span>`;
      left.appendChild(row);
    });
  } else left.appendChild(emptyState('لا توجد مواعيد اليوم', I.calendar));
  cols.appendChild(left);

  const right = el('div', 'glass'); right.style.padding = '22px';
  right.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
    <span class="ic rose" style="width:38px;height:38px">${I.bell}</span>
    <div style="font-weight:800;font-size:16px">تنبيهات مهمة</div>
    <span class="nav-badge" style="margin-inline-start:auto;position:static">${alertCount}</span></div>`;
  const alerts = collectAlerts(d).slice(0, 5);
  if (alerts.length) {
    alerts.forEach(a => {
      const row = el('div', 'alert-item'); row.style.padding = '12px 14px';
      row.onclick = () => a.patientId && openPatient(a.patientId);
      row.innerHTML = `<div class="ai ic ${a.cls}" style="width:38px;height:38px">${a.icon}</div>
        <div class="txt"><div class="h" style="font-size:13.5px">${esc(a.h)}</div><div class="s" style="font-size:12px">${esc(a.s)}</div></div>`;
      right.appendChild(row);
    });
    const more = el('button', 'btn btn-ghost btn-sm');
    more.style.cssText = 'width:100%;justify-content:center;margin-top:8px';
    more.textContent = 'عرض كل التنبيهات'; more.onclick = () => go('alerts');
    right.appendChild(more);
  } else right.appendChild(emptyState('لا توجد تنبيهات', I.check));
  cols.appendChild(right);
  c.appendChild(cols);

  const rp = el('div');
  rp.innerHTML = `<div class="section-head"><h2>آخر المرضى المضافين</h2><div class="line"></div>
    <button class="btn btn-ghost btn-sm" data-act="go:'patients'">عرض الكل ${I.chevL}</button></div>`;
  rp.appendChild(buildPatientTable(d.recentPatients.map(p => ({ ...p, due: 0, total: 0, paid: 0 })), true));
  c.appendChild(rp);
}

function collectAlerts(d) {
  const out = [];
  d.todayAppointments.forEach(a => out.push({ type:'today', icon:I.calendar, cls:'teal',
    h:`موعد اليوم — ${a.patientName}`, s:`${to12(a.appointmentTime)} • ${a.treatmentType}`, tm:to12(a.appointmentTime), patientId:a.patientId }));
  d.tomorrowAppointments.forEach(a => out.push({ type:'tomorrow', icon:I.clock, cls:'blue',
    h:`موعد غداً — ${a.patientName}`, s:`${to12(a.appointmentTime)} • ${a.treatmentType}`, tm:'غداً', patientId:a.patientId }));
  d.followUps.forEach(f => out.push({ type:'followup', icon:I.warn, cls:'rose',
    h:`مراجعة بعد العلاج — ${f.patientName}`, s:`آخر زيارة قبل ${f.daysAgo} يوم`, tm:'متابعة', patientId:f.patientId }));
  d.dueInstallments.forEach(x => out.push({ type:'installment', icon:I.money, cls:'gold',
    h:`قسط مستحق — ${x.patientName}`, s:`المتبقي ${money(x.due)}`, tm:'مالي', patientId:x.patientId }));
  return out;
}

window.openStatDetail = function (key, d) {
  let title = '', icon = '', body = '', actions = '';
  const row = (pid, name, sub, right, extra = '') => `<div class="d-row" data-act="closeModal:|openPatient:${pid}">
    <span class="mini-av">${esc(initials(name))}</span>
    <div class="d-txt"><div class="d-name">${esc(name)}</div><div class="d-sub">${esc(sub)}</div></div>
    <div class="d-right">${right}${extra}</div></div>`;
  const none = (t) => `<div class="empty" style="padding:34px 12px">${I.check}<h4>${t}</h4></div>`;

  if (key === 'patients') {
    title = 'إجمالي المرضى'; icon = I.patients;
    body = `<div class="mini-stats">
        <div class="ms"><div class="v">${fmt(d.stats.patientCount)}</div><div class="l">إجمالي المرضى</div></div>
        <div class="ms"><div class="v" style="color:var(--gold)">${d.dueInstallments.length}</div><div class="l">عليهم أقساط</div></div>
      </div>
      <div class="detail-list">${d.recentPatients.map(p => row(p.id, p.fullName, `#${p.fileNo} • ${p.gender} • ${p.age} سنة`, '')).join('') || none('لا يوجد مرضى')}</div>
      <div style="margin-top:12px;font-size:12.5px;color:var(--txt-3)">تُعرض آخر ٥ — افتح صفحة المرضى للقائمة الكاملة.</div>`;
    actions = `<button class="btn btn-primary" data-act="closeModal:|go:'patients'">${I.patients} صفحة المرضى</button><button class="btn btn-ghost" data-act="closeModal:">إغلاق</button>`;
  } else if (key === 'today') {
    title = 'مرضى اليوم'; icon = I.calendar;
    const conf = d.todayAppointments.filter(a => a.status === 'مؤكد').length;
    body = `<div class="mini-stats">
        <div class="ms"><div class="v">${d.todayAppointments.length}</div><div class="l">مواعيد اليوم</div></div>
        <div class="ms"><div class="v" style="color:var(--ok)">${conf}</div><div class="l">مؤكدة</div></div>
        <div class="ms"><div class="v" style="color:var(--gold)">${d.todayAppointments.length - conf}</div><div class="l">أخرى</div></div>
      </div>
      <div class="detail-list">${d.todayAppointments.map(a => row(a.patientId, a.patientName, `${to12(a.appointmentTime)} • ${a.treatmentType} • ${a.durationMin} دقيقة`, `<span class="pill ${a.status==='قائمة انتظار'?'gold':'teal'}">${esc(a.status)}</span>`)).join('') || none('لا مواعيد اليوم')}</div>`;
    actions = `<button class="btn btn-primary" data-act="closeModal:|go:'appointments'">${I.calendar} التقويم</button><button class="btn btn-ghost" data-act="closeModal:">إغلاق</button>`;
  } else if (key === 'due') {
    title = 'الأقساط المتبقية'; icon = I.money;
    body = `<div class="mini-stats">
        <div class="ms"><div class="v" style="color:var(--gold)">${fmt(d.stats.due)}</div><div class="l">إجمالي المتبقي (د.ع)</div></div>
        <div class="ms"><div class="v">${d.dueInstallments.length}</div><div class="l">مرضى مدينون</div></div>
      </div>
      <div class="detail-list">${d.dueInstallments.map(x => row(x.patientId, x.patientName, 'قسط مستحق', `<span class="pill gold">متبقي ${fmt(x.due)}</span>`)).join('') || none('لا أقساط مستحقة')}</div>`;
    actions = `<button class="btn btn-primary" data-act="closeModal:|go:'finance'">${I.money} صفحة المالية</button><button class="btn btn-ghost" data-act="closeModal:">إغلاق</button>`;
  } else {
    title = 'إجمالي الإيرادات'; icon = I.cash;
    body = `<div class="mini-stats">
        <div class="ms"><div class="v" style="color:var(--ok)">${fmt(d.stats.paid)}</div><div class="l">المحصّل (د.ع)</div></div>
        <div class="ms"><div class="v" style="color:var(--gold)">${fmt(d.stats.due)}</div><div class="l">المتبقي (د.ع)</div></div>
        <div class="ms"><div class="v">${fmt(d.stats.total)}</div><div class="l">قيمة العلاجات</div></div>
      </div>
      <div style="font-size:13px;color:var(--txt-2);line-height:1.9">افتح صفحة المالية لسجل الدفعات الكامل وتفاصيل كل علاج.</div>`;
    actions = `<button class="btn btn-primary" data-act="closeModal:|go:'finance'">${I.money} صفحة المالية</button><button class="btn btn-ghost" data-act="closeModal:">إغلاق</button>`;
  }
  showModal(`<span class="modal-title-ic">${icon}</span>${title}`, body, actions);
};

/* =========== المرضى (مرقّم من الخادم) =========== */
let pState = { q: '', page: 1, limit: 25, total: 0, pages: 0 };

async function viewPatients(c) {
  const head = el('div');
  head.innerHTML = `<div style="display:flex;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap">
    <div class="search-quick" style="width:min(360px,60vw);position:relative">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;inset-inline-start:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--txt-3)"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4-4"/></svg>
      <input id="pSearch" placeholder="ابحث بالاسم أو رقم الملف أو الهاتف…" value="${esc(pState.q)}">
    </div>
    <button class="btn btn-primary" style="margin-inline-start:auto" data-act="openPatientForm:">${I.plus} إضافة مريض</button>
  </div>`;
  c.appendChild(head);
  const list = el('div'); c.appendChild(list);
  const pager = el('div'); pager.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:center;margin-top:18px;flex-wrap:wrap';
  c.appendChild(pager);

  async function load() {
    list.innerHTML = '<div class="empty"><div class="spinner"></div></div>';
    const params = new URLSearchParams({ page: pState.page, limit: pState.limit });
    if (pState.q) params.set('q', pState.q);
    const d = await apiGet('/patients?' + params);
    Object.assign(pState, d.pagination);
    list.innerHTML = '';
    if (d.patients.length) list.appendChild(buildPatientTable(d.patients));
    else list.appendChild(emptyState('لا يوجد مرضى مطابقون', I.patients));
    pager.innerHTML = `
      <button class="btn btn-ghost btn-sm" ${pState.page <= 1 ? 'disabled' : ''} id="prevP">${I.chevR} السابق</button>
      <span style="font-size:13px;color:var(--txt-2);font-weight:600">صفحة ${pState.page} من ${pState.pages || 1} • ${fmt(pState.total)} مريض</span>
      <button class="btn btn-ghost btn-sm" ${pState.page >= pState.pages ? 'disabled' : ''} id="nextP">التالي ${I.chevL}</button>`;
    const prev = $('#prevP'), next = $('#nextP');
    if (prev) prev.onclick = () => { if (pState.page > 1) { pState.page--; load(); } };
    if (next) next.onclick = () => { if (pState.page < pState.pages) { pState.page++; load(); } };
  }
  await load();

  let timer;
  $('#pSearch').oninput = (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { pState.q = e.target.value.trim(); pState.page = 1; load(); }, 300);
  };
}

function buildPatientTable(arr, compact = false) {
  const wrap = el('div', 'glass table-wrap');
  const t = el('table');
  t.innerHTML = `<thead><tr><th>المريض</th><th>رقم الملف</th><th>العمر</th><th>الهاتف</th>${compact ? '' : '<th>الحالة المالية</th><th>الحالات الطبية</th>'}<th></th></tr></thead>`;
  const tb = el('tbody');
  arr.forEach(p => {
    const tags = [];
    if (p.chronicDiseases) tags.push(p.chronicDiseases);
    if (p.allergies) tags.push('حساسية');
    if (p.isPregnant) tags.push('حمل');
    if (p.isSmoker) tags.push('مدخّن');
    const tr = el('tr'); tr.onclick = () => openPatient(p.id);
    tr.innerHTML = `
      <td><div class="cell-p"><span class="mini-av">${esc(initials(p.fullName))}</span><div><div class="nm">${esc(p.fullName)}</div><div class="sub">${esc(p.gender)} • ${esc(p.occupation || '—')}</div></div></div></td>
      <td><span class="pill gray">#${p.fileNo}</span></td>
      <td>${p.age}</td>
      <td dir="ltr" style="text-align:right">${esc(p.phone || '—')}</td>
      ${compact ? '' : `<td>${p.due > 0 ? `<span class="pill gold"><span class="dot"></span>متبقي ${fmt(p.due)}</span>` : `<span class="pill green"><span class="dot"></span>مسدد</span>`}</td>
      <td>${tags.length ? tags.map(x => `<span class="pill rose" style="margin:2px">${esc(x)}</span>`).join('') : '<span style="color:var(--txt-3)">—</span>'}</td>`}
      <td><button class="btn btn-ghost btn-sm" data-act="openPatient:${p.id}" data-stop="1">${I.eye}</button></td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); wrap.appendChild(t); return wrap;
}

/* =========== ملف المريض =========== */
window.openPatient = async function (id) {
  showModal('ملف المريض', '<div class="empty"><div class="spinner"></div></div>', '', 'wide');
  let d;
  try { d = await apiGet('/patients/' + id); }
  catch (e) { toast(e.message, 'err'); closeModal(); return; }

  const p = d.patient, f = d.finance;
  const tags = [];
  if (p.chronicDiseases) tags.push({ t: p.chronicDiseases, c: 'rose' });
  if (p.allergies) tags.push({ t: 'حساسية: ' + p.allergies, c: 'rose' });
  if (p.isPregnant) tags.push({ t: 'حمل', c: 'gold' });
  if (p.isSmoker) tags.push({ t: 'مدخّن', c: 'gold' });
  tags.push({ t: p.gender, c: 'blue' }, { t: p.age + ' سنة', c: 'gray' });

  const body = `
    <div class="pro-head glass">
      <div class="pro-av">${esc(initials(p.fullName))}</div>
      <div class="pro-meta">
        <h2>${esc(p.fullName)}</h2>
        <div style="color:var(--txt-2);font-size:13px;margin-top:3px">رقم الملف #${p.fileNo} • ${esc(p.phone)} ${p.address ? '• ' + esc(p.address) : ''}</div>
        <div class="pro-tags">${tags.map(x => `<span class="pill ${x.c}">${esc(x.t)}</span>`).join('')}</div>
      </div>
      <div class="pro-fin">
        <div class="pf"><div class="v">${fmt(f.total)}</div><div class="l">الكلي</div></div>
        <div class="pf"><div class="v" style="color:var(--ok)">${fmt(f.paid)}</div><div class="l">المدفوع</div></div>
        <div class="pf"><div class="v" style="color:${f.due > 0 ? 'var(--gold)' : 'var(--txt-2)'}">${fmt(f.due)}</div><div class="l">المتبقي</div></div>
      </div>
    </div>
    <div class="tabs" id="proTabs">
      <div class="tab on" data-t="visits">السجل الطبي (${d.visits.length})</div>
      <div class="tab" data-t="treat">العلاجات (${d.treatments.length})</div>
      <div class="tab" data-t="teeth">مخطط الأسنان</div>
      <div class="tab" data-t="info">المعلومات</div>
    </div>
    <div id="proContent"></div>`;

  const isDoc = ME.role === 'doctor';
  const actions = `
    ${isDoc ? `<button class="btn btn-primary" data-act="openVisitForm:${p.id}">${I.plus} زيارة جديدة</button>` : ''}
    <button class="btn btn-ghost" data-act="openTreatmentForm:${p.id}">${I.money} علاج جديد</button>
    <button class="btn btn-ghost" data-act="openPaymentForm:${p.id}">${I.cash} تسجيل دفعة</button>
    <button class="btn btn-ghost" data-act="openAppointment:${p.id}">${I.calendar} حجز موعد</button>
    <button class="btn btn-ghost" data-act="openPatientForm:${p.id}">${I.edit} تعديل</button>
    ${isDoc ? `<button class="btn btn-danger" data-act="deletePatient:${p.id},'${esc(p.fullName)}'">${I.trash} حذف</button>` : ''}`;

  showModal('ملف المريض', body, actions, 'wide');

  const render = (t) => {
    $$('#proTabs .tab').forEach(x => x.classList.toggle('on', x.dataset.t === t));
    const box = $('#proContent'); box.innerHTML = '';
    if (t === 'visits') box.appendChild(renderVisits(d.visits));
    if (t === 'treat') box.appendChild(renderTreatments(d.treatments, p.id));
    if (t === 'teeth') box.appendChild(renderChartBox(p, d.chart));
    if (t === 'info') box.appendChild(renderInfo(p));
  };
  $$('#proTabs .tab').forEach(tab => tab.onclick = () => render(tab.dataset.t));
  render('visits');
};

function renderVisits(visits) {
  if (!visits.length) return emptyState('لا توجد زيارات مسجلة', I.file);
  const tl = el('div', 'timeline');
  visits.forEach(v => {
    const it = el('div', 'tl-item');
    it.innerHTML = `<div class="tl-date">${arDate(v.visitDate)} • ${relLabel(v.visitDate)}</div>
      <div class="glass" style="padding:15px 18px">
        <div style="font-weight:800;margin-bottom:8px">${esc(v.reason)}</div>
        <div style="font-size:13.5px;line-height:1.9;color:var(--txt-2)">
        ${v.diagnosis ? `<div><b style="color:#0A7C86">التشخيص:</b> ${esc(v.diagnosis)}</div>` : ''}
        ${v.treatmentPlan ? `<div><b style="color:#0E4AE4">خطة العلاج:</b> ${esc(v.treatmentPlan)}</div>` : ''}
        ${v.treatmentDone ? `<div><b style="color:#B5750F">ما تم:</b> ${esc(v.treatmentDone)}</div>` : ''}</div>
      </div>`;
    tl.appendChild(it);
  });
  return tl;
}

function renderTreatments(treatments, pid) {
  if (!treatments.length) return emptyState('لا توجد علاجات', I.money);
  const wrap = el('div', 'glass table-wrap');
  const t = el('table');
  t.innerHTML = `<thead><tr><th>العلاج</th><th>التفاصيل</th><th>الكلي</th><th>المدفوع</th><th>المتبقي</th><th>التقدم</th></tr></thead>`;
  const tb = el('tbody');
  treatments.forEach(tr => {
    const due = tr.totalCost - tr.paidAmount;
    const pct = tr.totalCost ? Math.round(tr.paidAmount / tr.totalCost * 100) : 0;
    const row = el('tr'); row.style.cursor = 'default';
    row.innerHTML = `<td><b>${esc(tr.name)}</b></td><td style="color:var(--txt-2)">${esc(tr.details || '—')}</td>
      <td>${fmt(tr.totalCost)}</td><td style="color:var(--ok)">${fmt(tr.paidAmount)}</td>
      <td style="color:${due > 0 ? 'var(--gold)' : 'var(--txt-3)'}">${fmt(due)}</td>
      <td style="min-width:120px"><div class="progress-bar"><i style="width:${pct}%"></i></div><div style="font-size:11px;color:var(--txt-3);margin-top:3px">${pct}%</div></td>`;
    tb.appendChild(row);
  });
  t.appendChild(tb); wrap.appendChild(t); return wrap;
}

function renderChartBox(p, chart) {
  const box = el('div', 'glass'); box.style.padding = '22px';
  box.appendChild(buildToothChart(p.id, chart, ME.role === 'doctor'));
  return box;
}

function renderInfo(p) {
  const box = el('div', 'glass'); box.style.padding = '22px';
  const rows = [['الاسم الكامل', p.fullName], ['رقم الملف', '#' + p.fileNo], ['العمر', p.age + ' سنة'],
    ['الجنس', p.gender], ['الهاتف', p.phone], ['العنوان', p.address || '—'], ['المهنة', p.occupation || '—'],
    ['الأمراض المزمنة', p.chronicDiseases || 'لا يوجد'], ['الحساسية', p.allergies || 'لا يوجد'],
    ['الحمل', p.isPregnant ? 'نعم' : 'لا'], ['التدخين', p.isSmoker ? 'نعم' : 'لا'],
    ['تاريخ الإنشاء', arDate((p.createdAt || '').slice(0, 10))]];
  box.innerHTML = `<div class="form-grid">${rows.map(r => `<div class="field"><label>${r[0]}</label><div style="padding:12px 14px;background:rgba(14,74,228,.04);border-radius:12px;border:1px solid var(--glass-border);font-weight:600">${esc(r[1])}</div></div>`).join('')}</div>`;
  return box;
}

/* =========== مخطط الأسنان =========== */
function buildToothChart(patientId, chart, editable) {
  const wrap = el('div');
  const legend = el('div', 'chart-legend');
  Object.entries(TOOTH_STATES).forEach(([k, v]) => {
    legend.innerHTML += `<div class="lg"><span class="sw" style="background:${v.c};border:1px solid rgba(3,7,45,.15)"></span>${v.label}</div>`;
  });
  wrap.appendChild(legend);
  const arch = el('div', 'arch');
  [UPPER, LOWER].forEach((rowNums, ri) => {
    const r = el('div', 'arch-row');
    rowNums.forEach(n => {
      const state = chart[n] || '';
      const th = el('div', 'tooth'); th.dataset.num = n;
      th.innerHTML = toothSVG(TOOTH_STATES[state].c) + `<span class="num">${n}</span>`;
      if (editable) th.onclick = () => cycleTooth(patientId, chart, n, th);
      r.appendChild(th);
    });
    arch.appendChild(r);
    if (ri === 0) { const sep = el('div'); sep.style.cssText = 'height:1px;width:60%;margin:0 auto;background:linear-gradient(90deg,transparent,var(--glass-border),transparent)'; arch.appendChild(sep); }
  });
  wrap.appendChild(arch);
  if (editable) {
    const hint = el('div'); hint.style.cssText = 'text-align:center;color:var(--txt-3);font-size:12.5px;margin-top:14px';
    hint.textContent = 'اضغط على أي سن لتغيير حالته';
    wrap.appendChild(hint);
  }
  return wrap;
}

async function cycleTooth(patientId, chart, n, th) {
  const cur = chart[n] || '';
  const next = STATE_CYCLE[(STATE_CYCLE.indexOf(cur) + 1) % STATE_CYCLE.length];
  th.querySelector('svg').outerHTML = toothSVG(TOOTH_STATES[next].c);
  if (next === '') delete chart[n]; else chart[n] = next;
  try { await apiPut('/patients/tooth', { patientId, toothNo: n, condition: next }); }
  catch (e) { toast(e.message, 'err'); }
}

async function viewChart(c) {
  const d = await apiGet('/patients?limit=500');
  if (!d.patients.length) { c.appendChild(emptyState('لا يوجد مرضى بعد', I.chart)); return; }
  const firstP = d.patients[0];
  const firstName = `${firstP.fullName} — #${firstP.fileNo}`;
  const head = el('div'); head.style.cssText = 'display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap';
  head.innerHTML = `<div class="field" style="min-width:320px"><label>اختر المريض</label>
    ${patientPickerHTML('chartSel', firstP.id, firstName)}</div>`;
  c.appendChild(head);
  const box = el('div', 'glass'); box.style.padding = '26px'; c.appendChild(box);

  async function draw(pid) {
    const selectedId = pid || $('#chartSel').value;
    if (!selectedId) return;
    box.innerHTML = '<div class="empty"><div class="spinner"></div></div>';
    const full = await apiGet('/patients/' + selectedId);
    box.innerHTML = '';
    const t = el('div');
    t.innerHTML = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <span class="mini-av" style="width:44px;height:44px">${esc(initials(full.patient.fullName))}</span>
      <div><div style="font-weight:800;font-size:17px">${esc(full.patient.fullName)}</div>
      <div style="font-size:12.5px;color:var(--txt-2)">مخطط الأسنان — نظام FDI</div></div></div>`;
    box.appendChild(t);
    box.appendChild(buildToothChart(full.patient.id, full.chart, ME.role === 'doctor'));
  }
  initPatientPicker('chartSel', d.patients, (selectedId) => draw(selectedId));
  await draw(firstP.id);
}

/* =========== النماذج =========== */
window.openPatientForm = async function (id) {
  let p = {};
  if (id) { try { p = (await apiGet('/patients/' + id)).patient; } catch (e) { toast(e.message, 'err'); return; } }
  const body = `<div class="form-grid">
    <div class="field"><label>الاسم الكامل <span class="req">*</span></label><input id="f_name" value="${esc(p.fullName || '')}" placeholder="مثال: نور الهدى كريم"></div>
    <div class="field"><label>العمر <span class="req">*</span></label><input id="f_age" type="number" min="0" max="130" value="${p.age ?? ''}" placeholder="28"></div>
    <div class="field"><label>الجنس</label><select id="f_gender"><option ${p.gender === 'أنثى' ? 'selected' : ''}>أنثى</option><option ${p.gender === 'ذكر' ? 'selected' : ''}>ذكر</option></select></div>
    <div class="field"><label>رقم الهاتف <span class="req">*</span></label><input id="f_phone" value="${esc(p.phone || '')}" placeholder="0770 000 0000" dir="ltr"></div>
    <div class="field"><label>العنوان</label><input id="f_addr" value="${esc(p.address || '')}" placeholder="بغداد - ..."></div>
    <div class="field"><label>المهنة</label><input id="f_job" value="${esc(p.occupation || '')}" placeholder="—"></div>
    <div class="field"><label>الأمراض المزمنة</label><input id="f_chronic" value="${esc(p.chronicDiseases || '')}" placeholder="السكري، الضغط..."></div>
    <div class="field"><label>الحساسية</label><input id="f_allergy" value="${esc(p.allergies || '')}" placeholder="البنسلين..."></div>
    <div class="field" style="grid-column:1/-1"><label>حالات إضافية</label>
      <div class="chip-toggle" id="f_chips">
        <div class="ct ${p.isPregnant ? 'on' : ''}" data-field="isPregnant">حمل</div>
        <div class="ct ${p.isSmoker ? 'on' : ''}" data-field="isSmoker">مدخّن</div>
      </div></div>
  </div>${!id ? '<div style="margin-top:14px;font-size:12.5px;color:var(--txt-3)">يُولَّد رقم الملف تلقائياً عند الحفظ.</div>' : ''}`;
  const actions = `<button class="btn btn-primary" id="savePatientBtn">${I.check} ${id ? 'حفظ التعديلات' : 'إضافة المريض'}</button>
    <button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>`;
  showModal(id ? 'تعديل بيانات المريض' : 'إضافة مريض جديد', body, actions);
  $$('#f_chips .ct').forEach(ct => ct.onclick = () => ct.classList.toggle('on'));
  $('#savePatientBtn').onclick = () => savePatient(id);
};

async function savePatient(id) {
  const chips = {};
  $$('#f_chips .ct').forEach(c => chips[c.dataset.field] = c.classList.contains('on'));
  const payload = {
    fullName: $('#f_name').value.trim(),
    age: Number($('#f_age').value),
    gender: $('#f_gender').value,
    phone: $('#f_phone').value.trim(),
    address: $('#f_addr').value.trim(),
    occupation: $('#f_job').value.trim(),
    chronicDiseases: $('#f_chronic').value.trim(),
    allergies: $('#f_allergy').value.trim(),
    isPregnant: !!chips.isPregnant, isSmoker: !!chips.isSmoker,
  };
  const btn = $('#savePatientBtn'); btn.disabled = true;
  try {
    if (id) { await apiPatch('/patients/' + id, payload); toast('تم حفظ التعديلات'); }
    else { const r = await apiPost('/patients', payload); toast(`تم إنشاء الملف #${r.patient.fileNo}`); }
    closeModal();
    go(currentView);
  } catch (e) {
    showFormErrors(e); btn.disabled = false;
  }
}

function showFormErrors(e) {
  if (e.issues?.length) e.issues.forEach(i => toast(`${i.message}`, 'err'));
  else toast(e.message, 'err');
}

window.openVisitForm = function (pid) {
  const body = `<div class="form-grid">
    <div class="field"><label>تاريخ الزيارة</label><input id="v_date" type="date" value="${todayStr()}"></div>
    <div class="field"><label>سبب الزيارة <span class="req">*</span></label><input id="v_reason" placeholder="ألم، تنظيف، متابعة..."></div>
  </div>
  <div class="field" style="margin-top:16px"><label>التشخيص</label><textarea id="v_diag" placeholder="اكتب التشخيص..."></textarea></div>
  <div class="field" style="margin-top:16px"><label>خطة العلاج</label><textarea id="v_plan" placeholder="خطة العلاج المقترحة..."></textarea></div>
  <div class="field" style="margin-top:16px"><label>العلاج الذي تم</label><textarea id="v_done" placeholder="ما تم تنفيذه في هذه الزيارة..."></textarea></div>`;
  const actions = `<button class="btn btn-primary" id="saveVisitBtn">${I.check} حفظ الزيارة</button>
    <button class="btn btn-ghost" data-act="openPatient:${pid}">رجوع</button>`;
  showModal('زيارة جديدة', body, actions);
  $('#saveVisitBtn').onclick = async () => {
    const btn = $('#saveVisitBtn'); btn.disabled = true;
    try {
      await apiPost('/patients/visits', {
        patientId: pid, visitDate: $('#v_date').value, reason: $('#v_reason').value.trim(),
        diagnosis: $('#v_diag').value.trim(), treatmentPlan: $('#v_plan').value.trim(),
        treatmentDone: $('#v_done').value.trim(),
      });
      toast('تم حفظ الزيارة'); openPatient(pid);
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

window.openTreatmentForm = function (pid) {
  const body = `<div class="form-grid">
    <div class="field" style="grid-column:1/-1"><label>اسم العلاج <span class="req">*</span></label><input id="t_name" placeholder="تقويم، حشوة، تتويج..."></div>
    <div class="field" style="grid-column:1/-1"><label>التفاصيل</label><input id="t_details" placeholder="السن، الفك، ملاحظات..."></div>
    <div class="field"><label>السعر الكلي <span class="req">*</span></label><input id="t_total" type="number" min="0" placeholder="0"></div>
    <div class="field"><label>الدفعة الأولى</label><input id="t_init" type="number" min="0" value="0"></div>
  </div>`;
  const actions = `<button class="btn btn-primary" id="saveTreatBtn">${I.check} إضافة العلاج</button>
    <button class="btn btn-ghost" data-act="openPatient:${pid}">رجوع</button>`;
  showModal('علاج جديد', body, actions);
  $('#saveTreatBtn').onclick = async () => {
    const btn = $('#saveTreatBtn'); btn.disabled = true;
    try {
      await apiPost('/treatments', {
        patientId: pid, name: $('#t_name').value.trim(), details: $('#t_details').value.trim(),
        totalCost: Number($('#t_total').value), initialPayment: Number($('#t_init').value || 0),
      });
      toast('تمت إضافة العلاج'); openPatient(pid);
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

window.openPaymentForm = async function (pid) {
  let d;
  try { d = await apiGet('/patients/' + pid); } catch (e) { toast(e.message, 'err'); return; }
  const open = d.treatments.filter(t => t.paidAmount < t.totalCost);
  const f = d.finance;
  const body = `
    <div class="glass" style="padding:18px;margin-bottom:18px;display:flex;gap:22px;justify-content:space-around;text-align:center;flex-wrap:wrap">
      <div><div style="font-size:20px;font-weight:800">${fmt(f.total)}</div><div style="font-size:12px;color:var(--txt-2)">الكلي</div></div>
      <div><div style="font-size:20px;font-weight:800;color:var(--ok)">${fmt(f.paid)}</div><div style="font-size:12px;color:var(--txt-2)">المدفوع</div></div>
      <div><div style="font-size:20px;font-weight:800;color:var(--gold)">${fmt(f.due)}</div><div style="font-size:12px;color:var(--txt-2)">المتبقي</div></div>
    </div>
    ${open.length ? `<div class="form-grid">
      <div class="field" style="grid-column:1/-1"><label>العلاج</label><select id="pay_treat">${open.map(t => `<option value="${t.id}">${esc(t.name)} — متبقي ${fmt(t.totalCost - t.paidAmount)}</option>`).join('')}</select></div>
      <div class="field"><label>المبلغ المدفوع <span class="req">*</span></label><input id="pay_amt" type="number" min="1" placeholder="0"></div>
      <div class="field"><label>التاريخ</label><input id="pay_date" type="date" value="${todayStr()}"></div>
    </div>` : '<div style="color:var(--txt-3);font-size:13px;text-align:center;padding:20px">لا توجد علاجات عليها مبالغ متبقية.</div>'}`;
  const actions = `${open.length ? `<button class="btn btn-primary" id="savePayBtn">${I.cash} تسجيل الدفعة</button>` : ''}
    <button class="btn btn-ghost" data-act="openPatient:${pid}">رجوع</button>`;
  showModal('تسجيل دفعة', body, actions);
  if (open.length) $('#savePayBtn').onclick = async () => {
    const btn = $('#savePayBtn'); btn.disabled = true;
    try {
      await apiPost('/payments', {
        treatmentId: Number($('#pay_treat').value),
        amount: Number($('#pay_amt').value),
        paidAt: $('#pay_date').value,
      });
      toast('تم تسجيل الدفعة'); openPatient(pid);
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

/* =========== المواعيد =========== */
let calMode = 'week', calRef = new Date(), calCache = [];

async function viewAppointments(c) {
  const head = el('div', 'cal-head');
  head.innerHTML = `
    <div class="cal-nav">
      <button data-act="calShift:-1">${I.chevR}</button>
      <div class="cal-title" id="calTitle"></div>
      <button data-act="calShift:1">${I.chevL}</button>
    </div>
    <button class="btn btn-ghost btn-sm" data-act="calToday:">اليوم</button>
    <div class="view-toggle">
      <button class="${calMode === 'week' ? 'on' : ''}" data-act="setCalMode:'week'">أسبوعي</button>
      <button class="${calMode === 'month' ? 'on' : ''}" data-act="setCalMode:'month'">شهري</button>
    </div>
    <button class="btn btn-primary" data-act="openAppointment:">${I.plus} حجز موعد</button>`;
  c.appendChild(head);
  const box = el('div'); box.id = 'calBox'; c.appendChild(box);
  const wl = el('div'); wl.id = 'waitList'; c.appendChild(wl);
  await drawCalendar();
}
window.setCalMode = (m) => { calMode = m; go('appointments'); };
window.calShift = (d) => { if (calMode === 'week') calRef.setDate(calRef.getDate() + d * 7); else calRef.setMonth(calRef.getMonth() + d); drawCalendar(); };
window.calToday = () => { calRef = new Date(); drawCalendar(); };

async function drawCalendar() {
  const box = $('#calBox'); if (!box) return;
  box.innerHTML = '<div class="empty"><div class="spinner"></div></div>';
  let from, to;
  if (calMode === 'week') {
    const s = new Date(calRef); s.setDate(s.getDate() - s.getDay());
    from = s.toISOString().slice(0, 10);
    const e = new Date(s); e.setDate(e.getDate() + 6);
    to = e.toISOString().slice(0, 10);
  } else {
    const y = calRef.getFullYear(), m = calRef.getMonth();
    from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    to = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
  }
  const d = await apiGet(`/appointments?from=${from}&to=${to}`);
  calCache = d.appointments;
  box.innerHTML = '';
  if (calMode === 'week') drawWeek(box); else drawMonth(box);
  drawWaitList();
}

function drawWaitList() {
  const wl = $('#waitList'); if (!wl) return;
  const items = calCache.filter(a => a.status === 'قائمة انتظار');
  wl.innerHTML = '';
  if (!items.length) return;
  wl.style.marginTop = '22px';
  wl.innerHTML = `<div class="section-head"><h2>قائمة الانتظار</h2><div class="line"></div></div>`;
  const list = el('div', 'glass'); list.style.padding = '14px';
  items.forEach(a => {
    const row = el('div', 'alert-item'); row.style.marginBottom = '8px';
    row.onclick = () => openAppointment(null, a.id);
    row.innerHTML = `<div class="ai ic gold">${I.clock}</div>
      <div class="txt"><div class="h">${esc(a.patientName)}</div><div class="s">${relLabel(a.appointmentDate)} • ${to12(a.appointmentTime)} • ${esc(a.treatmentType)}</div></div>
      <span class="pill gold"><span class="dot"></span>انتظار</span>`;
    list.appendChild(row);
  });
  wl.appendChild(list);
}

function drawWeek(box) {
  const start = new Date(calRef); start.setDate(start.getDate() - start.getDay());
  const days = []; for (let i = 0; i < 6; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
  $('#calTitle').textContent = `${days[0].getDate()} - ${days[5].getDate()} ${AR_MONTHS[days[5].getMonth()]}`;
  const slots = []; for (let h = 15; h < 21; h++) { slots.push(`${h}:00`); slots.push(`${h}:30`); }
  const grid = el('div', 'week-grid');
  const corner = el('div', 'wd-head'); corner.textContent = 'الوقت'; grid.appendChild(corner);
  const daysHead = el('div', 'week-days');
  days.forEach(d => {
    const iso = d.toISOString().slice(0, 10);
    const h = el('div', 'wd-head' + (iso === todayStr() ? ' today' : ''));
    h.innerHTML = `${AR_DAYS[d.getDay()]}<div class="dd">${d.getDate()}</div>`;
    daysHead.appendChild(h);
  });
  grid.appendChild(daysHead);
  slots.forEach(slot => {
    const st = el('div', 'slot-time'); st.textContent = to12(slot); grid.appendChild(st);
    const rowDays = el('div', 'week-days');
    days.forEach(d => {
      const iso = d.toISOString().slice(0, 10);
      const cell = el('div', 'slot');
      cell.onclick = () => openAppointment(null, null, iso, slot);
      const apt = calCache.find(a => a.appointmentDate === iso && a.appointmentTime === slot && a.status !== 'ملغي');
      if (apt) {
        const b = el('div', 'apt-block');
        b.innerHTML = `${esc(apt.patientName)}<div class="t">${esc(apt.treatmentType)}</div>`;
        b.onclick = (e) => { e.stopPropagation(); openAppointment(null, apt.id); };
        cell.appendChild(b);
      }
      rowDays.appendChild(cell);
    });
    grid.appendChild(rowDays);
  });
  box.appendChild(grid);
}

function drawMonth(box) {
  const y = calRef.getFullYear(), m = calRef.getMonth();
  $('#calTitle').textContent = `${AR_MONTHS[m]} ${y}`;
  const startDay = new Date(y, m, 1).getDay();
  const grid = el('div', 'month-grid');
  AR_DAYS.forEach(d => { const h = el('div', 'dow'); h.textContent = d; grid.appendChild(h); });
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) { const cell = el('div', 'mcell other'); cell.innerHTML = `<div class="dn">${prevDays - i}</div>`; grid.appendChild(cell); }
  for (let dnum = 1; dnum <= daysInMonth; dnum++) {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(dnum).padStart(2, '0')}`;
    const cell = el('div', 'mcell' + (iso === todayStr() ? ' today' : ''));
    cell.onclick = () => openAppointment(null, null, iso, '15:00');
    let html = `<div class="dn">${dnum}</div>`;
    const apts = calCache.filter(a => a.appointmentDate === iso && a.status !== 'ملغي');
    apts.slice(0, 3).forEach(a => { html += `<div class="apt">${to12(a.appointmentTime)} ${esc(a.patientName.split(' ')[0])}</div>`; });
    if (apts.length > 3) html += `<div style="font-size:10px;color:var(--txt-3);padding:0 6px">+${apts.length - 3} المزيد</div>`;
    cell.innerHTML = html; grid.appendChild(cell);
  }
  box.appendChild(grid);
}

window.openAppointment = async function (presetPid, editId, presetDate, presetTime) {
  const ap = editId ? calCache.find(a => a.id === editId) : null;
  let pid = ap ? ap.patientId : presetPid;
  let patients = [];
  try { patients = (await apiGet('/patients?limit=500')).patients; } catch (e) { toast(e.message, 'err'); return; }
  if (!pid && patients.length) pid = patients[0].id;
  const selP = patients.find(p => p.id == pid);
  const selName = selP ? `${selP.fullName} — #${selP.fileNo}` : '';
  const times = []; for (let h = 15; h < 21; h++) { times.push(`${h}:00`); times.push(`${h}:30`); }
  const types = ['كشف','تنظيف','حشوة','خلع','علاج عصب','تتويج','متابعة تقويم','مراجعة بعد العلاج','تبييض'];
  const body = `<div class="form-grid">
    <div class="field" style="grid-column:1/-1"><label>المريض <span class="req">*</span></label>
      ${patientPickerHTML('a_pid', pid, selName)}</div>
    <div class="field"><label>التاريخ</label><input id="a_date" type="date" value="${ap ? ap.appointmentDate : (presetDate || todayStr())}"></div>
    <div class="field"><label>الوقت</label><select id="a_time">${times.map(t => `<option value="${t}" ${(ap ? ap.appointmentTime : presetTime) === t ? 'selected' : ''}>${to12(t)}</option>`).join('')}</select></div>
    <div class="field"><label>نوع العلاج</label><select id="a_type">${types.map(t => `<option ${ap && ap.treatmentType === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="field"><label>المدة</label><select id="a_dur">
      <option value="30" ${ap && ap.durationMin == 30 ? 'selected' : ''}>30 دقيقة</option>
      <option value="45" ${ap && ap.durationMin == 45 ? 'selected' : ''}>45 دقيقة</option>
      <option value="60" ${ap && ap.durationMin == 60 ? 'selected' : ''}>ساعة</option>
      <option value="90" ${ap && ap.durationMin == 90 ? 'selected' : ''}>ساعة ونصف</option></select></div>
    <div class="field" style="grid-column:1/-1"><label>الحالة</label><select id="a_status">
      ${['مؤكد','قائمة انتظار','حضر','لم يحضر','ملغي'].map(s => `<option ${ap && ap.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  </div>`;
  let actions = `<button class="btn btn-primary" id="saveAptBtn">${I.check} ${ap ? 'حفظ' : 'حجز الموعد'}</button>`;
  if (ap) actions += `<button class="btn btn-danger" id="delAptBtn">${I.trash} إلغاء الموعد</button>`;
  actions += `<button class="btn btn-ghost" data-act="closeModal:">إغلاق</button>`;
  showModal(ap ? 'تعديل موعد' : 'حجز موعد جديد', body, actions);
  initPatientPicker('a_pid', patients);

  $('#saveAptBtn').onclick = async () => {
    const patientId = Number($('#a_pid').value);
    if (!patientId || patientId <= 0) {
      toast('يرجى اختيار مريض من قائمة البحث', 'err');
      return;
    }
    const btn = $('#saveAptBtn'); btn.disabled = true;
    const payload = {
      patientId, appointmentDate: $('#a_date').value,
      appointmentTime: $('#a_time').value, durationMin: Number($('#a_dur').value),
      treatmentType: $('#a_type').value, status: $('#a_status').value,
    };
    try {
      if (editId) { await apiPatch('/appointments/' + editId, payload); toast('تم حفظ الموعد'); }
      else { await apiPost('/appointments', payload); toast('تم حجز الموعد'); }
      closeModal();
      if (currentView === 'appointments') drawCalendar(); else go(currentView);
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
  const del = $('#delAptBtn');
  if (del) del.onclick = async () => {
    try { await apiDel('/appointments/' + editId); toast('تم إلغاء الموعد', 'info'); closeModal();
      if (currentView === 'appointments') drawCalendar(); else go(currentView); }
    catch (e) { toast(e.message, 'err'); }
  };
};

/* =========== المالية =========== */
async function viewFinance(c) {
  const d = await apiGet('/finance');
  const sg = el('div', 'grid stat-grid');
  [
    { ic:'green', icon:I.cash,  val:money(d.totals.paid),  lbl:'إجمالي الإيرادات المحصّلة' },
    { ic:'gold',  icon:I.money, val:money(d.totals.due),   lbl:'إجمالي الأقساط المتبقية' },
    { ic:'blue',  icon:I.file,  val:money(d.totals.total), lbl:'إجمالي قيمة العلاجات' },
  ].forEach(s => {
    const card = el('div', 'stat glass');
    card.innerHTML = `<div class="ic ${s.ic}">${s.icon}</div><div class="val" style="font-size:20px">${s.val}</div><div class="lbl">${s.lbl}</div>`;
    sg.appendChild(card);
  });
  c.appendChild(sg);

  const sec = el('div');
  sec.innerHTML = `<div class="section-head"><h2>الأقساط المستحقة</h2><div class="line"></div><span class="pill gold"><span class="dot"></span>${d.dueList.length} حالة</span></div>`;
  c.appendChild(sec);
  if (d.dueList.length) {
    const wrap = el('div', 'glass table-wrap'); const t = el('table');
    t.innerHTML = `<thead><tr><th>المريض</th><th>الكلي</th><th>المدفوع</th><th>المتبقي</th><th>نسبة السداد</th><th></th></tr></thead>`;
    const tb = el('tbody');
    d.dueList.forEach(x => {
      const pct = x.total ? Math.round(x.paid / x.total * 100) : 0;
      const tr = el('tr'); tr.onclick = () => openPatient(x.patientId);
      tr.innerHTML = `<td><div class="cell-p"><span class="mini-av">${esc(initials(x.patientName))}</span><div class="nm">${esc(x.patientName)}</div></div></td>
        <td>${fmt(x.total)}</td><td style="color:var(--ok)">${fmt(x.paid)}</td>
        <td style="color:var(--gold);font-weight:800">${fmt(x.due)}</td>
        <td style="min-width:130px"><div class="progress-bar"><i style="width:${pct}%"></i></div></td>
        <td><button class="btn btn-primary btn-sm" data-act="openPaymentForm:${x.patientId}" data-stop="1">${I.cash} دفعة</button></td>`;
      tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t); c.appendChild(wrap);
  } else c.appendChild(emptyState('لا توجد أقساط مستحقة — كل الحسابات مسددة', I.check));

  const sec2 = el('div');
  sec2.innerHTML = `<div class="section-head"><h2>آخر الدفعات</h2><div class="line"></div></div>`;
  c.appendChild(sec2);
  if (d.recentPayments.length) {
    const wrap = el('div', 'glass table-wrap'); const t2 = el('table');
    t2.innerHTML = `<thead><tr><th>التاريخ</th><th>المريض</th><th>العلاج</th><th>المبلغ</th><th>الطريقة</th></tr></thead>`;
    const tb2 = el('tbody');
    d.recentPayments.forEach(p => {
      const tr = el('tr'); tr.style.cursor = 'default';
      tr.innerHTML = `<td style="color:var(--txt-2)">${arDate(p.paidAt)}</td><td>${esc(p.patientName)}</td>
        <td><b>${esc(p.treatmentName)}</b></td><td style="color:var(--ok);font-weight:700">${fmt(p.amount)}</td>
        <td><span class="pill gray">${esc(p.method)}</span></td>`;
      tb2.appendChild(tr);
    });
    t2.appendChild(tb2); wrap.appendChild(t2); c.appendChild(wrap);
  }
}

/* =========== المختبر =========== */
async function viewLab(c) {
  const d = await apiGet('/labs');
  const head = el('div'); head.style.cssText = 'display:flex;margin-bottom:18px';
  head.innerHTML = `<button class="btn btn-primary" style="margin-inline-start:auto" data-act="openLabForm:">${I.plus} إضافة عمل مختبر</button>`;
  c.appendChild(head);
  if (!d.labs.length) { c.appendChild(emptyState('لا توجد أعمال مختبر', I.lab)); return; }
  const wrap = el('div', 'glass table-wrap'); const t = el('table');
  t.innerHTML = `<thead><tr><th>المريض</th><th>العمل</th><th>المختبر</th><th>المصاريف</th><th>تاريخ التسليم</th><th>الحالة</th><th></th></tr></thead>`;
  const tb = el('tbody');
  d.labs.forEach(l => {
    const stCls = l.status === 'تم الاستلام' ? 'green' : l.status === 'قيد التنفيذ' ? 'blue' : 'gold';
    const overdue = l.status !== 'تم الاستلام' && l.dueDate && l.dueDate < todayStr();
    const tr = el('tr'); tr.style.cursor = 'default';
    tr.innerHTML = `<td>${esc(l.patientName)}</td><td><b>${esc(l.workDetails)}</b></td>
      <td style="color:var(--txt-2)">${esc(l.labName || '—')}</td><td>${money(l.cost)}</td>
      <td style="color:${overdue ? 'var(--danger)' : 'var(--txt-2)'}">${arDate(l.dueDate)}${overdue ? ' ⚠' : ''}</td>
      <td><span class="pill ${stCls}"><span class="dot"></span>${esc(l.status)}</span></td>
      <td><button class="btn btn-ghost btn-sm" data-act="openLabForm:${l.id}">${I.edit}</button></td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); wrap.appendChild(t); c.appendChild(wrap);
}

window.openLabForm = async function (id) {
  let l = {}, patients = [];
  try {
    patients = (await apiGet('/patients?limit=500')).patients;
    if (id) l = (await apiGet('/labs')).labs.find(x => x.id === id) || {};
  } catch (e) { toast(e.message, 'err'); return; }
  let pid = l.patientId;
  if (!pid && patients.length) pid = patients[0].id;
  const selP = patients.find(p => p.id == pid);
  const selName = selP ? `${selP.fullName} — #${selP.fileNo}` : '';
  const body = `<div class="form-grid">
    <div class="field" style="grid-column:1/-1"><label>المريض <span class="req">*</span></label>
      ${patientPickerHTML('l_pid', pid, selName)}</div>
    <div class="field"><label>تفاصيل العمل <span class="req">*</span></label><input id="l_work" value="${esc(l.workDetails || '')}" placeholder="تاج، جسر، جهاز تقويم..."></div>
    <div class="field"><label>اسم المختبر</label><input id="l_lab" value="${esc(l.labName || '')}" placeholder="مختبر..."></div>
    <div class="field"><label>المصاريف</label><input id="l_cost" type="number" min="0" value="${l.cost ?? ''}" placeholder="0"></div>
    <div class="field"><label>تاريخ التسليم المتوقع</label><input id="l_due" type="date" value="${l.dueDate || ''}"></div>
    <div class="field" style="grid-column:1/-1"><label>الحالة</label><select id="l_status">
      ${['مرسل','قيد التنفيذ','تم الاستلام'].map(s => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  </div>`;
  let actions = `<button class="btn btn-primary" id="saveLabBtn">${I.check} حفظ</button>`;
  if (id) actions += `<button class="btn btn-danger" id="delLabBtn">${I.trash} حذف</button>`;
  actions += `<button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>`;
  showModal(id ? 'تعديل عمل مختبر' : 'إضافة عمل مختبر', body, actions);
  initPatientPicker('l_pid', patients);

  $('#saveLabBtn').onclick = async () => {
    const patientId = Number($('#l_pid').value);
    if (!patientId || patientId <= 0) {
      toast('يرجى اختيار مريض من قائمة البحث', 'err');
      return;
    }
    const btn = $('#saveLabBtn'); btn.disabled = true;
    const payload = {
      patientId, workDetails: $('#l_work').value.trim(),
      labName: $('#l_lab').value.trim(), cost: Number($('#l_cost').value || 0),
      status: $('#l_status').value, dueDate: $('#l_due').value || undefined,
    };
    try {
      if (id) await apiPatch('/labs/' + id, payload); else await apiPost('/labs', payload);
      toast('تم الحفظ'); closeModal(); go('lab');
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
  const del = $('#delLabBtn');
  if (del) del.onclick = async () => {
    try { await apiDel('/labs/' + id); toast('تم الحذف', 'info'); closeModal(); go('lab'); }
    catch (e) { toast(e.message, 'err'); }
  };
};

/* =========== التنبيهات =========== */
async function viewAlerts(c) {
  const d = await apiGet('/dashboard');
  const all = collectAlerts(d);
  alertCount = all.filter(a => a.type !== 'today').length;
  buildNav();
  const groups = { today: [], tomorrow: [], followup: [], installment: [] };
  all.forEach(a => groups[a.type]?.push(a));
  const titles = {
    today: ['مواعيد اليوم', I.calendar, 'teal'], tomorrow: ['مواعيد الغد', I.clock, 'blue'],
    followup: ['مراجعات ومتابعات', I.warn, 'rose'], installment: ['أقساط مستحقة', I.money, 'gold'],
  };
  let any = false;
  Object.entries(titles).forEach(([k, [t, icon, cls]]) => {
    if (!groups[k].length) return;
    any = true;
    const sec = el('div');
    sec.innerHTML = `<div class="section-head"><span class="ic ${cls}" style="width:34px;height:34px">${icon}</span><h2>${t}</h2><div class="line"></div><span class="pill ${cls}">${groups[k].length}</span></div>`;
    c.appendChild(sec);
    groups[k].forEach(a => {
      const row = el('div', 'alert-item');
      row.onclick = () => a.patientId && openPatient(a.patientId);
      row.innerHTML = `<div class="ai ic ${a.cls}">${a.icon}</div>
        <div class="txt"><div class="h">${esc(a.h)}</div><div class="s">${esc(a.s)}</div></div>
        <span class="tm">${esc(a.tm)}</span>`;
      c.appendChild(row);
    });
  });
  if (!any) c.appendChild(emptyState('لا توجد تنبيهات حالياً — كل شيء منظّم', I.check));
}

/* =========== إدارة الحسابات (الطبيب فقط) =========== */
async function viewUsers(c) {
  const d = await apiGet('/auth/users');
  const head = el('div'); head.style.cssText = 'display:flex;margin-bottom:18px;align-items:center;gap:12px;flex-wrap:wrap';
  head.innerHTML = `<div style="font-size:13.5px;color:var(--txt-2);line-height:1.8">
      أنشئ حسابات السكرتيرات وحدّد بياناتها وكلمات مرورها. تعطيل الحساب يُنهي جلساته فوراً.</div>
    <button class="btn btn-primary" style="margin-inline-start:auto" data-act="openUserForm:">${I.plus} إضافة حساب</button>`;
  c.appendChild(head);

  const wrap = el('div', 'glass table-wrap'); const t = el('table');
  t.innerHTML = `<thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>الهاتف</th><th>الحالة</th><th>جلسات نشطة</th><th></th></tr></thead>`;
  const tb = el('tbody');
  d.users.forEach(u => {
    const tr = el('tr'); tr.style.cursor = 'default';
    const isMe = u.id === ME.id;
    tr.innerHTML = `
      <td><div class="cell-p"><span class="mini-av">${esc(initials(u.fullName))}</span>
        <div><div class="nm">${esc(u.fullName)}</div>${isMe ? '<div class="sub">أنت</div>' : ''}</div></div></td>
      <td dir="ltr" style="text-align:right"><span class="pill gray">${esc(u.username)}</span></td>
      <td><span class="pill ${u.role === 'doctor' ? 'teal' : 'blue'}">${u.role === 'doctor' ? 'طبيب' : 'سكرتيرة'}</span></td>
      <td dir="ltr" style="text-align:right">${esc(u.phone || '—')}</td>
      <td>${u.isActive ? '<span class="pill green"><span class="dot"></span>نشط</span>' : '<span class="pill rose"><span class="dot"></span>معطّل</span>'}</td>
      <td>${u.activeSessions}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" data-act="openUserForm:${u.id}" title="تعديل">${I.edit}</button>
        <button class="btn btn-ghost btn-sm" data-act="openResetPassword:${u.id},'${esc(u.fullName)}'" title="إعادة تعيين كلمة المرور">${I.key}</button>
        ${isMe ? '' : `<button class="btn btn-danger btn-sm" data-act="deleteUser:${u.id},'${esc(u.fullName)}'" title="حذف">${I.trash}</button>`}
      </td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); wrap.appendChild(t); c.appendChild(wrap);
}

window.openUserForm = async function (id) {
  let u = {};
  if (id) {
    try { u = (await apiGet('/auth/users')).users.find(x => x.id === id) || {}; }
    catch (e) { toast(e.message, 'err'); return; }
  }
  const body = `<div class="form-grid">
    <div class="field"><label>الاسم الكامل <span class="req">*</span></label><input id="u_name" value="${esc(u.fullName || '')}" placeholder="مثال: سارة أحمد"></div>
    <div class="field"><label>رقم الهاتف</label><input id="u_phone" value="${esc(u.phone || '')}" dir="ltr" placeholder="0770 000 0000"></div>
    ${id ? '' : `
    <div class="field"><label>اسم المستخدم <span class="req">*</span></label><input id="u_username" dir="ltr" placeholder="sara" autocomplete="off"></div>
    <div class="field"><label>كلمة المرور <span class="req">*</span></label><input id="u_password" type="password" placeholder="٨ أحرف على الأقل" autocomplete="new-password"></div>
    <div class="field" style="grid-column:1/-1"><label>الدور</label><select id="u_role">
      <option value="secretary">سكرتيرة</option><option value="doctor">طبيب</option></select></div>`}
    ${id ? `<div class="field" style="grid-column:1/-1"><label>الحالة</label><select id="u_active">
      <option value="1" ${u.isActive ? 'selected' : ''}>نشط</option>
      <option value="0" ${!u.isActive ? 'selected' : ''}>معطّل</option></select></div>` : ''}
  </div>
  ${id ? '' : '<div style="margin-top:14px;font-size:12.5px;color:var(--txt-3)">سيُطلب من المستخدم تغيير كلمة المرور عند أول دخول إن رغبت لاحقاً.</div>'}`;
  const actions = `<button class="btn btn-primary" id="saveUserBtn">${I.check} ${id ? 'حفظ' : 'إنشاء الحساب'}</button>
    <button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>`;
  showModal(id ? 'تعديل حساب' : 'إضافة حساب جديد', body, actions);

  $('#saveUserBtn').onclick = async () => {
    const btn = $('#saveUserBtn'); btn.disabled = true;
    try {
      if (id) {
        await apiPatch('/auth/users/' + id, {
          fullName: $('#u_name').value.trim(), phone: $('#u_phone').value.trim(),
          isActive: $('#u_active').value === '1',
        });
        toast('تم حفظ الحساب');
      } else {
        await apiPost('/auth/users', {
          username: $('#u_username').value.trim(), password: $('#u_password').value,
          fullName: $('#u_name').value.trim(), role: $('#u_role').value,
          phone: $('#u_phone').value.trim(),
        });
        toast('تم إنشاء الحساب');
      }
      closeModal(); go('users');
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

window.openResetPassword = function (id, name) {
  const body = `<div style="margin-bottom:16px;color:var(--txt-2);font-size:13.5px">
      تعيين كلمة مرور جديدة لـ <b>${esc(name)}</b>. ستُنهى كل جلساته الحالية.</div>
    <div class="field"><label>كلمة المرور الجديدة <span class="req">*</span></label>
      <input id="rp_pass" type="password" placeholder="٨ أحرف على الأقل" autocomplete="new-password"></div>`;
  const actions = `<button class="btn btn-primary" id="rpBtn">${I.key} تعيين</button>
    <button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>`;
  showModal('إعادة تعيين كلمة المرور', body, actions);
  $('#rpBtn').onclick = async () => {
    const btn = $('#rpBtn'); btn.disabled = true;
    try {
      await apiPost(`/auth/users/${id}/reset-password`, { password: $('#rp_pass').value });
      toast('تم تعيين كلمة المرور'); closeModal(); go('users');
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

window.deleteUser = function (id, name) {
  const body = `<div style="color:var(--txt-2);font-size:14px;line-height:1.9">
    سيتم حذف حساب <b>${esc(name)}</b> وإنهاء جلساته. البيانات التي أنشأها تبقى محفوظة.</div>`;
  const actions = `<button class="btn btn-danger" id="delUserBtn">${I.trash} تأكيد الحذف</button>
    <button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>`;
  showModal('حذف حساب', body, actions);
  $('#delUserBtn').onclick = async () => {
    try { await apiDel('/auth/users/' + id); toast('تم حذف الحساب', 'info'); closeModal(); go('users'); }
    catch (e) { toast(e.message, 'err'); }
  };
};

window.openChangePassword = function () {
  const body = `<div style="margin-bottom:16px;color:var(--txt-2);font-size:13.5px">
      ${ME.mustChangePassword ? 'يجب تغيير كلمة المرور قبل المتابعة.' : 'اختر كلمة مرور جديدة.'}</div>
    <div class="field" style="margin-bottom:14px"><label>كلمة المرور الحالية <span class="req">*</span></label>
      <input id="cp_cur" type="password" autocomplete="current-password"></div>
    <div class="field"><label>كلمة المرور الجديدة <span class="req">*</span></label>
      <input id="cp_new" type="password" placeholder="٨ أحرف على الأقل" autocomplete="new-password"></div>`;
  const actions = `<button class="btn btn-primary" id="cpBtn">${I.check} تغيير</button>
    ${ME.mustChangePassword ? '' : '<button class="btn btn-ghost" data-act="closeModal:">إلغاء</button>'}`;
  showModal('تغيير كلمة المرور', body, actions);
  $('#cpBtn').onclick = async () => {
    const btn = $('#cpBtn'); btn.disabled = true;
    try {
      const r = await apiPost('/auth/change-password', {
        currentPassword: $('#cp_cur').value, newPassword: $('#cp_new').value,
      });
      CSRF = r.csrfToken; ME.mustChangePassword = false;
      toast('تم تغيير كلمة المرور'); closeModal();
    } catch (e) { showFormErrors(e); btn.disabled = false; }
  };
};

/* =========== سجل النظام =========== */
async function viewAudit(c) {
  const d = await apiGet('/auth/audit?limit=200');
  const LABELS = {
    LOGIN:'تسجيل دخول', LOGOUT:'تسجيل خروج', LOGIN_FAILED:'محاولة دخول فاشلة',
    LOGIN_BLOCKED:'دخول محظور', LOGIN_INACTIVE:'دخول لحساب معطّل',
    USER_CREATED:'إنشاء حساب', USER_UPDATED:'تعديل حساب', USER_DELETED:'حذف حساب',
    PASSWORD_RESET:'إعادة تعيين كلمة مرور', PASSWORD_CHANGED:'تغيير كلمة مرور',
    PATIENT_CREATED:'إضافة مريض', PATIENT_UPDATED:'تعديل مريض', PATIENT_DELETED:'حذف مريض',
    VISIT_CREATED:'تسجيل زيارة', APPOINTMENT_CREATED:'حجز موعد',
    APPOINTMENT_UPDATED:'تعديل موعد', APPOINTMENT_DELETED:'إلغاء موعد',
    TREATMENT_CREATED:'إضافة علاج', PAYMENT_RECEIVED:'تسجيل دفعة', PAYMENT_VOIDED:'إلغاء دفعة',
    LAB_CREATED:'إضافة عمل مختبر', LAB_UPDATED:'تعديل عمل مختبر', LAB_DELETED:'حذف عمل مختبر',
    BACKUP_CREATED:'إنشاء نسخة احتياطية', BACKUP_RESTORED:'استعادة نسخة احتياطية',
  };
  const cls = (a) => a.includes('FAILED') || a.includes('BLOCKED') || a.includes('DELETED') ? 'rose'
    : a.includes('CREATED') || a.includes('RESTORED') ? 'green' : a.includes('PAYMENT') ? 'gold' : a.includes('BACKUP') ? 'teal' : 'blue';
  const wrap = el('div', 'glass table-wrap'); const t = el('table');
  t.innerHTML = `<thead><tr><th>الوقت</th><th>المستخدم</th><th>العملية</th><th>الكيان</th></tr></thead>`;
  const tb = el('tbody');
  d.entries.forEach(e => {
    const tr = el('tr'); tr.style.cursor = 'default';
    const dt = new Date(e.createdAt.replace(' ', 'T') + 'Z');
    tr.innerHTML = `<td style="color:var(--txt-2);font-size:12.5px" dir="ltr">${dt.toLocaleString('en-GB', { hour12: false })}</td>
      <td>${esc(e.userName || '—')}</td>
      <td><span class="pill ${cls(e.action)}">${esc(LABELS[e.action] || e.action)}</span></td>
      <td style="color:var(--txt-3);font-size:12.5px">${esc(e.entity)}${e.entityId ? ' #' + esc(e.entityId) : ''}</td>`;
    tb.appendChild(tr);
  });
  t.appendChild(tb); wrap.appendChild(t); c.appendChild(wrap);
  if (!d.entries.length) c.appendChild(emptyState('لا توجد عمليات مسجلة', I.shield));
}

/* =========== حذف المريض =========== */
window.deletePatient = function (id, name) {
  const body = `<div style="text-align:center;padding:10px 0">
    <div style="width:72px;height:72px;border-radius:20px;background:rgba(240,65,107,.12);display:inline-grid;place-items:center;margin-bottom:18px">
      <svg viewBox="0 0 24 24" fill="none" stroke="#D42A54" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></svg>
    </div>
    <h3 style="font-size:18px;font-weight:800;margin-bottom:10px;color:var(--txt)">هل أنت متأكد من حذف المريض؟</h3>
    <div style="color:var(--txt-2);font-size:14px;line-height:1.9">
      سيتم حذف ملف المريض <b style="color:var(--danger)">${esc(name)}</b> بشكل نهائي.<br>
      لا يمكن التراجع عن هذا الإجراء.
    </div>
  </div>`;
  const actions = `<button class="btn btn-danger" id="delPatientBtn" style="gap:8px">${I.trash} نعم، حذف المريض</button>
    <button class="btn btn-ghost" data-act="closeModal:" style="gap:8px">لا، إلغاء</button>`;
  showModal('تأكيد حذف المريض', body, actions);
  $('#delPatientBtn').onclick = async () => {
    const btn = $('#delPatientBtn'); btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> جاري الحذف…';
    try {
      await apiDel('/patients/' + id);
      toast('تم حذف المريض بنجاح', 'info');
      closeModal();
      go('patients');
    } catch (e) {
      toast(e.message, 'err');
      btn.disabled = false;
      btn.innerHTML = `${I.trash} نعم، حذف المريض`;
    }
  };
};

/* =========== النسخ الاحتياطي =========== */
async function viewBackup(c) {
  let backups = [];
  try {
    const d = await apiGet('/backup/list');
    backups = d.backups || [];
  } catch { /* لا توجد نسخ سابقة */ }

  /* --- الإحصائيات العلوية --- */
  const lastBackup = backups.length > 0 ? backups[0] : null;
  const lastBackupDate = lastBackup ? new Date(lastBackup.created_at).toLocaleString('ar-IQ', { dateStyle: 'long', timeStyle: 'short' }) : 'لم يتم بعد';
  const totalBackups = backups.length;

  const sg = el('div', 'grid stat-grid');
  [
    { ic:'green', icon:I.backup, val: totalBackups, lbl:'عدد النسخ الاحتياطية' },
    { ic:'blue', icon:I.clock, val: lastBackupDate, lbl:'آخر نسخة احتياطية', small: true },
    { ic:'teal', icon:I.shield, val: 'نشط', lbl:'النسخ الاحتياطي التلقائي اليومي' },
  ].forEach(s => {
    const card = el('div', 'stat glass');
    card.innerHTML = `<div class="ic ${s.ic}">${s.icon}</div><div class="val" style="font-size:${s.small ? '16px' : '30px'}">${s.val}</div><div class="lbl">${s.lbl}</div>`;
    sg.appendChild(card);
  });
  c.appendChild(sg);

  /* --- أزرار العمليات --- */
  const actBox = el('div', 'glass'); actBox.style.cssText = 'padding:28px;margin-top:20px';
  actBox.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px">
      <div class="ic teal" style="width:50px;height:50px">${I.backup}</div>
      <div>
        <h3 style="font-size:17px;font-weight:800">إدارة النسخ الاحتياطي</h3>
        <div style="font-size:13px;color:var(--txt-2)">يتم إنشاء نسخة احتياطية تلقائية يومياً. يمكنك أيضاً إنشاء نسخة يدوياً أو استعادة نسخة سابقة.</div>
      </div>
    </div>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <button class="btn btn-primary" id="manualBackupBtn">${I.download} إنشاء نسخة احتياطية الآن</button>
      <label class="btn btn-ghost" style="cursor:pointer">
        ${I.upload} استعادة من ملف
        <input type="file" accept=".json" id="restoreFileInput" style="display:none">
      </label>
    </div>
    <div id="backupProgress" style="margin-top:16px;display:none">
      <div style="display:flex;align-items:center;gap:12px;padding:16px;background:rgba(14,74,228,.06);border:1px solid rgba(14,74,228,.15);border-radius:14px">
        <div class="spinner" style="width:22px;height:22px;border-width:2px"></div>
        <span id="backupProgressText" style="font-size:14px;font-weight:600;color:var(--txt-2)">جاري المعالجة…</span>
      </div>
    </div>`;
  c.appendChild(actBox);

  /* --- جدول النسخ السابقة --- */
  const sec = el('div');
  sec.innerHTML = `<div class="section-head"><h2>النسخ الاحتياطية السابقة</h2><div class="line"></div><span class="pill blue"><span class="dot"></span>${totalBackups} نسخة</span></div>`;
  c.appendChild(sec);

  if (backups.length) {
    const wrap = el('div', 'glass table-wrap'); const t = el('table');
    t.innerHTML = `<thead><tr><th>التاريخ والوقت</th><th>الحجم</th><th>الجداول</th><th></th></tr></thead>`;
    const tb = el('tbody');
    backups.forEach(b => {
      const tr = el('tr'); tr.style.cursor = 'default';
      const dt = new Date(b.created_at);
      const sizeKB = b.size_bytes ? (b.size_bytes / 1024).toFixed(1) + ' KB' : '—';
      tr.innerHTML = `<td>
        <div class="cell-p">
          <span class="mini-av" style="background:linear-gradient(145deg,rgba(14,74,228,.8),rgba(15,183,196,.8));width:38px;height:38px;font-size:14px">${I.backup}</span>
          <div><div class="nm">${dt.toLocaleString('ar-IQ', { dateStyle: 'long', timeStyle: 'short' })}</div>
          <div class="sub">${relLabel(b.created_at.slice(0, 10))}</div></div>
        </div></td>
        <td><span class="pill gray">${sizeKB}</span></td>
        <td style="color:var(--txt-2)">${b.table_count || '—'} جدول</td>
        <td style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm backup-download" data-id="${b.id}" title="تحميل">${I.download}</button>
          <button class="btn btn-danger btn-sm backup-restore" data-id="${b.id}" title="استعادة">${I.backup}</button>
        </td>`;
      tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t); c.appendChild(wrap);

    /* Download a specific backup */
    wrap.querySelectorAll('.backup-download').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const bid = btn.dataset.id;
        btn.disabled = true;
        try {
          const d = await apiGet('/backup/download/' + bid);
          const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url;
          a.download = `clinic-backup-${new Date().toISOString().slice(0,10)}.json`;
          a.click(); URL.revokeObjectURL(url);
          toast('تم تحميل النسخة الاحتياطية');
        } catch (e) { toast(e.message, 'err'); }
        btn.disabled = false;
      };
    });

    /* Restore a specific stored backup */
    wrap.querySelectorAll('.backup-restore').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const bid = btn.dataset.id;
        const confirmBody = `<div style="text-align:center;padding:10px 0">
          <div style="width:72px;height:72px;border-radius:20px;background:rgba(181,117,15,.12);display:inline-grid;place-items:center;margin-bottom:18px">
            <svg viewBox="0 0 24 24" fill="none" stroke="#B5750F" stroke-width="1.9" width="36" height="36"><path d="M12 3.2L2.2 20h19.6L12 3.2z"/><path d="M12 10v4.2M12 17.4v.1"/></svg>
          </div>
          <h3 style="font-size:18px;font-weight:800;margin-bottom:10px">هل أنت متأكد من الاستعادة؟</h3>
          <div style="color:var(--txt-2);font-size:14px;line-height:1.9">
            سيتم <b style="color:var(--danger)">استبدال جميع البيانات الحالية</b> ببيانات هذه النسخة الاحتياطية.<br>
            هذا الإجراء لا يمكن التراجع عنه.
          </div>
        </div>`;
        const confirmActions = `<button class="btn btn-danger" id="confirmRestoreBtn">${I.backup} نعم، استعادة البيانات</button>
          <button class="btn btn-ghost" data-act="closeModal:">لا، إلغاء</button>`;
        showModal('تأكيد الاستعادة', confirmBody, confirmActions);
        $('#confirmRestoreBtn').onclick = async () => {
          const rb = $('#confirmRestoreBtn'); rb.disabled = true; rb.textContent = 'جاري الاستعادة…';
          try {
            await apiPost('/backup/restore/' + bid);
            toast('تم استعادة البيانات بنجاح!', 'ok');
            closeModal(); go('backup');
          } catch (e) { toast(e.message, 'err'); rb.disabled = false; rb.textContent = 'نعم، استعادة البيانات'; }
        };
      };
    });
  } else {
    c.appendChild(emptyState('لا توجد نسخ احتياطية سابقة', I.backup));
  }

  /* --- Manual Backup Button --- */
  $('#manualBackupBtn').onclick = async () => {
    const btn = $('#manualBackupBtn'); btn.disabled = true;
    const prog = $('#backupProgress'); prog.style.display = 'block';
    $('#backupProgressText').textContent = 'جاري إنشاء النسخة الاحتياطية…';
    try {
      const d = await apiPost('/backup/create');
      /* Download the backup file */
      const blob = new Blob([JSON.stringify(d.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `clinic-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast('تم إنشاء وتحميل النسخة الاحتياطية بنجاح');
      prog.style.display = 'none';
      go('backup'); /* Refresh the page */
    } catch (e) { toast(e.message, 'err'); prog.style.display = 'none'; }
    btn.disabled = false;
  };

  /* --- Restore From File --- */
  $('#restoreFileInput').onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    /* Read and validate */
    const text = await file.text();
    let data;
    try { data = JSON.parse(text); }
    catch { toast('الملف غير صالح — يجب أن يكون ملف JSON', 'err'); return; }

    const confirmBody = `<div style="text-align:center;padding:10px 0">
      <div style="width:72px;height:72px;border-radius:20px;background:rgba(181,117,15,.12);display:inline-grid;place-items:center;margin-bottom:18px">
        <svg viewBox="0 0 24 24" fill="none" stroke="#B5750F" stroke-width="1.9" width="36" height="36"><path d="M12 3.2L2.2 20h19.6L12 3.2z"/><path d="M12 10v4.2M12 17.4v.1"/></svg>
      </div>
      <h3 style="font-size:18px;font-weight:800;margin-bottom:10px">هل أنت متأكد من استعادة هذا الملف؟</h3>
      <div style="color:var(--txt-2);font-size:14px;line-height:1.9">
        الملف: <b>${esc(file.name)}</b> (${(file.size / 1024).toFixed(1)} KB)<br>
        سيتم <b style="color:var(--danger)">استبدال جميع البيانات الحالية</b> ببيانات هذا الملف.
      </div>
    </div>`;
    const confirmActions = `<button class="btn btn-danger" id="confirmFileRestoreBtn">${I.upload} نعم، استعادة من الملف</button>
      <button class="btn btn-ghost" data-act="closeModal:">لا، إلغاء</button>`;
    showModal('تأكيد الاستعادة من ملف', confirmBody, confirmActions);
    $('#confirmFileRestoreBtn').onclick = async () => {
      const rb = $('#confirmFileRestoreBtn'); rb.disabled = true; rb.textContent = 'جاري الاستعادة…';
      try {
        await apiPost('/backup/restore-file', { data });
        toast('تم استعادة البيانات من الملف بنجاح!', 'ok');
        closeModal(); go('backup');
      } catch (e) { toast(e.message, 'err'); rb.disabled = false; rb.textContent = 'نعم، استعادة من الملف'; }
    };
    e.target.value = ''; /* Reset file input */
  };
}

/* =========== البحث السريع =========== */
let searchTimer;
window.quickSearch = function (q) {
  clearTimeout(searchTimer);
  const box = $('#searchRes');
  q = q.trim();
  if (!q) { box.classList.add('hidden'); return; }
  searchTimer = setTimeout(async () => {
    try {
      const d = await apiGet('/patients?limit=6&q=' + encodeURIComponent(q));
      box.innerHTML = '';
      if (!d.patients.length) {
        box.innerHTML = '<div class="sr" style="color:var(--txt-3)">لا نتائج</div>';
      } else {
        d.patients.forEach(p => {
          const r = el('div', 'sr');
          r.innerHTML = `<span class="mini-av">${esc(initials(p.fullName))}</span>
            <div style="flex:1"><div style="font-weight:700">${esc(p.fullName)}</div>
            <div style="font-size:11.5px;color:var(--txt-3)">#${p.fileNo} • ${esc(p.phone || '')}</div></div>
            ${p.due > 0 ? '<span class="pill gold" style="font-size:10px">متبقي</span>' : ''}`;
          r.onmousedown = () => { openPatient(p.id); $('#gsearch').value = ''; box.classList.add('hidden'); };
          box.appendChild(r);
        });
      }
      box.classList.remove('hidden');
    } catch { box.classList.add('hidden'); }
  }, 280);
};
window.hideSearch = () => $('#searchRes').classList.add('hidden');

/* =========================================================
   محرك تفويض الأحداث
   يستبدل onclick المضمّن — متوافق مع سياسة CSP الصارمة
========================================================= */
const ACTIONS = {
  doLogin:            () => doLogin(),
  logout:             () => doLogout(),
  toggleSidebar:      () => toggleSidebar(),
  closeModal:         () => closeModal(),
  go:                 (v) => go(v),
  openPatient:        (id) => openPatient(Number(id)),
  openPatientForm:    (id) => openPatientForm(id ? Number(id) : undefined),
  openVisitForm:      (id) => openVisitForm(Number(id)),
  openTreatmentForm:  (id) => openTreatmentForm(Number(id)),
  openPaymentForm:    (id) => openPaymentForm(Number(id)),
  openAppointment:    (a, b) => openAppointment(a ? Number(a) : undefined, b ? Number(b) : undefined),
  openLabForm:        (id) => openLabForm(id ? Number(id) : undefined),
  openUserForm:       (id) => openUserForm(id ? Number(id) : undefined),
  openResetPassword:  (id, name) => openResetPassword(Number(id), name),
  deleteUser:         (id, name) => deleteUser(Number(id), name),
  deletePatient:      (id, name) => deletePatient(Number(id), name),
  setCalMode:         (m) => setCalMode(m),
  calShift:           (d) => calShift(Number(d)),
  calToday:           () => calToday(),
};

/** يفكّ ترميز وسيط: يزيل الاقتباسات ويعالج القيم الفارغة */
function parseArg(raw) {
  const v = (raw ?? '').trim();
  if (v === '' || v === 'null' || v === 'undefined') return undefined;
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    return v.slice(1, -1);
  }
  return v;
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-act]');
  if (!target) return;
  if (target.hasAttribute('data-stop')) e.stopPropagation();
  // صيغة: "fn:arg1,arg2|fn2:arg"
  target.getAttribute('data-act').split('|').forEach(part => {
    const [fn, argStr = ''] = part.split(':');
    const handler = ACTIONS[fn.trim()];
    if (!handler) return;
    const args = argStr ? argStr.split(',').map(parseArg) : [];
    try { handler(...args); } catch (err) { console.error('action error', fn, err); }
  });
});

/* =========== المودال =========== */
function showModal(title, body, actions, cls = '') {
  const m = $('#modal'); m.className = 'modal ' + cls;
  m.innerHTML = `<div class="modal-head"><h3>${title}</h3><div class="x" data-act="closeModal:">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg></div></div>
    <div class="modal-body">${body}</div>
    ${actions ? `<div class="modal-foot">${actions}</div>` : ''}`;
  $('#overlay').classList.add('on');
}
window.closeModal = function () { $('#overlay').classList.remove('on'); };
$('#overlay').addEventListener('click', e => { if (e.target.id === 'overlay') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ME?.mustChangePassword) closeModal(); });

/* =========== الإقلاع =========== */
$('#loginBtn').addEventListener('click', doLogin);
$('#lpass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('#luser').addEventListener('keydown', e => { if (e.key === 'Enter') $('#lpass').focus(); });
$('#gsearch').addEventListener('input', e => quickSearch(e.target.value));
$('#gsearch').addEventListener('blur', () => setTimeout(hideSearch, 200));
boot();
