// The icons round the title open in place, the way the site's desktop does: a chapter folder opens the folder
// window with that chapter's items from the site's manifest; a thread, or a bot request, opens its messages in a
// window of the same chrome. The data is the site's own, read from archive-desktop (chat/*.json, desktop-labels.json,
// desktop-layout.js for what each manifest key is, bot-requests/posts.json). The windows, sounds and overlay are
// desktop.js's. Without JS the icons are plain links into the site, which they stay as a fallback.
(function () {
    var SITE = 'archive-desktop/';
    var AVATARS = 'content/img/discord%20avatars/';
    var POOL = ['discord-avatar-01.jpg', 'discord-avatar-02.jpg', 'discord-avatar-03.jpg', 'discord-avatar-04.jpg', 'discord-avatar-05.jpg', 'discord-avatar-06.jpg',
        'discord-avatar-07.jpg', 'discord-avatar-08.jpg', 'discord-avatar-09.png', 'discord-avatar-010.png', 'discord-avatar-011.png', 'discord-avatar-012.png',
        'discord-avatar-013.png', 'discord-avatar-014.png', 'discord-avatar-015.png', 'discord-avatar-016.png', 'discord-avatar-017.png', 'discord-avatar-018.png',
        'discord-avatar-019.png', 'discord-avatar-020.png', 'discord-avatar-021.webp', 'discord-avatar-022.webp'];
    var THEMES = ['bot-requests', 'bot-makers', 'craft', 'community', 'user', 'margins', 'misc'];
    var CHAPTERS = { 'bot-requests': 'bot requests', 'bot-makers': 'the bot makers', 'craft': 'the craft', 'user': 'the {{user}}' };
    var HIDDEN = { 'msg-cant-fuck-this-bot': 1, 'diary-notepad-discourse': 1 };   // left out of this site, as its index.html does

    var folderWindow = document.getElementById('folderWindow'), threadWindow = document.getElementById('threadWindow');
    var sound = function (t) { if (window.deskSound) window.deskSound(t); };
    var overlay = function (v) { if (window.deskOverlay) window.deskOverlay(v); };
    var esc = function (v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
    var enc = function (p) { return String(p).replace(/ /g, '%20'); };
    var el = function (html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

    // ---- the site's data, fetched once ----
    var cache = {};
    function getJSON(url) { return cache[url] || (cache[url] = fetch(url).then(function (r) { return r.json(); })); }
    function threads() {
        return cache.threads || (cache.threads = Promise.all(THEMES.map(function (t) {
            return getJSON(SITE + 'chat/' + t + '.json').catch(function () { return []; });
        })).then(function (lists) {
            var map = {};
            lists.forEach(function (list) { list.forEach(function (t) { map[t.id] = t; }); });
            return map;
        }));
    }
    function manifest() { return getJSON(SITE + 'desktop-labels.json').catch(function () { return {}; }); }
    function getText(url) { return cache['t:' + url] || (cache['t:' + url] = fetch(encodeURI(url)).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })); }
    // the diary entries this site has (content/api/diary.json), by slug
    function diaryEntries() {
        return cache.diary || (cache.diary = getJSON('content/api/diary.json').then(function (list) {
            var map = {}; list.forEach(function (e) { map[e.slug] = e; }); return map;
        }).catch(function () { return {}; }));
    }
    function diarySlugs() { return diaryEntries(); }
    // Delta's clips: a question of mine and her answer, both recorded; only her answer plays here, as on the site
    function interviews() {
        return cache.interviews || (cache.interviews = getJSON(SITE + 'interviews/delta.json').then(function (list) {
            var map = {}; list.forEach(function (t) { map[t.id] = t; }); return map;
        }).catch(function () { return {}; }));
    }
    function posts() {
        return cache.posts || (cache.posts = getJSON(SITE + 'bot-requests/posts.json').then(function (list) {
            var map = {}; list.forEach(function (p) { map[p.id] = p; }); return map;
        }).catch(function () { return {}; }));
    }
    // desktop-layout.js: what each manifest key is (a thread card, a bot request with its thread, a post)
    var layoutMap = null;
    function layout() {
        if (layoutMap) return layoutMap;
        layoutMap = {};
        var L = window.DESKTOP_LAYOUT; if (!L) return layoutMap;
        var keyOf = function (it) { return it.key || it.slug || it.postId || it.folder || it.char || it.channel || (it.msgId ? 'msg-' + it.msgId : null); };
        var groups = Object.keys(L.items || {}).map(function (k) { return L.items[k]; }).concat([L.botRequests || []]);
        groups.forEach(function (items) { items.forEach(function (it) { var k = keyOf(it); if (k) layoutMap[k] = it; }); });
        return layoutMap;
    }

    // ---- avatars: the message's own when it names one, else one from the pool, the same one for the same name ----
    var picked = {}, used = 0;
    function avatarFor(m) {
        if (m.avatar) return m.avatar.replace(/^(\.\.\/content\/img\/discord(%20| )avatars\/|img\/discord(%20| )avatars\/)/, AVATARS).replace(/ /g, '%20');
        var name = m.username || 'anon';
        if (!picked[name]) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0; picked[name] = POOL[(Math.abs(h) + used++) % POOL.length]; }
        return AVATARS + picked[name];
    }

    // ---- the thread window ----
    function messageRow(m, cont) {
        var text = esc(m.text).replace(/\n/g, '<br>');
        var imgs = (m.images || []).length ? '<div class="dc-images">' + m.images.map(function (src) {
            return '<img src="' + enc(SITE + src) + '" alt="" loading="lazy">'; }).join('') + '</div>' : '';
        var reactions = (m.reactions || []).length ? '<div class="dc-reactions">' + m.reactions.map(function (r) {
            return '<span class="dc-reaction">' + esc(r.emoji) + ' <span>' + esc(r.count) + '</span></span>'; }).join('') + '</div>' : '';
        if (cont) return '<div class="dc-msg dc-msg-cont"><div class="dc-text">' + text + '</div>' + imgs + reactions + '</div>';
        return '<div class="dc-msg"><img class="dc-avatar" src="' + avatarFor(m) + '" alt="">' +
            '<div class="dc-col"><div class="dc-meta"><span class="dc-name" style="color:' + esc(m.color || 'var(--text)') + '">' + esc(m.username || 'anon') + '</span>' +
            (m.time ? '<span class="dc-time">' + esc(m.time) + '</span>' : '') + '</div><div class="dc-text">' + text + '</div>' + imgs + reactions + '</div></div>';
    }
    function openWin(title, html, chapter, id, status) {
        var body = document.getElementById('threadBody');
        body.innerHTML = html;
        document.getElementById('threadTitle').textContent = title;
        document.getElementById('threadPath').textContent = '/users/shakti/' + (CHAPTERS[chapter] || chapter) + '/' + id;
        document.getElementById('threadStatus').textContent = status;
        body.scrollTop = 0;
        folderWindow.classList.remove('active');
        threadWindow.classList.add('active');
        overlay(true); sound('open');
        return body;
    }
    function showThread(title, messages, chapter, id) {
        var html = '', last = null;
        messages.forEach(function (m) { html += messageRow(m, last === (m.username || 'anon') && !(m.images || []).length); last = m.username || 'anon'; });
        var body = openWin(title, html, chapter, id, messages.length + ' message' + (messages.length === 1 ? '' : 's'));
        body.querySelectorAll('.dc-images img').forEach(function (img) {
            img.addEventListener('click', function (e) { e.stopPropagation(); var lb = document.getElementById('lightbox'); document.getElementById('lightboxImg').src = img.src; lb.classList.add('active'); sound('open'); });
        });
    }

    // ---- a diary note: a script beat, a diary entry, or a recorded memo's entry (else its caption text joined up), as the desktop shows them ----
    function beatQuote(md, n) {
        var lines = md.split('\n'), start = -1;
        for (var i = 0; i < lines.length; i++) if (new RegExp('^## BEAT ' + n + '\\b').test(lines[i])) { start = i; break; }
        if (start === -1) return '';
        var out = '', prev = -2;
        for (var j = start + 1; j < lines.length; j++) {
            if (/^## /.test(lines[j])) break;
            if (!/^>/.test(lines[j])) continue;
            var content = lines[j].replace(/^>\s?/, '').replace(/\s+$/, '');
            if (out) out += (j === prev + 1) ? '\n' : '\n\n';
            out += content; prev = j;
        }
        return out.replace(/\uD83C\uDF99\s*[\w ]*VO\s*(\[[^\]]*\])?:\s*/g, '').replace(/\*\*/g, '').trim();
    }
    var diaryPath = function (src) { return /^diary\//.test(src) ? src.replace(/^diary\//, 'content/diary/') : SITE + src; };
    function noteText(it) {
        if (it.type === 'voice-memo') {
            return diarySlugs().then(function (set) {
                if (set[it.slug]) return getText('content/diary/' + it.slug + '.md').then(function (md) { return md.trim(); });
                return '';
            }).then(function (md) {
                if (md) return md;
                var audio = it.audioPath || ('diary vo/' + it.slug + '.mp3');
                return getJSON(SITE + audio.replace(/\.[^.]+$/, '.json')).then(function (c) {
                    return (c.chunks || []).map(function (x) { return x.text; }).join(' ').replace(/\s+/g, ' ').trim();
                }).catch(function () { return ''; });
            });
        }
        return getText(diaryPath(it.src || 'script/part-3-bot-requests.md')).then(function (md) {
            return /^## BEAT /m.test(md) ? beatQuote(md, it.beat || 7) : md.trim();
        });
    }
    // the note's marks: **lead**, ~~struck~~, ==highlighted==; blank lines break paragraphs
    function noteHtml(text, clipping) {
        var inline = function (str) {
            return esc(str).replace(/\*\*([^*]+)\*\*/g, '<strong class="np-lead">$1</strong>')
                .replace(/~~([^~]+)~~/g, '<s class="np-strike">$1</s>')
                .replace(/==([^=]+)==/g, '<span class="np-hl on">$1</span>')
                .replace(/\n/g, '<br>');
        };
        var paras = text.split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
        var head = '';
        if (clipping && paras.length > 1) head = '<h4 class="note-title">' + esc(paras.shift()) + '</h4>';
        return '<div class="note">' + head + paras.map(function (p) { return '<p>' + inline(p) + '</p>'; }).join('') + '</div>';
    }
    function openNote(key, chapter, it, label) {
        if (!it) return Promise.resolve(false);
        return noteText(it).then(function (text) {
            if (!text) return false;
            stopClip();
            openWin(label || 'diary', noteHtml(text, it.mode === 'paste'), chapter, key, it.meta || (it.type === 'voice-memo' ? 'My diary' : 'diary'));
            return true;
        });
    }

    // ---- a character file: the bot's JSON, as written ----
    var CHAR_FILES = { priest: 'judgemental_priest.json' };
    // JSON as an editor shows it: keys, strings, numbers, booleans and punctuation each their own colour
    function jsonHtml(data) {
        return esc(JSON.stringify(data, null, 2)).replace(/(&quot;(?:[^&]|&(?!quot;))*&quot;)(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, function (m, str, colon, kw) {
            if (str) return colon ? '<span class="j-key">' + str + '</span>' + colon : '<span class="j-str">' + str + '</span>';
            if (kw) return '<span class="j-kw">' + m + '</span>';
            return '<span class="j-num">' + m + '</span>';
        });
    }
    function openCharacterFile(file, label, meta, chapter, key) {
        return getJSON(SITE + 'character-data/' + file).then(function (data) {
            stopClip();
            var body = openWin(label || file, '<pre class="code"></pre>', chapter || 'bot-requests', key || file.replace(/\.json$/, ''), meta || (data.name ? data.name : 'character file'));
            body.querySelector('pre').innerHTML = jsonHtml(data);
            return true;
        }).catch(function () { return false; });
    }
    function openCharacter(key, chapter, it, label, meta) {
        return openCharacterFile(CHAR_FILES[it.char] || (it.char + '.json'), label, meta, chapter, key);
    }
    // a diary entry by its slug, from the site's diary
    function openDiaryEntry(slug) {
        return diaryEntries().then(function (map) {
            var e = map[slug]; if (!e || !e.content) return false;
            stopClip();
            openWin('My diary', noteHtml(e.content.trim(), false), 'user', slug, e.displayDate || 'My diary');
            return true;
        });
    }
    function openThread(id, chapter) {
        return threads().then(function (map) {
            var t = map[id]; if (!t) return false;
            showThread(t.title || t.label || id, (t.messages || []).filter(function (m) { return !m.hidden; }), chapter, id);
            return true;
        });
    }
    function openPost(id, chapter, title) {
        return posts().then(function (map) {
            var p = map[id]; if (!p) return false;
            var first = { username: p.username, color: p.color, text: p.text, time: p.timestamp, images: p.image ? [p.image] : [], reactions: p.reactions };
            var rest = (p.comments || []).map(function (c) { return { username: c.username, color: c.color, text: c.text, time: c.timestamp, images: c.image ? [c.image] : [], reactions: c.reactions }; });
            showThread(title || p.title || p.label || id, [first].concat(rest), chapter, id);
            return true;
        });
    }
    // ---- a clip: the question, the answer with its words lit as she says them, the recording under it ----
    var audio = null, playingIcon = null, raf = null;
    function stopClip() {
        if (audio) { audio.pause(); audio.src = ''; audio = null; }
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (playingIcon) { playingIcon.classList.remove('playing'); playingIcon = null; }
    }
    var fmt = function (t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); };
    function openInterview(id, chapter, icon) {
        return interviews().then(function (map) {
            var t = map[id]; if (!t) return false;
            var q = (t.messages || []).filter(function (m) { return m.username === 'me'; })[0];
            var a = (t.messages || []).filter(function (m) { return m.username !== 'me'; })[0];
            if (!a) return false;
            var who = t.interviewee || a.username || 'Delta';
            var portrait = enc(SITE + (t.portrait || 'img/anime-bitmap/delta.png'));
            var rows = [];
            if (q) rows.push({ username: 'me', color: 'var(--accent-2, #90F1EF)', text: q.text, avatar: enc(SITE + 'img/anime-bitmap/shakti.png') });
            rows.push({ username: who, color: 'var(--accent)', text: a.text, avatar: portrait });
            stopClip();
            showThread(t.title || id, rows, chapter, id);
            document.getElementById('threadStatus').textContent = (t.meta || 'interview') + ' \u00b7 recorded';
            var body = document.getElementById('threadBody');
            var answer = body.querySelectorAll('.dc-msg')[rows.length - 1];
            var text = answer.querySelector('.dc-text');
            // the player sits under her answer
            var player = el('<div class="dc-player"><button class="pp" type="button"><svg viewBox="0 0 7 9"><path d="M0 0 L7 4.5 L0 9 Z"/></svg><span>play</span></button><div class="bar"><div class="fill"></div></div><span class="t">0:00</span></div>');
            text.after(player);
            var btn = player.querySelector('.pp'), label = btn.querySelector('span'), fill = player.querySelector('.fill'), time = player.querySelector('.t'), bar = player.querySelector('.bar');
            var chunks = null;
            var ready = a.captions ? getJSON(SITE + a.captions).then(function (c) {
                chunks = c.chunks || [];
                // her answer, word by word, from the captions, so the lit words are the spoken ones
                text.classList.add('captioned');
                text.innerHTML = chunks.map(function (ch, i) { return '<span class="w" data-i="' + i + '">' + esc(ch.text) + '</span>'; }).join(' ');
            }).catch(function () {}) : Promise.resolve();
            var sync = function () {
                if (!audio) return;
                var cur = audio.currentTime, dur = audio.duration || 0;
                fill.style.width = (dur ? cur / dur * 100 : 0) + '%';
                time.textContent = fmt(cur) + ' / ' + fmt(dur);
                if (chunks) text.querySelectorAll('.w').forEach(function (w, i) {
                    var ch = chunks[i]; var on = cur >= ch.start && cur < ch.end; var said = cur >= ch.end;
                    w.classList.toggle('on', on); w.classList.toggle('said', said);
                });
                raf = requestAnimationFrame(sync);
            };
            var setLabel = function (playing) { label.textContent = playing ? 'pause' : 'play'; if (icon) icon.classList.toggle('playing', playing); };
            btn.addEventListener('click', function (ev) {
                ev.stopPropagation();
                if (audio && !audio.paused) { audio.pause(); setLabel(false); return; }
                if (!audio) {
                    audio = new Audio(enc(SITE + a.audio)); playingIcon = icon || null;
                    audio.addEventListener('ended', function () { setLabel(false); text.querySelectorAll('.w').forEach(function (w) { w.classList.remove('on'); w.classList.add('said'); }); });
                    audio.addEventListener('play', function () { if (!raf) sync(); });
                    audio.addEventListener('pause', function () { if (raf) { cancelAnimationFrame(raf); raf = null; } });
                }
                ready.then(function () { audio.play().then(function () { setLabel(true); }).catch(function () { setLabel(false); }); });
            });
            bar.addEventListener('click', function (ev) {
                ev.stopPropagation(); if (!audio || !isFinite(audio.duration)) return;
                var r = bar.getBoundingClientRect(); audio.currentTime = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * audio.duration;
            });
            return true;
        });
    }
    function closeThread() {
        if (!threadWindow.classList.contains('active')) return;
        stopClip();
        threadWindow.classList.remove('active'); overlay(false); sound('close');
    }
    window.closeThread = closeThread;
    window.openArchiveInterview = openInterview;   // the desk scenes (desktop.js) open her clips through this
    var closeAll = window.closeAllWindows;
    if (closeAll) window.closeAllWindows = function (quiet) { stopClip(); return closeAll(quiet); };
    window.openArchiveThread = openThread;   // the desk scenes (desktop.js) open their threads through this
    window.openArchiveChapter = openChapter; // and their folders, the chapter's listing from the site's manifest
    window.openArchiveCharacter = function (file, label, meta) { return openCharacterFile(file + '.json', label, meta); };   // the found bots' files
    window.openArchiveDiary = openDiaryEntry;   // the diary's entries
    window.openArchivePost = function (id, title) { return openPost(id, 'bot-requests', title); };   // a bot request made as a post

    // what a manifest key opens: a thread (its own, or the request's), a post, or nothing this page can show
    var interviewMap = {};   // filled once the interviews arrive, so the listing can open them
    function opener(key, chapter, label, meta) {
        var it = layout()[key];
        if (!it && interviewMap[key]) return function () { return openInterview(key, chapter); };
        if (it && it.type === 'notepad') return function () { return openNote(key, chapter, it, label); };
        if (it && it.type === 'voice-memo') return /my diary/i.test(it.meta || meta || '') ? function () { return openNote(key, chapter, it, label); } : null;   // other people's recordings stay out, as on the desktop
        if (it && it.type === 'character') return function () { return openCharacter(key, chapter, it, label, meta); };
        var m = key.match(/^msg-(.+)$/);
        if (it && it.type === 'msg-card' && it.msgId) return function () { return openThread(it.msgId, chapter); };
        if (it && it.type === 'bot-request' && it.threadId) return function () { return openThread(it.threadId, chapter); };
        if (it && it.type === 'bot-post' && it.postId) return function () { return openPost(it.postId, chapter); };
        if (!it && m) return function () { return openThread(m[1], chapter); };
        return null;
    }

    // ---- what each item looks like in the listing: a small line icon for its kind (Lucide, as the site draws them) ----
    var I = function (paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>'; };
    var ICONS = {
        message:   I('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
        interview: I('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>'),
        code:      I('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>'),
        folder:    I('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'),
        file:      I('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>'),
        note:      I('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>'),
        video:     I('<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>'),
        users:     I('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
        image:     I('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
        link:      I('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>')
    };
    function kindOf(key, it, meta) {
        var m = String(meta || '').toLowerCase();
        if (it) {
            if (it.type === 'msg-card') return 'message';
            if (it.type === 'bot-request' || it.type === 'bot-post') return it.thumbnail ? 'thumb' : 'image';
            if (it.type === 'character') return 'code';
            if (it.type === 'notepad' || it.type === 'voice-memo') return 'note';
            if (it.type === 'folder') return 'folder';
            if (it.type === 'link') return 'link';
            if (it.type === 'group-chat') return 'users';
            if (it.type === 'pdf' || /pdf/.test(m)) return 'file';
            if (it.type === 'video' || /video/.test(m)) return 'video';
        }
        if (/^msg-/.test(key) || /message/.test(m)) return 'message';
        if (/interview/.test(m) || /^delta-|^chris-/.test(key)) return 'interview';
        if (/\.json$|tokens/.test(m) || /json/.test(key)) return 'code';
        if (/items|bots|requests/.test(m)) return 'folder';
        if (/members/.test(m)) return 'users';
        if (/diary|note/.test(m) || /diary|notepad|the-end|^nadia$/.test(key)) return 'note';
        if (/pdf/.test(m)) return 'file';
        if (/video/.test(m)) return 'video';
        if (/\.(png|jpe?g|webp)$/.test(m) || /\d+ × \d+/.test(m)) return 'image';
        return 'file';
    }
    function iconFor(kind, it) {
        if (kind === 'thumb') return '<span class="item-icon thumb"><img src="' + enc(SITE + it.thumbnail) + '" alt=""></span>';
        return '<span class="item-icon">' + (ICONS[kind] || ICONS.file) + '</span>';
    }

    // ---- the folder window: a chapter's items, the site's manifest in its order ----
    function openChapter(chapter) {
        return Promise.all([manifest(), interviews()]).then(function (r) {
            var man = r[0]; interviewMap = r[1] || {};
            var entries = man[chapter] || {};
            var list = document.getElementById('folderList'); list.innerHTML = '';
            var keys = Object.keys(entries).filter(function (k) { return !HIDDEN[k] && entries[k] && typeof entries[k] === 'object'; });
            keys.forEach(function (key) {
                var e = entries[key], it = layout()[key];
                var label = e.label !== undefined && e.label !== null ? e.label : (it && it.label) || key;
                var meta = e.meta !== undefined && e.meta !== null ? e.meta : (it && it.meta) || '';
                var open = opener(key, chapter, label, meta);
                if (!open) return;   // nothing this page can open stays off the list (the desktop left these out too)
                var kind = kindOf(key, it, meta);
                var item = el('<div class="folder-item kind-' + kind + '">' + iconFor(kind, it) + '<span class="item-name"></span><span class="item-desc"></span></div>');
                item.querySelector('.item-name').textContent = label;
                item.querySelector('.item-desc').textContent = meta;
                item.addEventListener('click', function (ev) { ev.stopPropagation(); open(); });
                list.appendChild(item);
            });
            var count = list.children.length;
            document.getElementById('folderTitle').textContent = CHAPTERS[chapter] || chapter;
            document.getElementById('folderPath').textContent = '/users/shakti/' + (CHAPTERS[chapter] || chapter) + '/';
            document.getElementById('folderStatus').textContent = count + ' item' + (count === 1 ? '' : 's');
            threadWindow.classList.remove('active');
            folderWindow.classList.add('active'); folderWindow.classList.add('archive');   // the archive's listing, styled as such (landing.css)
            document.getElementById('folderList').scrollTop = 0;
            overlay(true); sound('folder');
        });
    }

    // ---- the icons ----
    document.querySelectorAll('.hero .desk a.desktop-icon').forEach(function (a) {
        a.addEventListener('click', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            var chapter = a.dataset.chapter, thread = a.dataset.thread, clip = a.dataset.interview, note = a.dataset.note;
            var go = function () { window.location.href = a.getAttribute('href'); };   // the site itself, if the data never arrives
            if (clip) openInterview(clip, chapter, a).then(function (ok) { if (!ok) go(); }).catch(go);
            else if (note) openNote(note, chapter, layout()[note], a.querySelector('.label').textContent).then(function (ok) { if (!ok) go(); }).catch(go);
            else if (thread) openThread(thread, chapter).then(function (ok) { if (!ok) go(); }).catch(go);
            else if (chapter) openChapter(chapter).catch(go);
            else go();
        });
    });
    var hero = document.querySelector('.hero');
    if (hero) hero.addEventListener('click', function (ev) { if (!ev.target.closest('.desktop-icon, .window, .down')) window.closeAllWindows && window.closeAllWindows(); });
    folderWindow.addEventListener('click', function (ev) { ev.stopPropagation(); });
    threadWindow.addEventListener('click', function (ev) { ev.stopPropagation(); });
})();
