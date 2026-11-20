const STORAGE_KEY = 'ytea_pure_workspaces_v3';
const ACTIVE_PROJECT_KEY = 'ytea_pure_active_ws_v3';

const DEFAULT_UI_FILE = `#UI//
div(id="app")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  .background(#111318)
  .font-family(system-ui, -apple-system, sans-serif)
  .color(#e2e8f0)
  .padding(24px)

  div(class="card")
    .background(#191c24)
    .border(1px solid #2a2f3d)
    .border-radius(12px)
    .padding(32px)
    .max-width(420px)
    .width(100%)

    span "YTEA UNIFIED FILES"
      .display(inline-block)
      .font-size(11px)
      .font-weight(600)
      .letter-spacing(0.08em)
      .color(#c586c0)
      .margin-bottom(10px)

    h1 "Logical & Clean."
      .font-size(24px)
      .font-weight(600)
      .margin(0 0 10px 0)

    p "Every file ends with .ytea. Start with #UI// for layout and styles, or #Y// for clean, indented JavaScript logic."
      .font-size(14px)
      .color(#94a3b8)
      .line-height(1.55)
      .margin-bottom(22px)

    div
      .display(flex)
      .gap(10px)

      button(id="btnCount") "Count: 0"
        .background(#0078d4)
        .color(#ffffff)
        .border(none)
        .padding(9px 16px)
        .border-radius(6px)
        .font-size(13px)
        .cursor(pointer)

      button(id="btnReset") "Reset"
        .background(#252526)
        .color(#cccccc)
        .border(1px solid #3c3c3c)
        .padding(9px 14px)
        .border-radius(6px)
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
<h1>ytea — Unified Structural Web Language</h1>
<p><strong>ytea</strong> is a structural reorganization of HTML, CSS, and JavaScript. Everything compiles directly into native browser code with zero mapping overhead.</p>

<h2>1. File Headers</h2>
<ul>
  <li><code>#UI//</code> — Layout &amp; CSS file (compiles to HTML with inline styles).</li>
  <li><code>#Y//</code> — Logic file (compiles indented blocks into standard JavaScript).</li>
</ul>

<h2>2. Autocomplete Shortcuts</h2>
<ul>
  <li>Type <code>.</code> inside <code>#UI//</code> for instant CSS property suggestions (e.g. <code>.background()</code>, <code>.display()</code>).</li>
  <li>Type tag names like <code>div</code>, <code>button</code>, <code>input</code> for HTML structure suggestions.</li>
  <li>Type <code>@</code> inside <code>#Y//</code> to autocomplete any <code>id="..."</code> defined in your UI files.</li>
  <li>Use <code>Up/Down</code> arrows to navigate and <code>Tab</code> or <code>Enter</code> to insert.</li>
</ul>
`;

const UI_TAG_SUGGESTIONS = [
  { label: 'div', insert: 'div', kind: 'tag' },
  { label: 'span', insert: 'span ""', kind: 'tag' },
  { label: 'h1', insert: 'h1 ""', kind: 'tag' },
  { label: 'h2', insert: 'h2 ""', kind: 'tag' },
  { label: 'p', insert: 'p ""', kind: 'tag' },
  { label: 'button', insert: 'button(id="") ""', kind: 'tag' },
  { label: 'input', insert: 'input(id="" type="text")', kind: 'tag' },
  { label: 'img', insert: 'img(src="" alt="")', kind: 'tag' },
  { label: 'a', insert: 'a(href="") ""', kind: 'tag' },
  { label: 'ul', insert: 'ul(id="")', kind: 'tag' },
  { label: 'li', insert: 'li ""', kind: 'tag' },
  { label: 'canvas', insert: 'canvas(id="")', kind: 'tag' }
];

