// Desktop canvas layout, organised by topic band, mapped to script.md PART 1-5.
//
// HOW TO EDIT:
//   - Each band is a horizontal section on the canvas.
//   - To move an item to a different topic: cut its entry, paste it under the
//     target topic's array. Adjust `y` (offset within that band) so it lands
//     where you want.
//   - `y` is relative to the band's top (0 = top of band).
//   - `x` is the absolute horizontal position.
//   - Within a topic, items are CURATED (not chronological); arrange by feel.
//
// Item types:
//   diary          -> openDiaryBySlug(slug)            (text-only)
//   notepad        -> openNotepad()                    (blank editable pad, nothing saves)
//   voice-memo     -> toggleVoiceMemo(event, slug)     (audio + transcript link)
//                     Optional: audioPath, showPlayBtn
//   diary-folder   -> openDiaryFolder()
//   character      -> openCharacterFile(char)
//   bot-chat       -> openBotChat(char)
//   creator-chat   -> openCreatorChat(channel)
//   msg-card       -> openMessageCard(msgId)           (one thread from chat/<theme>.json, found by id)
//   group-chat     -> openBotGroupChat()
//   folder         -> openFolder(folder)

window.DESKTOP_LAYOUT = {
  // The four top-level folders. Landing shows only these; opening one shows
  // the bands listed under it, in order, pulled up to the top of the screen.
  chapters: [
    { id: 'bot-requests', label: 'bot requests',   bands: ['bot-requests'] },
    { id: 'bot-makers',   label: 'the bot makers', bands: ['bot-makers'] },
    { id: 'craft',        label: 'the craft',      bands: ['craft'] },
    { id: 'user',         label: 'the {{user}}',   bands: ['user'] },
  ],
  // One band per folder. Items are laid out top to bottom in manifest order
  // (desktop-labels.json), so band heights only need to be generous.
  bands: [
    { id: 'bot-requests', label: 'bot requests',   top: 0,     height: 6000 },
    { id: 'bot-makers',   label: 'the bot makers', top: 6000,  height: 6000 },
    { id: 'craft',        label: 'the craft',      top: 12000, height: 6000 },
    { id: 'user',         label: 'the {{user}}',   top: 18000, height: 6000 },
  ],

  items: {
    // ============================================================
    // INTRO, PART 1: priest opens the script as the hook,
    // dinner thesis, finding Delta, "characters in head"
    // ============================================================
    intro: [
      { type: 'video-clip', y: 80,  x: 900, key: '60-minutes',
        videoPath: 'video/60 minutes on AI chatbots.mp4',
        thumbnail: 'video/thumbnail.png',
        startTime: 0.13,
        label: '60 minutes on AI chatbots.mp4',    meta: '0:37' },
      { type: 'character',  y: 100, x: 200, char: 'priest',
        label: 'judgemental_priest.json',           meta: '706 tokens' },
      { type: 'bot-post',   y: 150, x: 320, postId: 'mentally-unwell-dad',
        label: 'Mentally Unwell Dad & Stressed Mom', meta: 'touched.grass.once', color: '#22c55e',
        noIcon: true },
      { type: 'msg-card', y: 340, x: 800, msgId: 'voice-requests',
        label: 'any requests for voices?',          meta: '7 messages',
        avatars: ['img/discord%20avatars/discord-avatar-06.jpg', 'img/discord%20avatars/discord-avatar-04.jpg', 'img/discord%20avatars/discord-avatar-07.jpg'] },
      { type: 'msg-card', y: 200, x: 880, msgId: 'making-bots-at-2am',
        label: 'making bots at 2am',                meta: '4 messages' },
      { type: 'msg-card', y: 130, x: 420, msgId: 'rude-bots',
        label: 'rude bots',                         meta: '2 messages' },
      { type: 'creator-chat', y: 400, x: 200, channel: 'char-requests',
        label: 'bot requests' },
      { type: 'inbox', key: 'inbox', y: 70, x: 120,
        label: 'inbox',                             meta: '1 new' },
      { type: 'image', key: 'found-bot-portrait', y: 228, x: 780, src: 'img/00137-2557897375.png',
        label: '00137-2557897375.png',              meta: '1200 × 1600' },
      { type: 'notepad', y: 228, x: 400, key: 'diary-notepad-discourse',
        src: 'diary/2026-09-10.md',
        label: 'diary',                             meta: null, portrait: 'img/icons/diary-book.png' },
      { type: 'msg-card', y: 580, x: 720, msgId: 'reddit-dm-intro',
        label: 'would you be up for a quick chat?',  meta: 'Reddit DM' },
    ],

    // ============================================================
    // DELTA, dedicated space for material about Delta the person
    // ============================================================
    delta: [
      { type: 'notepad',    y: 780, x: 700, key: 'delta-guide-underlined', mode: 'paste',
        src: 'diary/delta-guide-underlined.md',
        label: "highlights from delta's guide",          meta: null },
      { type: 'pdf',        y: 780, x: 450, key: 'delta-guide-pdf', path: 'guides/Delta_Guide.pdf',
        thumbnail: 'guides/Delta_Guide-thumbnail.png',
        label: "Delta's Character Creation Guide", meta: 'PDF',
        comments: [
          { handle: 'anon_4729', time: '3y ago', likes: 19,
            avatar: 'img/discord%20avatars/discord-avatar-08.jpg',
            body: 'THIS SAVED MY FUCKING LIFE THANK YOU MY AI ISNT ALL WATTPAD-Y NOW OH MY GOD THANK YOU' },
          { handle: 'anon_8201', time: '3y ago', likes: 7,
            avatar: 'img/discord%20avatars/discord-avatar-06.jpg',
            body: 'This post deserves some awards, my AIs are noticeably better after following it.' },
          { handle: '[deleted]', time: '3y ago', likes: 1,
            avatar: 'img/discord%20avatars/discord-avatar-012.png',
            body: "Thank you so much! This guide helped me improve my characters a LOT. Now they're way more stable in their behaviour." },
        ] },
    ],

    // ============================================================
    // COMMUNITY, PART 2: Delta's guide, makers' channels, requests
    // ============================================================
    community: [
      { type: 'creator-chat', y: 150,  x: 1050, channel: 'maker-help', visible: false,
        label: 'maker help',                       meta: '' },
      { type: 'msg-card',     y: 200,  x: 400,  msgId: 'persona-design', visible: true,
        label: 'message exchange', meta: '3 messages',
        avatars: ['img/discord%20avatars/discord-avatar-04.jpg', 'img/discord%20avatars/discord-avatar-05.jpg', 'img/discord%20avatars/discord-avatar-06.jpg'] },
      { type: 'creator-chat', y: 380,  x: 180,  channel: 'maker-chat',  room: 'discord',
        label: 'maker chat',                       meta: '#maker-chat' },
      { type: 'msg-card',     y: 500,  x: 800,  msgId: 'mother-of-all-bots', visible: true,
        label: 'message exchange', meta: '4 messages',
        avatars: ['img/discord%20avatars/discord-avatar-09.png', 'img/discord%20avatars/discord-avatar-08.jpg', 'img/discord%20avatars/discord-avatar-010.png'] },
      { type: 'msg-card',     y: 700,  x: 560,  msgId: 'dont-care-if-good', key: 'msg-its-a-hobby', visible: true,
        label: 'message exchange', meta: '7 messages',
        avatars: ['img/discord%20avatars/discord-avatar-011.png'] },
      { type: 'folder',       y: 880,  x: 300,  folder: 'creator-guides',
        label: 'Creator Guides',                   meta: '7 items' },
      // Loose message snippets
      { type: 'msg-card', y: 1220, x: 120,  msgId: 'living-at-home',
        label: 'message exchange',                 meta: '8 messages' },
      { type: 'msg-card', y: 1220, x: 900,  msgId: 'sixty-hour-week',
        label: 'message exchange',                 meta: '1 message' },
      { type: 'msg-card', y: 1480, x: 200,  msgId: 'two-theories-of-escape',
        label: 'message exchange',                 meta: '1 message' },
      { type: 'msg-card', y: 1480, x: 1000, msgId: 'getting-bullied',
        label: 'message exchange',                 meta: '1 message' },
      { type: 'msg-card', y: 1740, x: 360,  msgId: 'what-porn-was-filling',
        label: 'message exchange',                 meta: '3 messages' },

      // Bot posts + remaining msg-cards interleaved
      { type: 'bot-post', y: 1980, x: 100,  postId: 'seeking-a-bodyguard',
        label: 'Seeking a bodyguard',              meta: 'Монготи Ковинстоко Дэрре', color: '#7c3aed',
        thumbnail: 'bot-requests/img/bodyguard.png' },
      { type: 'bot-post', y: 2200, x: 500,  postId: 'kimono-furry',
        label: 'pinned to the floor',             meta: 'saladful',                 color: '#f97316',
        thumbnail: 'bot-requests/img/kimono furry.png' },
      { type: 'msg-card', y: 2400, x: 720,  msgId: 'essay-length-replies',
        label: 'message exchange',                 meta: '2 messages' },
      { type: 'bot-post', y: 2600, x: 880,  postId: 'milf-muffet',
        label: 'Milf Muffet',                      meta: 'Zilkie Einar',             color: '#ec4899',
        thumbnail: 'bot-requests/img/milf-muffet-01.png' },
      { type: 'msg-card', y: 2800, x: 250,  msgId: 'waluigi-lorebook',
        label: 'message exchange',                 meta: '3 messages' },
      { type: 'msg-card', y: 3050, x: 800,  msgId: 'sharing-a-name-with-your-bot',
        label: 'message exchange',                 meta: '3 messages' },
      { type: 'bot-post', y: 3250, x: 120,  postId: 'road-96',
        label: 'Road 96 RPG',                      meta: 'Dr.EvilZ',                 color: '#ef4444',
        thumbnail: 'bot-requests/img/road 96.png' },
      { type: 'msg-card', y: 3450, x: 550,  msgId: 'keyword-collisions',
        label: 'message exchange',                 meta: '2 messages' },
      { type: 'bot-post', y: 3650, x: 900,  key: 'saladful-robots', postId: 'goblin.hours-robots',
        label: 'robot werewolf problem',           meta: 'saladful',                 color: '#f97316',
        thumbnail: 'bot-requests/img/robot animal.png' },
    ],

    // ============================================================
    // CRAFT, PART 3: character JSONs, dere types, constraints,
    // mbti/enneagram + yandere Delta quotes, platforms & labour
    // ============================================================
    craft: [
      { type: 'msg-card', y: 300,  x: 750, msgId: 'repetitive-answers', visible: true,
        label: 'welcome to bot dementia', meta: '3 messages',
        avatars: ['img/discord%20avatars/discord-avatar-08.jpg', 'img/discord%20avatars/discord-avatar-07.jpg', 'img/discord%20avatars/discord-avatar-011.png'] },
      { type: 'msg-card', y: 640,  x: 1050, msgId: 'testing-bots', visible: true,
        label: 'how to test your bot', meta: '2 messages',
        avatars: ['img/discord%20avatars/discord-avatar-09.png', 'img/discord%20avatars/discord-avatar-010.png'] },
      { type: 'msg-card', y: 1100, x: 450, msgId: 'rules-on-behalf-of-user', visible: true,
        label: 'be careful not to set so many rules', meta: '1 message',
        avatars: ['img/discord%20avatars/discord-avatar-05.jpg'] },
      { type: 'msg-card', y: 1220, x: 420, msgId: 'no-more-json', visible: true,
        label: 'json vs plain text', meta: '4 messages',
        avatars: ['img/discord%20avatars/discord-avatar-012.png', 'img/discord%20avatars/discord-avatar-04.jpg', 'img/discord%20avatars/discord-avatar-06.jpg', 'img/discord%20avatars/discord-avatar-08.jpg'] },
      { type: 'msg-card', y: 1560, x: 750, msgId: 'simulating-a-breakup', visible: true,
        label: 'simulating a breakup', meta: '2 messages', iconImg: 'img/icons/heart.png',
        avatars: ['img/discord%20avatars/discord-avatar-07.jpg', 'img/discord%20avatars/discord-avatar-09.png'] },
      { type: 'msg-card', y: 2200, x: 450, msgId: 'body-measurements', visible: true,
        label: 'body measurements', meta: '2 messages',
        avatars: ['img/discord%20avatars/discord-avatar-010.png', 'img/discord%20avatars/discord-avatar-05.jpg'] },
      { type: 'msg-card', y: 2500, x: 750, msgId: 'stuck-in-a-loop', visible: true,
        label: 'is there a fix for bots stuck in a loop?', meta: '8 messages',
        avatars: ['img/discord avatars/discord-avatar-09.png', 'img/discord avatars/discord-avatar-011.png'] },
      { type: 'folder',       y: 160,  x: 600, folder: 'personality-frameworks',
        label: 'personality frameworks',                        meta: '3 items' },
      { type: 'folder',       y: 220,  x: 950, folder: 'character-jsons',
        label: 'found bots',                              meta: '8 items' },
      { type: 'voice-memo',   y: 1600, x: 500, slug: 'nadia',
        label: 'contribute without needing to be told to',     meta: 'my diary', portrait: 'img/anime-bitmap/shakti.png' },
      { type: 'notepad',      y: 1900, x: 600, key: 'diary-notepad', beat: 7,
        label: 'diary',                                        meta: null, portrait: 'img/icons/diary-book.png' },
      { type: 'notepad',      y: 2700, x: 600, key: 'diary-notepad-2', beat: 11,
        label: 'diary',                                        meta: null, portrait: 'img/icons/diary-book.png' },
    ],

    // ============================================================
    // {{user}}, PART 4: roleplay, Huizinga's play, addiction,
    // bot chats (the experience of using)
    // ============================================================
    user: [
      { type: 'group-chat', y: 100, x: 400, label: 'bot group chat',     meta: '8 members' },
      { type: 'notepad',    y: 950, x: 600, key: 'diary-notepad-3',
        beat: 12, src: 'script/part-4-the-guides.md',
        label: 'diary',                                meta: null, portrait: 'img/icons/diary-book.png' },
    ],

    // ============================================================
    // MARGINS, PART 5: why this is happening at the margins,
    // Houellebecq, hypermodern content, musings on internet
    // ============================================================
    margins: [

      { type: 'voice-memo', y: 520, x: 900, slug: 'the-end',
        audioPath: 'diary vo/the end.mp3',
        label: 'what worlds we long to enter', meta: 'my diary', portrait: 'img/anime-bitmap/shakti.png' },
      { type: 'voice-memo', y: 700, x: 200, slug: 'chris-black-box',
        audioPath: 'chris/chris black box.mp3', showPlayBtn: true,
        label: 'finding signal in black boxes',  meta: 'Chris, AI researcher', portrait: 'img/anime-bitmap/chris.png' },
      { type: 'msg-card',   y: 1300, x: 700, msgId: 'improvise-trick', visible: true,
        label: 'someone turned it into an eco revolution', meta: '2 messages',
        avatars: ['img/discord%20avatars/discord-avatar-09.png', 'img/discord%20avatars/discord-avatar-05.jpg'] },
      { type: 'msg-card',   y: 1550, x: 300, msgId: 'monster-girls', visible: true,
        label: 'nowhere else can i say this',              meta: '2 messages',
        avatars: ['img/discord%20avatars/discord-avatar-010.png', 'img/discord%20avatars/discord-avatar-04.jpg'] },
    ],
  },

  // Bot-request panels (named requests like "Experiment 0682"). Iterated in
  // creator-chat order and assigned to slots in band-then-array order.
  // All of these are community artifacts.
  // Flat array, indexed by request order in the chat data. Each slot picks
  // its own `band` so any single request can live in any topic.
  // Inline bot-request panels (chat/bot-requests.json, by index). Rendered
  // like any other icon; the manifest decides which appear and where.
  botRequests: [
    { type: 'bot-request', threadId: 'ossix-ayto', key: 'bot-request-0', x: 900,  label: 'Experiment 0682, Ossix Ayto',   meta: 'bot request', thumbnail: 'bot-requests/img/ossix/ossix-01.png' },
    { type: 'bot-request', threadId: 'thanos', key: 'bot-request-3', x: 380,  label: 'Thanos, philosophy and nihilism', meta: 'bot request' },
    { type: 'bot-request', threadId: 'leonardo-malcom', key: 'bot-request-4', x: 220,  label: 'Leonardo/Malcom',               meta: 'bot request' },
    { type: 'bot-request', threadId: 'giant-golden-heart', key: 'bot-request-5', x: 560,  label: 'a giant with a golden heart',   meta: 'bot request', thumbnail: 'bot-requests/img/giant.webp' },
    { type: 'bot-request', threadId: 'dee-yandere-cashier', key: 'bot-request-6', x: 1000, label: 'Dee Leanne Hopfensperger',      meta: 'bot request' },
    { type: 'bot-request', threadId: 'succubus-better-person', key: 'bot-request-7', x: 220,  label: 'a succubus who tempts you to be a better person', meta: 'bot request' },
    { type: 'bot-request', threadId: 'undercover-job', key: 'bot-request-8', x: 720,  label: 'undercover stressful job',      meta: 'bot request' },
    { type: 'bot-request', threadId: 'haunted-costume-shop', key: 'bot-request-9', x: 300,  label: 'haunted costume shop',          meta: 'bot request' },
  ],

  imageSlots: { found: {}, botRequest: {} },
};
