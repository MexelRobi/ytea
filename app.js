const STORAGE_KEY = 'ytea_groq_workspaces_v1';
const ACTIVE_PROJECT_KEY = 'ytea_groq_active_ws_v1';
const GROQ_TOKEN_KEY = 'ytea_groq_token';
const GROQ_MODEL = 'openai/gpt-oss-120b'; // Extrem schnell & kostenlos über Groq

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

    span "YTEA GROQ ENGINE"
      .display(inline-block)
      .font-size(11px)
      .font-weight(600)
      .letter-spacing(0.08em)
      .color(#c586c0)
      .margin-bottom(10px)

    h1 "Lightning Fast AI."
      .font-size(24px)
      .font-weight(600)
      .margin(0 0 10px 0)

    p "Compilation runs via Groq Cloud API. Configure your gsk_... token in Settings."
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
<p><strong>ytea</strong> compiles your workspace via the ultra-fast <strong>Groq Cloud API</strong> (Llama 3.3).</p>

<h2>1. File Headers</h2>
<ul>
  <li><code>#UI//</code> — Layout &amp; CSS structure.</li>
  <li><code>#Y//</code> — Swift-like logic files.</li>
</ul>

<h2>2. Groq Compilation</h2>
<p>Open Settings in the top bar to enter your Groq API key (<code>gsk_...</code>). Compilation sends your workspace files directly to Groq's high-speed inference engine.</p>
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
  { label: 'a', insert: 'a(href="") ""', kind: 'tag' }
];

const CSS_MODIFIER_SUGGESTIONS = [
  '.display(flex)', '.flex-direction(column)', '.align-items(center)', '.justify-content(center)',
  '.gap(12px)', '.padding(16px)', '.margin(0)', '.margin-bottom(12px)',
  '.width(100%)', '.max-width(480px)', '.height(100%)', '.min-height(100vh)',
  '.background(#1e293b)', '.color(#ffffff)', '.font-size(14px)', '.font-weight(600)',
  '.border(1px solid #334155)', '.border-radius(8px)', '.cursor(pointer)'
].map(item => ({ label: item, insert: item, kind: 'css' }));

const Y_KEYWORD_SUGGESTIONS = [
  { label: 'var name = value', insert: 'var ', kind: 'keyword' },
  { label: 'func name()', insert: 'func ', kind: 'keyword' },
  { label: 'on click @id', insert: 'on click @', kind: 'event' },
  { label: 'if condition', insert: 'if ', kind: 'control' },
  { label: 'else', insert: 'else', kind: 'control' },
  { label: 'repeat count', insert: 'repeat ', kind: 'loop' },
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

  if (!tokenMatch) { hideAutocomplete(); return; }

  const token = tokenMatch[1];
  acTokenStart = pos - token.length;
  const mode = detectFileHeader(codeEditor.value);
  let pool = [];

  if (mode === 'UI') {
    if (token.startsWith('.')) pool = CSS_MODIFIER_SUGGESTIONS;
    else if (currentLine.trim() === token) pool = UI_TAG_SUGGESTIONS;
  } else {
    if (token.startsWith('@')) pool = collectWorkspaceIds();
    else pool = [...Y_KEYWORD_SUGGESTIONS, ...collectWorkspaceIds()];
  }

  acItems = pool.filter(item => item.label.toLowerCase().startsWith(token.toLowerCase()) && item.label !== token);
  if (acItems.length === 0) { hideAutocomplete(); return; }

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
  if (chosen.insert.endsWith('()') || chosen.insert.endsWith('""')) newCursor -= 1;
  codeEditor.selectionStart = codeEditor.selectionEnd = newCursor;
  hideAutocomplete();
  codeEditor.dispatchEvent(new Event('input'));
}

