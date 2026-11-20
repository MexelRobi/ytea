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
  @btnCount.textContent = "Count: " + count

on click @btnReset
  count = 0
  @btnCount.textContent = "Count: 0"`;

const README_HTML = `
<h1>ytea is simple</h1>
<p>You write websites with <strong>real</strong> HTML, CSS, and JavaScript words. ytea only changes the shape of the code — never the meaning. No fake names. No mappings.</p>

<h2>1. Two kinds of files</h2>
<ul>
  <li><code>#UI//</code> — how it looks (layout + style)</li>
  <li><code>#Y//</code> — what it does (logic)</li>
</ul>

<h2>2. How #UI// works</h2>
<ul>
  <li>Write a tag: <code>button(id="go") "Click"</code></li>
  <li>Under it, write real CSS with a dot: <code>.background(#3ecf6a)</code></li>
  <li>Indent kids under parents. That is nesting.</li>
</ul>

<h2>3. How #Y// works</h2>
<ul>
  <li><code>on click @go</code> means: when that button is clicked…</li>
  <li>Indented lines under it are the steps that happen.</li>
  <li><code>@go</code> means the element with <code>id="go"</code>.</li>
</ul>

<h2>4. Autocomplete</h2>
<ul>
  <li>HTML tags &amp; CSS properties load from official packages (MDN data + html-tags).</li>
  <li>Type <code>.</code> for CSS, a tag name for HTML, <code>@</code> for your ids.</li>
  <li><code>Tab</code> / <code>Enter</code> accept · <code>↑</code><code>↓</code> move · <code>Ctrl+Space</code> open · <code>Esc</code> close</li>
</ul>

<div class="tip">Rule of thumb: if a 10-year-old can read the words, you are doing it right.</div>
`;

const FALLBACK_HTML_TAGS = [
  'div', 'span', 'h1', 'h2', 'h3', 'p', 'button', 'input', 'img', 'a',
  'ul', 'ol', 'li', 'section', 'header', 'footer', 'nav', 'main', 'form',
  'label', 'textarea', 'select', 'option', 'canvas', 'video', 'audio'
];

const FALLBACK_CSS_PROPS = Object.keys(CSS_SMART_DEFAULTS);

const Y_LANGUAGE_SUGGESTIONS = [
  { label: 'var name = value', insert: 'var ', kind: 'keyword', detail: 'Make a box that holds a value' },
  { label: 'func name()', insert: 'func name()', kind: 'keyword', detail: 'Make a reusable action', cursorBack: 1 },
  { label: 'on click @id', insert: 'on click @', kind: 'event', detail: 'Run code when something is clicked' },
  { label: 'on input @id', insert: 'on input @', kind: 'event', detail: 'Run code while typing' },
  { label: 'on change @id', insert: 'on change @', kind: 'event', detail: 'Run code when a value changes' },
  { label: 'on mouseenter @id', insert: 'on mouseenter @', kind: 'event', detail: 'Run code when the mouse enters' },
  { label: 'on keydown @id', insert: 'on keydown @', kind: 'event', detail: 'Run code when a key is pressed' },
  { label: 'if condition', insert: 'if ', kind: 'keyword', detail: 'Do this only when something is true' },
  { label: 'else if condition', insert: 'else if ', kind: 'keyword', detail: 'Otherwise try this' },
  { label: 'else', insert: 'else', kind: 'keyword', detail: 'Otherwise do this' },
  { label: 'repeat count', insert: 'repeat ', kind: 'keyword', detail: 'Do something many times' },
  { label: 'for item in list', insert: 'for item in ', kind: 'keyword', detail: 'Go through each thing in a list' },
  { label: 'while condition', insert: 'while ', kind: 'keyword', detail: 'Keep going while true' },
  { label: 'return', insert: 'return ', kind: 'keyword', detail: 'Send a value back from a func' }
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

let projects = [];
let activeProjectId = null;
let activeViewMode = 'code';
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
const outLineNumbers = document.getElementById('outLineNumbers');
const compiledCode = document.getElementById('compiledCode');
const autocompleteMenu = document.getElementById('autocompleteMenu');
const statusMode = document.getElementById('statusMode');
const statusCompile = document.getElementById('statusCompile');
const statusSave = document.getElementById('statusSave');
const statusCursor = document.getElementById('statusCursor');
const statusCatalog = document.getElementById('statusCatalog');

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

function loadProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { projects = JSON.parse(raw); } catch { projects = []; }
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    const f1 = { id: generateId('file'), name: 'main.ytea', content: DEFAULT_UI_FILE };
    const f2 = { id: generateId('file'), name: 'logic.ytea', content: DEFAULT_Y_FILE };
    projects = [{ id: generateId('ws'), name: 'my-first-site', files: [f1, f2], activeFileId: f1.id }];
    saveProjects();
  }
  const savedWs = localStorage.getItem(ACTIVE_PROJECT_KEY);
  activeProjectId = projects.some(p => p.id === savedWs) ? savedWs : projects[0].id;
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  if (statusSave) statusSave.textContent = 'Saved';
}

function getActiveProject() {
  return projects.find(p => p.id === activeProjectId) || projects[0];
}

function getActiveFile() {
  const proj = getActiveProject();
  if (!proj || !Array.isArray(proj.files)) return null;
  return proj.files.find(f => f.id === proj.activeFileId) || proj.files[0];
}

function detectFileHeader(content) {
  const firstLine = (content || '').trim().split('\n')[0];
  return firstLine.startsWith('#Y//') ? 'Y' : 'UI';
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    let escaped = escapeHtml(trimmed);
    escaped = escaped.replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');
    escaped = escaped.replace(/@([a-zA-Z0-9_-]+)/g, '<span class="tok-ref">@$1</span>');
    escaped = escaped.replace(/\b(var|let|const|func|on|if|else|repeat|for|in|while|return|true|false|null)\b/g, '<span class="tok-kw">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
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
  const expandRefs = (expr) => expr.replace(/("[^"]*"|'[^']*'|`[^`]*`)|@([a-zA-Z0-9_-]+)/g, (m, q, id) => q || `document.getElementById('${id}')`);

  for (const { indent, text } of parsedLines) {
    while (blockStack.length > 0 && blockStack[blockStack.length - 1].indent >= indent) {
      const closed = blockStack.pop();
      output.push('  '.repeat(blockStack.length + 2) + closed.closer);
    }
    const pad = '  '.repeat(blockStack.length + 2);

    if (text.startsWith('//')) { output.push(`${pad}${text}`); continue; }
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
    const ifMatch = text.match(/^if\s+(.+)$/);
    if (ifMatch) {
      output.push(`${pad}if (${expandRefs(ifMatch[1])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }
    const repeatMatch = text.match(/^repeat\s+(.+)$/);
    if (repeatMatch) {
      output.push(`${pad}for (let i = 0; i < ${expandRefs(repeatMatch[1])}; i++) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }
    const forInMatch = text.match(/^for\s+([a-zA-Z0-9_$]+)\s+in\s+(.+)$/);
    if (forInMatch) {
      output.push(`${pad}for (const ${forInMatch[1]} of ${expandRefs(forInMatch[2])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }
    const whileMatch = text.match(/^while\s+(.+)$/);
    if (whileMatch) {
      output.push(`${pad}while (${expandRefs(whileMatch[1])}) {`);
      blockStack.push({ indent, closer: '}' });
      continue;
    }
    const varMatch = text.match(/^var\s+(.+)$/);
    if (varMatch) {
      output.push(`${pad}let ${expandRefs(varMatch[1])};`);
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

  compiledCode.textContent = lastCompiledDocument;
  outLineNumbers.innerHTML = Array.from({ length: lastCompiledDocument.split('\n').length }, (_, i) => i + 1).join('<br>');
  statusCompile.textContent = 'Compiled';
  statusCompile.className = 'status-item ok';
  if (notify) showToast('Compiled — real HTML ready');
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
  proj.files.forEach(file => {
    const mode = detectFileHeader(file.content);
    const li = document.createElement('li');
    li.className = 'file-item' + (activeViewMode === 'code' && file.id === proj.activeFileId ? ' active' : '');
    li.innerHTML = `<span class="file-tag ${mode === 'Y' ? 'tag-y' : 'tag-ui'}">${mode}</span><span>${escapeHtml(file.name)}</span>`;
    li.addEventListener('click', () => openCodeFile(file.id));
    fileTreeList.appendChild(li);
  });

  tabBar.innerHTML = '';
  proj.files.forEach(file => {
    const mode = detectFileHeader(file.content);
    const isActive = activeViewMode === 'code' && file.id === proj.activeFileId;
    const tab = document.createElement('div');
    tab.className = 'tab' + (isActive ? ' active' : '');
    tab.innerHTML = `<span class="file-tag ${mode === 'Y' ? 'tag-y' : 'tag-ui'}">${mode}</span><span>${escapeHtml(file.name)}</span><span class="tab-dot"></span>`;
    tab.addEventListener('click', () => openCodeFile(file.id));
    tabBar.appendChild(tab);
  });

  const readmeTab = document.createElement('div');
  readmeTab.className = 'tab' + (activeViewMode === 'readme' ? ' active' : '');
  readmeTab.innerHTML = `<span class="file-tag tag-md">?</span><span>How it works</span><span class="tab-dot"></span>`;
  readmeTab.addEventListener('click', openReadmeView);
  tabBar.appendChild(readmeTab);

  const outTab = document.createElement('div');
  outTab.className = 'tab' + (activeViewMode === 'output' ? ' active' : '');
  outTab.innerHTML = `<span class="file-tag tag-html">&lt;&gt;</span><span>dist/index.html</span><span class="tab-dot"></span>`;
  outTab.addEventListener('click', openOutputView);
  tabBar.appendChild(outTab);

  document.getElementById('navCompiledOutput').classList.toggle('active', activeViewMode === 'output');
}

function openReadmeView() {
  activeViewMode = 'readme';
  document.getElementById('readmeContent').innerHTML = README_HTML;
  document.getElementById('windowTitleText').textContent = 'How ytea works';
  document.getElementById('breadcrumb').textContent = 'ytea › How it works';
  switchEditorStage('view-readme');
  renderWorkspaceUI();
}

function openCodeFile(fileId) {
  const proj = getActiveProject();
  if (!proj) return;
  proj.activeFileId = fileId;
  activeViewMode = 'code';
  saveProjects();
  const file = getActiveFile();
  if (file) {
    codeEditor.value = file.content;
    updateEditorVisuals();
    updateCursorAndLineHighlight();
    document.getElementById('windowTitleText').textContent = `${file.name} — ${proj.name}`;
    document.getElementById('breadcrumb').textContent = `${proj.name} › ${file.name}`;
  }
  switchEditorStage('view-code');
  renderWorkspaceUI();
}

function openOutputView() {
  activeViewMode = 'output';
  compileProject(false);
  const proj = getActiveProject();
  document.getElementById('windowTitleText').textContent = `dist/index.html — ${proj.name}`;
  document.getElementById('breadcrumb').textContent = `${proj.name} › dist › index.html`;
  switchEditorStage('view-output');
  renderWorkspaceUI();
}

function switchEditorStage(viewId) {
  hideAutocomplete();
  document.querySelectorAll('.editor-view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

function updateEditorVisuals() {
  codeHighlight.innerHTML = highlightYteaFile(codeEditor.value) + '\n';
  codeLineNumbers.innerHTML = Array.from({ length: codeEditor.value.split('\n').length }, (_, i) => i + 1).join('<br>');
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
  compileProject(false);
  const btn = document.getElementById('btnPreview');
  btn.classList.remove('flash');
  void btn.offsetWidth;
  btn.classList.add('flash');

  if (!previewWindowRef || previewWindowRef.closed) {
    previewWindowRef = window.open('', 'YteaPreviewWindow', 'width=1040,height=720,resizable=yes,scrollbars=yes');
  } else {
    previewWindowRef.focus();
  }
  if (previewWindowRef) {
    previewWindowRef.document.open();
    previewWindowRef.document.write(lastCompiledDocument);
    previewWindowRef.document.close();
  } else {
    showToast('Popup blocked — please allow popups');
  }
}

codeEditor.addEventListener('scroll', () => {
  codeHighlight.scrollTop = codeEditor.scrollTop;
  codeHighlight.scrollLeft = codeEditor.scrollLeft;
  codeLineNumbers.scrollTop = codeEditor.scrollTop;
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
        (mode === 'Y' && /^(on\s+|func\s+|if\s+|else|repeat\s+|for\s+|while\s+)/.test(trimmed))) {
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

function createNewFile() {
  const proj = getActiveProject();
  if (!proj) return;
  let name = prompt('New file name:', `page-${proj.files.length + 1}.ytea`);
  if (!name || !name.trim()) return;
  name = name.trim().endsWith('.ytea') ? name.trim() : name.trim() + '.ytea';
  const type = prompt('UI (looks) or Y (does)?', 'UI');
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
document.getElementById('actReadme').addEventListener('click', openReadmeView);

document.getElementById('btnRenameFile').addEventListener('click', () => {
  const file = getActiveFile();
  if (!file || activeViewMode !== 'code') return;
  let n = prompt('Rename file:', file.name);
  if (n && n.trim()) {
    file.name = n.trim().endsWith('.ytea') ? n.trim() : n.trim() + '.ytea';
    saveProjects();
    openCodeFile(file.id);
  }
});

document.getElementById('btnDeleteFile').addEventListener('click', () => {
  const proj = getActiveProject();
  const file = getActiveFile();
  if (!proj || !file || proj.files.length <= 1) return;
  if (confirm(`Delete ${file.name}?`)) {
    proj.files = proj.files.filter(f => f.id !== file.id);
    proj.activeFileId = proj.files[0].id;
    saveProjects();
    openCodeFile(proj.activeFileId);
  }
});

document.getElementById('btnNewProject').addEventListener('click', () => {
  const name = prompt('Project name:', `project-${projects.length + 1}`);
  if (!name || !name.trim()) return;
  const f1 = { id: generateId('file'), name: 'main.ytea', content: `#UI//\ndiv(id="root")\n  .padding(32px)\n  .background(#0c100e)\n  .color(#f3faf5)\n  h1 "${name.trim()}"\n` };
  const f2 = { id: generateId('file'), name: 'logic.ytea', content: `#Y//\nconsole.log("${name.trim()} ready")\n` };
  const np = { id: generateId('ws'), name: name.trim(), files: [f1, f2], activeFileId: f1.id };
  projects.push(np);
  activeProjectId = np.id;
  saveProjects();
  openCodeFile(f1.id);
  compileProject(false);
});

document.getElementById('btnRenameProject').addEventListener('click', () => {
  const proj = getActiveProject();
  if (!proj) return;
  const n = prompt('Rename project:', proj.name);
  if (n && n.trim()) { proj.name = n.trim(); saveProjects(); openCodeFile(proj.activeFileId); }
});

document.getElementById('btnDeleteProject').addEventListener('click', () => {
  if (projects.length <= 1) return;
  const proj = getActiveProject();
  if (proj && confirm(`Delete ${proj.name}?`)) {
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

document.getElementById('navCompiledOutput').addEventListener('click', openOutputView);
document.getElementById('actCompile').addEventListener('click', openOutputView);
document.getElementById('btnCompile').addEventListener('click', () => compileProject(true));
document.getElementById('menuCompile').addEventListener('click', () => compileProject(true));
document.getElementById('btnPreview').addEventListener('click', openPreviewPopup);
document.getElementById('menuPreview').addEventListener('click', openPreviewPopup);
document.getElementById('actPreview').addEventListener('click', openPreviewPopup);

document.getElementById('btnExport').addEventListener('click', () => {
  compileProject(false);
  const blob = new Blob([lastCompiledDocument], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${getActiveProject().name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.html`;
  a.click();
  showToast('Exported HTML file');
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
