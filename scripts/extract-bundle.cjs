// Pull the real art out of the bundled Claude Design export.
//   node scripts/extract-bundle.cjs "C:/Users/.../Buddy Bingo.html" [--force]
// Assets live as a UUID->base64 manifest; buddy sprites are named in
// __bundler/ext_resources, the rest are identified by where the template uses them.
//
// Existing files are KEPT, never overwritten. The bundle ships the `assets/min/`
// downscales, and at least one of them (buddy_horror) is a bad crop that was
// replaced by hand — re-running this must not undo that. Pass --force to
// overwrite anyway, then re-apply your replacements.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const args = process.argv.slice(2);
const force = args.includes('--force');
const src = args.find((a) => !a.startsWith('--')) || path.join(process.env.USERPROFILE || '', 'Downloads', 'Buddy Bingo.html');
const outDir = path.join(__dirname, '..', 'public', 'assets');
const html = fs.readFileSync(src, 'utf8');

const section = (type) => {
  const open = `<script type="__bundler/${type}">`;
  const i = html.indexOf(open);
  if (i < 0) throw new Error('missing section: ' + type);
  const start = i + open.length;
  return html.slice(start, html.indexOf('</script>', start)).trim();
};

const manifest = JSON.parse(section('manifest'));
const ext = JSON.parse(section('ext_resources'));
const template = JSON.parse(section('template')); // JSON-encoded string

const NAME_BY_ID = {
  buddyIDLE: 'buddy_idle.png',
  buddyTALK: 'buddy_talk.png',
  buddyHAPPY: 'buddy_happy.png',
  buddySATISFIED: 'buddy_satisfied.png',
  buddyWORRY: 'buddy_worry.png',
  buddyGLITCH: 'buddy_glitch.png',
  buddyHORROR: 'buddy_horror.png',
  buddyWAVE: 'buddy_wave2.png',
};

const named = new Map(); // uuid -> filename
for (const { id, uuid } of ext) if (NAME_BY_ID[id]) named.set(uuid, NAME_BY_ID[id]);

// The remaining images are only distinguishable by the markup around them.
// Each probe is a substring of the template that uniquely precedes one <img src="uuid">.
const PROBES = [
  ['bubble_pixel.png', 'left:520px;top:150px;width:860px;height:240px'],
  ['heart_empty.png', 'heart-empty'],
  ['heart_full.png', 'heart-full'],
];

const uuidAfter = (anchor) => {
  const i = template.indexOf(anchor);
  if (i < 0) return null;
  const m = /<img src=\\?"([0-9a-f-]{36})\\?"/.exec(template.slice(i, i + 1200));
  return m ? m[1] : null;
};

// bubble sits right after its wrapper div
const bubbleUuid = uuidAfter(PROBES[0][1]);
if (bubbleUuid) named.set(bubbleUuid, 'bubble_pixel.png');

// hearts: the two <img> inside the sc-for heart block, empty first then full
const heartBlock = template.indexOf('width:44px;height:40px');
if (heartBlock > 0) {
  const slice = template.slice(heartBlock - 400, heartBlock + 900);
  const ids = [...slice.matchAll(/<img src=\\?"([0-9a-f-]{36})\\?"/g)].map((m) => m[1]);
  if (ids[0]) named.set(ids[0], 'heart_empty.png');
  if (ids[1]) named.set(ids[1], 'heart_full.png');
}

// backgrounds: the play screen paints day then night back to back
const bgIdx = template.indexOf('{{ dayBgStyle }}');
if (bgIdx > 0) {
  const slice = template.slice(bgIdx - 200, bgIdx + 600);
  const ids = [...slice.matchAll(/<img src=\\?"([0-9a-f-]{36})\\?"/g)].map((m) => m[1]);
  if (ids[0]) named.set(ids[0], 'bg_forest.png');
  if (ids[1]) named.set(ids[1], 'bg_forest_night.png');
}

fs.mkdirSync(outDir, { recursive: true });
let written = 0;
let kept = 0;
for (const [uuid, name] of named) {
  const entry = manifest[uuid];
  if (!entry) {
    console.warn('! no manifest entry for', name, uuid);
    continue;
  }
  const dest = path.join(outDir, name);
  if (fs.existsSync(dest) && !force) {
    console.log('kept  ', name, '(already present — --force to overwrite)');
    kept++;
    continue;
  }
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);
  fs.writeFileSync(dest, bytes);
  console.log('wrote ', name, bytes.length + 'B', entry.mime);
  written++;
}

const missing = Object.values(NAME_BY_ID)
  .concat(['bubble_pixel.png', 'heart_empty.png', 'heart_full.png', 'bg_forest.png', 'bg_forest_night.png'])
  .filter((n) => ![...named.values()].includes(n));
if (missing.length) console.warn('! unresolved:', missing.join(', '));
console.log(`${written} written, ${kept} kept — ${outDir}`);
