# ytea cheat sheet

## Headers

```
#UI//     how it looks
#Y//      what it does
```

## `#UI//`

```
div(id="box")
  .display(flex)
  .padding(16px)
  h1 "Title"
  button(id="go") "Go"
```

| Want | Write |
|------|--------|
| Nest | indent 2 spaces |
| Style | `.css-property(value)` |
| Center page | `.min-height(100vh)` + `.display(flex)` + `.align-items(center)` + `.justify-content(center)` |
| Comment | `// …` |

`align-items` **needs** `display(flex)` or `display(grid)`.

## `#Y//` — core

```
var n = 0
func hi(name)
  log name

on click @go
  n += 1
  set text of @go to "n=" + n
```

## `#Y//` — events

```
on click @id
on input @id
on change @id
on submit @id
on keydown @id
on key "Enter" @id
on mouseenter @id
on mouseleave @id
once click @id
on load
```

## `#Y//` — control

```
if / else if / else / unless
repeat N
for x in list   ·  each x in list
while cond      ·  until cond
try / catch err
stop  (= break) ·  skip (= continue)
wait ms         ·  every ms
```

## `#Y//` — DOM helpers

```
show @id · hide @id · toggle @id
focus @id · clear @id
enable @id · disable @id
add class "x" to @id
remove class "x" from @id
toggle class "x" on @id
set text of @id to …
set value of @id to …
set style color of @id to …
append "!" to @id
text of @id · value of @id
log … · say … · ask …
var x = ask "…"
```

## `#Y//` — refs

```
@myId          → getElementById('myId')
@myId.prop     → still works (JS)
```

## Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd+S` | Compile |
| `Ctrl/Cmd+Enter` | Run |
| `Ctrl+Space` | Autocomplete |
| `Tab` / `Enter` | Accept hint |

## Docs map

- [UI language](ui-language.md)
- [Y language](y-language.md)
- [Examples](examples.md)
- [Compiler](compiler.md)
- [README](../README.md)