const CSS_MODIFIER_SUGGESTIONS = [
  '.display(flex)', '.flex-direction(column)', '.align-items(center)', '.justify-content(center)',
  '.gap(12px)', '.padding(16px)', '.margin(0)', '.margin-bottom(12px)',
  '.width(100%)', '.max-width(480px)', '.height(100%)', '.min-height(100vh)',
  '.background(#1e293b)', '.color(#ffffff)', '.font-size(14px)', '.font-weight(600)',
  '.font-family(system-ui, sans-serif)', '.line-height(1.5)', '.letter-spacing(0.05em)',
  '.text-align(center)', '.border(1px solid #334155)', '.border-radius(8px)',
  '.box-shadow(0 10px 25px rgba(0,0,0,0.3))', '.cursor(pointer)', '.user-select(none)',
  '.position(relative)', '.position(absolute)', '.top(0)', '.left(0)',
  '.grid-template-columns(repeat(16, 24px))', '.overflow(hidden)', '.opacity(1)'
].map(item => ({ label: item, insert: item, kind: 'css' }));

const Y_KEYWORD_SUGGESTIONS = [
  { label: 'var name = value', insert: 'var ', kind: 'keyword' },
  { label: 'func name()', insert: 'func ', kind: 'keyword' },
  { label: 'on click @id', insert: 'on click @', kind: 'event' },
  { label: 'on input @id', insert: 'on input @', kind: 'event' },
  { label: 'on change @id', insert: 'on change @', kind: 'event' },
  { label: 'on mouseenter @id', insert: 'on mouseenter @', kind: 'event' },
  { label: 'on mousedown @id', insert: 'on mousedown @', kind: 'event' },
  { label: 'on keydown @id', insert: 'on keydown @', kind: 'event' },
  { label: 'if condition', insert: 'if ', kind: 'control' },
  { label: 'else if condition', insert: 'else if ', kind: 'control' },
  { label: 'else', insert: 'else', kind: 'control' },
  { label: 'repeat count', insert: 'repeat ', kind: 'loop' },
  { label: 'for item in list', insert: 'for item in ', kind: 'loop' },
  { label: 'while condition', insert: 'while ', kind: 'loop' },
  { label: 'return', insert: 'return ', kind: 'keyword' },
  { label: 'console.log()', insert: 'console.log()', kind: 'builtin' }
];

let projects = [];
let activeProjectId = null;
let activeViewMode = 'code';
let lastCompiledDocument = '';
let previewWindowRef = null;
let acItems = [];
let acSelectedIndex = 0;
let acTokenStart = 0;

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

function generateId(prefix) {
  return prefix + '_' + Math.random().toString(36).substring(2, 9);
}

function loadProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { projects = JSON.parse(raw); } catch { projects = []; }
  }
  if (projects.length === 0) {
    const f1 = { id: generateId('file'), name: 'main.ytea', content: DEFAULT_UI_FILE };
    const f2 = { id: generateId('file'), name: 'logic.ytea', content: DEFAULT_Y_FILE };
    projects.push({ id: generateId('ws'), name: 'starter-app', files: [f1, f2], activeFileId: f1.id });
    saveProjects();
  }
  const savedWs = localStorage.getItem(ACTIVE_PROJECT_KEY);
  activeProjectId = projects.some(p => p.id === savedWs) ? savedWs : projects[0].id;
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  statusSave.textContent = 'Saved';
}

function getActiveProject() {
  return projects.find(p => p.id === activeProjectId);
}

function getActiveFile() {
  const proj = getActiveProject();
  if (!proj) return null;
  return proj.files.find(f => f.id === proj.activeFileId) || proj.files[0];
}

function detectFileHeader(content) {
  const firstLine = (content || '').trim().split('\n')[0];
  return firstLine.startsWith('#Y//') ? 'Y' : 'UI';
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  return Array.from(ids).map(id => ({ label: `@${id}`, insert: `@${id}`, kind: 'element' }));
}

