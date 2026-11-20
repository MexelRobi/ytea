#!/usr/bin/env node
/** Bundle README + docs/*.md into docs-bundle.js for the in-app docs browser. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pages = [
  { id: 'readme', title: 'README', file: 'README.md', blurb: 'Overview, quick start, centering gotcha' },
  { id: 'ui-language', title: '#UI// language', file: 'docs/ui-language.md', blurb: 'Tags, CSS modifiers, nesting, centering' },
  { id: 'y-language', title: '#Y// language', file: 'docs/y-language.md', blurb: 'Events, loops, helpers, full reference' },
  { id: 'examples', title: 'Examples', file: 'docs/examples.md', blurb: 'Copy-paste patterns' },
  { id: 'compiler', title: 'Compiler', file: 'docs/compiler.md', blurb: 'Compile, preview, export, storage' },
  { id: 'cheatsheet', title: 'Cheat sheet', file: 'docs/cheatsheet.md', blurb: 'One-page reference' }
];

const out = pages.map(p => {
  const md = fs.readFileSync(path.join(root, p.file), 'utf8');
  return `  ${JSON.stringify(p.id)}: {\n    id: ${JSON.stringify(p.id)},\n    title: ${JSON.stringify(p.title)},\n    file: ${JSON.stringify(p.file)},\n    blurb: ${JSON.stringify(p.blurb)},\n    markdown: ${JSON.stringify(md)}\n  }`;
}).join(',\n');

const js = `/* Auto-bundled docs for in-app browser. Re-run: node scripts/bundle-docs.js */\nvar DOC_PAGES = {\n${out}\n};\n`;
fs.writeFileSync(path.join(root, 'docs-bundle.js'), js);
console.log('Wrote docs-bundle.js');
