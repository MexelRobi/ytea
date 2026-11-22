const STORAGE_KEY = 'ytea_pure_workspaces_v4';
const ACTIVE_PROJECT_KEY = 'ytea_pure_active_ws_v4';
const CATALOG_CACHE_KEY = 'ytea_official_catalog_v1';

const MDN_CSS_URL = 'https://cdn.jsdelivr.net/npm/mdn-data@2.18.0/css/properties.json';
const HTML_TAGS_URL = 'https://cdn.jsdelivr.net/npm/html-tags@3.3.1/html-tags.json';

const CSS_SMART_DEFAULTS = {
  display: 'flex',
  'flex-direction': 'column',
  'align-items': 'center',
  'justify-content': 'center',
  'justify-items': 'center',
  gap: '12px',
  padding: '16px',
  margin: '0',
  'margin-bottom': '12px',
  width: '100%',
  'max-width': '480px',
  height: 'auto',
  'min-height': '100vh',
  background: '#151c18',
  'background-color': '#151c18',
  color: '#f3faf5',
  'font-size': '16px',
  'font-weight': '600',
  'font-family': 'system-ui, sans-serif',
  'line-height': '1.5',
  'text-align': 'center',
  border: '1px solid #355040',
  'border-radius': '10px',
  'box-shadow': '0 10px 30px rgba(0,0,0,0.25)',
  cursor: 'pointer',
  position: 'relative',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  overflow: 'hidden',
  opacity: '1',
  transform: 'none',
  transition: '0.2s ease',
  'grid-template-columns': '1fr 1fr',
  'z-index': '1'
};

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr'
]);

const DEFAULT_UI_FILE = `#UI//
div(id="app")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  .background(#0c100e)
  .font-family(system-ui, sans-serif)
  .color(#f3faf5)
  .padding(24px)

  div(class="card")
    .background(#1a231e)
    .border(1px solid #355040)
    .border-radius(14px)
    .padding(28px)
    .max-width(420px)
    .width(100%)

    span "ytea"
      .display(inline-block)
      .font-size(12px)
      .font-weight(700)
      .letter-spacing(0.08em)
      .color(#3ecf6a)
      .margin-bottom(10px)

    h1 "Make a website."
      .font-size(26px)
      .font-weight(700)
      .margin(0 0 10px 0)

    p "Write how it looks in #UI//. Write what it does in #Y//. Real HTML + CSS names — nothing fake."
      .font-size(14px)
      .color(#7f9587)
      .line-height(1.55)
      .margin-bottom(20px)

    div
      .display(flex)
      .gap(10px)

      button(id="btnCount") "Count: 0"
        .background(#3ecf6a)
        .color(#062012)
        .border(none)
        .padding(10px 16px)
        .border-radius(8px)
        .font-size(13px)
        .font-weight(700)
        .cursor(pointer)

      button(id="btnReset") "Reset"
        .background(#121816)
        .color(#d7e4db)
        .border(1px solid #355040)
        .padding(10px 14px)
        .border-radius(8px)
        .font-size(13px)
        .cursor(pointer)`;

const DEFAULT_Y_FILE = `#Y//
var count = 0

on click @btnCount
  count += 1
  set text of @btnCount to "Count: " + count

on click @btnReset
  count = 0
  set text of @btnCount to "Count: 0"

on load
  log "ytea ready"`;

let docsView = 'readme'; // 'readme' | 'index' | page id

const DOC_LINK_MAP = {
  'readme.md': 'readme',
  '../readme.md': 'readme',
  'docs/ui-language.md': 'ui-language',
  'ui-language.md': 'ui-language',
  'docs/y-language.md': 'y-language',
  'y-language.md': 'y-language',
  'docs/examples.md': 'examples',
  'examples.md': 'examples',
  'docs/compiler.md': 'compiler',
  'compiler.md': 'compiler',
  'docs/cheatsheet.md': 'cheatsheet',
  'cheatsheet.md': 'cheatsheet'
};

const FALLBACK_HTML_TAGS = [
  'div', 'span', 'h1', 'h2', 'h3', 'p', 'button', 'input', 'img', 'a',
  'ul', 'ol', 'li', 'section', 'header', 'footer', 'nav', 'main', 'form',
  'label', 'textarea', 'select', 'option', 'canvas', 'video', 'audio'
];

const FALLBACK_CSS_PROPS = Object.keys(CSS_SMART_DEFAULTS);

const Y_LANGUAGE_SUGGESTIONS = [
  { label: 'set title to text', insert: 'set title to ""', kind: 'keyword', detail: 'Change the browser tab title' },
  { label: 'scroll to @id', insert: 'scroll to @', kind: 'keyword', detail: 'Smooth scroll to an element' },
  { label: 'copy text', insert: 'copy ', kind: 'keyword', detail: 'Copy text to clipboard' },
  { label: 'var name = value', insert: 'var ', kind: 'keyword', detail: 'Make a box that holds a value' },
  { label: 'func name()', insert: 'func name()', kind: 'keyword', detail: 'Make a reusable action', cursorBack: 1 },
  { label: 'on click @id', insert: 'on click @', kind: 'event', detail: 'Run code when something is clicked' },
  { label: 'on input @id', insert: 'on input @', kind: 'event', detail: 'Run code while typing' },
  { label: 'on change @id', insert: 'on change @', kind: 'event', detail: 'Run code when a value changes' },
  { label: 'on submit @id', insert: 'on submit @', kind: 'event', detail: 'Run code when a form is submitted' },
  { label: 'on mouseenter @id', insert: 'on mouseenter @', kind: 'event', detail: 'Run code when the mouse enters' },
  { label: 'on mouseleave @id', insert: 'on mouseleave @', kind: 'event', detail: 'Run code when the mouse leaves' },
  { label: 'on keydown @id', insert: 'on keydown @', kind: 'event', detail: 'Run code when a key is pressed' },
  { label: 'on key "Enter" @id', insert: 'on key "Enter" @', kind: 'event', detail: 'Run code when a specific key is pressed' },
  { label: 'on load', insert: 'on load', kind: 'event', detail: 'Run code when the page is ready' },
  { label: 'once click @id', insert: 'once click @', kind: 'event', detail: 'Run once the first time it is clicked' },
  { label: 'if condition', insert: 'if ', kind: 'keyword', detail: 'Do this only when something is true' },
  { label: 'else if condition', insert: 'else if ', kind: 'keyword', detail: 'Otherwise try this' },
  { label: 'else', insert: 'else', kind: 'keyword', detail: 'Otherwise do this' },
  { label: 'unless condition', insert: 'unless ', kind: 'keyword', detail: 'Do this only when something is false' },
  { label: 'repeat count', insert: 'repeat ', kind: 'keyword', detail: 'Do something many times' },
  { label: 'for item in list', insert: 'for item in ', kind: 'keyword', detail: 'Go through each thing in a list' },
  { label: 'each item in list', insert: 'each item in ', kind: 'keyword', detail: 'Same as for … in' },
  { label: 'while condition', insert: 'while ', kind: 'keyword', detail: 'Keep going while true' },
  { label: 'until condition', insert: 'until ', kind: 'keyword', detail: 'Keep going until true' },
  { label: 'try', insert: 'try', kind: 'keyword', detail: 'Try something that might fail' },
  { label: 'catch err', insert: 'catch err', kind: 'keyword', detail: 'Handle an error from try' },
  { label: 'wait 1000', insert: 'wait 1000', kind: 'keyword', detail: 'Pause, then run indented lines (ms)' },
  { label: 'every 1000', insert: 'every 1000', kind: 'keyword', detail: 'Run indented lines again and again (ms)' },
  { label: 'return', insert: 'return ', kind: 'keyword', detail: 'Send a value back from a func' },
  { label: 'stop', insert: 'stop', kind: 'keyword', detail: 'Leave a loop early (break)' },
  { label: 'skip', insert: 'skip', kind: 'keyword', detail: 'Skip to the next loop turn (continue)' },
  { label: 'log message', insert: 'log ', kind: 'keyword', detail: 'Print to the browser console' },
  { label: 'say message', insert: 'say ', kind: 'keyword', detail: 'Show an alert popup' },
  { label: 'ask question', insert: 'ask ', kind: 'keyword', detail: 'Ask the user and get text back' },
  { label: 'show @id', insert: 'show @', kind: 'keyword', detail: 'Make an element visible' },
  { label: 'hide @id', insert: 'hide @', kind: 'keyword', detail: 'Hide an element' },
  { label: 'toggle @id', insert: 'toggle @', kind: 'keyword', detail: 'Show if hidden, hide if shown' },
  { label: 'focus @id', insert: 'focus @', kind: 'keyword', detail: 'Put keyboard focus on an element' },
  { label: 'clear @id', insert: 'clear @', kind: 'keyword', detail: 'Clear text / input value' },
  { label: 'enable @id', insert: 'enable @', kind: 'keyword', detail: 'Enable a button or input' },
  { label: 'disable @id', insert: 'disable @', kind: 'keyword', detail: 'Disable a button or input' },
  { label: 'add class "x" to @id', insert: 'add class "" to @', kind: 'keyword', detail: 'Add a CSS class to an element', cursorBack: 5 },
  { label: 'remove class "x" from @id', insert: 'remove class "" from @', kind: 'keyword', detail: 'Remove a CSS class', cursorBack: 8 },
  { label: 'toggle class "x" on @id', insert: 'toggle class "" on @', kind: 'keyword', detail: 'Toggle a CSS class', cursorBack: 5 },
  { label: 'text of @id', insert: 'text of @', kind: 'keyword', detail: 'Read the text inside an element' },
  { label: 'value of @id', insert: 'value of @', kind: 'keyword', detail: 'Read the value of an input' },
  { label: 'set text of @id to', insert: 'set text of @ to ', kind: 'keyword', detail: 'Change the text inside an element' },
  { label: 'set value of @id to', insert: 'set value of @ to ', kind: 'keyword', detail: 'Change an input value' },
  { label: 'set style prop of @id to', insert: 'set style  of @ to ', kind: 'keyword', detail: 'Change one CSS style from logic', cursorBack: 8 },
  { label: 'append text to @id', insert: 'append  to @', kind: 'keyword', detail: 'Add more text inside an element', cursorBack: 5 }
];

