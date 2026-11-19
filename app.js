const STORAGE_KEY = 'ytea_ide_projects_v1';
const ACTIVE_PROJECT_KEY = 'ytea_ide_active_v1';

const STARTER_YTEA = `div(id="app")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  .background(#111318)
  .font-family(system-ui, -apple-system, sans-serif)
  .color(#e2e8f0)
  .padding(24px)

  div(class="panel")
    .background(#191c24)
    .border(1px solid #2a2f3d)
    .border-radius(12px)
    .padding(32px)
    .max-width(420px)
    .width(100%)

    span "YTEA WORKSPACE"
      .display(inline-block)
      .font-size(11px)
      .font-weight(600)
      .letter-spacing(0.08em)
      .color(#c586c0)
      .margin-bottom(10px)

    h1 "Structured HTML & CSS."
      .font-size(24px)
      .font-weight(600)
      .margin(0 0 10px 0)

    p "Write clean hierarchical tags and attach native CSS rules directly underneath using dot notation."
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

const STARTER_JS = `let count = 0;
const btnCount = document.getElementById('btnCount');
const btnReset = document.getElementById('btnReset');

btnCount.addEventListener('click', () => {
  count++;
  btnCount.textContent = \`Count: \${count}\`;
});

btnReset.addEventListener('click', () => {
  count = 0;
  btnCount.textContent = 'Count: 0';
});`;

let projects = [];
let activeProjectId = null;
let activeFileTab = 'structure';
let lastCompiledDocument = '';
let previewWindowRef = null;

const projectSelect = document.getElementById('projectSelect');
const sidebarProjectName = document.getElementById('sidebarProjectName');
const htmlEditor = document.getElementById('htmlEditor');
const jsEditor = document.getElementById('jsEditor');
const htmlHighlight = document.getElementById('htmlHighlight');
const jsHighlight = document.getElementById('jsHighlight');
const htmlLineNumbers = document.getElementById('htmlLineNumbers');
const jsLineNumbers = document.getElementById('jsLineNumbers');
const outLineNumbers = document.getElementById('outLineNumbers');
const compiledCode = document.getElementById('compiledCode');
const statusCompile = document.getElementById('statusCompile');
const statusSave = document.getElementById('statusSave');
const statusCursor = document.getElementById('statusCursor');
const statusLang = document.getElementById('statusLang');
const tabDirtyDot = document.getElementById('tabDirtyDot');

function generateId() {
  return 'ytea_' + Math.random().toString(36).substring(2, 9);
}

function loadProjects() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      projects = JSON.parse(raw);
    } catch {
      projects = [];
    }
  }

  if (projects.length === 0) {
    projects.push({
      id: generateId(),
      name: 'default-workspace',
      html: STARTER_YTEA,
      js: STARTER_JS,
      updatedAt: Date.now()
    });
    saveProjectsToStorage();
  }

  const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY);
  activeProjectId = projects.some(p => p.id === savedId) ? savedId : projects[0].id;
}

function saveProjectsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  statusSave.textContent = 'Saved';
}

function getActiveProject() {
  return projects.find(p => p.id === activeProjectId);
}

function renderProjectDropdown() {
  projectSelect.innerHTML = '';
  projects.forEach(proj => {
    const opt = document.createElement('option');
    opt.value = proj.id;
    opt.textContent = proj.name;
    if (proj.id === activeProjectId) opt.selected = true;
    projectSelect.appendChild(opt);
  });
  const current = getActiveProject();
  if (current) {
    sidebarProjectName.textContent = current.name;
  }
}

