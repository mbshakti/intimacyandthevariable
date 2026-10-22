# Intimacy When the Other Side Is a Variable

The site for the desktop documentary and video essay by Shakti Mb and Kiana Fernandez.

## The homepage

A one-page site in the desktop's own dress, at the repository root. No build step: upload the folder as it is, or open `index.html` locally.

- `index.html`, the page
- `styles.css`, the desktop's stylesheet, copied as it is from the film project (desktop-voyeur); `landing.css` adds only what a scrolling page needs and the film's window
- `font/`, Lekton and IBM Plex Mono, self-hosted
- `img/`, the page's own pictures: `img/photos/teaser.jpg` the teaser's poster frame, `img/team/` the portraits, `img/thumbs/` and `img/avatars/` the pictures and faces the desk scenes further down the page are drawn with, `img/icons/` the favicon
- `js/hero.js`, the icons round the title: a folder opens the chapter's listing from the archive's manifest (`archive-desktop/desktop-labels.json`, with `desktop-layout.js` for what each item is), a thread or bot request opens its messages from the archive (`archive-desktop/chat/*.json`, `bot-requests/posts.json`), Delta's clips (`archive-desktop/interviews/delta.json`, recordings and captions in `interview vo/`) play with their words lit as she says them; diary notes and the priest's character file open as notes and code; what the desktop never showed (folders, channels, the inbox, PDFs, other people's recordings) is left off the list
- `js/desktop.js`, the desk scenes: two from the deck (pictures, folders, threads, Delta's clip) and one more after the team from the archive (two pictures, a character file open from `archive-desktop/character-data/`, Ossix Ayto's file, a diary entry from `content/api/diary.json`, a clip of Delta's, a thread, a folder); icons and open files all lead to the same windows; on phones each desk becomes a two-column flow
- `js/main.js`, the title typing itself in once, and the teaser's poster frame swapping in the Vimeo player when pressed

The icons round the title are the desktop's own: its four chapter folders and threads from the archive's manifest, drawn with the desktop's folder icon, the avatar pool under `content/img/discord avatars/` and the bot-request thumbnails under `archive-desktop/`.

## Moving the icons: the layout admin

Where every movable thing sits is in `hero-layout.json`: a desktop layout and a phone layout, each thing either on the hero's desk (x, y in % of the hero) or anywhere on the page below it (x in % of the page width, y of the main column); `hide: true` leaves it out of that layout. Open `/admin` to move them: drag a thing anywhere, out of the hero and down the page or the other way; the desk scenes' pictures, files and icons move too, within their scene. Which layout you're editing follows the window: make it phone-sized (520px or narrower, the browser's device mode will do) and your moves go to the phone layout. Select a thing and press Delete to hide it in that layout (to bring it back, take the `hide` off its entry in the file). There is no panel: the admin is the page itself with everything draggable. Every move saves on its own: with the site running locally (`node server.js`), the admin writes `hero-layout.json` straight back, so the file is always current and a commit makes it live; on the live site there is nothing to write to, so moves stay in that browser only. (`_redirects` serves the page at `/admin` on Netlify; `server.js` does the same locally.) `js/admin.js` does all of this; without a layout file the page falls back to the positions in the markup and stylesheet.

## The desktop (the previous site)

The interactive desktop that was the homepage lives on at `desktop/index.html`, reachable at `/desktop/`. It keeps its `<base href="/archive-desktop/">`, so it loads its stylesheet, script and data from `archive-desktop/` wherever it sits. The homepage's icons fall back to it (`desktop/#chapter`) when JavaScript is off. Its signup form (the Netlify form `screening-invites`) is on that page only.

## Everything else

- `archive-desktop/` - the desktop's stylesheet, script, layout and data (threads, interviews, recordings, bot requests, images). Both pages read from it.
- `content/` - live data and media (the avatar pool, diary, character data, chat archives) loaded by the desktop and the dev server. `content/api/` is generated.
- `assets/` - public media, fonts and social images.
- `style.css`, `script.js` - legacy bundles kept for old URLs (see `_redirects`); neither page loads them.
- `scripts/` - build and generation scripts.
- `netlify/functions/` - serverless API functions.
- `archive/` - old/source files kept for reference but not loaded by the live site.

## Development

Generate static content data:

```sh
node scripts/build-static-data.js
```

Serve the site from the repository root (the dev server also answers the desktop's API routes):

```sh
PORT=3100 node server.js
```