const JS_MDN_SUGGESTIONS = [
  { label: 'console.log()', insert: 'console.log()', kind: 'js', detail: 'MDN: print a message to the console', cursorBack: 1 },
  { label: 'console.warn()', insert: 'console.warn()', kind: 'js', detail: 'MDN: print a warning', cursorBack: 1 },
  { label: 'console.error()', insert: 'console.error()', kind: 'js', detail: 'MDN: print an error', cursorBack: 1 },
  { label: 'Math.random()', insert: 'Math.random()', kind: 'js', detail: 'MDN: random number 0…1' },
  { label: 'Math.floor()', insert: 'Math.floor()', kind: 'js', detail: 'MDN: round down', cursorBack: 1 },
  { label: 'Math.ceil()', insert: 'Math.ceil()', kind: 'js', detail: 'MDN: round up', cursorBack: 1 },
  { label: 'Math.round()', insert: 'Math.round()', kind: 'js', detail: 'MDN: round to nearest', cursorBack: 1 },
  { label: 'Math.max()', insert: 'Math.max()', kind: 'js', detail: 'MDN: biggest number', cursorBack: 1 },
  { label: 'Math.min()', insert: 'Math.min()', kind: 'js', detail: 'MDN: smallest number', cursorBack: 1 },
  { label: 'JSON.stringify()', insert: 'JSON.stringify()', kind: 'js', detail: 'MDN: turn an object into text', cursorBack: 1 },
  { label: 'JSON.parse()', insert: 'JSON.parse()', kind: 'js', detail: 'MDN: turn text into an object', cursorBack: 1 },
  { label: 'Array.isArray()', insert: 'Array.isArray()', kind: 'js', detail: 'MDN: check if value is an array', cursorBack: 1 },
  { label: 'Date.now()', insert: 'Date.now()', kind: 'js', detail: 'MDN: current time in milliseconds' },
  { label: 'setTimeout()', insert: 'setTimeout(() => {\n  \n}, 1000)', kind: 'js', detail: 'MDN: wait, then run code' },
  { label: 'setInterval()', insert: 'setInterval(() => {\n  \n}, 1000)', kind: 'js', detail: 'MDN: run code again and again' },
  { label: 'fetch()', insert: 'fetch("")', kind: 'js', detail: 'MDN: load data from the internet', cursorBack: 2 },
  { label: 'localStorage.setItem()', insert: 'localStorage.setItem("", "")', kind: 'js', detail: 'MDN: save something in the browser', cursorBack: 5 },
  { label: 'localStorage.getItem()', insert: 'localStorage.getItem("")', kind: 'js', detail: 'MDN: read something from the browser', cursorBack: 2 },
  { label: 'alert()', insert: 'alert("")', kind: 'js', detail: 'MDN: show a simple popup', cursorBack: 2 },
  { label: 'prompt()', insert: 'prompt("")', kind: 'js', detail: 'MDN: ask the user a question', cursorBack: 2 },
  { label: '.textContent', insert: '.textContent', kind: 'js', detail: 'MDN: the text inside an element' },
  { label: '.value', insert: '.value', kind: 'js', detail: 'MDN: the value of an input' },
  { label: '.style', insert: '.style.', kind: 'js', detail: 'MDN: change CSS from JavaScript' },
  { label: '.classList.add()', insert: '.classList.add("")', kind: 'js', detail: 'MDN: add a CSS class', cursorBack: 2 },
  { label: '.classList.remove()', insert: '.classList.remove("")', kind: 'js', detail: 'MDN: remove a CSS class', cursorBack: 2 },
  { label: '.classList.toggle()', insert: '.classList.toggle("")', kind: 'js', detail: 'MDN: toggle a CSS class', cursorBack: 2 },
  { label: '.focus()', insert: '.focus()', kind: 'js', detail: 'MDN: focus an element' },
  { label: '.addEventListener()', insert: '.addEventListener("", (event) => {\n  \n})', kind: 'js', detail: 'MDN: listen for an event' }
];

const ZENOPACK_VERSION = '1.0';
const ZENOPACK_MIME_MAP = {
  html: 'text/html', htm: 'text/html',
  js: 'application/javascript', mjs: 'application/javascript', cjs: 'application/javascript',
  css: 'text/css', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', ico: 'image/x-icon',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
  mp4: 'video/mp4', webm: 'video/webm',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  txt: 'text/plain', xml: 'application/xml', wasm: 'application/wasm',
};
const ZENOPACK_HTML_PLACEHOLDER = '__ZENOPACK_BASE64__';

let projects = [];
let activeProjectId = null;
let activeViewMode = 'code';
let selectedAssetId = null;
let lastCompiledDocument = '';
let previewWindowRef = null;
let acItems = [];
let acSelectedIndex = 0;
let acTokenStart = 0;
let acDebounceTimer = null;

let UI_TAG_SUGGESTIONS = [];
let CSS_MODIFIER_SUGGESTIONS = [];

const projectSelect = document.getElementById('projectSelect');
const sidebarProjectName = document.getElementById('sidebarProjectName');
const fileTreeList = document.getElementById('fileTreeList');
const tabBar = document.getElementById('tabBar');
const codeEditor = document.getElementById('codeEditor');
const codeHighlight = document.getElementById('codeHighlight');
const codeLineNumbers = document.getElementById('codeLineNumbers');
const activeLineHighlight = document.getElementById('activeLineHighlight');
const assetPreview = document.getElementById('assetPreview');
const autocompleteMenu = document.getElementById('autocompleteMenu');
const statusMode = document.getElementById('statusMode');
const statusCompile = document.getElementById('statusCompile');
const statusSave = document.getElementById('statusSave');
const statusCursor = document.getElementById('statusCursor');
const statusCatalog = document.getElementById('statusCatalog');
const assetFileInput = document.getElementById('assetFileInput');
const assetFolderInput = document.getElementById('assetFolderInput');
const projectZipInput = document.getElementById('projectZipInput');

const TAB_CLOSE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

function generateId(prefix) {
  return prefix + '_' + Math.random().toString(36).substring(2, 9);
}

function buildTagSuggestion(tag) {
  const t = tag.toLowerCase();
  let insert = t;
  let detail = `HTML element <${t}>`;
  let cursorBack = 0;

  if (t === 'img') {
    insert = 'img(src="" alt="")';
    cursorBack = 8;
    detail = 'HTML image';
  } else if (t === 'input') {
    insert = 'input(id="" type="text")';
    cursorBack = 13;
    detail = 'HTML input field';
  } else if (t === 'a') {
    insert = 'a(href="") ""';
    cursorBack = 1;
    detail = 'HTML link';
  } else if (t === 'button') {
    insert = 'button(id="") ""';
    cursorBack = 1;
    detail = 'HTML button';
  } else if (VOID_HTML_TAGS.has(t)) {
    insert = `${t}()`;
    cursorBack = 1;
  } else if (['div', 'section', 'header', 'footer', 'main', 'nav', 'form', 'ul', 'ol'].includes(t)) {
    insert = `${t}(id="")`;
    cursorBack = 1;
  } else {
    insert = `${t} ""`;
    cursorBack = 1;
  }

  return { label: t, insert, kind: 'tag', detail, cursorBack, source: 'html-tags' };
}

function buildCssSuggestion(prop, meta = {}) {
  const initial = meta.initial;
  let value = CSS_SMART_DEFAULTS[prop];
  if (value == null && typeof initial === 'string' && initial.length < 40 && !initial.includes("'") && !initial.includes('[')) {
    value = initial;
  }
  if (value == null) value = '';
  const insert = `.${prop}(${value})`;
  const syntax = typeof meta.syntax === 'string' ? meta.syntax.replace(/\s+/g, ' ').slice(0, 90) : '';
  const group = Array.isArray(meta.groups) && meta.groups[0] ? meta.groups[0] : 'CSS';
  const detail = syntax ? `${group} · ${syntax}` : `${group} property`;
  return {
    label: `.${prop}`,
    insert,
    kind: 'css',
    detail,
    cursorBack: value ? 0 : 1,
    source: 'mdn-data'
  };
}

function applyFallbackCatalogs() {
  UI_TAG_SUGGESTIONS = FALLBACK_HTML_TAGS.map(buildTagSuggestion);
  CSS_MODIFIER_SUGGESTIONS = FALLBACK_CSS_PROPS.map(p => buildCssSuggestion(p));
}

function setCatalogStatus(text, ok = false) {
  if (!statusCatalog) return;
  statusCatalog.textContent = text;
  statusCatalog.className = 'status-item' + (ok ? ' ok' : ' warn');
}

async function loadOfficialCatalogs() {
  applyFallbackCatalogs();
  setCatalogStatus('Hints: loading…');

  try {
    const cached = localStorage.getItem(CATALOG_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.tags) && Array.isArray(parsed.css) && Date.now() - parsed.savedAt < 1000 * 60 * 60 * 24 * 7) {
        UI_TAG_SUGGESTIONS = parsed.tags;
        CSS_MODIFIER_SUGGESTIONS = parsed.css;
        setCatalogStatus(`Hints: ${parsed.css.length} CSS · ${parsed.tags.length} HTML`, true);
        return;
      }
    }
  } catch (_) { /* ignore bad cache */ }

  try {
    const [cssRes, tagsRes] = await Promise.all([
      fetch(MDN_CSS_URL),
      fetch(HTML_TAGS_URL)
    ]);
    if (!cssRes.ok || !tagsRes.ok) throw new Error('catalog fetch failed');

    const cssJson = await cssRes.json();
    const tagsJson = await tagsRes.json();

    const tags = (Array.isArray(tagsJson) ? tagsJson : [])
      .filter(t => typeof t === 'string' && !['html', 'head', 'body', 'script', 'style', 'meta', 'link', 'title'].includes(t))
      .map(buildTagSuggestion);

    const css = Object.keys(cssJson)
      .filter(k => !k.startsWith('-') && !k.includes('*') && cssJson[k] && cssJson[k].status !== 'nonstandard')
      .map(k => buildCssSuggestion(k, cssJson[k]));

    if (tags.length) UI_TAG_SUGGESTIONS = tags;
    if (css.length) CSS_MODIFIER_SUGGESTIONS = css;

    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      tags: UI_TAG_SUGGESTIONS,
      css: CSS_MODIFIER_SUGGESTIONS
    }));

    setCatalogStatus(`Hints: ${CSS_MODIFIER_SUGGESTIONS.length} CSS · ${UI_TAG_SUGGESTIONS.length} HTML`, true);
  } catch (err) {
    console.warn('ytea catalog load failed, using fallback', err);
    setCatalogStatus(`Hints: offline fallback (${CSS_MODIFIER_SUGGESTIONS.length} CSS)`, false);
  }
}

function ensureProjectShape(proj) {
  if (!proj || typeof proj !== 'object') return proj;
  if (!Array.isArray(proj.files)) proj.files = [];
  if (!Array.isArray(proj.assets)) proj.assets = [];
  if (!Array.isArray(proj.openTabs)) {
    proj.openTabs = proj.files.map(f => ({ type: 'file', id: f.id }));
  } else {
    proj.openTabs = proj.openTabs.filter(tab => {
      if (!tab || !tab.type || !tab.id) return false;
      if (tab.type === 'file') return proj.files.some(f => f.id === tab.id);
      if (tab.type === 'asset') return proj.assets.some(a => a.id === tab.id);
      if (tab.type === 'docs') return true;
      return false;
    });
  }
  return proj;
}

function ensureOpenTab(type, id) {
  const proj = getActiveProject();
  if (!proj) return;
  if (type === 'docs') {
    const existing = proj.openTabs.find(t => t.type === 'docs');
    if (existing) {
      if (existing.id !== id) {
        existing.id = id;
        saveProjects();
      }
      return;
    }
  }
  if (!proj.openTabs.some(t => t.type === type && t.id === id)) {
    proj.openTabs.push({ type, id });
    saveProjects();
  }
}

