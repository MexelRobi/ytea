# ytea

**ytea** lets you build websites with two tiny dialects that still use **real** HTML, CSS, and JavaScript words.

- `#UI//` — how it looks (layout + style)
- `#Y//` — what it does (logic)

ytea only changes the **shape** of the code (indent, dots, `@ids`). It never invents fake property names. If MDN has it, you can type it.

Open `index.html` in a browser — no build step, no install.

---

## Quick start

1. Open `index.html` (double-click or any local server).
2. Edit `main.ytea` (`#UI//`) and `logic.ytea` (`#Y//`).
3. Press **Compile** (`Ctrl/Cmd+S`) or **Run** (`Ctrl/Cmd+Enter`).
4. Export a single `*.html` file when you are happy.

### Tiny example

**main.ytea**

```ytea
#UI//
div(id="app")
  .min-height(100vh)
  .display(flex)
  .align-items(center)
  .justify-content(center)
  .background(#0c100e)
  .color(#f3faf5)

  button(id="go") "Click me"
    .padding(12px 18px)
    .border-radius(8px)
    .cursor(pointer)
```

**logic.ytea**

```ytea
#Y//
var n = 0

on click @go
  n += 1
  set text of @go to "Clicked " + n
```

---

## Mental model

| File header | Role | Compiles to |
|-------------|------|-------------|
| `#UI//` | Structure + CSS | HTML + inline styles |
| `#Y//` | Behavior | JavaScript |

- Indentation = nesting (UI children, Y blocks).
- `.property(value)` = real CSS (`background`, `display`, `align-items`, …).
- `@myId` = `document.getElementById('myId')`.
- Comments: `// like this`.

---

## Docs

| Doc | What’s inside |
|-----|----------------|
| [docs/ui-language.md](docs/ui-language.md) | `#UI//` tags, attributes, CSS modifiers, centering |
| [docs/y-language.md](docs/y-language.md) | Full `#Y//` reference (events, loops, helpers) |
| [docs/examples.md](docs/examples.md) | Copy-paste patterns |
| [docs/compiler.md](docs/compiler.md) | How compile / preview / export work |
| [docs/cheatsheet.md](docs/cheatsheet.md) | One-page cheat sheet |

In the app, open **`?`** to read this README, then click **Docs** for the language reference pages.

---

## Centering (common gotcha)

This does **not** center content:

```ytea
div(id="root")
  .align-items(center)
  h1 "test"
```

`align-items` only works on a **flex** or **grid** container. The compiler correctly emits `align-items: center;` — CSS simply ignores it without `display: flex` / `grid`.

Do this instead:

```ytea
div(id="root")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  h1 "test"
```

- `align-items` → cross axis (row → vertical, column → horizontal)
- `justify-content` → main axis
- `min-height(100vh)` → give the box the full viewport so centering is visible

Not a compiler bug — same rule as plain CSS.

---

## Editor shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Compile |
| `Ctrl/Cmd + Enter` | Run preview popup |
| `Tab` / `Enter` | Accept autocomplete |
| `↑` `↓` | Move in autocomplete |
| `Ctrl/Cmd + Space` | Open autocomplete |
| `Esc` | Close autocomplete |
| `Tab` (no menu) | Insert 2 spaces |
| `Enter` | New line + smart indent |

Autocomplete loads HTML tags + CSS properties from official catalogs (MDN data / html-tags), with an offline fallback.

---

## Project layout

```
ytea/
├── index.html      # App shell
├── app.js          # Editor, autocomplete, compilers
├── style.css       # App UI
├── README.md
└── docs/           # Language docs
```

Workspaces and files are stored in the browser (`localStorage`). Export writes a standalone HTML file.

---

## Philosophy

1. **Real names** — `background`, not `bg`. `textContent`, not a made-up API.
2. **Readable shape** — indent instead of braces where it helps; still JS underneath.
3. **Escape hatch** — any normal JavaScript still works in `#Y//`.
4. **One HTML out** — compile merges all `#UI//` + `#Y//` files into one page.

---

## License

Use freely for learning and building.