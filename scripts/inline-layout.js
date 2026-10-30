// Bakes hero-layout.json into index.html, as <script id="heroLayout" type="application/json">, so the page knows where
// everything sits before it first paints (js/admin.js reads it there instead of fetching the file, which showed every
// icon in its built-in place for the moment the fetch took). The dev server runs this on every save from the admin,
// and the Netlify build runs it at deploy; by hand:  node scripts/inline-layout.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const TAG = /<script id="heroLayout" type="application\/json">[\s\S]*?<\/script>/;

function block(layout) {
  return '<script id="heroLayout" type="application/json">' + JSON.stringify(layout).replace(/<\//g, '<\\/') + '</script>';
}
function inject(html, layout) {
  const b = block(layout);
  if (TAG.test(html)) return html.replace(TAG, () => b);
  return html.replace('</head>', b + '\n</head>');
}
function run(layout) {
  const file = path.join(root, 'index.html');
  if (!layout) layout = JSON.parse(fs.readFileSync(path.join(root, 'hero-layout.json'), 'utf8'));
  fs.writeFileSync(file, inject(fs.readFileSync(file, 'utf8'), layout));
}
module.exports = { inject, run };
if (require.main === module) { run(); console.log('baked hero-layout.json into index.html'); }
