# Graphing Calculator (TI-84 Plus CE Style)

A web-based graphing calculator inspired by the TI-84 Plus CE: graph multiple equations, adjust the window, use degrees/radians, and view a table of values.

## Run

Open `index.html` in a browser (no build step).

```bash
open index.html
# or
npx serve .
```

## Features

- **Y=** — Enter up to 4 equations (Y₁–Y₄). Use `x` as the variable (e.g. `x^2`, `sin(x)`, `2*x+1`).
- **WINDOW** — Set Xmin, Xmax, Ymin, Ymax for the graph.
- **GRAPH** — Plot the equations (updates when you change Y= or WINDOW).
- **MODE** — Switch between Degree and Radian for trig (sin, cos, tan).
- **TABLE** — View X and Y values for each equation.
- **Home screen** — Type expressions and press ENTER to evaluate (e.g. `2+3*4`, `sin(0)`).

## Supported expressions

- Numbers, `x`, `e`, `pi`
- Operators: `+` `-` `*` `/` `^`
- Functions: `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `abs`
- Parentheses: `( )`

Examples: `x^2`, `sin(x)`, `2*cos(x)`, `sqrt(x)`, `abs(x-1)`.