function switchProject(id) {
  activeProjectId = id;
  localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  const proj = getActiveProject();
  if (!proj) return;

  sidebarProjectName.textContent = proj.name;
  htmlEditor.value = proj.html;
  jsEditor.value = proj.js;

  updateEditorVisuals();
  compileProject(false);
  updateTitleAndBreadcrumb();
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightYtea(code) {
  return code.split('\n').map(line => {
    const trimmed = line.trim();
    const spaceMatch = line.match(/^\s*/);
    const leadingSpaces = spaceMatch ? spaceMatch[0] : '';

    if (!trimmed) return '';

    if (trimmed.startsWith('//')) {
      return `${leadingSpaces}<span class="tok-comment">${escapeHtml(trimmed)}</span>`;
    }

    if (trimmed.startsWith('.')) {
      const modMatch = trimmed.match(/^\.([a-zA-Z0-9_-]+)\((.*)\)$/);
      if (modMatch) {
        const prop = escapeHtml(modMatch[1]);
        const val = escapeHtml(modMatch[2]);
        return `${leadingSpaces}<span class="tok-mod">.${prop}</span>(<span class="tok-val">${val}</span>)`;
      }
      return `${leadingSpaces}<span class="tok-mod">${escapeHtml(trimmed)}</span>`;
    }

    const elemMatch = trimmed.match(/^([a-zA-Z0-9-]+)(\([^)]*\))?(.*)$/);
    if (elemMatch) {
      const tag = escapeHtml(elemMatch[1]);
      let attrsPart = elemMatch[2] || '';
      let restPart = elemMatch[3] || '';

      if (attrsPart) {
        const innerAttrs = escapeHtml(attrsPart.slice(1, -1))
          .replace(/([a-zA-Z0-9_-]+)=("[^"]*"|'[^']*')/g, '<span class="tok-attr">$1</span>=<span class="tok-str">$2</span>');
        attrsPart = `(${innerAttrs})`;
      }

      if (restPart) {
        restPart = escapeHtml(restPart).replace(/("[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');
      }

      return `${leadingSpaces}<span class="tok-tag">${tag}</span>${attrsPart}${restPart}`;
    }

    return escapeHtml(line);
  }).join('\n');
}

function highlightJS(code) {
  let escaped = escapeHtml(code);
  escaped = escaped.replace(/(\/\/.*$)/gm, '<span class="tok-comment">$1</span>');
  escaped = escaped.replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');
  const keywords = /\b(const|let|var|function|return|if|else|for|while|switch|case|break|new|class|async|await|try|catch|document|window)\b/g;
  escaped = escaped.replace(keywords, '<span class="tok-kw">$1</span>');
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
  return escaped;
}

function updateLineGutter(text, gutterEl) {
  const count = text.split('\n').length;
  gutterEl.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
}

function updateEditorVisuals() {
  htmlHighlight.innerHTML = highlightYtea(htmlEditor.value) + '\n';
  updateLineGutter(htmlEditor.value, htmlLineNumbers);

  jsHighlight.innerHTML = highlightJS(jsEditor.value) + '\n';
  updateLineGutter(jsEditor.value, jsLineNumbers);
}

function restructureToHTML(source) {
  const lines = source.split('\n');
  const root = { tag: 'root', indent: -1, children: [], styles: [], attrs: '', text: '' };
  const stack = [root];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith('//')) continue;

    const indent = rawLine.search(/\S/);
    const content = rawLine.trim();

    if (content.startsWith('.')) {
      const match = content.match(/^\.([a-zA-Z0-9_-]+)\((.*)\)$/);
      if (match) {
        const prop = match[1];
        const val = match[2];

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          if (stack[stack.length - 1].indent < indent) break;
          if (stack[stack.length - 1].indent === indent && stack.length > 2) {
            stack.pop();
          } else {
            break;
          }
        }

        const target = stack[stack.length - 1];
        if (target && target.tag !== 'root') {
          target.styles.push(`${prop}: ${val};`);
        }
        continue;
      }
    }

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (content.startsWith('<')) {
      stack[stack.length - 1].children.push({ raw: content, indent, children: [], styles: [] });
      continue;
    }

    const tagMatch = content.match(/^([a-zA-Z0-9-]+)(.*)$/);
    if (!tagMatch) continue;

    const tag = tagMatch[1];
    let rest = tagMatch[2].trim();

    let attrs = '';
    if (rest.startsWith('(')) {
      let depth = 0;
      let closeIdx = -1;
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '(') depth++;
        if (rest[i] === ')') depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
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
      isVoid: voidTags.has(tag.toLowerCase())
    };

    stack[stack.length - 1].children.push(node);
    if (!node.isVoid) {
      stack.push(node);
    }
  }

  function renderNode(node, depth) {
    if (node.raw) return '  '.repeat(depth) + node.raw;

    const pad = '  '.repeat(depth);
    const attrPart = node.attrs ? ` ${node.attrs}` : '';
    const stylePart = node.styles.length > 0 ? ` style="${node.styles.join(' ')}"` : '';

    if (node.isVoid) {
      return `${pad}<${node.tag}${attrPart}${stylePart} />`;
    }

    if (node.children.length === 0) {
      return `${pad}<${node.tag}${attrPart}${stylePart}>${node.text}</${node.tag}>`;
    }

    const inner = [];
    if (node.text) inner.push(`${pad}  ${node.text}`);
    for (const child of node.children) {
      inner.push(renderNode(child, depth + 1));
    }

    return `${pad}<${node.tag}${attrPart}${stylePart}>\n${inner.join('\n')}\n${pad}</${node.tag}>`;
  }

  return root.children.map(child => renderNode(child, 1)).join('\n');
}