function triggerAutocomplete() {
  const pos = codeEditor.selectionStart;
  const textBefore = codeEditor.value.substring(0, pos);
  const currentLine = textBefore.split('\n').pop();
  const tokenMatch = currentLine.match(/([.@a-zA-Z0-9_-]+)$/);

  if (!tokenMatch) {
    hideAutocomplete();
    return;
  }

  const token = tokenMatch[1];
  acTokenStart = pos - token.length;
  const mode = detectFileHeader(codeEditor.value);
  let pool = [];

  if (mode === 'UI') {
    if (token.startsWith('.')) {
      pool = CSS_MODIFIER_SUGGESTIONS;
    } else if (currentLine.trim() === token) {
      pool = UI_TAG_SUGGESTIONS;
    }
  } else {
    if (token.startsWith('@')) {
      pool = collectWorkspaceIds();
    } else {
      pool = [...Y_KEYWORD_SUGGESTIONS, ...collectWorkspaceIds()];
    }
  }

  acItems = pool.filter(item => item.label.toLowerCase().startsWith(token.toLowerCase()) && item.label !== token);
  if (acItems.length === 0) {
    hideAutocomplete();
    return;
  }

  acSelectedIndex = 0;
  renderAutocompleteMenu(textBefore);
}

function getSymbolBadge(kind) {
  if (kind === 'tag') return '<span class="ac-symbol sym-tag">&lt;&gt;</span>';
  if (kind === 'css') return '<span class="ac-symbol sym-css">#</span>';
  if (kind === 'element') return '<span class="ac-symbol sym-el">@</span>';
  return '<span class="ac-symbol sym-kw">ƒ</span>';
}

function renderAutocompleteMenu(textBefore) {
  const lines = textBefore.split('\n');
  const lineIndex = lines.length - 1;
  const colIndex = lines[lineIndex].length;

  const topPx = Math.min((lineIndex + 1) * 21.6 + 16 - codeEditor.scrollTop, codeEditor.clientHeight - 160);
  const leftPx = Math.min(colIndex * 8.1 + 16 - codeEditor.scrollLeft, codeEditor.clientWidth - 280);

  autocompleteMenu.style.top = `${Math.max(10, topPx)}px`;
  autocompleteMenu.style.left = `${Math.max(10, leftPx)}px`;

  autocompleteMenu.innerHTML = acItems.map((item, idx) => `
    <div class="ac-item ${idx === acSelectedIndex ? 'selected' : ''}" data-idx="${idx}">
      <div class="ac-item-left">
        ${getSymbolBadge(item.kind)}
        <span class="ac-label">${escapeHtml(item.label)}</span>
      </div>
      <span class="ac-kind">${item.kind}</span>
    </div>
  `).join('');

  autocompleteMenu.querySelectorAll('.ac-item').forEach(el => {
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      applyAutocomplete(Number(el.dataset.idx));
    });
  });

  autocompleteMenu.classList.add('visible');
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

  codeEditor.value = before + chosen.insert + after;
  let newCursor = acTokenStart + chosen.insert.length;
  if (chosen.insert.endsWith('()') || chosen.insert.endsWith('""')) {
    newCursor -= 1;
  }
  codeEditor.selectionStart = codeEditor.selectionEnd = newCursor;
  hideAutocomplete();
  codeEditor.dispatchEvent(new Event('input'));
}

function restructureUIToHTML(source) {
  const lines = source.split('\n');
  const root = { tag: 'root', indent: -1, children: [], styles: [], attrs: '', text: '' };
  const stack = [root];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#UI//')) continue;
    const indent = rawLine.search(/\S/);

    if (trimmed.startsWith('.')) {
      const match = trimmed.match(/^\.([a-zA-Z0-9_-]+)\((.*)\)$/);
      if (match) {
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          if (stack[stack.length - 1].indent < indent) break;
          if (stack[stack.length - 1].indent === indent && stack.length > 2) stack.pop();
          else break;
        }
        const target = stack[stack.length - 1];
        if (target && target.tag !== 'root') target.styles.push(`${match[1]}: ${match[2]};`);
        continue;
      }
    }

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

    const node = { tag, indent, attrs, text, styles: [], children: [], isVoid: voidTags.has(tag.toLowerCase()) };
    stack[stack.length - 1].children.push(node);
    if (!node.isVoid) stack.push(node);
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
    output.push(`${pad}${expandRefs(text)}`);
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
  <link rel="icon" href="https://mexelrobi.github.io/ytea/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="https://mexelrobi.github.io/ytea/apple-touch-icon.png">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; }
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
  if (notify) showToast('Project compiled successfully');
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
  readmeTab.innerHTML = `<span class="file-tag tag-md">MD</span><span>README.md</span><span class="tab-dot"></span>`;
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
  document.getElementById('windowTitleText').textContent = `README.md — ytea Studio`;
  document.getElementById('breadcrumb').innerHTML = `ytea &rsaquo; README.md`;
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
    document.getElementById('windowTitleText').textContent = `${file.name} — ${proj.name} — ytea Studio`;
    document.getElementById('breadcrumb').innerHTML = `${escapeHtml(proj.name)} &rsaquo; ${escapeHtml(file.name)}`;
  }
  switchEditorStage('view-code');
  renderWorkspaceUI();
}

