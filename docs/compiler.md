# Compiler & app workflow

ytea runs entirely in the browser. `app.js` owns editing, autocomplete, and compilation.

---

## What Compile does

1. Walks every file in the active project.
2. Files starting with `#Y//` → `restructureYToJS`.
3. Everything else (usually `#UI//`) → `restructureUIToHTML`.
4. Wraps the result in a full HTML document:

```html
<!DOCTYPE html>
<html lang="en">
<head>…title + base CSS…</head>
<body>
  <!-- each UI file -->
  …

  <script>
    // --- each Y file ---
    …
  </script>
</body>
</html>
```

Order = file order in the project. Put structure first, logic second (default template already does this).

---

## Preview & export

| Action | Result |
|--------|--------|
| **Compile** | Updates `dist/index.html` view + status |
| **Run** | Opens/writes a popup with the compiled document |
| **Export** | Downloads `{project-name}.html` |

Shortcuts: `Ctrl/Cmd+S` compile · `Ctrl/Cmd+Enter` run.

---

## Storage

Projects live in `localStorage`:

- `ytea_pure_workspaces_v4` — all workspaces / files
- `ytea_pure_active_ws_v4` — last active project
- `ytea_official_catalog_v1` — cached HTML/CSS autocomplete catalogs

Clearing site data resets projects to the default demo.

---

## Autocomplete catalogs

On load, ytea fetches:

- MDN CSS properties (`mdn-data`)
- HTML tag list (`html-tags`)

If offline, a small fallback list is used. Type `.` in `#UI//` for CSS, tag names for HTML, `@` in `#Y//` for your element ids.

---

## Design rules of the compilers

1. **UI** — no invented CSS; `.foo(bar)` → `foo: bar;`.
2. **Y** — keyword lines become JS blocks; unknown lines pass through as statements.
3. **`@id`** — always `document.getElementById('id')` (also inside strings? No — strings are preserved).
4. **Indent** — closes blocks when indentation goes back out.

---

## Debugging tips

1. Open **dist/index.html** in the editor to see exact output.
2. Use the browser console in the preview popup (`log …` helps).
3. If a CSS rule “does nothing”, check the compiled `style="…"` — usually a missing companion property (e.g. `display:flex` for `align-items`).
4. If `@id` is `null`, the id is missing in a `#UI//` file or the script runs before the element (keep UI above the script — default template is fine).