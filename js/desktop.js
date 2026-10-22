// The desktops, working, inside the page, one per frame the deck shows: the same parts as the desktop-voyeur
// site and the same behaviour, duplicated from its main.js so this folder stands
// on its own. Folders open the desktop's folder window over the blurred overlay;
// a picture (a thumbnail on the desk, or a file in a folder) opens the lightbox;
// the X on a picture window closes it; Esc, the overlay or a click on the empty
// desk closes everything; the desktop's own open and close tones play.
(function () {
    var ZOOM = 1.2, BAR = 48;
    var THUMBS = 'img/thumbs/', FACES = 'img/avatars/', FOLDER = 'img/icons/folder.png';
    var CLOSE = '<svg viewBox="0 0 10 10"><path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5"/></svg>';
    var CURSOR = '<svg viewBox="0 0 24 30" fill="#FFFFFF" stroke="#17111A" stroke-width="1.4" stroke-linejoin="round"><path d="M2 2 L2 24 L8 18.5 L12 27 L16 25.2 L12.2 17 L20 17 Z"/></svg>';
    // the found pictures: the thumb's file, the name its window shows, and its shape
    var PIC = {
        '00': ['00005-3114799947.png', 800, 600], '01': ['00137-2557897375.png', 600, 800], '02': ['1ae111ac-ad9a-4cdb.png', 800, 547], '03': ['2025-12-29-073550.png', 800, 480],
        '04': ['2026-02-24-201537_prefect.png', 600, 800], '06': ['4d405574-a120-45af.png', 800, 800], '08': ['a-woo.jpg', 800, 800], '10': ['a81cd40b-328d-49dd.png', 800, 533],
        '11': ['b344f719-82c0-464f.png', 480, 800], '12': ['bodyguard 1.png', 514, 800], '13': ['c2c96d44-1e1a-4f67.png', 800, 533], '14': ['c7d61dfd-dc69-4328.png', 533, 800],
        '15': ['f66d83d4-b598-47da.png', 800, 450], '16': ['god_why.jpg', 800, 800], '17': ['kitty_cat.jpg', 800, 800], '20': ['popping_a_squat.jpg', 800, 800],
        '22': ['SPOILER_view.png', 600, 800], '23': ['why_is_there_lime_on_the_stew.jpg', 800, 800], '24': ['00063-2713696236.png', 1344, 1728]
    };
    // the desks, the frames the deck shows; each one a working desktop
    var folder = function (id, label, x, y) { return { folder: id, label: label, x: x, y: y }; };
    // a thread on a desk: its label and faces as the deck drew them, plus the archive thread it opens (js/hero.js) and its chapter
    var thread = function (label, meta, faces, x, y, id, chapter) { return { label: label, meta: meta, faces: faces, x: x, y: y, id: id, chapter: chapter }; };
    var pic = function (t, x, y, w) { return { t: t, x: x, y: y, w: w }; };
    // one of Delta's clips on a desk: the site's interview icon, opening the recording (js/hero.js)
    var clip = function (id, chapter, topic, x, y) { return { clip: id, chapter: chapter, topic: topic, x: x, y: y }; };
    // a found bot's character file (archive-desktop/character-data), with its pixel face; opens the JSON (js/hero.js)
    // a bot request: the thread (or the post) it was made in; with its picture when it has one, by name alone otherwise
    var request = function (id, label, x, y, thumb, post) { return { req: id, label: label, thumb: thumb, post: !!post, x: x, y: y }; };
    var char = function (file, face, name, x, y, label) { return { char: file, face: face, name: name, x: x, y: y, label: label }; };   // label: shown instead of the file's name
    // a diary entry (content/api/diary.json), the desktop's notebook; opens the entry as a note (js/hero.js)
    var entry = function (slug, date, x, y) { return { entry: slug, date: date, x: x, y: y }; };
    // a window open on the desk showing the start of a character file, or of a diary entry; click for the whole thing
    var codewin = function (file, x, y, w) { return { code: file, x: x, y: y, w: w }; };
    var notewin = function (slug, date, x, y, w) { return { note: slug, date: date, x: x, y: y, w: w }; };
    var LAYOUTS = {
        // the bot requests desktop: the chapter folders, threads, five pictures open
        requests: {
            rest: [900, 335],
            icons: [folder('bot-requests', 'bot requests', 180, 118), folder('bot-makers', 'bot makers', 970, 126), folder('the-craft', 'the craft', 1124, 752),
                thread('catharsis or reinforcement', '1 message', ['face-09'], 684, 235, 'two-theories-of-escape', 'user'), thread('pacing the romance', '2 messages', ['face-07'], 1455, 97, 'rules-on-behalf-of-user', 'craft'),
                thread('making bots at 2am', '4 messages', ['face-012', 'face-02', 'face-015'], 1500, 300, 'making-bots-at-2am', 'bot-makers'), thread('simulating a breakup', '3 messages', ['face-03', 'face-05'], 985, 530, 'simulating-a-breakup', 'craft'),
                thread('philosophy on hobbies', '7 messages', ['face-01', 'face-017', 'face-021', 'face-09'], 189, 760, 'dont-care-if-good', 'bot-makers')],
            pics: [pic('00', 193, 264, 327), pic('20', 273, 369, 222), pic('14', 507, 419, 195), pic('16', 1162, 298, 201), pic('01', 1266, 436, 222)]
        },
        // the craft desktop: four pictures among the folders
        craft: {
            rest: [280, 344],
            icons: [thread('facial expression is critical', '3 messages', ['face-07'], 208, 112, 'facial-expression-is-critical', 'craft'), clip('delta-psychology', 'craft', 'what hooked her', 1180, 120), folder('bot-makers', 'bot makers', 896, 320), thread('what the bots replaced', '3 messages', ['face-07'], 1408, 376, 'what-porn-was-filling', 'user'),
                folder('the-craft', 'the craft', 235, 656), thread('rude bots', '4 messages', ['face-09', 'face-05'], 752, 656, 'rude-bots', 'craft'), folder('the-user', 'the {{user}}', 1032, 704)],
            pics: [pic('12', 480, 144, 208), pic('17', 429, 360, 208), pic('24', 1080, 328, 221), pic('08', 1240, 560, 205)]
        },
        // the hoard: fifteen pictures covering the desk
        hoard: {
            rest: [1288, 360],
            icons: [],
            pics: [pic('23', 60, 70, 420), pic('12', 1190, 20, 300), pic('16', 470, 40, 170), pic('22', 30, 430, 330), pic('11', 1040, 110, 230),
                pic('00', 920, 450, 560), pic('15', 1330, 600, 220), pic('10', 600, 130, 380), pic('17', 1460, 300, 140), pic('03', 540, 650, 330),
                pic('06', 780, 20, 160), pic('02', 330, 250, 260), pic('04', 1250, 330, 250), pic('20', 440, 520, 200), pic('13', 640, 300, 440)]
        },
        // seven windows on the empty desk
        windows: {
            icons: [],
            pics: [pic('03', 125, 419, 208), pic('12', 477, 141, 208), pic('01', 528, 352, 211), pic('22', 848, 232, 208), pic('20', 1104, 72, 208), pic('00', 1120, 419, 312), pic('08', 1232, 560, 208)]
        }
    };
    // what each folder holds (the site's folderContents): the found pictures of that chapter
    var FOLDERS = {
        'bot-requests': { title: 'bot requests', path: 'bot requests', files: ['00', '20', '14', '16', '01'] },
        'bot-makers':   { title: 'bot makers',   path: 'bot makers',   files: ['12', '17', '24', '08'] },
        'the-craft':    { title: 'the craft',    path: 'the craft',    files: ['23', '12', '16', '22', '11', '00', '15', '10', '17', '03', '06', '02', '04', '20', '13'] },
        'the-user':     { title: 'the {{user}}', path: 'the user',     files: ['03', '22', '04', '23', '08'] }
    };

    // ---- the desktop's sounds (main.js: getAudio, tone, rtone, playSound) ----
    var audioCtx = null;
    function getAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
    function tone(freq, startTime, attack, sustain, release, volume, detune) {
        var ctx = getAudio(), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq; if (detune) osc.detune.value = detune;
        osc.connect(gain); gain.connect(ctx.destination);
        var peak = startTime + attack;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(volume, peak);
        if (sustain > 0) gain.gain.setValueAtTime(volume, peak + sustain);
        gain.gain.exponentialRampToValueAtTime(0.0001, peak + sustain + release);
        osc.start(startTime); osc.stop(peak + sustain + release + 0.1);
    }
    function rtone(freq, startTime, attack, sustain, release, volume, detune) {
        tone(freq, startTime, attack, sustain, release, volume, detune);
        tone(freq, startTime + 0.15, attack * 0.8, 0, release * 0.7, volume * 0.22, detune);
        tone(freq, startTime + 0.35, attack * 0.6, 0, release * 0.5, volume * 0.07, detune);
    }
    function playSound(type) {
        var t;
        try { t = getAudio().currentTime; } catch (e) { return; }
        if (type === 'open') { rtone(523.25, t, 0.06, 0, 1.0, 0.044); rtone(659.25, t + 0.10, 0.06, 0, 0.9, 0.037); rtone(783.99, t + 0.20, 0.06, 0, 1.1, 0.031); }
        else if (type === 'close') { rtone(783.99, t, 0.05, 0, 0.75, 0.031); rtone(659.25, t + 0.09, 0.05, 0, 0.70, 0.026); rtone(523.25, t + 0.18, 0.05, 0, 0.85, 0.022); }
        else if (type === 'folder') { rtone(440.00, t, 0.07, 0, 0.85, 0.040); rtone(554.37, t + 0.12, 0.06, 0, 0.95, 0.032); }
    }

    // ---- the windows (main.js: setOverlay, openFolder, closeFolder, openLightbox, closeLightbox, closeAllWindows) ----
    var overlay = document.getElementById('desktopOverlay'), folderWindow = document.getElementById('folderWindow'), lightbox = document.getElementById('lightbox');
    var threadWindow = document.getElementById('threadWindow');
    // while a window is open the page behind holds still (on a phone a swipe on the sheet would scroll it otherwise)
    var lockedAt = null;
    function setOverlay(visible) {
        overlay.classList.toggle('active', visible);
        var html = document.documentElement;
        if (visible && lockedAt === null) { lockedAt = window.scrollY; html.classList.add('modal-open'); document.body.style.top = -lockedAt + 'px'; }
        else if (!visible && lockedAt !== null) { html.classList.remove('modal-open'); document.body.style.top = ''; window.scrollTo(0, lockedAt); lockedAt = null; }
    }
    function openFolder(id) {
        var folder = FOLDERS[id]; if (!folder) return;
        closeAllWindows(true);
        document.getElementById('folderTitle').textContent = folder.title;
        var list = document.getElementById('folderList'); list.innerHTML = '';
        folder.files.forEach(function (t) {
            var item = document.createElement('div');
            item.className = 'folder-item';
            item.innerHTML = '<div class="item-main"><span class="item-name"></span></div>';
            item.querySelector('.item-name').textContent = PIC[t][0];
            item.onclick = function () { openLightbox(THUMBS + t + '.jpg'); };
            list.appendChild(item);
        });
        document.getElementById('folderPath').textContent = '/users/shakti/' + folder.path + '/';
        document.getElementById('folderStatus').textContent = folder.files.length + ' item' + (folder.files.length === 1 ? '' : 's');
        folderWindow.classList.remove('archive');
        folderWindow.classList.add('active');
        playSound('open'); setOverlay(true);
    }
    function closeFolder() { if (!folderWindow.classList.contains('active')) return; folderWindow.classList.remove('active'); playSound('close'); setOverlay(false); }
    function openLightbox(src) { document.getElementById('lightboxImg').src = src; lightbox.classList.add('active'); playSound('open'); }
    function closeLightbox() { if (!lightbox.classList.contains('active')) return; lightbox.classList.remove('active'); document.getElementById('lightboxImg').src = ''; playSound('close'); }
    function closeAllWindows(quiet) {
        var open = folderWindow.classList.contains('active') || lightbox.classList.contains('active') || (threadWindow && threadWindow.classList.contains('active'));
        folderWindow.classList.remove('active'); lightbox.classList.remove('active'); document.getElementById('lightboxImg').src = '';
        if (threadWindow) threadWindow.classList.remove('active');
        setOverlay(false);
        if (open && !quiet) playSound('close');
    }
    window.closeFolder = closeFolder; window.closeLightbox = closeLightbox; window.closeAllWindows = closeAllWindows;
    window.deskSound = playSound; window.deskOverlay = setOverlay;   // the hero's own windows (js/hero.js) use the same
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllWindows(); });

    // ---- an icon on a desk: folder, thread, Delta's clip, a character file, a diary entry ----
    var DIARY_ICON = 'archive-desktop/img/icons/diary-book.png', FACE = 'archive-desktop/img/face/';
    function makeIcon(ic) {
        var el = document.createElement('div');
        el.className = 'desktop-icon' + (ic.folder ? ' folder' : ic.clip ? ' interview-icon' : ic.char ? ' char-file-icon' : ic.entry ? ' note-icon' : ' thread');
        if (ic.clip) {
            el.innerHTML = '<img src="archive-desktop/img/anime-bitmap/delta.png" class="portrait-icon" alt=""><span class="label">Delta</span><div class="meta-group"><span class="meta">ex-bot maker</span></div><span class="topic"></span><span class="play-pill"><svg width="7" height="9" viewBox="0 0 7 9" fill="currentColor" style="display:block;flex-shrink:0"><path d="M0 0 L7 4.5 L0 9 Z"/></svg>play</span>';
            el.querySelector('.topic').textContent = ic.topic;
            el.addEventListener('click', function (e) { e.stopPropagation(); if (window.openArchiveInterview) window.openArchiveInterview(ic.clip, ic.chapter, el); });
        } else if (ic.req) {
            el.innerHTML = (ic.thumb ? '<div class="icon img-thumb"><img src="archive-desktop/' + ic.thumb + '" alt=""></div>' : '') + '<span class="label"></span><div class="meta-group"><span class="meta">bot request</span></div>';
            el.querySelector('.label').textContent = ic.label;
            if (!ic.thumb) el.classList.add('no-icon');
            el.addEventListener('click', function (e) { e.stopPropagation(); if (ic.post) { if (window.openArchivePost) window.openArchivePost(ic.req, ic.label); } else if (window.openArchiveThread) window.openArchiveThread(ic.req, 'bot-requests'); });
        } else if (ic.char) {
            el.innerHTML = (ic.face ? '<div class="icon pixel-icon"><img src="' + FACE + ic.face + '.png" alt=""></div>' : '') + '<span class="label"></span><div class="meta-group"><span class="meta"></span></div>';
            if (!ic.face) el.classList.add('no-icon');
            el.querySelector('.label').textContent = ic.label || (ic.char + '.json');
            el.querySelector('.meta').textContent = ic.name;
            el.addEventListener('click', function (e) { e.stopPropagation(); if (window.openArchiveCharacter) window.openArchiveCharacter(ic.char, ic.char + '.json', ic.name); });
        } else if (ic.entry) {
            el.innerHTML = '<img src="' + DIARY_ICON + '" class="portrait-icon" alt=""><span class="label">My diary</span>';
            el.addEventListener('click', function (e) { e.stopPropagation(); if (window.openArchiveDiary) window.openArchiveDiary(ic.entry); });
        } else if (ic.folder) {
            el.innerHTML = '<div class="icon"><img src="' + FOLDER + '" alt=""></div><span class="label"></span>';
            el.querySelector('.label').textContent = ic.label;
            el.addEventListener('click', function (e) { e.stopPropagation(); openFolder(ic.folder); });
        } else {
            el.innerHTML = '<div class="msg-avatar-stack">' + ic.faces.map(function (f) { return '<img src="' + FACES + f + '.jpg" class="msg-avatar-circle" alt="">'; }).join('') + '</div><span class="label"></span><div class="meta-group"><span class="meta"></span></div>';
            el.querySelector('.label').textContent = ic.label;
            el.querySelector('.meta').textContent = ic.meta;
            if (ic.id) el.addEventListener('click', function (e) { e.stopPropagation(); if (window.openArchiveThread) window.openArchiveThread(ic.id, ic.chapter); });
        }
        return el;
    }
    // a picture open in a window: the file's name in the bar, the lightbox on click, the X closes it
    function makePicWin(t) {
        var meta = PIC[t], win = document.createElement('div');
        win.className = 'win';
        win.innerHTML = '<div class="bar"><span class="name"></span><button class="close" type="button" aria-label="close">' + CLOSE + '</button></div><img src="' + THUMBS + t + '.jpg" alt="" loading="lazy">';
        win.querySelector('.name').textContent = meta[0];
        win.querySelector('.close').addEventListener('click', function (e) { e.stopPropagation(); win.classList.add('closed'); playSound('close'); });
        win.querySelector('img').addEventListener('click', function (e) { e.stopPropagation(); openLightbox(THUMBS + t + '.jpg'); });
        win.addEventListener('click', function (e) { e.stopPropagation(); });
        return win;
    }
    // a window on the desk holding the start of a file: a character's JSON, or a diary entry; the whole thing on click
    function makeFileWin(w) {
        var win = document.createElement('div');
        win.className = 'win ' + (w.code ? 'code' : 'note');
        win.innerHTML = '<div class="bar"><span class="name"></span><button class="close" type="button" aria-label="close">' + CLOSE + '</button></div>' + (w.code ? '<pre class="text"></pre>' : '<div class="text"></div>');
        win.querySelector('.name').textContent = w.code ? w.code + '.json' : 'My diary \u00b7 ' + w.date;
        win.querySelector('.close').addEventListener('click', function (e) { e.stopPropagation(); win.classList.add('closed'); playSound('close'); });
        win.addEventListener('click', function (e) {
            e.stopPropagation();
            if (w.code && window.openArchiveCharacter) window.openArchiveCharacter(w.code, w.code + '.json', '');
            if (w.note && window.openArchiveDiary) window.openArchiveDiary(w.note);
        });
        var text = win.querySelector('.text');
        if (w.code) fetch('archive-desktop/character-data/' + w.code + '.json').then(function (r) { return r.json(); }).then(function (d) {
            text.textContent = JSON.stringify(d, null, 2).split('\n').slice(0, 16).join('\n') + '\n  \u2026';
        }).catch(function () {});
        else fetch('content/api/diary.json').then(function (r) { return r.json(); }).then(function (list) {
            var e = list.filter(function (x) { return x.slug === w.note; })[0]; if (!e) return;
            var paras = e.content.replace(/\*\*|~~|==/g, '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
            var out = '', i = 0; while (i < paras.length && out.length < 380) { out += (out ? '\n\n' : '') + paras[i++]; }
            if (out.length > 420) out = out.slice(0, 420).replace(/\s+\S*$/, '') + ' \u2026'; else if (i < paras.length) out += ' \u2026';
            text.textContent = out;
        }).catch(function () {});
        return win;
    }

    // ---- the desks ----
    var PHONE = matchMedia('(max-width: 700px)');
    function build(host) {
        var L = LAYOUTS[host.dataset.layout]; if (!L) return;
        host.innerHTML = '';
        if (PHONE.matches) return buildPhone(host, L);
        host.classList.remove('mobile');
        var desk = document.createElement('div'); desk.className = 'scene-desk'; host.appendChild(desk);
        var place = function (el, x, y) { el.style.left = Math.round(x / ZOOM) + 'px'; el.style.top = Math.round(y / ZOOM) + 'px'; };
        var scene = host.dataset.layout;
        L.icons.forEach(function (ic, i) { var el = makeIcon(ic); el.dataset.id = 'scene-' + scene + '-icon-' + i; el.dataset.anchor = 'centre'; place(el, ic.x, ic.y); desk.appendChild(el); });
        (L.wins || []).forEach(function (w, i) {
            var win = makeFileWin(w);
            win.dataset.id = 'scene-' + scene + '-window-' + (w.code || w.note); win.dataset.anchor = 'left';
            win.style.cssText = 'left:' + w.x + 'px; top:' + w.y + 'px; width:' + w.w + 'px; z-index:' + (10 + i) + ';';
            desk.appendChild(win);
        });
        // the pictures sit on the desk as files, each under the middle of its window, the window open over it
        var top = 10 + L.pics.length;   // the front-most window on this desk
        L.pics.forEach(function (p, i) {
            var meta = PIC[p.t], win;
            var th = document.createElement('div');
            th.className = 'desktop-icon';
            th.innerHTML = '<div class="icon img-thumb"><img src="' + THUMBS + p.t + '.jpg" alt=""></div><span class="label"></span>';
            th.querySelector('.label').textContent = meta[0];
            th.dataset.id = 'scene-' + scene + '-file-' + p.t; th.dataset.anchor = 'centre';
            // the file opens its own window on the desk (or brings it to the front if it is already open)
            th.addEventListener('click', function (e) {
                e.stopPropagation();
                if (win.classList.contains('closed')) { win.classList.remove('closed'); playSound('open'); }
                win.style.zIndex = ++top;
            });
            place(th, p.x + p.w / 2, p.y + (BAR + p.w * meta[2] / meta[1]) / 2 - 14); desk.appendChild(th);
            win = document.createElement('div');
            win.className = 'win';
            win.dataset.id = 'scene-' + scene + '-picture-' + p.t; win.dataset.anchor = 'left';
            win.style.cssText = 'left:' + p.x + 'px; top:' + p.y + 'px; width:' + p.w + 'px; z-index:' + (10 + i) + ';';
            win.innerHTML = '<div class="bar"><span class="name"></span><button class="close" type="button" aria-label="close">' + CLOSE + '</button></div><img src="' + THUMBS + p.t + '.jpg" alt="">';
            win.querySelector('.name').textContent = meta[0];
            win.querySelector('.close').addEventListener('click', function (e) { e.stopPropagation(); win.classList.add('closed'); playSound('close'); });
            win.querySelector('img').addEventListener('click', function (e) { e.stopPropagation(); openLightbox(THUMBS + p.t + '.jpg'); });
            win.addEventListener('click', function (e) { e.stopPropagation(); });
            desk.appendChild(win);
        });
        if (L.rest) {
            var sim = document.createElement('div'); sim.className = 'sim on'; sim.innerHTML = CURSOR; sim.setAttribute('aria-hidden', 'true');
            sim.style.left = L.rest[0] + 'px'; sim.style.top = L.rest[1] + 'px'; desk.appendChild(sim);
        }
        wire(host);
        var fit = function () {
            if (!desk.isConnected) return;
            var s = host.clientWidth / 1600;
            desk.style.transform = 'scale(' + s + ')';
            host.style.setProperty('--desk-scale', s);   // the icons' type divides this back out (landing.css)
        };
        if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host); else addEventListener('resize', fit);
        fit();
    }
    function wire(host) {
        if (host.dataset.wired) return; host.dataset.wired = '1';
        host.addEventListener('click', function () { closeAllWindows(); });   // the empty desk closes everything, as the site's does
    }
    // the same desk on a phone: the pictures as windows in two columns at a size you can see, the folders, threads
    // and Delta's clip between them, the scene as tall as it needs; the first picture of a scene gets the full width
    function buildPhone(host, L) {
        host.classList.add('mobile');
        host.innerHTML = '';
        var desk = document.createElement('div'); desk.className = 'scene-desk'; host.appendChild(desk);
        var icons = L.icons.slice(), pics = L.pics.slice(), wins = (L.wins || []).slice(), cells = [];
        // pictures (or file windows) and icons take turns: one window, then two icons, until all run out
        while (pics.length || icons.length || wins.length) {
            if (pics.length) cells.push({ pic: pics.shift() }); else if (wins.length) cells.push({ win: wins.shift() });
            if (icons.length) cells.push({ icon: icons.shift() });
            if (icons.length) cells.push({ icon: icons.shift() });
        }
        var first = true;
        // a desk, not a grid: each thing nudged off its cell a little, and each icon pulled toward one side or the other
        var seed = 0; for (var si = 0; si < host.dataset.layout.length; si++) seed = (seed * 31 + host.dataset.layout.charCodeAt(si)) | 0;
        var rnd = function (i, k) { var h = Math.sin(seed + i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); };   // the same every time, different per thing
        var dishevel = function (node, i, isWin) {
            var side = isWin ? 'center' : ['start', 'center', 'end'][Math.floor(rnd(i, 3) * 3)];
            var dx = (rnd(i, 1) - 0.5) * (isWin ? 24 : side === 'center' ? 70 : 20), dy = (rnd(i, 2) - 0.5) * (isWin ? 30 : 56);   // pulled to a side already: only a small nudge, so it stays on screen
            node.style.transform = 'translate(' + Math.round(dx) + 'px, ' + Math.round(dy) + 'px)';
            if (!isWin) node.style.justifySelf = side;
        };
        cells.forEach(function (c, ci) {
            if (c.pic) {
                var p = c.pic, meta = PIC[p.t];
                var win = document.createElement('div');
                win.className = 'win';   // never the full width: a picture keeps to its column, as a window on a desk would
                win.innerHTML = '<div class="bar"><span class="name"></span><button class="close" type="button" aria-label="close">' + CLOSE + '</button></div><img src="' + THUMBS + p.t + '.jpg" alt="" loading="lazy">';
                win.querySelector('.name').textContent = meta[0];
                win.querySelector('.close').addEventListener('click', function (e) { e.stopPropagation(); win.classList.add('closed'); playSound('close'); });
                win.querySelector('img').addEventListener('click', function (e) { e.stopPropagation(); openLightbox(THUMBS + p.t + '.jpg'); });
                win.addEventListener('click', function (e) { e.stopPropagation(); });
                dishevel(win, ci, true);
                desk.appendChild(win);
                return;
            }
            if (c.win) { desk.appendChild(makeFileWin(c.win)); return; }
            var icon = makeIcon(c.icon); dishevel(icon, ci, false); desk.appendChild(icon);
        });
        wire(host);
    }
    // ---- the margins of the lower sections: the archive desk's things, left and right of the windows, as the hero's icons sit round the title ----
    // x is of the page width, y of the main column below the hero; icons centre on the point, windows hang from it, anchored to their side
    var MARGIN = [
        { id: 'thread-making-bots', icon: thread('making bots at 2am', '4 messages', ['face-012', 'face-02', 'face-015'], 0, 0, 'making-bots-at-2am', 'bot-makers'), x: '6.5%', y: '62.7%' },
        { id: 'clip-delta-demon', icon: clip('delta-demon', 'bot-makers', 'the word demon', 0, 0), x: '93.5%', y: '62.3%' },
        { id: 'folder-bot-requests', icon: folder('bot-requests', 'bot requests', 0, 0), x: '6.5%', y: '73.5%' },
        { id: 'file-ossix', icon: char('experiment_0682', 'experiment_0682', 'Ossix Ayto', 0, 0), x: '93.5%', y: '74.3%' },
        { id: 'picture-stew', pic: '23', side: 'left', y: '80.7%' },
        { id: 'picture-dragon', pic: '04', side: 'right', y: '79.9%' },
        { id: 'file-minho', icon: char('loving_korean_boyfriend', null, 'JSON', 0, 0, 'loving korean boyfriend'), x: '93.5%', y: '91.2%' },   // its name alone, no face,
        // more of the found bots, by name alone, beside the overview and the teaser
        { id: 'file-victoria', icon: char('evil_bully_wife', null, 'JSON', 0, 0, 'evil bully wife'), x: '6.5%', y: '4%' },
        { id: 'file-eleanor', icon: char('rich_dommy_mommy', null, 'JSON', 0, 0, 'rich dommy mommy'), x: '93.5%', y: '9%' },
        { id: 'file-luna', icon: char('mental_chastity_girlfriend', null, 'JSON', 0, 0, 'mental chastity girlfriend'), x: '6.5%', y: '22%' },
        { id: 'file-priest', icon: char('judgemental_priest', null, 'JSON', 0, 0, 'judgemental priest'), x: '93.5%', y: '26%' },
        { id: 'file-parents', icon: char('mentally_unwell_dad_and_stressed_mom', null, 'JSON', 0, 0, 'mentally unwell dad & stressed mom'), x: '6.5%', y: '40%' },
        // two more threads from the bot makers, and three requests
        { id: 'thread-breached-400k', icon: thread('top bots breached 400K', '1 message', ['face-021'], 0, 0, 'breached-400k', 'bot-makers'), x: '93.5%', y: '44%' },
        { id: 'thread-voice-chat', icon: thread('scared to join the voice chat', '8 messages', ['face-09', 'face-017'], 0, 0, 'scared-to-join-voice-chat', 'bot-makers'), x: '6.5%', y: '52%' },
        { id: 'request-costume-shop', icon: request('haunted-costume-shop', 'haunted costume shop', 0, 0), x: '93.5%', y: '15%' },
        { id: 'request-succubus', icon: request('succubus-better-person', 'a succubus who tempts you to be a better person', 0, 0), x: '93.5%', y: '34%' }
    ];
    // on a screen with no margins (under 1024px), the margins' things go between the window sections instead: a few
    // after the overview, after the teaser, after the team and after the support stack, each group a small desk flow
    var NARROW = matchMedia('(max-width: 1023px)');
    function buildStrips() {
        document.querySelectorAll('.desktop.strip').forEach(function (s) { s.remove(); });
        if (!NARROW.matches) return;
        var after = ['top', 'overview', 'teaser', 'team', 'notes'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
        if (!after.length) return;
        // everything that scatters: the margins' things and the desk scenes' (the scenes themselves stay off a phone),
        // pictures and icons each dealt out evenly, so no strip is all pictures and none all text
        var pics = [], icons = [];
        MARGIN.forEach(function (m) { if (m.pic) pics.push(m.pic); else if (m.icon) icons.push(m.icon); });
        ['craft', 'windows'].forEach(function (k) { var L = LAYOUTS[k]; if (!L) return; L.pics.forEach(function (p) { if (pics.indexOf(p.t) < 0) pics.push(p.t); }); L.icons.forEach(function (ic) { icons.push(ic); }); });
        var groups = after.map(function () { return { icons: [], pics: [], wins: [] }; });
        pics.forEach(function (t, i) { groups[i % groups.length].pics.push(pic(t, 0, 0, 230)); });
        icons.forEach(function (ic, i) { groups[(i + 2) % groups.length].icons.push(ic); });
        after.forEach(function (sec, i) {
            var host = document.createElement('div'); host.className = 'desktop strip'; host.dataset.layout = 'strip-' + i;
            sec.insertAdjacentElement('afterend', host);
            buildPhone(host, groups[i]);
        });
    }
    function buildMargin() {
        var host = document.getElementById('marginDesk'); if (!host) return;
        host.innerHTML = '';
        MARGIN.forEach(function (m) {
            var el = m.icon ? makeIcon(m.icon) : m.pic ? makePicWin(m.pic) : makeFileWin(m.win);
            el.dataset.id = 'margin-' + m.id; el.dataset.anchor = m.icon ? 'centre' : 'left';   // how a layout's x places it (js/admin.js)
            el.style.top = m.y; el.dataset.homeY = m.y;
            if (m.icon) { el.style.left = m.x; el.dataset.homeX = m.x; } else { el.style[m.side] = '1.5%'; el.dataset.homeSide = m.side; }
            host.appendChild(el);
        });
    }
    buildMargin();
    var hosts = document.querySelectorAll('.desktop[data-layout]:not(.strip)');
    hosts.forEach(build);
    buildStrips();
    (NARROW.addEventListener ? NARROW.addEventListener('change', buildStrips) : NARROW.addListener(buildStrips));
    // crossing the phone width rebuilds the desks the other way
    var rebuild = function () { hosts.forEach(build); if (window.applyLayout) window.applyLayout(); };
    (PHONE.addEventListener ? PHONE.addEventListener('change', rebuild) : PHONE.addListener(rebuild));
})();
