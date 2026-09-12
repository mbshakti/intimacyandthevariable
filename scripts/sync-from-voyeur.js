// Copies the archive data (and fonts) from the desktop-voyeur project into this
// site. desktop-voyeur/archive.html is where the data gets edited; this site only
// reads it. Re-run after editing over there, then commit the copied files:
//   node scripts/sync-from-voyeur.js
// Source folder defaults to ../desktop-voyeur; override with VOYEUR_DIR=/path.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const src = process.env.VOYEUR_DIR || path.join(root, '..', 'desktop-voyeur');
if (!fs.existsSync(path.join(src, 'archive.html'))) {
  console.error(`desktop-voyeur not found at ${src} (set VOYEUR_DIR)`);
  process.exit(1);
}

const site = path.join(root, 'archive-desktop'); // index.html has <base href="/archive-desktop/">
let copied = 0;

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied++;
}

function copyDir(from, to, filter = () => true, skipDirs = []) {
  if (!fs.existsSync(from)) { console.warn(`skip (missing): ${path.relative(src, from)}`); return; }
  for (const entry of fs.readdirSync(from)) {
    if (entry.startsWith('.') || skipDirs.includes(entry)) continue;
    const a = path.join(from, entry);
    const b = path.join(to, entry);
    if (fs.statSync(a).isDirectory()) copyDir(a, b, filter);
    else if (filter(entry)) copyFile(a, b);
  }
}

const isJson = f => f.endsWith('.json');

// Chat threads: one file per theme, every thread has an id the desktop icons point at.
copyDir(path.join(src, 'chat'), path.join(site, 'chat'), isJson, ['vo']); // chat/vo audio is not used here
// Desktop manifest (labels + meta per item), kept for reference / future use.
copyFile(path.join(src, 'desktop-labels.json'), path.join(site, 'desktop-labels.json'));
// Reddit-style bot request posts and their images.
copyFile(path.join(src, 'bot-requests', 'posts.json'), path.join(site, 'bot-requests', 'posts.json'));
copyDir(path.join(src, 'bot-requests', 'img'), path.join(site, 'bot-requests', 'img'));
// Desktop layout: item types, x positions and thumbnails the manifest keys point at.
copyFile(path.join(src, 'desktop-layout.js'), path.join(site, 'desktop-layout.js'));
// Icons the layout references directly.
copyFile(path.join(src, 'img', 'icons', 'heart.png'), path.join(site, 'img', 'icons', 'heart.png'));
// Folder icon used by the four chapter folders on the landing.
copyFile(path.join(src, 'img', 'icons', 'folder.svg'), path.join(site, 'img', 'icons', 'folder.svg'));
// Character JSONs.
copyDir(path.join(src, 'character-data'), path.join(site, 'character-data'), isJson);
// Self-hosted fonts (Lekton, IBM Plex Mono).
copyDir(path.join(src, 'font', 'lekton'), path.join(site, 'font', 'lekton'));
copyDir(path.join(src, 'font', 'ibmplexmono'), path.join(site, 'font', 'ibmplexmono'));
// Diary notes typed out on the desktop: script beats + the diary book / portrait icons.
copyDir(path.join(src, 'script'), path.join(site, 'script'), f => f.endsWith('.md'));
for (const f of ['img/icons/diary-book.png', 'img/anime-bitmap/shakti.png', 'img/anime-bitmap/delta.png']) {
  copyFile(path.join(src, f), path.join(site, f));
}
// Diary memos open as text here, so only their caption sidecars come over (the transcript source).
for (const base of ['nadia', 'the end']) {
  copyFile(path.join(src, 'diary vo', base + '.json'), path.join(site, 'diary vo', base + '.json'));
}
// Delta interview clips: only the ones the desktop manifest lists.
copyFile(path.join(src, 'interviews', 'delta.json'), path.join(site, 'interviews', 'delta.json'));
{
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'desktop-labels.json'), 'utf8'));
  const listed = new Set(Object.values(manifest).flatMap(items => Object.keys(items)));
  const interviews = JSON.parse(fs.readFileSync(path.join(src, 'interviews', 'delta.json'), 'utf8'));
  for (const t of interviews) {
    if (!listed.has(t.id)) continue;
    for (const m of t.messages) {
      for (const f of [m.audio, m.captions]) {
        if (f && fs.existsSync(path.join(src, f))) copyFile(path.join(src, f), path.join(site, f));
      }
    }
  }
}
// Diary entries feed /api/diary and the static content/api/diary.json.
copyDir(path.join(src, 'diary'), path.join(root, 'content', 'diary'), f => f.endsWith('.md'));

console.log(`copied ${copied} files from ${src}`);
execFileSync(process.execPath, [path.join(__dirname, 'build-static-data.js')], { stdio: 'inherit' });
