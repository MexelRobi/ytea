# Compiler & app workflow

ytea runs entirely in the browser. `app.js` owns editing, autocomplete, compilation, assets, and ZenoPack export.

---

## What Compile does

1. Walks every `.ytea` file in the active project (not assets).
2. Files starting with `#Y//` → `restructureYToJS`.
3. Everything else (usually `#UI//`) → `restructureUIToHTML`.
4. Wraps the result in a full HTML document (`index.html` for the pack):

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

## Assets

Under **Assets** you can add any files or whole folders (no type filter). Paths keep their folder structure (e.g. `images/logo.png`). Assets are stored with the project and packed into the export as-is.

Reference them from `#UI//` with normal paths, e.g. `img(src="images/logo.png")`.

---

## Preview & export

| Action | Result |
|--------|--------|
| **Compile** | Builds the HTML document + status |
| **Run** | Opens a popup with the ZenoPack standalone HTML (compiled site + assets) |
| **Export** | Packs compiled `index.html` + all assets into a `.zenopack`, then embeds that into a standalone `.html` download |

Shortcuts: `Ctrl/Cmd+S` compile · `Ctrl/Cmd+Enter` run.

---

## Storage

Projects live in `localStorage`:

- `ytea_pure_workspaces_v4` — all workspaces / files / assets
- `ytea_pure_active_ws_v4` — last active project
- `ytea_official_catalog_v1` — cached HTML/CSS autocomplete catalogs

Clearing site data resets projects to the default demo. Very large assets may hit browser storage limits.

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

1. Use **Run** and the browser console in the preview popup (`log …` helps).
2. If a CSS rule “does nothing”, check the compiled styles — usually a missing companion property (e.g. `display:flex` for `align-items`).
3. If `@id` is `null`, the id is missing in a `#UI//` file or the script runs before the element (keep UI above the script — default template is fine).
4. If an asset does not load in Run/Export, check the path matches the Assets tree exactly.