function removeOpenTab(type, id) {
  const proj = getActiveProject();
  if (!proj) return;
  proj.openTabs = proj.openTabs.filter(t => !(t.type === type && t.id === id));
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function downloadProjectZip() {
  if (typeof JSZip === 'undefined') {
    showToast('ZIP library missing');
    return;
  }
  const proj = getActiveProject();
  if (!proj) return;

  const zip = new JSZip();
  zip.file('ytea.json', JSON.stringify({
    version: 1,
    name: proj.name,
    activeFile: (proj.files.find(f => f.id === proj.activeFileId) || {}).name || null
  }, null, 2));

  for (const file of proj.files) {
    zip.file(file.name, file.content || '');
  }
  for (const asset of proj.assets) {
    const path = normalizeAssetPath(asset.path);
    if (!path || path.toLowerCase() === 'ytea.json') continue;
    zip.file(path, base64ToBytes(asset.dataBase64));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${safeDownloadName(proj.name, 'ytea-project')}.zip`);
  showToast('Project ZIP downloaded');
}

async function uploadProjectZip(file) {
  if (!file) return;
  if (typeof JSZip === 'undefined') {
    showToast('ZIP library missing');
    return;
  }

  const zip = await JSZip.loadAsync(file);
  let meta = { name: file.name.replace(/\.zip$/i, '') || 'imported-project' };
  const metaFile = zip.file('ytea.json');
  if (metaFile) {
    try {
      const parsed = JSON.parse(await metaFile.async('string'));
      if (parsed && typeof parsed === 'object') meta = { ...meta, ...parsed };
    } catch (_) { /* ignore bad meta */ }
  }

  const files = [];
  const assets = [];
  const entries = Object.keys(zip.files).filter(p => !zip.files[p].dir);

  for (const entryPath of entries) {
    const path = normalizeAssetPath(entryPath);
    if (!path || path === 'ytea.json' || path.startsWith('__MACOSX/') || path.endsWith('.DS_Store')) continue;
    const entry = zip.file(entryPath);
    if (!entry) continue;

    if (/\.ytea$/i.test(path) && !path.includes('/')) {
      const content = await entry.async('string');
      files.push({
        id: generateId('file'),
        name: path,
        content
      });
    } else if (/\.ytea$/i.test(path)) {
      // Nested .ytea files are treated as source files using the basename
      const content = await entry.async('string');
      const name = path.split('/').pop();
      if (!files.some(f => f.name === name)) {
        files.push({ id: generateId('file'), name, content });
      }
    } else {
      const bytes = new Uint8Array(await entry.async('uint8array'));
      assets.push({
        id: generateId('asset'),
        path,
        mimeType: getZenopackMime(path),
        dataBase64: bytesToBase64(bytes),
        size: bytes.length
      });
    }
  }

  if (!files.length) {
    showToast('ZIP has no .ytea files');
    return;
  }

  const activeName = meta.activeFile;
  const active = files.find(f => f.name === activeName) || files[0];
  const np = {
    id: generateId('ws'),
    name: String(meta.name || 'imported-project').trim() || 'imported-project',
    files,
    assets,
    openTabs: files.map(f => ({ type: 'file', id: f.id })),
    activeFileId: active.id
  };
  projects.push(np);
  activeProjectId = np.id;
  selectedAssetId = null;
  saveProjects();
  openCodeFile(active.id, { addTab: false });
  compileProject(false);
  showToast(`Imported “${np.name}” (${files.length} files, ${assets.length} assets)`);
}

function closeOpenTab(type, id) {
  const proj = getActiveProject();
  if (!proj) return;
  const idx = proj.openTabs.findIndex(t => t.type === type && t.id === id);
  if (idx < 0) return;

  const wasActive =
    (type === 'file' && activeViewMode === 'code' && proj.activeFileId === id) ||
    (type === 'asset' && activeViewMode === 'asset' && selectedAssetId === id) ||
    (type === 'docs' && activeViewMode === 'readme');

  proj.openTabs.splice(idx, 1);
  saveProjects();

  if (!wasActive) {
    renderWorkspaceUI();
    return;
  }

  const next = proj.openTabs[idx] || proj.openTabs[idx - 1] || proj.openTabs[0] || null;
  if (!next) {
    if (proj.files[0]) openCodeFile(proj.files[0].id, { addTab: true });
    else renderWorkspaceUI();
    return;
  }
  if (next.type === 'file') openCodeFile(next.id, { addTab: false });
  else if (next.type === 'asset') openAssetView(next.id, { addTab: false });
  else openReadmeView(next.id === 'index' ? 'index' : 'readme', { addTab: false });
}

function getExplorerEntries(proj) {
  const entries = [];
  for (const file of proj.files) {
    entries.push({
      kind: 'file',
      id: file.id,
      path: file.name,
      label: file.name,
      depth: 0,
      mode: detectFileHeader(file.content)
    });
  }
  for (const asset of proj.assets) {
    const path = normalizeAssetPath(asset.path);
    entries.push({
      kind: 'asset',
      id: asset.id,
      path,
      label: path,
      depth: Math.max(0, path.split('/').length - 1),
      mode: 'A'
    });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path, undefined, { sensitivity: 'base' }));
  return entries;
}

function loadProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { projects = JSON.parse(raw); } catch { projects = []; }
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    const f1 = { id: generateId('file'), name: 'main.ytea', content: DEFAULT_UI_FILE };
    const f2 = { id: generateId('file'), name: 'logic.ytea', content: DEFAULT_Y_FILE };
    projects = [{
      id: generateId('ws'),
      name: 'my-first-site',
      files: [f1, f2],
      assets: [],
      openTabs: [{ type: 'file', id: f1.id }, { type: 'file', id: f2.id }],
      activeFileId: f1.id
    }];
    saveProjects();
  } else {
    projects.forEach(ensureProjectShape);
  }
  const savedWs = localStorage.getItem(ACTIVE_PROJECT_KEY);
  activeProjectId = projects.some(p => p.id === savedWs) ? savedWs : projects[0].id;
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    if (statusSave) statusSave.textContent = 'Saved';
  } catch (err) {
    console.error(err);
    if (statusSave) statusSave.textContent = 'Save failed';
    showToast('Could not save — assets may be too large for browser storage');
  }
}

function getActiveProject() {
  return ensureProjectShape(projects.find(p => p.id === activeProjectId) || projects[0]);
}

function getActiveFile() {
  const proj = getActiveProject();
  if (!proj || !Array.isArray(proj.files)) return null;
  return proj.files.find(f => f.id === proj.activeFileId) || proj.files[0];
}

function getSelectedAsset() {
  const proj = getActiveProject();
  if (!proj || !selectedAssetId) return null;
  return proj.assets.find(a => a.id === selectedAssetId) || null;
}

function getZenopackMime(filename) {
  const ext = String(filename || '').split('.').pop().toLowerCase();
  return ZENOPACK_MIME_MAP[ext] || 'application/octet-stream';
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64) {
  const binary = atob(b64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function textToByteArray(text) {
  return Array.from(new TextEncoder().encode(String(text || '')));
}

function base64ToByteArray(b64) {
  return Array.from(base64ToBytes(b64));
}

function formatBytes(n) {
  if (!n || n < 1024) return `${n || 0} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function normalizeAssetPath(path) {
  return String(path || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^\.\//, '');
}

async function readFileAsAsset(file, relativePath) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const path = normalizeAssetPath(relativePath || file.name);
  return {
    id: generateId('asset'),
    path,
    mimeType: file.type || getZenopackMime(path),
    dataBase64: bytesToBase64(bytes),
    size: bytes.length
  };
}

function upsertAssets(newAssets) {
  const proj = getActiveProject();
  if (!proj || !newAssets.length) return 0;
  let added = 0;
  for (const asset of newAssets) {
    const existing = proj.assets.findIndex(a => a.path === asset.path);
    if (existing >= 0) proj.assets[existing] = asset;
    else {
      proj.assets.push(asset);
      added++;
    }
  }
  proj.assets.sort((a, b) => a.path.localeCompare(b.path));
  saveProjects();
  return added;
}

async function importAssetFileList(fileList, fromFolder) {
  const files = Array.from(fileList || []).filter(f => f && f.name && !f.name.startsWith('.'));
  if (!files.length) {
    showToast('No files selected');
    return;
  }
  const assets = [];
  for (const file of files) {
    let path = file.name;
    if (fromFolder && file.webkitRelativePath) {
      // Keep the selected folder name + nested paths exactly as chosen
      path = file.webkitRelativePath;
    }
    path = normalizeAssetPath(path);
    if (!path || path.split('/').includes('..')) continue;
    assets.push(await readFileAsAsset(file, path));
  }
  const added = upsertAssets(assets);
  renderWorkspaceUI();
  showToast(added ? `Added ${assets.length} asset${assets.length === 1 ? '' : 's'}` : `Updated ${assets.length} asset${assets.length === 1 ? '' : 's'}`);
}

function detectFileHeader(content) {
  const firstLine = (content || '').trim().split('\n')[0];
  return firstLine.startsWith('#Y//') ? 'Y' : 'UI';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function highlightMatch(label, query) {
  const safe = escapeHtml(label);
  if (!query) return safe;
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return safe;
  const before = escapeHtml(label.slice(0, idx));
  const mid = escapeHtml(label.slice(idx, idx + query.length));
  const after = escapeHtml(label.slice(idx + query.length));
  return `${before}<mark>${mid}</mark>${after}`;
}

function fuzzyScore(label, query) {
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 1;
  if (l === q) return 1000;
  if (l.startsWith(q)) return 800 - Math.min(l.length, 80);
  if (l.includes(q)) return 500 - l.indexOf(q);

  let li = 0;
  let score = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = l.indexOf(ch, li);
    if (found < 0) return 0;
    score += 10 - Math.min(found - li, 9);
    li = found + 1;
  }
  return score;
}

function highlightYteaFile(code) {
  const mode = detectFileHeader(code);
  return code.split('\n').map((line, index) => {
    const trimmed = line.trim();
    const spaceMatch = line.match(/^\s*/);
    const leadingSpaces = spaceMatch ? spaceMatch[0] : '';
    if (!trimmed) return '';

    if (index === 0 && (trimmed.startsWith('#UI//') || trimmed.startsWith('#Y//'))) {
      return `${leadingSpaces}<span class="tok-header">${escapeHtml(trimmed)}</span>`;
    }
    if (trimmed.startsWith('//')) {
      return `${leadingSpaces}<span class="tok-comment">${escapeHtml(trimmed)}</span>`;
    }

    if (mode === 'UI') {
      if (trimmed.startsWith('.')) {
        const modMatch = trimmed.match(/^\.([a-zA-Z0-9_-]+)\((.*)\)$/);
        if (modMatch) {
          return `${leadingSpaces}<span class="tok-mod">.${escapeHtml(modMatch[1])}</span>(<span class="tok-val">${escapeHtml(modMatch[2])}</span>)`;
        }
        return `${leadingSpaces}<span class="tok-mod">${escapeHtml(trimmed)}</span>`;
      }
      const elemMatch = trimmed.match(/^([a-zA-Z0-9-]+)(\([^)]*\))?(.*)$/);
      if (elemMatch) {
        const tag = escapeHtml(elemMatch[1]);
        let attrsPart = elemMatch[2] || '';
        let restPart = elemMatch[3] || '';
        if (attrsPart) {
          const inner = escapeHtml(attrsPart.slice(1, -1))
            .replace(/([a-zA-Z0-9_-]+)=("[^"]*"|'[^']*')/g, '<span class="tok-attr">$1</span>=<span class="tok-str">$2</span>');
          attrsPart = `(${inner})`;
        }
        if (restPart) {
          restPart = escapeHtml(restPart).replace(/("[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');
        }
        return `${leadingSpaces}<span class="tok-tag">${tag}</span>${attrsPart}${restPart}`;
      }
      return escapeHtml(line);
    }

    // Placeholder-pass so keyword "class" never matches inside <span class="...">.
    // Markers use _digits_ so \b(\d+)\b cannot eat the slot index.
    const slots = [];
    const slot = (html) => {
      const i = slots.length;
      slots.push(html);
      return `\uE000_${i}_\uE001`;
    };
    let escaped = escapeHtml(trimmed);
    escaped = escaped.replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, (m) => slot(`<span class="tok-str">${m}</span>`));
    escaped = escaped.replace(/@([a-zA-Z0-9_-]+)/g, (_, id) => slot(`<span class="tok-ref">@${id}</span>`));
    escaped = escaped.replace(/\b(var|let|const|func|on|once|if|else|unless|repeat|for|each|in|while|until|try|catch|wait|every|return|stop|skip|log|say|ask|show|hide|toggle|focus|clear|enable|disable|add|remove|set|append|text|value|style|class|of|to|from|key|load|true|false|null)\b/g, (m) => slot(`<span class="tok-kw">${m}</span>`));
    escaped = escaped.replace(/\b(\d+)\b/g, (m) => slot(`<span class="tok-num">${m}</span>`));
    escaped = escaped.replace(/\uE000_(\d+)_\uE001/g, (_, i) => slots[Number(i)]);
    return `${leadingSpaces}${escaped}`;
  }).join('\n');
}

function collectWorkspaceIds() {
  const proj = getActiveProject();
  if (!proj) return [];
  const ids = new Set();
  for (const f of proj.files) {
    if (detectFileHeader(f.content) === 'UI') {
      const matches = f.content.matchAll(/\bid\s*=\s*["']([^"']+)["']/g);
      for (const m of matches) ids.add(m[1]);
    }
  }
  return Array.from(ids).map(id => ({
    label: `@${id}`,
    insert: `@${id}`,
    kind: 'element',
    detail: `Your element id="${id}"`
  }));
}

function scheduleAutocomplete(force = false) {
  clearTimeout(acDebounceTimer);
  acDebounceTimer = setTimeout(() => triggerAutocomplete(force), force ? 0 : 40);
}

function triggerAutocomplete(force = false) {
  const pos = codeEditor.selectionStart;
  const textBefore = codeEditor.value.substring(0, pos);
  const currentLine = textBefore.split('\n').pop();
  const tokenMatch = currentLine.match(/([.@a-zA-Z0-9_-]+)$/);

  if (!tokenMatch && !force) {
    hideAutocomplete();
    return;
  }

  const token = tokenMatch ? tokenMatch[1] : '';
  acTokenStart = tokenMatch ? pos - token.length : pos;
  const mode = detectFileHeader(codeEditor.value);
  let pool = [];

  if (mode === 'UI') {
    if (token.startsWith('.') || (force && currentLine.trim().startsWith('.'))) {
      pool = CSS_MODIFIER_SUGGESTIONS;
    } else if (!token || currentLine.trim() === token || /^[a-zA-Z]/.test(token)) {
      pool = UI_TAG_SUGGESTIONS;
    }
  } else {
    if (token.startsWith('@')) {
      pool = collectWorkspaceIds();
    } else {
      pool = [...Y_LANGUAGE_SUGGESTIONS, ...JS_MDN_SUGGESTIONS, ...collectWorkspaceIds()];
    }
  }

  const scored = pool
    .map(item => ({ item, score: fuzzyScore(item.label, token) }))
    .filter(x => force ? true : x.score > 0)
    .filter(x => x.item.label !== token)
    .sort((a, b) => b.score - a.score || a.item.label.length - b.item.label.length)
    .slice(0, 60)
    .map(x => x.item);

  acItems = scored;
  if (acItems.length === 0) {
    hideAutocomplete();
    return;
  }

  acSelectedIndex = 0;
  renderAutocompleteMenu(textBefore, token);
}

function getSymbolBadge(kind) {
  if (kind === 'tag') return '<span class="ac-symbol sym-tag">&lt;&gt;</span>';
  if (kind === 'css') return '<span class="ac-symbol sym-css">#</span>';
  if (kind === 'element') return '<span class="ac-symbol sym-el">@</span>';
  if (kind === 'js') return '<span class="ac-symbol sym-js">JS</span>';
  if (kind === 'event') return '<span class="ac-symbol sym-event">on</span>';
  return '<span class="ac-symbol sym-kw">ƒ</span>';
}

function renderAutocompleteMenu(textBefore, query = '') {
  const lines = textBefore.split('\n');
  const lineIndex = lines.length - 1;
  const colIndex = lines[lineIndex].length;
  const charW = 8.15;
  const lineH = 21.6;

  const topPx = Math.min((lineIndex + 1) * lineH + 16 - codeEditor.scrollTop, codeEditor.clientHeight - 220);
  const leftPx = Math.min(colIndex * charW + 16 - codeEditor.scrollLeft, codeEditor.clientWidth - 300);

  autocompleteMenu.style.top = `${Math.max(8, topPx)}px`;
  autocompleteMenu.style.left = `${Math.max(8, leftPx)}px`;

  const selected = acItems[acSelectedIndex] || acItems[0];
  const listHtml = acItems.map((item, idx) => `
    <div class="ac-item ${idx === acSelectedIndex ? 'selected' : ''}" data-idx="${idx}" role="option" aria-selected="${idx === acSelectedIndex}">
      ${getSymbolBadge(item.kind)}
      <span class="ac-label">${highlightMatch(item.label, query)}</span>
      <span class="ac-kind">${escapeHtml(item.kind)}</span>
    </div>
  `).join('');

  autocompleteMenu.innerHTML = `
    <div class="ac-list">${listHtml}</div>
    <div class="ac-footer">
      <div class="ac-detail-title">${escapeHtml(selected.label)}</div>
      <div class="ac-detail-body">${escapeHtml(selected.detail || '')}</div>
      <div class="ac-hint-keys">Tab / Enter · ↑↓ · Esc · Ctrl+Space</div>
    </div>
  `;

  autocompleteMenu.querySelectorAll('.ac-item').forEach(el => {
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      applyAutocomplete(Number(el.dataset.idx));
    });
    el.addEventListener('mouseenter', () => {
      acSelectedIndex = Number(el.dataset.idx);
      renderAutocompleteMenu(textBefore, query);
    });
  });

  autocompleteMenu.classList.add('visible');

  const selectedEl = autocompleteMenu.querySelector('.ac-item.selected');
  if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
}

function hideAutocomplete() {
  autocompleteMenu.classList.remove('visible');
  acItems = [];
}

function applyAutocomplete(index) {
  const chosen = acItems[index];
  if (!chosen) return;
  const pos = codeEditor.selectionStart;
  const before = codeEditor.value.substring(0, acTokenStart);
  const after = codeEditor.value.substring(pos);
  const insert = chosen.insert;

  codeEditor.value = before + insert + after;
  let newCursor = acTokenStart + insert.length;
  if (chosen.cursorBack) newCursor -= chosen.cursorBack;
  else if (insert.endsWith('()') || insert.endsWith('""')) newCursor -= 1;

  codeEditor.selectionStart = codeEditor.selectionEnd = newCursor;
  hideAutocomplete();
  codeEditor.dispatchEvent(new Event('input'));
  codeEditor.focus();
}

function restructureUIToHTML(source) {
  const lines = source.split('\n');
  const root = { tag: 'root', indent: -1, children: [], styles: [], attrs: '', text: '' };
  const stack = [root];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#UI//')) continue;
    const indent = rawLine.search(/\S/);

    if (trimmed.startsWith('.')) {
      const match = trimmed.match(/^\.([a-zA-Z0-9_-]+)\((.*)\)$/);
      if (match) {
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        const target = stack[stack.length - 1];
        if (target && target.tag !== 'root') target.styles.push(`${match[1]}: ${match[2]};`);
        continue;
      }
    }

    // Void tags stay on the stack only so indented .styles() can attach to them.
    // Before a new element, pop voids — they cannot contain children.
    while (stack.length > 1 && stack[stack.length - 1].isVoid) stack.pop();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

    if (trimmed.startsWith('<')) {
      stack[stack.length - 1].children.push({ raw: trimmed, indent, children: [], styles: [] });
      continue;
    }

    const tagMatch = trimmed.match(/^([a-zA-Z0-9-]+)(.*)$/);
    if (!tagMatch) continue;
    const tag = tagMatch[1];
    let rest = tagMatch[2].trim();
    let attrs = '';

    if (rest.startsWith('(')) {
      let depth = 0, closeIdx = -1;
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '(') depth++;
        if (rest[i] === ')') depth--;
        if (depth === 0) { closeIdx = i; break; }
      }
      if (closeIdx !== -1) {
        attrs = rest.slice(1, closeIdx).trim();
        rest = rest.slice(closeIdx + 1).trim();
      }
    }

    let text = '';
    if ((rest.startsWith('"') && rest.endsWith('"')) || (rest.startsWith("'") && rest.endsWith("'"))) {
      text = rest.slice(1, -1);
    } else if (rest.length > 0) {
      text = rest;
    }

    const node = {
      tag,
      indent,
      attrs,
      text,
      styles: [],
      children: [],
      isVoid: VOID_HTML_TAGS.has(tag.toLowerCase())
    };
    stack[stack.length - 1].children.push(node);
    // Always push (including void) so following indented styles bind correctly
    stack.push(node);
  }

  function renderNode(node, depth) {
    if (node.raw) return '  '.repeat(depth) + node.raw;
    const pad = '  '.repeat(depth);
    const attrPart = node.attrs ? ` ${node.attrs}` : '';
    const stylePart = node.styles.length > 0 ? ` style="${node.styles.join(' ')}"` : '';
    if (node.isVoid) return `${pad}<${node.tag}${attrPart}${stylePart} />`;
    if (node.children.length === 0) return `${pad}<${node.tag}${attrPart}${stylePart}>${node.text}</${node.tag}>`;

    const inner = [];
    if (node.text) inner.push(`${pad}  ${node.text}`);
    for (const child of node.children) inner.push(renderNode(child, depth + 1));
    return `${pad}<${node.tag}${attrPart}${stylePart}>\n${inner.join('\n')}\n${pad}</${node.tag}>`;
  }

  return root.children.map(child => renderNode(child, 1)).join('\n');
}