function openOutputView() {
  activeViewMode = 'output';
  compileProject(false);
  const proj = getActiveProject();
  document.getElementById('windowTitleText').textContent = `dist/index.html — ${proj.name} — ytea Studio`;
  document.getElementById('breadcrumb').innerHTML = `${escapeHtml(proj.name)} &rsaquo; dist &rsaquo; index.html`;
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
  statusMode.textContent = detectFileHeader(codeEditor.value) === 'Y' ? 'Header: #Y// (Logic)' : 'Header: #UI// (Layout)';
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
    showToast('Popup blocked. Please allow popups.');
  }
}

codeEditor.addEventListener('scroll', () => {
  codeHighlight.scrollTop = codeEditor.scrollTop;
  codeHighlight.scrollLeft = codeEditor.scrollLeft;
  codeLineNumbers.scrollTop = codeEditor.scrollTop;
  updateCursorAndLineHighlight();
  hideAutocomplete();
});

codeEditor.addEventListener('click', updateCursorAndLineHighlight);
codeEditor.addEventListener('keyup', updateCursorAndLineHighlight);

codeEditor.addEventListener('input', () => {
  const file = getActiveFile();
  if (file) { file.content = codeEditor.value; saveProjects(); }
  statusCompile.textContent = 'Modified';
  updateEditorVisuals();
  updateCursorAndLineHighlight();
  triggerAutocomplete();
  renderWorkspaceUI();
});

codeEditor.addEventListener('keydown', (e) => {
  if (autocompleteMenu.classList.contains('visible')) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acSelectedIndex = (acSelectedIndex + 1) % acItems.length;
      renderAutocompleteMenu(codeEditor.value.substring(0, codeEditor.selectionStart));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      acSelectedIndex = (acSelectedIndex - 1 + acItems.length) % acItems.length;
      renderAutocompleteMenu(codeEditor.value.substring(0, codeEditor.selectionStart));
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

// Global Shortcuts (Ctrl+S & Ctrl+Enter)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    compileProject(true);
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    openPreviewPopup();
  }
});

document.getElementById('btnNewFile').addEventListener('click', () => {
  const proj = getActiveProject();
  if (!proj) return;
  let name = prompt('New .ytea file name:', `module-${proj.files.length + 1}.ytea`);
  if (!name || !name.trim()) return;
  name = name.trim().endsWith('.ytea') ? name.trim() : name.trim() + '.ytea';
  const type = prompt('Type UI for #UI// or Y for #Y//:', 'Y');
  const content = (type && type.trim().toUpperCase() === 'Y') ? '#Y//\n' : '#UI//\ndiv\n  .padding(16px)\n';
  const nf = { id: generateId('file'), name, content };
  proj.files.push(nf);
  proj.activeFileId = nf.id;
  saveProjects();
  openCodeFile(nf.id);
});

document.getElementById('menuNewFile').addEventListener('click', () => document.getElementById('btnNewFile').click());
document.getElementById('actNewFile').addEventListener('click', () => document.getElementById('btnNewFile').click());
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
  const name = prompt('Workspace name:', `project-${projects.length + 1}`);
  if (!name || !name.trim()) return;
  const f1 = { id: generateId('file'), name: 'main.ytea', content: `#UI//\ndiv(id="root")\n  .padding(32px)\n  h1 "${name.trim()}"` };
  const f2 = { id: generateId('file'), name: 'logic.ytea', content: `#Y//\nconsole.log("${name.trim()} ready")` };
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
  const n = prompt('Rename workspace:', proj.name);
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
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('visible'), 2200);
}

loadProjects();
openCodeFile(getActiveProject().activeFileId);
compileProject(false);