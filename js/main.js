// The title types itself in once, the way the diary does in the film: the
// caret stands where the next letter will go and follows each one in, quick
// inside a word, a breath at the line break, now and then a hesitation; it
// holds solid while keys go in and blinks only once the writer stops. With
// reduced motion, or if the fonts never arrive, the title is simply there.
(function () {
    var h1 = document.querySelector('.typed');
    if (!h1 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var caret = h1.querySelector('.caret');
    var lines = h1.querySelectorAll('.line');
    var chars = [];
    lines.forEach(function (line) {
        var text = line.textContent;
        line.textContent = '';
        for (var i = 0; i < text.length; i++) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.textContent = text[i];
            s.dataset.last = (i === text.length - 1) ? '1' : '';
            line.appendChild(s);
            chars.push(s);
        }
    });
    if (!caret || !chars.length) return;
    // the caret waits at the start of the first line, blinking, until the writer begins
    lines[0].insertBefore(caret, chars[0]);
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var restTimer = null;
    function keystroke() {
        caret.classList.add('typing');
        clearTimeout(restTimer);
        restTimer = setTimeout(function () { caret.classList.remove('typing'); }, 450);
    }
    var ready = document.fonts ? document.fonts.ready : Promise.resolve();
    var fallback = new Promise(function (r) { setTimeout(r, 600); });
    Promise.race([ready, fallback]).then(function () {
        var i = 0;
        function next() {
            if (i >= chars.length) return;
            var ch = chars[i];
            ch.classList.add('on');
            ch.after(caret);                                      // the caret moves on behind the letter
            keystroke();
            i++;
            if (i >= chars.length) return;
            var d = rand(72, 128);                                // a key
            if (ch.dataset.last) d = rand(480, 680);              // the breath at the line break
            else if (Math.random() < 0.12) d += rand(200, 390);   // a hesitation
            setTimeout(next, d);
        }
        setTimeout(next, 150);                                 // the first key, as soon as the type is in
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
            .then(function () { form.classList.add('done'); form.innerHTML = '<p class="signup-done">You\u2019re on the list.</p>'; })
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
