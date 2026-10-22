// Where the icons sit comes from hero-layout.json: a desktop layout and a phone layout for the hero's icons, and one
// for the archive's things in the margins (x, y in % of their desk; hide: true leaves an item out). The admin mode,
// opened with ?admin=1, lets you drag them into place, with a phone preview for the phone layout; the draft keeps in
// this browser as you go, and "copy" or "download" gives you hero-layout.json to put in the site, which is how it
// goes live for everyone. ?admin=0, or the panel's exit, turns the mode off.
(function () {
    var KEY = 'heroLayoutDraft', ON = 'heroLayoutAdmin';
    var PHONE = matchMedia('(max-width: 520px)');
    var file = { hero: { desktop: {}, phone: {} }, margins: {} }, draft = load(KEY) || { hero: { desktop: {}, phone: {} }, margins: {} };
    var admin = false, phonePreview = false, selected = null;

    function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch (e) {} }
    function mode() { return phonePreview || PHONE.matches ? 'phone' : 'desktop'; }
    // the file's layout, with the draft over it while the admin is on (off, the page shows the file's layout alone)
    function merged() {
        var out = { _about: file._about, hero: { desktop: {}, phone: {} }, margins: {} };
        ['desktop', 'phone'].forEach(function (m) {
            Object.keys(file.hero[m] || {}).forEach(function (k) { out.hero[m][k] = Object.assign({}, file.hero[m][k]); });
            if (admin) Object.keys(draft.hero[m] || {}).forEach(function (k) { out.hero[m][k] = Object.assign({}, out.hero[m][k] || {}, draft.hero[m][k]); });
        });
        Object.keys(file.margins || {}).forEach(function (k) { out.margins[k] = Object.assign({}, file.margins[k]); });
        if (admin) Object.keys(draft.margins || {}).forEach(function (k) { out.margins[k] = Object.assign({}, out.margins[k] || {}, draft.margins[k]); });
        return out;
    }
    function entryFor(el) {
        var L = merged();
        return el.closest('#marginDesk') ? L.margins[el.dataset.id] : L.hero[mode()][el.dataset.id];
    }
    function draftFor(el) {
        var set = el.closest('#marginDesk') ? draft.margins : draft.hero[mode()];
        return set[el.dataset.id] || (set[el.dataset.id] = {});
    }

    // ---- placing everything from the layout ----
    function place(el, e, inMargins) {
        if (!e) { if (!inMargins) { el.style.left = el.style.top = el.style.display = ''; } return; }
        if (e.hide) { el.style.display = 'none'; return; }
        el.style.display = inMargins ? '' : 'flex';
        if (e.x !== undefined) { el.style.left = e.x + '%'; if (inMargins) el.style.right = 'auto'; }
        if (e.y !== undefined) el.style.top = e.y + '%';
    }
    function apply() {
        var L = merged(), m = mode();
        document.querySelectorAll('.hero .desk [data-id]').forEach(function (el) { place(el, L.hero[m][el.dataset.id], false); });
        document.querySelectorAll('#marginDesk [data-id]').forEach(function (el) { place(el, L.margins[el.dataset.id], true); });
        if (panel) status();
    }

    // ---- the admin mode ----
    var panel = null;
    function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
    function status() {
        var n = Object.keys(draft.hero.desktop).length + Object.keys(draft.hero.phone).length + Object.keys(draft.margins).length;
        panel.querySelector('.adm-status').textContent = 'editing the ' + mode() + ' layout' + (n ? ' · ' + n + ' draft change' + (n === 1 ? '' : 's') : '');
        panel.querySelector('.adm-phone').classList.toggle('on', phonePreview);
        var sel = panel.querySelector('.adm-sel');
        if (selected && selected.isConnected) {
            var e = entryFor(selected) || {};
            sel.hidden = false;
            sel.querySelector('.adm-sel-name').textContent = selected.dataset.id;
            sel.querySelector('.adm-hide').checked = !!e.hide;
        } else sel.hidden = true;
    }
    function fileText() { return JSON.stringify(merged(), null, 2) + '\n'; }
    function openPanel() {
        document.documentElement.classList.add('admin');
        document.querySelectorAll('.hero .desk [data-id]').forEach(function (a) { a.setAttribute('draggable', 'false'); });
        panel = el('<div class="admin-panel" role="region" aria-label="layout admin">' +
            '<div class="adm-head">layout admin</div>' +
            '<div class="adm-status"></div>' +
            '<div class="adm-row"><button type="button" class="adm-phone">phone preview</button><button type="button" class="adm-copy">copy hero-layout.json</button><button type="button" class="adm-dl">download</button></div>' +
            '<div class="adm-sel" hidden><span class="adm-sel-name"></span><label><input type="checkbox" class="adm-hide"> hidden in this layout</label></div>' +
            '<div class="adm-row"><button type="button" class="adm-reset">reset draft</button><button type="button" class="adm-exit">exit admin</button></div>' +
            '<div class="adm-help">Drag an icon to move it. The phone layout is separate: switch the preview on, or make the window narrower than 520px. ' +
            'When it looks right, copy or download hero-layout.json and put it at the site\'s root (or send it to Claude); until then the draft stays in this browser and shows only in the admin.</div>' +
            '</div>');
        document.body.appendChild(panel);
        panel.querySelector('.adm-phone').addEventListener('click', function () { phonePreview = !phonePreview; document.documentElement.classList.toggle('admin-phone', phonePreview); selected = null; apply(); });
        panel.querySelector('.adm-copy').addEventListener('click', function () {
            var b = this; navigator.clipboard.writeText(fileText()).then(function () { b.textContent = 'copied'; setTimeout(function () { b.textContent = 'copy hero-layout.json'; }, 1400); });
        });
        panel.querySelector('.adm-dl').addEventListener('click', function () {
            var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([fileText()], { type: 'application/json' })); a.download = 'hero-layout.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        });
        panel.querySelector('.adm-reset').addEventListener('click', function () { draft = { hero: { desktop: {}, phone: {} }, margins: {} }; try { localStorage.removeItem(KEY); } catch (e) {} selected = null; apply(); });
        panel.querySelector('.adm-exit').addEventListener('click', function () { try { localStorage.removeItem(ON); } catch (e) {} location.href = location.pathname; });
        panel.querySelector('.adm-hide').addEventListener('change', function () {
            if (!selected) return; var d = draftFor(selected); if (this.checked) d.hide = true; else delete d.hide; save(); apply();
        });
        status();
    }

    // ---- dragging ----
    var drag = null;
    function target(ev) { if (!admin) return null; var t = ev.target.closest && ev.target.closest('.hero .desk [data-id], #marginDesk [data-id]'); return t; }
    document.addEventListener('pointerdown', function (ev) {
        var t = target(ev); if (!t || ev.button !== 0) return;
        ev.preventDefault(); ev.stopPropagation();
        var inMargins = !!t.closest('#marginDesk');
        var box = (inMargins ? document.getElementById('marginDesk') : document.querySelector('.hero .desk')).getBoundingClientRect();
        var r = t.getBoundingClientRect(), centre = inMargins ? t.dataset.anchor === 'centre' : true;
        drag = { el: t, box: box, inMargins: inMargins, centre: centre,
                 dx: ev.clientX - (centre ? r.left + r.width / 2 : r.left), dy: ev.clientY - (centre ? r.top + r.height / 2 : r.top), moved: false };
        if (selected) selected.classList.remove('admin-selected');
        selected = t; t.classList.add('admin-selected'); status();
        try { t.setPointerCapture(ev.pointerId); } catch (e) {}
    }, true);
    document.addEventListener('pointermove', function (ev) {
        if (!drag) return;
        var x = (ev.clientX - drag.dx - drag.box.left) / drag.box.width * 100, y = (ev.clientY - drag.dy - drag.box.top) / drag.box.height * 100;
        x = Math.round(Math.max(0, Math.min(100, x)) * 10) / 10; y = Math.round(Math.max(0, Math.min(100, y)) * 10) / 10;
        var d = draftFor(drag.el); d.x = x; d.y = y; drag.moved = true;
        place(drag.el, Object.assign({}, entryFor(drag.el), d), drag.inMargins);
    }, true);
    document.addEventListener('pointerup', function (ev) {
        if (!drag) return;
        if (drag.moved) save();
        drag = null; status();
    }, true);
    // in the admin, a click on an icon selects it and opens nothing
    document.addEventListener('click', function (ev) { if (target(ev)) { ev.preventDefault(); ev.stopPropagation(); } }, true);

    // ---- start ----
    var q = new URLSearchParams(location.search).get('admin');
    if (q === '1') { try { localStorage.setItem(ON, '1'); } catch (e) {} }
    if (q === '0') { try { localStorage.removeItem(ON); } catch (e) {} }
    admin = q === '1' || (q !== '0' && load(ON) === 1) || (q !== '0' && (function () { try { return localStorage.getItem(ON) === '1'; } catch (e) { return false; } })());
    fetch('hero-layout.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (j) file = { _about: j._about, hero: { desktop: (j.hero && j.hero.desktop) || {}, phone: (j.hero && j.hero.phone) || {} }, margins: j.margins || {} };
    }).catch(function () {}).then(function () {
        apply();
        if (admin) openPanel();
        (PHONE.addEventListener ? PHONE.addEventListener('change', apply) : PHONE.addListener(apply));
    });
})();