async function compileProject(notify = true) {
  const proj = getActiveProject();
  if (!proj) return;

  const token = localStorage.getItem(GROQ_TOKEN_KEY);

  if (!token || !token.trim().startsWith('gsk_')) {
    lastCompiledDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Compilation Error</title>
  <link rel="icon" href="https://mexelrobi.github.io/ytea/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="https://mexelrobi.github.io/ytea/apple-touch-icon.png">
</head>
<body style="background:#1f1f1f;color:#f14c4c;font-family:sans-serif;padding:40px;">
  <h2>Groq API Key Required</h2>
  <p>No valid Groq key found in localStorage. Please open Settings and enter your gsk_... key to compile this project.</p>
</body>
</html>`;
    compiledCode.textContent = lastCompiledDocument;
    outLineNumbers.innerHTML = '1';
    statusCompile.textContent = 'Error';
    if (notify) showToast('Error: Groq API key missing');
    return;
  }

  if (notify) showToast('Compiling workspace via Groq Cloud...');
  const combinedWorkspace = proj.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n');
  const prompt = `Convert the entire ytea workspace (including all #UI// layout/styles and #Y// Swift-like logic files) into a single clean, fully functional standard HTML5 document with inline CSS and vanilla JavaScript. Include these required favicon links in the <head>:
<link rel="icon" href="https://mexelrobi.github.io/ytea/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="https://mexelrobi.github.io/ytea/apple-touch-icon.png">
Output ONLY raw HTML code without markdown code blocks, completely self-contained.\n\n${combinedWorkspace}`;

  try {
    const response = await fetch(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    })
  }
);

    if (response.ok) {
      const data = await response.json();
      let rawContent = data.choices[0].message.content.trim();
      if (rawContent.startsWith('```html')) rawContent = rawContent.replace(/^```html\s*/, '');
      if (rawContent.startsWith('```')) rawContent = rawContent.replace(/^```\s*/, '');
      if (rawContent.endsWith('```')) rawContent = rawContent.replace(/\s*```$/, '');
      lastCompiledDocument = rawContent;
      compiledCode.textContent = lastCompiledDocument;
      outLineNumbers.innerHTML = Array.from({ length: lastCompiledDocument.split('\n').length }, (_, i) => i + 1).join('<br>');
      statusCompile.textContent = 'Compiled';
      if (notify) showToast('Project compiled successfully via Groq');
    } else {
      const errText = await response.text();
      throw new Error(errText);
    }
  } catch (err) {
    lastCompiledDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Groq Compilation Error</title>
</head>
<body style="background:#1f1f1f;color:#f14c4c;font-family:sans-serif;padding:40px;">
  <h2>Groq Compilation Failed</h2>
  <p>Could not reach Groq API or the model returned an error. Check your API key in Settings.</p>
  <pre style="background:#2a2a2a;padding:15px;border-radius:6px;color:#d4d4d4;overflow:auto;margin-top:15px;">${escapeHtml(err.message)}</pre>
</body>
</html>`;
    compiledCode.textContent = lastCompiledDocument;
    outLineNumbers.innerHTML = '1';
    statusCompile.textContent = 'Groq Error';
    if (notify) showToast('Groq Compilation failed');
  }
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
  statusMode.textContent = detectFileHeader(codeEditor.value) === 'Y' ? 'Header: #Y// (Groq Swift Logic)' : 'Header: #UI// (Layout)';
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
}

document.getElementById('btnNewFileTab').addEventListener('click', createNewFile);
document.getElementById('btnNewFileSide').addEventListener('click', createNewFile);
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

const settingsModal = document.getElementById('settingsModal');
const inputHfToken = document.getElementById('inputHfToken');

function openSettingsModal() {
  inputHfToken.value = localStorage.getItem(GROQ_TOKEN_KEY) || '';
  settingsModal.classList.add('visible');
}

function closeSettingsModal() {
  settingsModal.classList.remove('visible');
}

document.getElementById('btnSettings').addEventListener('click', openSettingsModal);
document.getElementById('actSettings').addEventListener('click', openSettingsModal);
document.getElementById('btnCloseModal').addEventListener('click', closeSettingsModal);
document.getElementById('btnCancelModal').addEventListener('click', closeSettingsModal);
document.getElementById('btnSaveModal').addEventListener('click', () => {
  localStorage.setItem(GROQ_TOKEN_KEY, inputHfToken.value.trim());
  closeSettingsModal();
  showToast('Groq settings saved successfully');
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