function compileProject(notify = true) {
  const proj = getActiveProject();
  const title = proj ? proj.name : 'ytea Output';
  const bodyHTML = restructureToHTML(htmlEditor.value);
  const scriptContent = jsEditor.value
    .split('\n')
    .map(line => (line.trim() ? '    ' + line : ''))
    .join('\n');

  lastCompiledDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; }
  </style>
</head>
<body>
${bodyHTML}

  <script>
${scriptContent}
  <\/script>
</body>
</html>`;

  compiledCode.textContent = lastCompiledDocument;
  updateLineGutter(lastCompiledDocument, outLineNumbers);
  statusCompile.textContent = 'Compiled';
  tabDirtyDot.classList.remove('visible');

  if (notify) {
    showToast('Compiled dist/index.html');
  }
}
function openPreviewPopup() {
  compileProject(false);

  const width = 1040;
  const height = 720;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  if (!previewWindowRef || previewWindowRef.closed) {
    previewWindowRef = window.open(
      '',
      'YteaPreviewWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  } else {
    previewWindowRef.focus();
  }

  if (previewWindowRef) {
    previewWindowRef.document.open();
    previewWindowRef.document.write(lastCompiledDocument);
    previewWindowRef.document.close();
  } else {
    showToast('Popup blocked. Allow popups for preview.');
  }
}

function exportHtmlFile() {
  compileProject(false);
  const proj = getActiveProject();
  const safeName = (proj ? proj.name : 'index')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');

  const blob = new Blob([lastCompiledDocument], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.html`;
  link.click();
  URL.revokeObjectURL(url);

  showToast(`Exported ${safeName}.html`);
}

function switchFileTab(fileKey) {
  activeFileTab = fileKey;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.file === fileKey);
  });

  document.querySelectorAll('.file-item').forEach(item => {
    item.classList.toggle('active', item.dataset.file === fileKey);
  });

  document.querySelectorAll('.editor-view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`view-${fileKey}`).classList.add('active');

  if (fileKey === 'output') {
    compileProject(false);
  }

  updateTitleAndBreadcrumb();
}

function updateTitleAndBreadcrumb() {
  const proj = getActiveProject();
  const projName = proj ? proj.name : 'workspace';
  const fileMap = {
    structure: { label: 'structure.ytea', lang: 'YTEA' },
    script: { label: 'script.js', lang: 'JavaScript' },
    output: { label: 'dist/index.html', lang: 'HTML' }
  };

  const info = fileMap[activeFileTab];
  document.getElementById('windowTitle').textContent = `${info.label} — ${projName} — ytea`;
  document.getElementById('breadcrumb').innerHTML = `${escapeHtml(projName)} &rsaquo; ${info.label}`;
  statusLang.textContent = info.lang;
}

function updateCursorPosition(textarea) {
  const pos = textarea.selectionStart;
  const textUpToCursor = textarea.value.substring(0, pos);
  const lines = textUpToCursor.split('\n');
  const lineNum = lines.length;
  const colNum = lines[lines.length - 1].length + 1;
  statusCursor.textContent = `Ln ${lineNum}, Col ${colNum}`;
}