function restructureYToJS(source) {
  const parsedLines = [];
  for (const raw of source.split('\n')) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#Y//')) continue;
    parsedLines.push({ indent: raw.search(/\S/), text: trimmed });
  }

  const output = [];
  const blockStack = [];
  const expandRefs = (expr) => expr
    .replace(/\btext of @([a-zA-Z0-9_-]+)/g, "document.getElementById('$1').textContent")
    .replace(/\bvalue of @([a-zA-Z0-9_-]+)/g, "document.getElementById('$1').value")
    .replace(/("[^"]*"|'[^']*'|`[^`]*`)|@([a-zA-Z0-9_-]+)/g, (m, q, id) => q || `document.getElementById('${id}')`);

  const quoteOf = (raw) => {
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) return raw;
    return JSON.stringify(raw);
  };

  for (const { indent, text } of parsedLines) {
    while (blockStack.length > 0 && blockStack[blockStack.length - 1].indent >= indent) {
      const closed = blockStack.pop();
      output.push('  '.repeat(blockStack.length + 2) + closed.closer);
    }
    const pad = '  '.repeat(blockStack.length + 2);

    if (text.startsWith('//')) { output.push(`${pad}${text}`); continue; }

    if (text === 'on load' || text === 'when ready' || text === 'when load') {
      output.push(`${pad}window.addEventListener('DOMContentLoaded', () => {`);
      blockStack.push({ indent, closer: '});' });
      continue;
    }

    const onceMatch = text.match(/^once\s+([a-zA-Z0-9_-]+)\s+@([a-zA-Z0-9_-]+)$/);
    if (onceMatch) {
      output.push(`${pad}document.getElementById('${onceMatch[2]}').addEventListener('${onceMatch[1]}', (event) => {`);
      blockStack.push({ indent, closer: '}, { once: true });' });
      continue;
    }

    const onKeyMatch = text.match(/^on\s+key\s+("[^"]+"|'[^']+')\s+@([a-zA-Z0-9_-]+)$/);
    if (onKeyMatch) {
      output.push(`${pad}document.getElementById('${onKeyMatch[2]}').addEventListener('keydown', (event) => {`);
      output.push(`${pad}  if (event.key !== ${onKeyMatch[1]}) return;`);
      blockStack.push({ indent, closer: '});' });
      continue;
    }

    const onMatch = text.match(/^on\s+([a-zA-Z0-9_-]+)\s+@([a-zA-Z0-9_-]+)$/);
    if (onMatch) {
      output.push(`${pad}document.getElementById('${onMatch[2]}').addEventListener('${onMatch[1]}', (event) => {`);
      blockStack.push({ indent, closer: '});' });
      continue;
    }

    const funcMatch = text.match(/^func\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)$/);
    if (funcMatch) {
      output.push(`${pad}function ${funcMatch[1]}(${funcMatch[2]}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const elseIfMatch = text.match(/^else\s+if\s+(.+)$/);
    if (elseIfMatch) {
      output.push(`${pad}else if (${expandRefs(elseIfMatch[1])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }
    if (text === 'else') {
      output.push(`${pad}else {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const unlessMatch = text.match(/^unless\s+(.+)$/);
    if (unlessMatch) {
      output.push(`${pad}if (!(${expandRefs(unlessMatch[1])})) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const ifMatch = text.match(/^if\s+(.+)$/);
    if (ifMatch) {
      output.push(`${pad}if (${expandRefs(ifMatch[1])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    
    const copyTextMatch = text.match(/^copy\s+(.+)$/);
    if (copyTextMatch) {
      const m = copyTextMatch;
      output.push(`${pad}navigator.clipboard.writeText(${expandRefs(m[1])});`);
      continue;
    }

    const scrollToMatch = text.match(/^scroll\s+to\s+@([a-zA-Z0-9_-]+)$/);
    if (scrollToMatch) {
      const m = scrollToMatch;
      output.push(`${pad}document.getElementById('${m[1]}').scrollIntoView({ behavior: 'smooth' });`);
      continue;
    }

    const setPageTitleMatch = text.match(/^set\s+title\s+to\s+(.+)$/);
    if (setPageTitleMatch) {
      const m = setPageTitleMatch;
      output.push(`${pad}window.top.document.title = ${expandRefs(m[1])};`);
      continue;
    }

    const tryMatch = text.match(/^try$/);
    if (tryMatch) {
      output.push(`${pad}try {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const catchMatch = text.match(/^catch\s+([a-zA-Z0-9_$]+)$/);
    if (catchMatch) {
      output.push(`${pad}catch (${catchMatch[1]}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const waitMatch = text.match(/^wait\s+(.+)$/);
    if (waitMatch) {
      output.push(`${pad}setTimeout(() => {`);
      blockStack.push({ indent, closer: `}, ${expandRefs(waitMatch[1])});` });
      continue;
    }

    const everyMatch = text.match(/^every\s+(.+)$/);
    if (everyMatch) {
      output.push(`${pad}setInterval(() => {`);
      blockStack.push({ indent, closer: `}, ${expandRefs(everyMatch[1])});` });
      continue;
    }

    const repeatMatch = text.match(/^repeat\s+(.+)$/);
    if (repeatMatch) {
      output.push(`${pad}for (let i = 0; i < ${expandRefs(repeatMatch[1])}; i++) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const forInMatch = text.match(/^(?:for|each)\s+([a-zA-Z0-9_$]+)\s+in\s+(.+)$/);
    if (forInMatch) {
      output.push(`${pad}for (const ${forInMatch[1]} of ${expandRefs(forInMatch[2])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const untilMatch = text.match(/^until\s+(.+)$/);
    if (untilMatch) {
      output.push(`${pad}while (!(${expandRefs(untilMatch[1])})) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const whileMatch = text.match(/^while\s+(.+)$/);
    if (whileMatch) {
      output.push(`${pad}while (${expandRefs(whileMatch[1])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }

    const varAskMatch = text.match(/^var\s+([a-zA-Z0-9_$]+)\s*=\s*ask\s+(.+)$/);
    if (varAskMatch) {
      output.push(`${pad}let ${varAskMatch[1]} = prompt(${expandRefs(varAskMatch[2])});`);
      continue;
    }

    const varMatch = text.match(/^var\s+(.+)$/);
    if (varMatch) {
      output.push(`${pad}let ${expandRefs(varMatch[1])};`);
      continue;
    }

    if (text === 'stop') { output.push(`${pad}break;`); continue; }
    if (text === 'skip') { output.push(`${pad}continue;`); continue; }

    const logMatch = text.match(/^log\s+(.+)$/);
    if (logMatch) { output.push(`${pad}console.log(${expandRefs(logMatch[1])});`); continue; }

    const sayMatch = text.match(/^say\s+(.+)$/);
    if (sayMatch) { output.push(`${pad}alert(${expandRefs(sayMatch[1])});`); continue; }

    const askMatch = text.match(/^ask\s+(.+)$/);
    if (askMatch) { output.push(`${pad}prompt(${expandRefs(askMatch[1])});`); continue; }

    const showMatch = text.match(/^show\s+@([a-zA-Z0-9_-]+)$/);
    if (showMatch) { output.push(`${pad}document.getElementById('${showMatch[1]}').style.display = '';`); continue; }

    const hideMatch = text.match(/^hide\s+@([a-zA-Z0-9_-]+)$/);
    if (hideMatch) { output.push(`${pad}document.getElementById('${hideMatch[1]}').style.display = 'none';`); continue; }

    const toggleElMatch = text.match(/^toggle\s+@([a-zA-Z0-9_-]+)$/);
    if (toggleElMatch) {
      output.push(`${pad}(() => { const __el = document.getElementById('${toggleElMatch[1]}'); __el.style.display = (__el.style.display === 'none') ? '' : 'none'; })();`);
      continue;
    }

    const focusMatch = text.match(/^focus\s+@([a-zA-Z0-9_-]+)$/);
    if (focusMatch) { output.push(`${pad}document.getElementById('${focusMatch[1]}').focus();`); continue; }

    const clearMatch = text.match(/^clear\s+@([a-zA-Z0-9_-]+)$/);
    if (clearMatch) {
      output.push(`${pad}(() => { const __el = document.getElementById('${clearMatch[1]}'); if ('value' in __el) __el.value = ''; else __el.textContent = ''; })();`);
      continue;
    }

    const enableMatch = text.match(/^enable\s+@([a-zA-Z0-9_-]+)$/);
    if (enableMatch) { output.push(`${pad}document.getElementById('${enableMatch[1]}').disabled = false;`); continue; }

    const disableMatch = text.match(/^disable\s+@([a-zA-Z0-9_-]+)$/);
    if (disableMatch) { output.push(`${pad}document.getElementById('${disableMatch[1]}').disabled = true;`); continue; }

    const addClassMatch = text.match(/^add\s+class\s+("[^"]+"|'[^']+'|[^\s]+)\s+to\s+@([a-zA-Z0-9_-]+)$/);
    if (addClassMatch) {
      output.push(`${pad}document.getElementById('${addClassMatch[2]}').classList.add(${quoteOf(addClassMatch[1])});`);
      continue;
    }

    const removeClassMatch = text.match(/^remove\s+class\s+("[^"]+"|'[^']+'|[^\s]+)\s+from\s+@([a-zA-Z0-9_-]+)$/);
    if (removeClassMatch) {
      output.push(`${pad}document.getElementById('${removeClassMatch[2]}').classList.remove(${quoteOf(removeClassMatch[1])});`);
      continue;
    }

    const toggleClassMatch = text.match(/^toggle\s+class\s+("[^"]+"|'[^']+'|[^\s]+)\s+on\s+@([a-zA-Z0-9_-]+)$/);
    if (toggleClassMatch) {
      output.push(`${pad}document.getElementById('${toggleClassMatch[2]}').classList.toggle(${quoteOf(toggleClassMatch[1])});`);
      continue;
    }

    const setTextMatch = text.match(/^set\s+text\s+of\s+@([a-zA-Z0-9_-]+)\s+to\s+(.+)$/);
    if (setTextMatch) {
      output.push(`${pad}document.getElementById('${setTextMatch[1]}').textContent = ${expandRefs(setTextMatch[2])};`);
      continue;
    }

    const setValueMatch = text.match(/^set\s+value\s+of\s+@([a-zA-Z0-9_-]+)\s+to\s+(.+)$/);
    if (setValueMatch) {
      output.push(`${pad}document.getElementById('${setValueMatch[1]}').value = ${expandRefs(setValueMatch[2])};`);
      continue;
    }

    const setStyleMatch = text.match(/^set\s+style\s+([a-zA-Z0-9_-]+)\s+of\s+@([a-zA-Z0-9_-]+)\s+to\s+(.+)$/);
    if (setStyleMatch) {
      const cssProp = setStyleMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      output.push(`${pad}document.getElementById('${setStyleMatch[2]}').style.${cssProp} = ${expandRefs(setStyleMatch[3])};`);
      continue;
    }

    const appendMatch = text.match(/^append\s+(.+)\s+to\s+@([a-zA-Z0-9_-]+)$/);
    if (appendMatch) {
      output.push(`${pad}document.getElementById('${appendMatch[2]}').textContent += ${expandRefs(appendMatch[1])};`);
      continue;
    }

    let stmt = expandRefs(text);
    if (!/[;{}]$/.test(stmt) && !stmt.startsWith('//')) stmt += ';';
    output.push(`${pad}${stmt}`);
  }

  while (blockStack.length > 0) {
    const closed = blockStack.pop();
    output.push('  '.repeat(blockStack.length + 2) + closed.closer);
  }
  return output.join('\n');
}

function compileProject(notify = true) {
  const proj = getActiveProject();
  if (!proj) return;
  const uiParts = [];
  const jsParts = [];

  for (const file of proj.files) {
    if (detectFileHeader(file.content) === 'Y') {
      jsParts.push(`    // --- ${file.name} ---\n` + restructureYToJS(file.content));
    } else {
      uiParts.push(`  <!-- ${file.name} -->\n` + restructureUIToHTML(file.content));
    }
  }

  lastCompiledDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(proj.name)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
${uiParts.join('\n\n')}

  <script>
${jsParts.join('\n\n')}
  <\/script>
</body>
</html>`;

  statusCompile.textContent = 'Compiled';
  statusCompile.className = 'status-item ok';
  if (notify) showToast('Compiled — real HTML ready');
}

function buildZenopackObject(proj, compiledHtml) {
  const files = [{
    path: 'index.html',
    mimeType: 'text/html',
    data: textToByteArray(compiledHtml)
  }];

  for (const asset of (proj.assets || [])) {
    const path = normalizeAssetPath(asset.path);
    if (!path || path.toLowerCase() === 'index.html') continue;
    files.push({
      path,
      mimeType: asset.mimeType || getZenopackMime(path),
      data: base64ToByteArray(asset.dataBase64)
    });
  }

  return {
    zenopack: ZENOPACK_VERSION,
    name: proj.name,
    icon: null,
    category: null,
    description: null,
    fileCount: files.length,
    exportedAt: new Date().toISOString(),
    files
  };
}

function buildZenopackStandaloneHtml(pack) {
  const packJson = JSON.stringify(pack);
  const encoded = bytesToBase64(new TextEncoder().encode(packJson));
  let html = ZENOPACK_HTML_TEMPLATE.replace('__PROJECT_TITLE__', escapeHtml(pack.name || 'App'));
  html = html.replace(ZENOPACK_HTML_PLACEHOLDER, encoded);
  if (html.includes(ZENOPACK_HTML_PLACEHOLDER)) {
    throw new Error('Base64 insertion failed');
  }
  return html;
}

const ZENOPACK_HTML_TEMPLATE = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>__PROJECT_TITLE__</title>\n<style>\nhtml,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}\n#game-frame{display:block;width:100%;height:100%;border:0}\n#loading{position:fixed;inset:0;display:grid;place-items:center;background:#111;color:#eee;font:14px system-ui;z-index:10}\n#loading span{opacity:.8}\n</style>\n</head>\n<body>\n<div id=\"loading\"><span>Loading...</span></div>\n<iframe id=\"game-frame\" allow=\"fullscreen; autoplay; gamepad\" allowfullscreen></iframe>\n\n<script>\n\"use strict\";\n\nconst GAME_BASE64 = \"__ZENOPACK_BASE64__\";\n\n(async function () {\n    const loading = document.getElementById(\"loading\");\n\n    const showError = message => {\n        loading.style.display = \"grid\";\n        loading.innerHTML = \"<span></span>\";\n        loading.querySelector(\"span\").textContent = \"Loading failed: \" + message;\n    };\n\n    const fileURLs = new Map();\n\n    try {\n        const binary = atob(GAME_BASE64);\n        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));\n        const pack = JSON.parse(new TextDecoder().decode(bytes));\n\n        if (!pack || !pack.zenopack || !pack.name || !Array.isArray(pack.files)) {\n            throw new Error(\"Invalid bundle structure\");\n        }\n\n        for (const file of pack.files) {\n            if (!file || typeof file.path !== \"string\" || !Array.isArray(file.data)) {\n                throw new Error(\"Invalid file entry\");\n            }\n\n            const path = file.path.replace(/\\\\/g, \"/\").replace(/^\\/+/, \"\");\n            const segments = path.split(\"/\");\n\n            if (!path || segments.includes(\"..\") || fileURLs.has(path)) {\n                throw new Error(\"Unsafe or duplicate path: \" + path);\n            }\n\n            const blob = new Blob(\n                [new Uint8Array(file.data)],\n                { type: file.mimeType || \"application/octet-stream\" }\n            );\n\n            fileURLs.set(path, URL.createObjectURL(blob));\n        }\n\n        const indexEntry = pack.files.find(\n            f => f.path.toLowerCase() === \"index.html\"\n        );\n\n        if (!indexEntry) {\n            throw new Error(\"Missing index.html\");\n        }\n\n        function normalizePath(input) {\n            let value = String(input);\n\n            if (/^(blob:|data:|https?:|javascript:|mailto:|tel:|#|\\/\\/)/i.test(value)) {\n                return null;\n            }\n\n            value = value.split(\"#\", 1)[0].split(\"?\", 1)[0];\n\n            try {\n                value = decodeURIComponent(value);\n            } catch (_) {}\n\n            value = value.replace(/\\\\/g, \"/\");\n\n            if (/^[a-z][a-z0-9+.-]*:\\/\\//i.test(value)) {\n                try {\n                    value = new URL(value).pathname;\n                } catch (_) {\n                    return null;\n                }\n            }\n\n            const parts = [];\n\n            for (const part of value.split(\"/\")) {\n                if (!part || part === \".\") continue;\n\n                if (part === \"..\") {\n                    if (!parts.length) return null;\n                    parts.pop();\n                } else {\n                    parts.push(part);\n                }\n            }\n\n            let key = parts.join(\"/\");\n\n            if (key === \"archive_files.json\") {\n                key = \"archive/archive_files.json\";\n            }\n\n            return key;\n        }\n\n        function findFileURL(input) {\n            const key = normalizePath(input);\n\n            if (!key) return null;\n            if (fileURLs.has(key)) return fileURLs.get(key);\n\n            const archivePos = key.lastIndexOf(\"archive/\");\n\n            if (archivePos >= 0) {\n                const archiveKey = key.slice(archivePos);\n\n                if (fileURLs.has(archiveKey)) {\n                    return fileURLs.get(archiveKey);\n                }\n            }\n\n            const basename = key.split(\"/\").pop();\n\n            if (fileURLs.has(basename)) {\n                return fileURLs.get(basename);\n            }\n\n            return null;\n        }\n\n        const virtualFiles = Object.fromEntries(fileURLs);\n\n        const bootstrap = `<script>\n        (() => {\n            const files = ${JSON.stringify(virtualFiles)};\n\n            function resolveAsset(input) {\n                let value = String(input);\n\n                if (/^(blob:|data:|https?:|javascript:|mailto:|tel:|#|\\\\/\\\\/)/i.test(value)) {\n                    return null;\n                }\n\n                value = value.split(\"#\", 1)[0].split(\"?\", 1)[0];\n\n                try {\n                    value = decodeURIComponent(value);\n                } catch (_) {}\n\n                value = value.replace(/\\\\\\\\/g, \"/\");\n\n                if (/^[a-z][a-z0-9+.-]*:\\\\/\\\\//i.test(value)) {\n                    try {\n                        value = new URL(value).pathname;\n                    } catch (_) {\n                        return null;\n                    }\n                }\n\n                const parts = [];\n\n                for (const part of value.split(\"/\")) {\n                    if (!part || part === \".\") continue;\n\n                    if (part === \"..\") {\n                        if (!parts.length) return null;\n                        parts.pop();\n                    } else {\n                        parts.push(part);\n                    }\n                }\n\n                let key = parts.join(\"/\");\n\n                if (key === \"archive_files.json\") {\n                    key = \"archive/archive_files.json\";\n                }\n\n                if (files[key]) return files[key];\n\n                const archivePos = key.lastIndexOf(\"archive/\");\n\n                if (archivePos >= 0 && files[key.slice(archivePos)]) {\n                    return files[key.slice(archivePos)];\n                }\n\n                const basename = key.split(\"/\").pop();\n\n                return files[basename] || null;\n            }\n\n            const originalOpen = XMLHttpRequest.prototype.open;\n\n            XMLHttpRequest.prototype.open = function(method, url, ...rest) {\n                const local = resolveAsset(url);\n                return originalOpen.call(this, method, local || url, ...rest);\n            };\n\n            if (window.fetch) {\n                const originalFetch = window.fetch.bind(window);\n\n                window.fetch = function(input, init) {\n                    const raw = input instanceof Request ? input.url : input;\n                    const local = resolveAsset(raw);\n\n                    return local\n                        ? originalFetch(local, init)\n                        : originalFetch(input, init);\n                };\n            }\n\n            const originalSetAttribute = Element.prototype.setAttribute;\n\n            Element.prototype.setAttribute = function(name, value) {\n                if (/^(src|href|poster)$/i.test(name)) {\n                    const local = resolveAsset(value);\n                    if (local) value = local;\n                }\n\n                return originalSetAttribute.call(this, name, value);\n            };\n\n            const scriptSrcDescriptor =\n                Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, \"src\");\n\n            if (\n                scriptSrcDescriptor &&\n                scriptSrcDescriptor.get &&\n                scriptSrcDescriptor.set\n            ) {\n                Object.defineProperty(HTMLScriptElement.prototype, \"src\", {\n                    configurable: scriptSrcDescriptor.configurable,\n                    enumerable: scriptSrcDescriptor.enumerable,\n\n                    get: function() {\n                        return scriptSrcDescriptor.get.call(this);\n                    },\n\n                    set: function(value) {\n                        const local = resolveAsset(value);\n                        scriptSrcDescriptor.set.call(this, local || value);\n                    }\n                });\n            }\n        })();\n        <\\/script>`;\n\n        let gameHTML = new TextDecoder().decode(\n            new Uint8Array(indexEntry.data)\n        );\n\n        gameHTML = gameHTML.replace(\n            /\\b(src|href|poster|data)\\s*=\\s*([\"'])(.*?)\\2/gi,\n            (match, attr, quote, value) => {\n                const local = findFileURL(value);\n                return local ? `${attr}=${quote}${local}${quote}` : match;\n            }\n        );\n\n        gameHTML = gameHTML.replace(\n            /url\\(\\s*([\"']?)(?!data:|https?:|blob:|\\/\\/|#)([^)'\"]+)\\1\\s*\\)/gi,\n            (match, quote, path) => {\n                const local = findFileURL(path.trim());\n                return local ? `url(\"${local}\")` : match;\n            }\n        );\n\n        gameHTML = gameHTML.replace(/,\\s*minimal-ui|minimal-ui\\s*,?/gi, \"\");\n\n        if (/<head\\b[^>]*>/i.test(gameHTML)) {\n            gameHTML = gameHTML.replace(\n                /<head\\b[^>]*>/i,\n                head => head + bootstrap\n            );\n        } else {\n            gameHTML = bootstrap + gameHTML;\n        }\n\n        document.getElementById(\"game-frame\").srcdoc = gameHTML;\n        document.title = pack.name;\n        loading.style.display = \"none\";\n\n        console.info(\n            \"Bundle loaded:\",\n            pack.name,\n            \"| Files:\",\n            pack.files.length\n        );\n\n    } catch (error) {\n        console.error(error);\n        showError(error && error.message ? error.message : String(error));\n    }\n})();\n</script>\n</body>\n</html>\n";

function buildExportDocument() {
  compileProject(false);
  const proj = getActiveProject();
  const pack = buildZenopackObject(proj, lastCompiledDocument);
  return {
    proj,
    pack,
    html: buildZenopackStandaloneHtml(pack)
  };
}

function safeDownloadName(name, fallback) {
  const cleaned = String(name || '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/[^a-z0-9_\-]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
  return cleaned || fallback || 'ytea-export';
}

function createTabCloseButton(type, id) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tab-close';
  btn.title = 'Close';
  btn.setAttribute('aria-label', 'Close tab');
  btn.innerHTML = TAB_CLOSE_SVG;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeOpenTab(type, id);
  });
  return btn;
}

function renderWorkspaceUI() {
  const proj = getActiveProject();
  if (!proj) return;
  projectSelect.innerHTML = '';
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    if (p.id === activeProjectId) opt.selected = true;
    projectSelect.appendChild(opt);
  });
  sidebarProjectName.textContent = proj.name;

  fileTreeList.innerHTML = '';
  const entries = getExplorerEntries(proj);
  if (!entries.length) {
    const empty = document.createElement('li');
    empty.className = 'file-item asset-empty';
    empty.innerHTML = `<span class="file-tag tag-asset">·</span><span>No files yet</span>`;
    fileTreeList.appendChild(empty);
  } else {
    entries.forEach(entry => {
      const li = document.createElement('li');
      const isActive = entry.kind === 'file'
        ? (activeViewMode === 'code' && entry.id === proj.activeFileId)
        : (activeViewMode === 'asset' && selectedAssetId === entry.id);
      li.className = 'file-item' + (isActive ? ' active' : '');
      li.style.setProperty('--tree-depth', String(entry.depth));
      li.title = entry.path;
      const tagClass = entry.kind === 'asset'
        ? 'tag-asset'
        : (entry.mode === 'Y' ? 'tag-y' : 'tag-ui');
      const tagLabel = entry.kind === 'asset' ? 'A' : entry.mode;
      const displayName = entry.kind === 'asset'
        ? entry.path.split('/').pop()
        : entry.label;
      li.innerHTML = `<span class="file-tag ${tagClass}">${tagLabel}</span><span class="file-label">${escapeHtml(displayName)}</span>`;
      if (entry.kind === 'asset' && entry.depth > 0) {
        li.querySelector('.file-label').insertAdjacentHTML('beforebegin', `<span class="file-path-hint">${escapeHtml(entry.path.split('/').slice(0, -1).join('/'))}/</span>`);
      }
      li.addEventListener('click', () => {
        if (entry.kind === 'file') openCodeFile(entry.id);
        else openAssetView(entry.id);
      });
      fileTreeList.appendChild(li);
    });
  }

  tabBar.innerHTML = '';
  proj.openTabs.forEach(tab => {
    const el = document.createElement('div');
    let label = '';
    let tagClass = 'tag-asset';
    let tagLabel = 'A';
    let isActive = false;

    if (tab.type === 'file') {
      const file = proj.files.find(f => f.id === tab.id);
      if (!file) return;
      const mode = detectFileHeader(file.content);
      label = file.name;
      tagClass = mode === 'Y' ? 'tag-y' : 'tag-ui';
      tagLabel = mode;
      isActive = activeViewMode === 'code' && proj.activeFileId === file.id;
      el.addEventListener('click', () => openCodeFile(file.id, { addTab: false }));
    } else if (tab.type === 'asset') {
      const asset = proj.assets.find(a => a.id === tab.id);
      if (!asset) return;
      label = asset.path;
      tagClass = 'tag-asset';
      tagLabel = 'A';
      isActive = activeViewMode === 'asset' && selectedAssetId === asset.id;
      el.addEventListener('click', () => openAssetView(asset.id, { addTab: false }));
    } else if (tab.type === 'docs') {
      label = (tab.id === 'index' || docsView === 'index')
        ? 'Docs'
        : ((typeof DOC_PAGES !== 'undefined' && DOC_PAGES[docsView]) ? DOC_PAGES[docsView].title : 'README');
      tagClass = 'tag-md';
      tagLabel = '?';
      isActive = activeViewMode === 'readme';
      el.addEventListener('click', () => openReadmeView(tab.id === 'index' ? 'index' : docsView || 'readme', { addTab: false }));
    } else {
      return;
    }

    el.className = 'tab' + (isActive ? ' active' : '');
    el.innerHTML = `<span class="file-tag ${tagClass}">${tagLabel}</span><span class="tab-label">${escapeHtml(label)}</span>`;
    el.appendChild(createTabCloseButton(tab.type, tab.id));
    tabBar.appendChild(el);
  });
}

function renderInlineMd(text) {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const key = String(href).trim().toLowerCase();
    const pageId = DOC_LINK_MAP[key] || DOC_LINK_MAP[key.split('/').pop()] || null;
    if (pageId) return `<a href="#" class="docs-link" data-docs-nav="${pageId}">${label}</a>`;
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${label}</a>`;
  });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}

function renderMarkdown(md) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  let inList = false;
  let inOl = false;

  const closeLists = () => {
    if (inList) { html.push('</ul>'); inList = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      closeLists();
      const lang = escapeHtml(line.slice(3).trim());
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i]);
        i++;
      }
      html.push(`<pre class="docs-code"${lang ? ` data-lang="${lang}"` : ''}><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      i++;
      continue;
    }

    if (/^\|(.+)\|$/.test(line.trim()) && i + 1 < lines.length && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[i + 1].trim())) {
      closeLists();
      const splitRow = (row) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const headers = splitRow(line.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|(.+)\|$/.test(lines[i].trim())) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      html.push('<div class="docs-table-wrap"><table class="docs-table"><thead><tr>' +
        headers.map(h => `<th>${renderInlineMd(h)}</th>`).join('') +
        '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${renderInlineMd(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    if (line.trim() === '---') {
      closeLists();
      html.push('<hr class="docs-hr" />');
      i++;
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      html.push(`<h${level}>${renderInlineMd(h[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeLists();
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote class="docs-quote">${renderInlineMd(quote.join(' '))}</blockquote>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (inList) { html.push('</ul>'); inList = false; }
      if (!inOl) { html.push('<ol>'); inOl = true; }
      html.push(`<li>${renderInlineMd(line.replace(/^\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${renderInlineMd(line.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (!line.trim()) {
      closeLists();
      i++;
      continue;
    }

    closeLists();
    html.push(`<p>${renderInlineMd(line)}</p>`);
    i++;
  }
  closeLists();
  return html.join('\n');
}

function docsNavBar(active) {
  const parts = [
    `<button type="button" class="docs-crumb${active === 'readme' ? ' current' : ''}" data-docs-nav="readme">README</button>`,
    '<span class="docs-crumb-sep">/</span>',
    `<button type="button" class="docs-crumb${active === 'index' ? ' current' : ''}" data-docs-nav="index">Docs</button>`
  ];
  if (active !== 'readme' && active !== 'index' && typeof DOC_PAGES !== 'undefined' && DOC_PAGES[active]) {
    parts.push('<span class="docs-crumb-sep">/</span>');
    parts.push(`<span class="docs-crumb current">${escapeHtml(DOC_PAGES[active].title)}</span>`);
  }
  return `<nav class="docs-nav">${parts.join('')}</nav>`;
}

function docsIndexHtml() {
  const pages = typeof DOC_PAGES !== 'undefined'
    ? Object.values(DOC_PAGES).filter(p => p.id !== 'readme')
    : [];
  const cards = pages.map(p => `
    <button type="button" class="docs-card" data-docs-nav="${escapeHtml(p.id)}">
      <span class="docs-card-title">${escapeHtml(p.title)}</span>
      <span class="docs-card-file">${escapeHtml(p.file)}</span>
      <span class="docs-card-blurb">${escapeHtml(p.blurb)}</span>
    </button>
  `).join('');
  return `
    ${docsNavBar('index')}
    <h1>Docs</h1>
    <p>Same files as in the repo <code>docs/</code> folder. README is under the README tab.</p>
    <div class="docs-grid">${cards}</div>
  `;
}

function docsPageHtml(pageId) {
  const page = typeof DOC_PAGES !== 'undefined' ? DOC_PAGES[pageId] : null;
  if (!page) {
    return `${docsNavBar('index')}<h1>Missing page</h1><p>Unknown doc id <code>${escapeHtml(pageId)}</code>.</p>`;
  }
  return `${docsNavBar(pageId)}<div class="docs-article">${renderMarkdown(page.markdown)}</div>`;
}

function bindDocsNav(root) {
  root.querySelectorAll('[data-docs-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openReadmeView(el.getAttribute('data-docs-nav') || 'readme');
    });
  });
}

function openReadmeView(view = 'readme', options = {}) {
  const next = (typeof view === 'string' && view) ? view : 'readme';
  docsView = next;
  selectedAssetId = null;
  activeViewMode = 'readme';
  if (options.addTab !== false) {
    ensureOpenTab('docs', next === 'index' ? 'index' : 'readme');
  }
  const root = document.getElementById('readmeContent');
  let title = 'README';
  let crumb = 'ytea › README';

  if (docsView === 'index') {
    root.innerHTML = docsIndexHtml();
    title = 'Docs';
    crumb = 'ytea › README › Docs';
  } else {
    const pageId = (typeof DOC_PAGES !== 'undefined' && DOC_PAGES[docsView]) ? docsView : 'readme';
    docsView = pageId;
    root.innerHTML = docsPageHtml(pageId);
    const page = (typeof DOC_PAGES !== 'undefined') ? DOC_PAGES[pageId] : null;
    title = page ? page.title : 'README';
    crumb = pageId === 'readme' ? 'ytea › README' : `ytea › README › Docs › ${title}`;
  }

  bindDocsNav(root);
  root.scrollTop = 0;
  document.getElementById('windowTitleText').textContent = title;
  document.getElementById('breadcrumb').textContent = crumb;
  switchEditorStage('view-readme');
  renderWorkspaceUI();
}

function openCodeFile(fileId, options = {}) {
  const proj = getActiveProject();
  if (!proj) return;
  const file = proj.files.find(f => f.id === fileId) || proj.files[0];
  if (!file) return;
  proj.activeFileId = file.id;
  selectedAssetId = null;
  activeViewMode = 'code';
  if (options.addTab !== false) ensureOpenTab('file', file.id);
  saveProjects();
  codeEditor.value = file.content;
  updateEditorVisuals();
  updateCursorAndLineHighlight();
  document.getElementById('windowTitleText').textContent = `${file.name} — ${proj.name}`;
  document.getElementById('breadcrumb').textContent = `${proj.name} › ${file.name}`;
  switchEditorStage('view-code');
  renderWorkspaceUI();
}

function openAssetView(assetId, options = {}) {
  const proj = getActiveProject();
  const asset = (proj.assets || []).find(a => a.id === assetId);
  if (!asset) return;
  selectedAssetId = asset.id;
  activeViewMode = 'asset';
  if (options.addTab !== false) ensureOpenTab('asset', asset.id);
  document.getElementById('windowTitleText').textContent = `${asset.path} — ${proj.name}`;
  document.getElementById('breadcrumb').textContent = `${proj.name} › ${asset.path}`;
  if (assetPreview) {
    const isImage = (asset.mimeType || '').startsWith('image/');
    const sizeLabel = formatBytes(asset.size || Math.floor(((asset.dataBase64 || '').length * 3) / 4));
    assetPreview.innerHTML = `
      <div class="asset-preview-meta">
        <div class="asset-preview-path">${escapeHtml(asset.path)}</div>
        <div class="asset-preview-details">${escapeHtml(asset.mimeType || 'application/octet-stream')} · ${escapeHtml(sizeLabel)}</div>
      </div>
      ${isImage
        ? `<img class="asset-preview-image" alt="${escapeHtml(asset.path)}" src="data:${escapeHtml(asset.mimeType)};base64,${asset.dataBase64}" />`
        : `<div class="asset-preview-empty">Binary asset — included as-is in ZenoPack export</div>`}
    `;
  }
  switchEditorStage('view-asset');
  renderWorkspaceUI();
}

function switchEditorStage(viewId) {
  hideAutocomplete();
  document.querySelectorAll('.editor-view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

function syncEditorScroll() {
  codeHighlight.scrollTop = codeEditor.scrollTop;
  codeHighlight.scrollLeft = codeEditor.scrollLeft;
  codeLineNumbers.scrollTop = codeEditor.scrollTop;
}

function updateEditorVisuals() {
  // innerHTML resets the highlight layer's scroll — restore from the textarea
  const sl = codeEditor.scrollLeft;
  const st = codeEditor.scrollTop;
  codeHighlight.innerHTML = highlightYteaFile(codeEditor.value) + '\n';
  codeLineNumbers.innerHTML = Array.from({ length: codeEditor.value.split('\n').length }, (_, i) => i + 1).join('<br>');
  codeHighlight.scrollLeft = sl;
  codeHighlight.scrollTop = st;
  codeLineNumbers.scrollTop = st;
  statusMode.textContent = detectFileHeader(codeEditor.value) === 'Y' ? '#Y// does' : '#UI// looks';
}

function updateCursorAndLineHighlight() {
  const pos = codeEditor.selectionStart || 0;
  const textBefore = codeEditor.value.substring(0, pos);
  const lines = textBefore.split('\n');
  const currentLine = lines.length;
  const currentCol = lines[lines.length - 1].length + 1;

  statusCursor.textContent = `Ln ${currentLine}, Col ${currentCol}`;
  const topOffset = (currentLine - 1) * 21.6 + 14 - codeEditor.scrollTop;
  activeLineHighlight.style.top = `${topOffset}px`;
}

function openPreviewPopup() {
  const btn = document.getElementById('btnPreview');
  btn.classList.remove('flash');
  void btn.offsetWidth;
  btn.classList.add('flash');

  let html;
  try {
    html = buildExportDocument().html;
  } catch (err) {
    console.error(err);
    showToast('Preview failed: ' + (err && err.message ? err.message : err));
    return;
  }

  if (!previewWindowRef || previewWindowRef.closed) {
    previewWindowRef = window.open('', 'YteaPreviewWindow', 'width=1040,height=720,resizable=yes,scrollbars=yes');
  } else {
    previewWindowRef.focus();
  }
  if (previewWindowRef) {
    previewWindowRef.document.open();
    previewWindowRef.document.write(html);
    previewWindowRef.document.close();
  } else {
    showToast('Popup blocked — please allow popups');
  }
}

codeEditor.addEventListener('scroll', () => {
  syncEditorScroll();
  updateCursorAndLineHighlight();
  hideAutocomplete();
});

codeEditor.addEventListener('click', () => {
  updateCursorAndLineHighlight();
  hideAutocomplete();
});
codeEditor.addEventListener('keyup', (e) => {
  updateCursorAndLineHighlight();
  if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) hideAutocomplete();
});

codeEditor.addEventListener('input', () => {
  const file = getActiveFile();
  if (file) { file.content = codeEditor.value; saveProjects(); }
  statusCompile.textContent = 'Modified';
  statusCompile.className = 'status-item warn';
  updateEditorVisuals();
  syncEditorScroll();
  updateCursorAndLineHighlight();
  scheduleAutocomplete(false);
  renderWorkspaceUI();
});

codeEditor.addEventListener('keydown', (e) => {
  const acOpen = autocompleteMenu.classList.contains('visible');

  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
    e.preventDefault();
    scheduleAutocomplete(true);
    return;
  }

  if (acOpen) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acSelectedIndex = (acSelectedIndex + 1) % acItems.length;
      renderAutocompleteMenu(codeEditor.value.substring(0, codeEditor.selectionStart), (codeEditor.value.substring(0, codeEditor.selectionStart).split('\n').pop().match(/([.@a-zA-Z0-9_-]+)$/) || ['', ''])[1]);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      acSelectedIndex = (acSelectedIndex - 1 + acItems.length) % acItems.length;
      renderAutocompleteMenu(codeEditor.value.substring(0, codeEditor.selectionStart), (codeEditor.value.substring(0, codeEditor.selectionStart).split('\n').pop().match(/([.@a-zA-Z0-9_-]+)$/) || ['', ''])[1]);
      return;
    }
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      applyAutocomplete(acSelectedIndex);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideAutocomplete();
      return;
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const s = codeEditor.selectionStart;
    codeEditor.value = codeEditor.value.substring(0, s) + '  ' + codeEditor.value.substring(codeEditor.selectionEnd);
    codeEditor.selectionStart = codeEditor.selectionEnd = s + 2;
    codeEditor.dispatchEvent(new Event('input'));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const s = codeEditor.selectionStart;
    const before = codeEditor.value.substring(0, s);
    const line = before.split('\n').pop();
    const m = line.match(/^\s*/);
    let indent = m ? m[0] : '';
    const trimmed = line.trim();
    const mode = detectFileHeader(codeEditor.value);
    if ((mode === 'UI' && trimmed && !trimmed.startsWith('.') && !trimmed.startsWith('//') && !trimmed.startsWith('#UI//')) ||
        (mode === 'Y' && /^(on\s+|once\s+|when\s+|func\s+|if\s+|unless\s+|else|repeat\s+|for\s+|each\s+|while\s+|until\s+|try|catch\s+|wait\s+|every\s+)/.test(trimmed))) {
      indent += '  ';
    }
    codeEditor.value = before + '\n' + indent + codeEditor.value.substring(codeEditor.selectionEnd);
    codeEditor.selectionStart = codeEditor.selectionEnd = s + 1 + indent.length;
    codeEditor.dispatchEvent(new Event('input'));
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    compileProject(true);
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    openPreviewPopup();
  }
});

/**
 * Shows a styled prompt modal and returns a promise with the user input.
 * Replaces browser prompt() with a nice overlay matching the ytea design.
 * @param {string} message - The prompt message to display.
 * @param {string} defaultValue - The default text in the input field.
 * @returns {Promise<string | null>} - Resolves with the trimmed input value,
 *   or null if the user clicks Cancel or presses Escape.
 */
function showStyledPrompt(message, defaultValue = '') {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existing = document.querySelector('.prompt-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';
    overlay.innerHTML = `
      <div class="prompt-modal">
        <div style="margin-bottom: 16px; color: var(--text-main); font-size: 14px;;">${message}</div>
        <input type="text" autocomplete="off" style="width:100%;padding:8px 12px;margin-bottom:16px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel);color:var(--text-main);font:inherit;font-size:14px;" />
        <div class="buttons">
          <button class="btn ok" style="background:transparent;border:1px solid var(--accent);color:var(--text-main);padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;">OK</button>
          <button class="btn cancel" style="background:transparent;border:1px solid var(--border);color:var(--text-main);padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('visible');

    const input = overlay.querySelector('input');
    const okBtn = overlay.querySelector('.btn.ok');
    const cancelBtn = overlay.querySelector('.btn.cancel');

    // Set default value after the DOM is ready
    if (defaultValue) input.value = defaultValue;

    function closeModal() {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    }

    // OK button -> resolve with input value
    okBtn.addEventListener('click', () => {
      const value = input.value.trim();
      closeModal();
      resolve(value ? value : null);
    });

    // Cancel button -> resolve null
    cancelBtn.addEventListener('click', () => {
      closeModal();
      resolve(null);
    });

    // Escape key -> resolve null
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
        resolve(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
  });
}

/**
 * Shows a styled confirmation modal (OK / Cancel) and returns a promise
 * that resolves to true when the user confirms, false otherwise.
 * @param {string} message - The confirmation message to display.
 * @returns {Promise<boolean>}
 */
function showStyledConfirm(message) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.prompt-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';
    overlay.innerHTML = `
      <div class="prompt-modal">
        <div style="margin-bottom: 20px; color: var(--text-main); font-size: 14px;">${message}</div>
        <div class="buttons">
          <button class="btn ok" style="background:transparent;border:1px solid var(--accent);color:var(--text-main);padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;">OK</button>
          <button class="btn cancel" style="background:transparent;border:1px solid var(--border);color:var(--text-main);padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.classList.add('visible');

    const okBtn = overlay.querySelector('.btn.ok');
    const cancelBtn = overlay.querySelector('.btn.cancel');

    function closeModal() {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    }

    okBtn.addEventListener('click', () => {
      closeModal();
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      closeModal();
      resolve(false);
    });

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
        resolve(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
  });
}

/* istanbul ignore next */
async function createNewFile() {
  const proj = getActiveProject();
  if (!proj) return;
  let name = await showStyledPrompt('New file name:', `page-${proj.files.length + 1}.ytea`);
  if (!name || !name.trim()) return;
  name = name.trim().endsWith('.ytea') ? name.trim() : name.trim() + '.ytea';
  const type = await showStyledPrompt('UI (looks) or Y (does)?', 'UI');
  const content = (type && type.trim().toUpperCase() === 'Y')
    ? '#Y//\n'
    : '#UI//\ndiv(id="box")\n  .padding(16px)\n  h1 "Hello"\n';
  const nf = { id: generateId('file'), name, content };
  proj.files.push(nf);
  proj.activeFileId = nf.id;
  saveProjects();
  openCodeFile(nf.id);
}

document.getElementById('btnNewFile').addEventListener('click', createNewFile);
document.getElementById('btnNewFileTab').addEventListener('click', createNewFile);
document.getElementById('menuNewFile').addEventListener('click', createNewFile);
document.getElementById('actNewFile').addEventListener('click', createNewFile);
document.getElementById('actReadme').addEventListener('click', () => openReadmeView('readme'));

document.getElementById('btnRenameFile').addEventListener('click', async () => {
  if (activeViewMode === 'asset') {
    const asset = getSelectedAsset();
    if (!asset) return;
    let n = await showStyledPrompt('Rename asset path:', asset.path);
    if (!n || !n.trim()) return;
    const path = normalizeAssetPath(n.trim());
    if (!path || path.split('/').includes('..')) {
      showToast('Invalid asset path');
      return;
    }
    const proj = getActiveProject();
    if (proj.assets.some(a => a.id !== asset.id && a.path === path)) {
      showToast('An asset with that path already exists');
      return;
    }
    asset.path = path;
    asset.mimeType = getZenopackMime(path);
    saveProjects();
    openAssetView(asset.id);
    return;
  }

  const file = getActiveFile();
  if (!file || activeViewMode !== 'code') return;
  let n = await showStyledPrompt('Rename file:', file.name);
  if (n && n.trim()) {
    file.name = n.trim().endsWith('.ytea') ? n.trim() : n.trim() + '.ytea';
    saveProjects();
    openCodeFile(file.id);
  }
});

document.getElementById('btnDeleteFile').addEventListener('click', async () => {
  const proj = getActiveProject();
  if (!proj) return;

  if (activeViewMode === 'asset') {
    const asset = getSelectedAsset();
    if (!asset) return;
    if (await showStyledConfirm(`Delete asset ${asset.path}?`)) {
      removeOpenTab('asset', asset.id);
      proj.assets = proj.assets.filter(a => a.id !== asset.id);
      selectedAssetId = null;
      saveProjects();
      const nextTab = proj.openTabs[0];
      if (nextTab && nextTab.type === 'asset') openAssetView(nextTab.id, { addTab: false });
      else openCodeFile((nextTab && nextTab.type === 'file' ? nextTab.id : null) || proj.activeFileId || proj.files[0].id, { addTab: false });
    }
    return;
  }

  const file = getActiveFile();
  if (!file || proj.files.length <= 1) return;
  if (await showStyledConfirm(`Delete ${file.name}?`)) {
    removeOpenTab('file', file.id);
    proj.files = proj.files.filter(f => f.id !== file.id);
    proj.activeFileId = proj.files[0].id;
    saveProjects();
    openCodeFile(proj.activeFileId, { addTab: true });
  }
});

document.getElementById('btnNewProject').addEventListener('click', async () => {
  const name = await showStyledPrompt('Project name:', `project-${projects.length + 1}`);
  if (!name || !name.trim()) return;
  const f1 = { id: generateId('file'), name: 'main.ytea', content: `#UI//\ndiv(id="root")\n  .min-height(100vh)\n  .display(flex)\n  .flex-direction(column)\n  .align-items(center)\n  .justify-content(center)\n  .padding(32px)\n  .background(#0c100e)\n  .color(#f3faf5)\n  h1 "${name.trim()}"\n` };
  const f2 = { id: generateId('file'), name: 'logic.ytea', content: `#Y//\non load\n  log "${name.trim()} ready"\n` };
  const np = {
    id: generateId('ws'),
    name: name.trim(),
    files: [f1, f2],
    assets: [],
    openTabs: [{ type: 'file', id: f1.id }, { type: 'file', id: f2.id }],
    activeFileId: f1.id
  };
  projects.push(np);
  activeProjectId = np.id;
  selectedAssetId = null;
  saveProjects();
  openCodeFile(f1.id, { addTab: false });
  compileProject(false);
});

document.getElementById('btnRenameProject').addEventListener('click', async () => {
  const proj = getActiveProject();
  if (!proj) return;
  const n = await showStyledPrompt('Rename project:', proj.name);
  if (n && n.trim()) { proj.name = n.trim(); saveProjects(); openCodeFile(proj.activeFileId); }
});

document.getElementById('btnDeleteProject').addEventListener('click', async () => {
  if (projects.length <= 1) return;
  const proj = getActiveProject();
  if (proj && await showStyledConfirm(`Delete ${proj.name}?`)) {
    projects = projects.filter(p => p.id !== proj.id);
    activeProjectId = projects[0].id;
    saveProjects();
    openCodeFile(getActiveProject().activeFileId);
    compileProject(false);
  }
});

projectSelect.addEventListener('change', (e) => {
  activeProjectId = e.target.value;
  saveProjects();
  openCodeFile(getActiveProject().activeFileId);
  compileProject(false);
});

document.getElementById('actCompile').addEventListener('click', () => compileProject(true));
document.getElementById('btnCompile').addEventListener('click', () => compileProject(true));
document.getElementById('menuCompile').addEventListener('click', () => compileProject(true));
document.getElementById('btnPreview').addEventListener('click', openPreviewPopup);
document.getElementById('menuPreview').addEventListener('click', openPreviewPopup);
document.getElementById('actPreview').addEventListener('click', openPreviewPopup);

document.getElementById('btnAddAssetFiles').addEventListener('click', () => assetFileInput && assetFileInput.click());
document.getElementById('btnAddAssetFolder').addEventListener('click', () => assetFolderInput && assetFolderInput.click());
document.getElementById('btnDownloadProject').addEventListener('click', () => {
  downloadProjectZip().catch(err => {
    console.error(err);
    showToast('ZIP download failed');
  });
});
document.getElementById('btnUploadProject').addEventListener('click', () => projectZipInput && projectZipInput.click());

if (assetFileInput) {
  assetFileInput.addEventListener('change', async () => {
    try {
      await importAssetFileList(assetFileInput.files, false);
    } catch (err) {
      console.error(err);
      showToast('Failed to add assets');
    }
    assetFileInput.value = '';
  });
}
if (assetFolderInput) {
  assetFolderInput.addEventListener('change', async () => {
    try {
      await importAssetFileList(assetFolderInput.files, true);
    } catch (err) {
      console.error(err);
      showToast('Failed to add folder');
    }
    assetFolderInput.value = '';
  });
}
if (projectZipInput) {
  projectZipInput.addEventListener('change', async () => {
    const file = projectZipInput.files && projectZipInput.files[0];
    try {
      await uploadProjectZip(file);
    } catch (err) {
      console.error(err);
      showToast('ZIP import failed');
    }
    projectZipInput.value = '';
  });
}

document.getElementById('btnExport').addEventListener('click', () => {
  try {
    const { proj, pack, html } = buildExportDocument();
    const name = safeDownloadName(proj.name, 'ytea-export');
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${name}.html`);
    showToast(`Exported ZenoPack HTML (${pack.fileCount} files)`);
  } catch (err) {
    console.error(err);
    showToast('Export failed: ' + (err && err.message ? err.message : err));
  }
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2200);
}

loadProjects();
applyFallbackCatalogs();
openCodeFile(getActiveProject().activeFileId);
compileProject(false);
loadOfficialCatalogs();
