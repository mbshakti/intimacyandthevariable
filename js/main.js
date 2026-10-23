// Film or performance: the toggle at the top of the hero. The same work, two sides of a coin; the content stays
// and only the copy follows (every element marked data-copy, shown or hidden by landing.css off html[data-mode]).
// ?performance in the address opens the page on that side, and the toggle keeps the address in step, so either
// side can be sent as a link.
(function () {
    var root = document.documentElement, btns = document.querySelectorAll('.mode-btn');
    var titles = {
        film: 'Intimacy when the other side is a variable, a desktop documentary and video essay',
        performance: 'Unstable Performers, a live performance and screening'
    };
    var ind = document.querySelector('.mode-ind'), busy = false, wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    // the highlight sits under the pressed side; it slides there once it has a place to slide from
    function place() {
        if (!ind) return;
        var b = document.querySelector('.mode-btn[aria-pressed="true"]'); if (!b) return;
        ind.style.width = b.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + (b.offsetLeft - 5) + 'px)';
        if (!ind.classList.contains('placed')) requestAnimationFrame(function () { ind.classList.add('placed'); });
    }
    function apply(mode) {
        root.dataset.mode = mode;
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === mode)); });
        document.title = titles[mode];
        place();
    }
    // the switch, as a sequence: the page goes back to the top while the old side's copy, title included, fades;
    // then the new side's comes in, from its hero. A press during the switch waits its turn.
    function set(mode) {
        if (busy || root.dataset.mode === mode) return;
        busy = true;
        if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === mode)); });   // the highlight moves at once
        place();
        root.classList.add('switching');
        wait(240).then(function () {
            apply(mode);
            if (history.replaceState) history.replaceState(null, '', location.pathname + (mode === 'performance' ? '?performance' : '') + location.hash);
            root.classList.remove('switching');
            root.classList.add('copy-in');
            return wait(450);
        }).then(function () { root.classList.remove('copy-in'); busy = false; });
    }
    apply(/[?&]performance(?=&|=|$)/.test(location.search) ? 'performance' : 'film');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);   // the type settles, the highlight fits it
    window.addEventListener('resize', place);
    if (window.ResizeObserver) { var ro = new ResizeObserver(place); btns.forEach(function (b) { ro.observe(b); }); }   // the highlight follows a side as it opens or closes
    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.set); }); });
    // a link in the copy to the other side (the other work's name) flips the toggle in place; without JS it is a plain link to that side
    document.addEventListener('click', function (ev) {
        var a = ev.target.closest && ev.target.closest('a[data-flip]'); if (!a) return;
        ev.preventDefault(); set(a.dataset.flip);
    });
})();

// The screening sign-up: the address goes to the same sheet the desktop's form fed (the Apps Script endpoint),
// and the form becomes a line of thanks. Netlify keeps a copy too (data-netlify), as before.
(function () {
    var form = document.getElementById('signup'); if (!form) return;
    var endpoint = 'https://script.google.com/macros/s/AKfycbxhqH0y36PICJiRVloJxEDyZKgg8oSJw4UjG1N_CpoJ4VDfI5BWZIfy69o8BuPhaWYf/exec';
    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var submit = form.querySelector('.signup-submit'), email = (form.querySelector('[name="email"]').value || '').trim();
        if (!email) return;
        submit.disabled = true; submit.textContent = 'Sending\u2026';
        fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ email: email, source: 'screening-invites', page: location.href }) })
            .then(function () { var note = form.querySelector('.signup-note'); form.classList.add('done'); form.innerHTML = '<p class="signup-done">You\u2019re on the list.</p>' + (note ? note.outerHTML : ''); })
            .catch(function () { submit.disabled = false; submit.textContent = 'Sign up'; var s = form.querySelector('.signup-status') || document.createElement('p'); s.className = 'signup-status'; s.textContent = 'Something went wrong. Try again?'; form.appendChild(s); });
    });
})();

// The teaser: the poster frame waits with its play pill; pressing it swaps in the Vimeo player, playing.
(function () {
    var host = document.getElementById('teaserVideo'); if (!host) return;
    var btn = host.querySelector('.play'); if (!btn) return;
    btn.addEventListener('click', function () {
        var f = document.createElement('iframe');
        f.src = 'https://player.vimeo.com/video/' + host.dataset.vimeo + '?autoplay=1&dnt=1&title=0&byline=0&portrait=0';
        f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
        f.setAttribute('allowfullscreen', '');
        f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        f.title = 'Teaser: Intimacy when the other side is a variable';
        host.replaceChild(f, btn);
    });
})();
