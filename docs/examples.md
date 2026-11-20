# Examples

Copy these into `*.ytea` files in the editor.

---

## 1. Centered hello

**main.ytea**

```ytea
#UI//
div(id="root")
  .min-height(100vh)
  .display(flex)
  .align-items(center)
  .justify-content(center)
  .background(#0c100e)
  .color(#f3faf5)
  .font-family(system-ui, sans-serif)

  h1 "Hello ytea"
    .margin(0)
    .font-size(42px)
```

**logic.ytea**

```ytea
#Y//
on load
  log "ready"
```

---

## 2. Counter (UI + Y helpers)

**main.ytea** — same idea as the default project: a card with two buttons (`btnCount`, `btnReset`).

**logic.ytea**

```ytea
#Y//
var count = 0

on click @btnCount
  count += 1
  set text of @btnCount to "Count: " + count

on click @btnReset
  count = 0
  set text of @btnCount to "Count: 0"
```

---

## 3. Show / hide a panel

```ytea
#UI//
div(id="app")
  .padding(24px)

  button(id="toggle") "Toggle panel"
  div(id="panel") "Secret panel"
    .margin-top(12px)
    .padding(16px)
    .background(#1a231e)
```

```ytea
#Y//
hide @panel

on click @toggle
  toggle @panel
```

---

## 4. Form: Enter key + ask

```ytea
#UI//
div
  .padding(24px)
  .display(flex)
  .gap(8px)

  input(id="name" type="text" placeholder="Your name")
  button(id="ok") "OK"
  p(id="out") ""
```

```ytea
#Y//
func greet()
  var n = value of @name
  if n == ""
    n = ask "Your name?"
  set text of @out to "Hello, " + n
  clear @name
  focus @name

on click @ok
  greet()

on key "Enter" @name
  greet()
```

---

## 5. Timer with wait / every

```ytea
#Y//
var ticks = 0

on click @start
  set text of @status to "Starting…"
  wait 1000
    set text of @status to "Go!"
  every 1000
    ticks += 1
    set text of @status to "Tick " + ticks
    if ticks >= 5
      stop
```

> Note: `stop` only breaks a `repeat` / `for` / `while` / `until` loop. To cancel `every`, keep the interval id in a `var` and use real JS `clearInterval(id)` (escape hatch), or reload the preview.

Safer interval pattern with JS escape hatch:

```ytea
#Y//
var timer = null
var ticks = 0

on click @start
  if timer != null
    clearInterval(timer)
  ticks = 0
  timer = setInterval(() => {
    ticks += 1
    @status.textContent = "Tick " + ticks
    if (ticks >= 5) clearInterval(timer)
  }, 1000)
```

---

## 6. List rendering

```ytea
#UI//
ul(id="list")
button(id="add") "Add item"
```

```ytea
#Y//
var items = ["Tea", "Milk", "Honey"]

func render()
  clear @list
  for item in items
    @list.innerHTML += "<li>" + item + "</li>"

on load
  render()

on click @add
  var next = ask "New item?"
  unless next == null
    unless next == ""
      items.push(next)
      render()
```

---

## 7. Theme toggle with classes

```ytea
#UI//
div(id="page")
  .min-height(100vh)
  .padding(32px)
  .background(#f3faf5)
  .color(#0c100e)

  button(id="theme") "Dark mode"
  p(id="hint") "Click to flip theme"
```

```ytea
#Y//
on click @theme
  toggle class "dark" on @page
  if @page.classList.contains("dark")
    set style background of @page to "#0c100e"
    set style color of @page to "#f3faf5"
    set text of @theme to "Light mode"
  else
    set style background of @page to "#f3faf5"
    set style color of @page to "#0c100e"
    set text of @theme to "Dark mode"
```

---

## 8. Why centering failed (before / after)

**Before (looks left-aligned):**

```ytea
#UI//
div(id="root")
  .padding(32px)
  .background(#0c100e)
  .color(#f3faf5)
  .align-items(center)
  h1 "test"
```

Compiles to `align-items: center` **without** `display: flex` → browser ignores it.

**After:**

```ytea
#UI//
div(id="root")
  .min-height(100vh)
  .display(flex)
  .flex-direction(column)
  .align-items(center)
  .justify-content(center)
  .padding(32px)
  .background(#0c100e)
  .color(#f3faf5)
  h1 "test"
```