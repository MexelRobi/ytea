# `#UI//` — how it looks

A UI file always starts with:

```ytea
#UI//
```

Everything after that is structure (HTML tags) and style (CSS modifiers).

---

## Elements

```ytea
tag
tag "text content"
tag(id="box" class="card") "Hello"
```

- Tag names are **real HTML**: `div`, `button`, `input`, `img`, `a`, …
- Attributes go in `(…)` with normal HTML syntax: `id="…"`, `type="text"`, `href="…"`.
- Optional text after the tag becomes the element’s text content.

### Void tags

Tags that cannot have children (`img`, `input`, `br`, `hr`, …) still accept indented `.styles()`:

```ytea
img(src="photo.jpg" alt="A photo")
  .width(240px)
  .border-radius(12px)
```

---

## Nesting

Indentation = parent / child:

```ytea
div(id="card")
  h1 "Title"
  p "Body text"
  div
    button(id="ok") "OK"
    button(id="no") "Cancel"
```

Use **2 spaces** per level (the editor inserts them on Tab / Enter).

---

## CSS modifiers

Under an element, lines that start with `.` are CSS:

```ytea
div(id="hero")
  .display(flex)
  .padding(24px)
  .background(#0c100e)
  .color(#f3faf5)
```

Rules:

- Name = **real CSS property** (`background-color`, `align-items`, `font-size`, …).
- Value = whatever CSS accepts (`16px`, `#3ecf6a`, `center`, `1fr 1fr`, …).
- Compiles to inline `style="…"`.

```ytea
.padding(16px)
```

becomes:

```html
style="padding: 16px;"
```

---

## Centering content

`align-items` and `justify-content` only work when the element is a flex or grid container.

### Full-page center

```ytea
div(id="root")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  .background(#0c100e)
  .color(#f3faf5)

  h1 "Centered"
```

| Property | Job |
|----------|-----|
| `display(flex)` | Turns on flex layout (required) |
| `flex-direction(column)` | Stack children vertically |
| `align-items(center)` | Center on the cross axis |
| `justify-content(center)` | Center on the main axis |
| `min-height(100vh)` | Fill the viewport so centering is visible |

### Horizontal row of buttons

```ytea
div
  .display(flex)
  .gap(10px)
  .justify-content(center)

  button(id="a") "A"
  button(id="b") "B"
```

### Text-only center

For a single line of text you can also use:

```ytea
p "Hello"
  .text-align(center)
```

That does **not** replace flex centering for blocks.

---

## Linking to `#Y//`

Give interactive elements an `id`. Logic files refer to them with `@id`:

```ytea
button(id="save") "Save"
input(id="name" type="text")
```

```ytea
#Y//
on click @save
  log value of @name
```

---

## Comments & raw HTML

```ytea
// This line is ignored
<div class="escape">raw HTML if you need it</div>
```

Raw `<…>` lines are copied through as-is (escape hatch).

---

## Tips

1. Prefer real CSS names — autocomplete lists MDN properties.
2. Style the parent for layout; style children for look.
3. One visual job per block keeps files readable.
4. If a CSS property “does nothing”, check whether it needs a companion (`display`, `position`, width/height, etc.) — same as the browser.