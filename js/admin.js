// Where every movable thing sits comes from hero-layout.json: a desktop layout and a phone layout, each thing in
// the hero's desk (x, y in % of the hero) or on the page below it (x in % of the page width, y of the main column);
// hide: true leaves it out. The admin, at /admin, lets you drag them anywhere, with a phone layout of its own; the draft keeps in
// this browser as you go, and "save layout" gives you hero-layout.json to put in the site, which is how it
// goes live for everyone. The admin is the page at /admin.
(function () {
    var KEY = 'heroLayoutDraft';
    var PHONE = matchMedia('(max-width: 520px)');
    var file = { desktop: {}, phone: {} }, draft = load(KEY) || { desktop: {}, phone: {} };
    var admin = false, selected = null;

    function load(k) { try { var v = JSON.parse(localStorage.getItem(k)); return v && v.desktop ? v : null; } catch (e) { return null; } }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch (e) {} }
    // which layout is being edited follows the window: a phone-sized one (520px or narrower, the browser's device mode included) edits the phone layout
    function mode() { return PHONE.matches ? 'phone' : 'desktop'; }
    // the file's layout, with the draft over it while the admin is on (off, the page shows the file's layout alone)
    function merged() {
        var out = { _about: file._about, desktop: {}, phone: {} };
        ['desktop', 'phone'].forEach(function (m) {
            Object.keys(file[m] || {}).forEach(function (k) { out[m][k] = Object.assign({}, file[m][k]); });
            if (admin) Object.keys(draft[m] || {}).forEach(function (k) { out[m][k] = Object.assign({}, out[m][k] || {}, draft[m][k]); });
        });
        return out;
    }
    var hero = function () { return document.querySelector('.hero .desk'); };
    var page = function () { return document.getElementById('marginDesk'); };
    function items() { return document.querySelectorAll('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id]'); }
    function homeZone(el) { return /^scene-/.test(el.dataset.id) ? 'scene' : /^margin-/.test(el.dataset.id) ? 'page' : 'hero'; }
    function zoneOf(el) { return el.closest('.scene-desk') ? 'scene' : el.closest('#marginDesk') ? 'page' : 'hero'; }
    // a desk scene is drawn on a 1600px canvas and scaled to fit; its things are placed in those px
    function sceneScale(el) { var host = el.closest('.desktop'); return host ? (parseFloat(host.style.getPropertyValue('--desk-scale')) || host.clientWidth / 1600) : 1; }
    function entryFor(el) { return merged()[mode()][el.dataset.id]; }
    function draftFor(el) { var set = draft[mode()]; return set[el.dataset.id] || (set[el.dataset.id] = {}); }
    function anchorCentre(el) { return el.dataset.anchor ? el.dataset.anchor === 'centre' : true; }

    // ---- placing everything from the layout ----
    function place(el, e) {
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
        var L = merged()[mode()];
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
            .then(function (r) { if (!r.ok) throw new Error(); file = L; draft = { desktop: {}, phone: {} }; try { localStorage.removeItem(KEY); } catch (e) {} })
            .catch(function () { save(); });
    }
    function openPanel() {
        document.documentElement.classList.add('admin');
        document.querySelectorAll('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id], .hero .desk [data-id] img, #marginDesk [data-id] img, .scene-desk [data-id] img').forEach(function (a) { a.setAttribute('draggable', 'false'); });
        document.addEventListener('keydown', function (ev) {
            if ((ev.key === 'Delete' || ev.key === 'Backspace') && selected && selected.isConnected) {
                ev.preventDefault(); var d = draftFor(selected); d.hide = true; apply(); persist(); selected = null;
            }
        });
    }

    // ---- dragging: anywhere on the page. Leaving the hero puts a thing on the page layer, and the other way round ----
    var drag = null;
    function target(ev) { if (!admin) return null; return ev.target.closest && ev.target.closest('.hero .desk [data-id], #marginDesk [data-id], .scene-desk [data-id]'); }
    function anchorPoint(el) { var r = el.getBoundingClientRect(); return anchorCentre(el) ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: r.left, y: r.top }; }
    document.addEventListener('pointerdown', function (ev) {
        var t = target(ev); if (!t || ev.button !== 0) return;
        ev.preventDefault(); ev.stopPropagation();
        var a = anchorPoint(t);
        drag = { el: t, dx: ev.clientX - a.x, dy: ev.clientY - a.y, moved: false, zone: zoneOf(t) };
        if (selected) selected.classList.remove('admin-selected');
        selected = t; t.classList.add('admin-selected'); status();
        try { t.setPointerCapture(ev.pointerId); } catch (e) {}
    }, true);
    document.addEventListener('pointermove', function (ev) {
        if (!drag) return;
        var el = drag.el, d = draftFor(el);
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
    fetch('hero-layout.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (j && j.desktop) file = { _about: j._about, desktop: j.desktop || {}, phone: j.phone || {} };
    }).catch(function () {}).then(function () {
        apply();
        if (admin) openPanel();
        var onChange = function () { selected = null; apply(); };
        (PHONE.addEventListener ? PHONE.addEventListener('change', onChange) : PHONE.addListener(onChange));
    });
})();
