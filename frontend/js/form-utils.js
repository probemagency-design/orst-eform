/**
 * form-utils.js — ฟังก์ชันกลางสำหรับ E-Form
 */

/* ── Toast Notifications ── */
const Toast = (() => {
  let container;

  function _getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(type, title, msg, duration = 4000) {
    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div>
        <div class="toast-title">${title}</div>
        ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
      </div>`;
    _getContainer().appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(110%)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 350); }, duration);
  }

  return { show };
})();

/* ── Validation ── */
const Validator = (() => {
  function validate(rules) {
    let ok = true;
    rules.forEach(({ el, check, msg }) => {
      const field = el.closest('.field');
      const errEl = field ? field.querySelector('.err-msg') : null;
      const pass = typeof check === 'function' ? check(el.value) : !!el.value.trim();
      if (!pass) {
        el.classList.add('error');
        if (field) field.classList.add('has-error');
        if (errEl) errEl.textContent = msg || 'กรุณากรอกข้อมูล';
        ok = false;
      } else {
        el.classList.remove('error');
        if (field) field.classList.remove('has-error');
      }
    });
    return ok;
  }

  function clearErrors(formEl) {
    formEl.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    formEl.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function notEmpty(v) { return v.trim().length > 0; }

  return { validate, clearErrors, isEmail, notEmpty };
})();

/* ── PDF Preview Modal ── */
const PDFModal = (() => {
  function show(dataUri, title) {
    let overlay = document.getElementById('pdf-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pdf-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h2 id="pdf-modal-title">ตัวอย่าง PDF</h2>
            <button class="modal-close" onclick="PDFModal.close()" aria-label="ปิด">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <iframe id="pdf-modal-frame" title="ตัวอย่าง PDF"></iframe>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) PDFModal.close(); });
    }
    document.getElementById('pdf-modal-title').textContent = title || 'ตัวอย่าง PDF';
    document.getElementById('pdf-modal-frame').src = dataUri;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const overlay = document.getElementById('pdf-modal');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { show, close };
})();

/* ── API Submit Helper ── */
async function submitToAPI(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error ${res.status}`);
  }
  return res.json();
}

/* ── Get today's date as YYYY-MM-DD ── */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/* ── Format Thai date ── */
function thaiDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  const months = ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return `${parseInt(d)} ${months[parseInt(m)]} พ.ศ. ${parseInt(y) + 543}`;
}

/* ── Button loading state ── */
function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-text" style="opacity:0">${btn.dataset.origText}</span><span style="position:absolute;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .7s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>กำลังประมวลผล...</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
  }
}
