# `#Y//` — what it does

A logic file always starts with:

```ytea
#Y//
```

Lines compile to JavaScript. Friendly ytea words become normal JS; anything else is passed through (with `@id` → `getElementById`).

---

## Variables & functions

```ytea
var count = 0
var name = "ytea"
var items = [1, 2, 3]

func greet(who)
  log "Hello " + who

greet("Bubi")
```

| ytea | JavaScript |
|------|------------|
| `var x = 1` | `let x = 1;` |
| `func name(a, b)` + indent | `function name(a, b) { … }` |
| `return value` | `return value;` |

---

## Talking to the UI (`@id`)

`@btn` means the element with `id="btn"`.

```ytea
@btn.textContent = "Hi"          // still valid JS
set text of @btn to "Hi"         // same idea, friendlier
log text of @btn
log value of @email
```

| Expression | Becomes |
|------------|---------|
| `@id` | `document.getElementById('id')` |
| `text of @id` | `….textContent` |
| `value of @id` | `….value` |

---

## Events

Indented lines under an event run when it fires. Inside handlers you get `event`.

```ytea
on click @go
  log "clicked"

on input @email
  log value of @email

on change @select
  log value of @select

on submit @form
  event.preventDefault()
  log "submitted"

on mouseenter @card
  add class "hover" to @card

on mouseleave @card
  remove class "hover" from @card

on keydown @field
  log event.key

on key "Enter" @field
  say "You pressed Enter"

once click @start
  log "only the first click"

on load
  log "page ready"
```

Aliases for page ready: `on load`, `when ready`, `when load`.

| Form | Meaning |
|------|---------|
| `on EVENT @id` | `addEventListener('EVENT', …)` |
| `on key "X" @id` | keydown, only if `event.key === "X"` |
| `once EVENT @id` | listener with `{ once: true }` |
| `on load` | `DOMContentLoaded` on `window` |

Any DOM event name works (`click`, `dblclick`, `focus`, `blur`, `scroll`, …).

---

## Conditions

```ytea
if count > 10
  say "big"
else if count > 0
  say "ok"
else
  say "empty"

unless count == 0
  log "not zero"
```

| ytea | JS |
|------|----|
| `if cond` | `if (cond) { }` |
| `else if cond` | `else if (cond) { }` |
| `else` | `else { }` |
| `unless cond` | `if (!(cond)) { }` |

---

## Loops

```ytea
repeat 5
  log i

for item in items
  log item

each item in items
  log item

while count < 10
  count += 1

until ready
  // keep going until ready is true
  stop

repeat 10
  if i == 3
    skip
  if i == 8
    stop
  log i
```

| ytea | JS |
|------|----|
| `repeat N` | `for (let i = 0; i < N; i++)` — use `i` inside |
| `for x in list` / `each x in list` | `for (const x of list)` |
| `while cond` | `while (cond)` |
| `until cond` | `while (!(cond))` |
| `stop` | `break` |
| `skip` | `continue` |

---

## Time

```ytea
wait 1000
  log "1 second later"

every 2000
  log "tick"
```

| ytea | JS |
|------|----|
| `wait ms` + indent | `setTimeout(() => { … }, ms)` |
| `every ms` + indent | `setInterval(() => { … }, ms)` |

Values can be numbers or expressions: `wait delay`, `every 500 * 2`.

---

## Show, hide, focus, clear

```ytea
show @panel
hide @panel
toggle @panel
focus @email
clear @email
enable @save
disable @save
```

| ytea | Effect |
|------|--------|
| `show @id` | clear `display` (visible again) |
| `hide @id` | `display = 'none'` |
| `toggle @id` | flip visible / hidden |
| `focus @id` | `.focus()` |
| `clear @id` | empty `.value` or `.textContent` |
| `enable @id` | `disabled = false` |
| `disable @id` | `disabled = true` |

---

## Classes & styles

```ytea
add class "active" to @tab
remove class "active" from @tab
toggle class "open" on @menu

set text of @title to "Hello"
set value of @email to "a@b.c"
set style color of @title to "#3ecf6a"
set style background-color of @box to "#151c18"
append "!" to @title
```

CSS property names in `set style …` may use dashes; they become camelCase in JS (`background-color` → `backgroundColor`).

---

## Log, say, ask

```ytea
log "debug" + count
say "Saved!"
var name = ask "Your name?"
ask "Just a prompt"
```

| ytea | JS |
|------|----|
| `log …` | `console.log(…)` |
| `say …` | `alert(…)` |
| `ask …` | `prompt(…)` |
| `var x = ask "…"` | `let x = prompt("…")` |

---

## Errors

```ytea
try
  JSON.parse(raw)
catch err
  log err
  say "Bad JSON"
```

---

## Escape hatch: real JavaScript

Anything that is not a ytea keyword line is emitted as JS (`;` added if needed), with `@id` expanded:

```ytea
fetch("/api/hi").then((r) => r.json()).then((data) => {
  @out.textContent = data.message
})

localStorage.setItem("n", count)
count = Number(localStorage.getItem("n")) || 0
```

You can mix MDN APIs freely: `Math`, `JSON`, `Date`, `fetch`, `classList`, …

---

## Compile map (summary)

| ytea | JavaScript |
|------|------------|
| `on click @a` | `getElementById('a').addEventListener('click', (event) => {` |
| `once click @a` | same + `{ once: true }` |
| `on key "Enter" @a` | keydown + `if (event.key !== "Enter") return;` |
| `on load` | `window.addEventListener('DOMContentLoaded', () => {` |
| `wait 1000` | `setTimeout(() => { … }, 1000)` |
| `every 1000` | `setInterval(() => { … }, 1000)` |
| `show` / `hide` / `toggle` `@a` | display helpers |
| `set text of @a to x` | `….textContent = x` |
| `stop` / `skip` | `break` / `continue` |
| `unless c` | `if (!(c))` |
| `until c` | `while (!(c))` |

Full examples: [examples.md](examples.md).