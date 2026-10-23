// Where every movable thing sits comes from hero-layout.json: for each side of the toggle (film, performance), a
// desktop layout and a phone layout, each thing in the hero's desk (x, y in % of the hero) or on the page below it
// (x in % of the page width, y of the main column), or, for a window of the page itself (data-win), a nudge from its
// place in the flow (x in % of the column's width, y in px); hide: true leaves it out. The performance side's layout is the
// film's except where it says otherwise: a thing moved on the performance side gets an entry there of its own, and
// the rest keep following the film's. The admin, at /admin, lets you drag them anywhere, on whichever side the
// toggle shows and in a phone layout of its own; every move saves straight back to the file when the site runs
// locally, and keeps in this browser otherwise.
(function () {
    var KEY = 'heroLayoutDraft2';
    var PHONE = matchMedia('(max-width: 520px)');
    var SIDES = ['film', 'performance'], MODES = ['desktop', 'phone'];
    function blank() { return { film: { desktop: {}, phone: {} }, performance: { desktop: {}, phone: {} } }; }
    var file = blank(), draft = load(KEY) || blank();
    var admin = false, selected = null;

    function load(k) { try { var v = JSON.parse(localStorage.getItem(k)); return v && v.film && v.performance ? v : null; } catch (e) { return null; } }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch (e) {} }
    // which layout is being edited follows the window: a phone-sized one (520px or narrower, the browser's device mode included) edits the phone layout
    function mode() { return PHONE.matches ? 'phone' : 'desktop'; }
    // and the side the toggle shows (js/main.js keeps it on the root)
    function side() { return document.documentElement.dataset.mode === 'performance' ? 'performance' : 'film'; }
    // the file's layouts, with the draft over them while the admin is on (off, the page shows the file's layouts alone)
    function merged() {
        var out = blank(); out._about = file._about;
        SIDES.forEach(function (s) { MODES.forEach(function (m) {
            Object.keys(file[s][m] || {}).forEach(function (k) { out[s][m][k] = Object.assign({}, file[s][m][k]); });
            if (admin) Object.keys(draft[s][m] || {}).forEach(function (k) { out[s][m][k] = Object.assign({}, out[s][m][k] || {}, draft[s][m][k]); });
        }); });
        return out;
    }
    // the layout in force now: this side's entries, and the film's for everything this side has no entry for
    function current() { var L = merged(), m = mode(); return Object.assign({}, L.film[m], L[side()][m]); }
    var hero = function () { return document.querySelector('.hero .desk'); };
    var page = function () { return document.getElementById('marginDesk'); };
    function items() { return document.querySelectorAll('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id], main [data-win]'); }
    // a window of the page (data-win) keeps its place in the flow and is nudged from it; the rest are laid on a desk
    function homeZone(el) { return el.hasAttribute('data-win') ? 'flow' : /^phone-/.test(el.dataset.id) ? 'grid' : /^scene-/.test(el.dataset.id) ? 'scene' : /^margin-/.test(el.dataset.id) ? 'page' : 'hero'; }
    var gridWidth = function (el) { var h = el.closest('.desktop'); return h ? h.getBoundingClientRect().width : 1; };
    var column = function () { var m = document.querySelector('main'); return m ? m.getBoundingClientRect().width : 1; };
    function zoneOf(el) { return el.closest('.scene-desk') ? 'scene' : el.closest('#marginDesk') ? 'page' : 'hero'; }
    // a desk scene is drawn on a 1600px canvas and scaled to fit; its things are placed in those px
    function sceneScale(el) { var host = el.closest('.desktop'); return host ? (parseFloat(host.style.getPropertyValue('--desk-scale')) || host.clientWidth / 1600) : 1; }
    function entryFor(el) { return current()[el.dataset.id]; }
    function draftFor(el) { var set = draft[side()][mode()]; return set[el.dataset.id] || (set[el.dataset.id] = {}); }
    function anchorCentre(el) { return el.dataset.anchor ? el.dataset.anchor === 'centre' : true; }

    // ---- placing everything from the layout ----
    function place(el, e) {
        if (homeZone(el) === 'flow') {    // nudged from its place in the flow: x in % of the column's width, y in px
            if (e && e.hide) { el.style.display = 'none'; return; }
            el.style.display = '';
            var nudged = !!(e && (e.x || e.y));
            el.style.transform = nudged ? 'translate(' + (e.x || 0) / 100 * column() + 'px, ' + (e.y || 0) + 'px)' : '';
            el.classList.toggle('nudged', nudged);   // forward, so a section after it in the page does not paint over it and take the pointer
            return;
        }
        if (homeZone(el) === 'grid') {    // a phone desk's thing, nudged within its cell on top of the small nudge the desk gave it: x in % of the desk's width, y in px
            if (e && e.hide) { el.style.display = 'none'; return; }
            el.style.display = '';
            var moved = !!(e && (e.x || e.y));
            el.style.transform = (el.dataset.base || '') + (moved ? ' translate(' + (e.x || 0) / 100 * gridWidth(el) + 'px, ' + (e.y || 0) + 'px)' : '');
            el.classList.toggle('nudged', moved);
            return;
        }
        if (homeZone(el) === 'scene') {   // stays on its scene; x, y in the scene's px
            if (!e) return;
            if (e.hide) { el.style.display = 'none'; return; }
            el.style.display = '';
            if (e.x !== undefined) el.style.left = e.x + 'px';
            if (e.y !== undefined) el.style.top = e.y + 'px';
            return;
        }
        var zone = (e && e.zone) || homeZone(el);
        var box = zone === 'page' ? page() : hero();
        if (box && el.parentElement !== box) box.appendChild(el);
        if (!e) {   // no saved position: back to where the markup or the desk script put it
            el.style.display = ''; el.style.left = el.style.top = el.style.right = '';
            if (el.dataset.homeY) el.style.top = el.dataset.homeY;
            if (el.dataset.homeX) el.style.left = el.dataset.homeX; else if (el.dataset.homeSide) el.style[el.dataset.homeSide] = '1.5%';
            return;
        }
        if (e.hide) { el.style.display = 'none'; return; }
        el.style.display = zone === 'page' && !el.classList.contains('desktop-icon') ? '' : 'flex';
        if (e.x !== undefined) { el.style.left = e.x + '%'; el.style.right = 'auto'; }
        if (e.y !== undefined) el.style.top = e.y + '%';
    }
    function apply() {
        var L = current();
        items().forEach(function (el) { place(el, L[el.dataset.id]); });
        if (panel) status();
    }
    window.applyLayout = apply;   // the desk scenes call this after rebuilding themselves

    // ---- the admin mode ----
    var panel = null;
    function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
    // no panel: the admin is just the page with everything draggable. Delete (or backspace) hides the selected thing in
    // this layout; a hidden thing can be brought back by removing its hide from hero-layout.json
    var panel = null;
    function status() {}
    function persist() {
        var L = merged();
        fetch('/api/layout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(L) })
            .then(function (r) { if (!r.ok) throw new Error(); file = L; draft = blank(); try { localStorage.removeItem(KEY); } catch (e) {} })
            .catch(function () { save(); });
    }
    function openPanel() {
        document.documentElement.classList.add('admin');
        document.querySelectorAll('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id], main [data-win], .hero .desk [data-id] img, #marginDesk [data-id] img, .scene-desk [data-id] img, main [data-win] img, main [data-win] a').forEach(function (a) { a.setAttribute('draggable', 'false'); });
        document.addEventListener('keydown', function (ev) {
            if ((ev.key === 'Delete' || ev.key === 'Backspace') && selected && selected.isConnected) {
                ev.preventDefault(); var d = draftFor(selected); d.hide = true; apply(); persist(); selected = null;
            }
        });
    }

    // ---- dragging: anywhere on the page. Leaving the hero puts a thing on the page layer, and the other way round ----
    var drag = null;
    function target(ev) { if (!admin) return null; return ev.target.closest && ev.target.closest('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id], main [data-win]'); }
    function anchorPoint(el) { var r = el.getBoundingClientRect(); return anchorCentre(el) ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: r.left, y: r.top }; }
    document.addEventListener('pointerdown', function (ev) {
        var t = target(ev); if (!t || ev.button !== 0) return;
        ev.preventDefault(); ev.stopPropagation();
        var a = anchorPoint(t), e0 = entryFor(t) || {};
        drag = { el: t, dx: ev.clientX - a.x, dy: ev.clientY - a.y, moved: false, zone: zoneOf(t), x0: ev.clientX, y0: ev.clientY, ex: e0.x || 0, ey: e0.y || 0 };
        if (selected) selected.classList.remove('admin-selected');
        selected = t; t.classList.add('admin-selected'); status();
        try { t.setPointerCapture(ev.pointerId); } catch (e) {}
    }, true);
    document.addEventListener('pointermove', function (ev) {
        if (!drag) return;
        var el = drag.el, d = draftFor(el);
        if (homeZone(el) === 'flow' || homeZone(el) === 'grid') {    // the nudge grows with the pointer's travel from where it took hold
            var span = homeZone(el) === 'flow' ? column() : gridWidth(el);
            d.x = Math.round((drag.ex + (ev.clientX - drag.x0) / span * 100) * 10) / 10; d.y = Math.round(drag.ey + (ev.clientY - drag.y0));
            drag.moved = true; place(el, d); return;
        }
        if (homeZone(el) === 'scene') {   // within its scene, in the scene's px
            var sb = el.closest('.scene-desk').getBoundingClientRect(), sc = sceneScale(el);
            d.x = Math.round((ev.clientX - drag.dx - sb.left) / sc); d.y = Math.round((ev.clientY - drag.dy - sb.top) / sc);
            drag.moved = true; place(el, d); return;
        }
        // which zone the pointer is in (the phone layout is the hero's alone)
        var heroRect = document.querySelector('.hero').getBoundingClientRect();
        var zone = mode() === 'phone' || !page() || getComputedStyle(page()).display === 'none' ? 'hero'
                 : (ev.clientY >= heroRect.top && ev.clientY <= heroRect.bottom ? 'hero' : 'page');
        if (zone !== drag.zone) { drag.zone = zone; (zone === 'page' ? page() : hero()).appendChild(el); }
        var box = (zone === 'page' ? page() : hero()).getBoundingClientRect();
        var x = (ev.clientX - drag.dx - box.left) / box.width * 100, y = (ev.clientY - drag.dy - box.top) / box.height * 100;
        d.zone = zone;
        d.x = Math.round(Math.max(0, Math.min(100, x)) * 10) / 10; d.y = Math.round(Math.max(0, Math.min(100, y)) * 10) / 10;
        drag.moved = true;
        place(el, Object.assign({}, entryFor(el), d));
    }, true);
    document.addEventListener('pointerup', function () {
        if (!drag) return;
        var moved = drag.moved; drag = null;
        if (moved) persist(); else status();
    }, true);
    // the browser's own drag of a picture or a link would swallow the pointer: none of that in the admin
    document.addEventListener('dragstart', function (ev) { if (admin) ev.preventDefault(); }, true);
    // in the admin, a click on an icon selects it and opens nothing
    document.addEventListener('click', function (ev) { if (target(ev)) { ev.preventDefault(); ev.stopPropagation(); } }, true);

    // ---- start ----
    admin = /^\/admin\/?$/.test(location.pathname) || new URLSearchParams(location.search).get('admin') === '1';
    // the badge at the top right: into the admin from the page, back to the page from the admin, on the side showing
    var link = document.getElementById('adminLink');
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) document.documentElement.classList.add('local');   // the badge shows here only
    if (link) {
        var flag = function () { return document.documentElement.dataset.mode === 'performance' ? '?performance' : ''; };
        var point = function () { link.href = (admin ? '/' : '/admin') + flag(); };
        if (admin) link.textContent = 'exit admin';
        point();
        new MutationObserver(point).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    }
    fetch('hero-layout.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        var P = (j && j.performance) || {};
        if (j && j.film) file = { _about: j._about, film: { desktop: j.film.desktop || {}, phone: j.film.phone || {} }, performance: { desktop: P.desktop || {}, phone: P.phone || {} } };
        else if (j && j.desktop) file = { _about: j._about, film: { desktop: j.desktop, phone: j.phone || {} }, performance: { desktop: {}, phone: {} } };   // the file from before there were two sides
    }).catch(function () {}).then(function () {
        apply();
        if (admin) openPanel();
        var onChange = function () { selected = null; apply(); };
        (PHONE.addEventListener ? PHONE.addEventListener('change', onChange) : PHONE.addListener(onChange));
        // the toggle changes sides: the other side's layout takes over
        new MutationObserver(onChange).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
        // the column's width changes: the windows' nudges, in % of it, are measured again
        var sizeTimer = null; window.addEventListener('resize', function () { clearTimeout(sizeTimer); sizeTimer = setTimeout(apply, 120); });
    });
})();