function setupEditor(textarea, highlightEl, lineNumbersEl, isYteaEditor) {
  textarea.addEventListener('scroll', () => {
    highlightEl.scrollTop = textarea.scrollTop;
    highlightEl.scrollLeft = textarea.scrollLeft;
    lineNumbersEl.scrollTop = textarea.scrollTop;
  });

  textarea.addEventListener('click', () => updateCursorPosition(textarea));
  textarea.addEventListener('keyup', () => updateCursorPosition(textarea));

  textarea.addEventListener('input', () => {
    const proj = getActiveProject();
    if (proj) {
      if (isYteaEditor) {
        proj.html = textarea.value;
      } else {
        proj.js = textarea.value;
      }
      proj.updatedAt = Date.now();
      statusSave.textContent = 'Saving...';
      saveProjectsToStorage();
    }

    statusCompile.textContent = 'Modified';
    tabDirtyDot.classList.add('visible');
    updateEditorVisuals();
    updateCursorPosition(textarea);
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      textarea.dispatchEvent(new Event('input'));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, start);
      const currentLine = textBefore.split('\n').pop();
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';

      if (isYteaEditor) {
        const trimmed = currentLine.trim();
        if (trimmed && !trimmed.startsWith('.') && !trimmed.startsWith('//')) {
          indent += '  ';
        }
      }

      textarea.value = textBefore + '\n' + indent + textarea.value.substring(textarea.selectionEnd);
      textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
      textarea.dispatchEvent(new Event('input'));
    }
  });
}

// Global Shortcuts (Ctrl+S Compile, Ctrl+Enter Preview)
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    compileProject(true);
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    openPreviewPopup();
  }
});

// Event Bindings
document.querySelectorAll('.tab, .file-item').forEach(el => {
  el.addEventListener('click', () => switchFileTab(el.dataset.file));
});

compiledCode.addEventListener('scroll', () => {
  outLineNumbers.scrollTop = compiledCode.scrollTop;
});

projectSelect.addEventListener('change', (e) => switchProject(e.target.value));

document.getElementById('btnNewProject').addEventListener('click', () => {
  const name = prompt('Workspace name:', `project-${projects.length + 1}`);
  if (!name || !name.trim()) return;

  const cleanName = name.trim();
  const newProj = {
    id: generateId(),
    name: cleanName,
    html: `div(id="root")\n  .padding(32px)\n  .font-family(sans-serif)\n\n  h1 "${cleanName}"\n    .font-size(24px)`,
    js: `console.log('${cleanName} ready');`,
    updatedAt: Date.now()
  };

  projects.push(newProj);
  activeProjectId = newProj.id;
  saveProjectsToStorage();
  renderProjectDropdown();
  switchProject(newProj.id);
  showToast(`Created ${cleanName}`);
});

document.getElementById('btnRenameProject').addEventListener('click', () => {
  const proj = getActiveProject();
  if (!proj) return;

  const newName = prompt('Rename workspace:', proj.name);
  if (!newName || !newName.trim()) return;

  proj.name = newName.trim();
  saveProjectsToStorage();
  renderProjectDropdown();
  compileProject(false);
  updateTitleAndBreadcrumb();
  showToast('Workspace renamed');
});

document.getElementById('btnDeleteProject').addEventListener('click', () => {
  if (projects.length <= 1) {
    showToast('Cannot delete the only workspace');
    return;
  }

  const proj = getActiveProject();
  if (!proj) return;

  if (confirm(`Delete workspace "${proj.name}"?`)) {
    projects = projects.filter(p => p.id !== proj.id);
    activeProjectId = projects[0].id;
    saveProjectsToStorage();
    renderProjectDropdown();
    switchProject(activeProjectId);
    showToast('Workspace deleted');
  }
});

document.getElementById('btnCompile').addEventListener('click', () => compileProject(true));
document.getElementById('actCompile').addEventListener('click', () => compileProject(true));
document.getElementById('btnPreview').addEventListener('click', openPreviewPopup);
document.getElementById('actPreview').addEventListener('click', openPreviewPopup);
document.getElementById('btnExport').addEventListener('click', exportHtmlFile);

document.getElementById('btnCopyOutput').addEventListener('click', () => {
  navigator.clipboard.writeText(lastCompiledDocument);
  showToast('Copied compiled HTML');
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

// Boot
setupEditor(htmlEditor, htmlHighlight, htmlLineNumbers, true);
setupEditor(jsEditor, jsHighlight, jsLineNumbers, false);
loadProjects();
renderProjectDropdown();
switchProject(activeProjectId);
switchFileTab('structure');
