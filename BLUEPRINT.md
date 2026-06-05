# BLUEPRINT — Statsbudsjettet

A technical design reference for the **Statsbudsjettet** website: an interactive,
client‑side visualization of the Norwegian national budget (2024–2026) built from
the official *Gul Bok* data grunnlag.

The goal of this document is to capture *how the site is built* — its architecture,
styling system, fonts, colours, data model, and the conventions behind it — so the
project can be rebuilt or extended from scratch without reverse‑engineering the code.

---

## 1. What it is

- A **static, zero‑build single‑page app**. No framework, no bundler, no server.
  Plain HTML + CSS + vanilla JS. Deployed as static files (GitHub Pages).
- Loads three JSON datasets (one per budget year) in the browser, aggregates them,
  and draws **hand‑rolled SVG line/area charts** per department.
- Supports **drill‑down navigation**: Overview → Department → Chapter (`kapittel`)
  → Post (`post`), with breadcrumbs and a header "back one level" button.
- Each chart card can **copy** its data (TSV → clipboard) or **download** it (CSV).

### Tech at a glance
| Concern | Choice |
|---|---|
| Markup | Single `index.html` |
| Styling | `src/css/main.css` (the only stylesheet actually loaded) |
| Logic | `src/js/main.js` (the only script actually loaded) |
| Icons | [Lucide](https://lucide.dev) UMD build, pinned + deferred from unpkg |
| Font | **Space Grotesk** (Google Fonts) |
| Charts | Custom SVG built with `document.createElementNS` — **no chart library** |
| Data | 3 static JSON files under `data/json/` |

---

## 2. File / directory structure

```
budget/
├── index.html                  # The whole page shell (loading screen, header, nav, grid, footer)
├── BLUEPRINT.md                # ← this file
├── README.md
├── test.html                   # Tiny GitHub Pages connectivity test (not part of the app)
├── requirements.txt            # Python deps for the data conversion script
├── data/
│   ├── excel/                  # Source .xlsx Gul Bok files (not deployed; git-ignored)
│   └── json/                   # Converted JSON actually fetched by the app
│       ├── gul_bok_2024_datagrunnlag.json        → 2024
│       ├── 20241002_gulbok_data_til_publ.json    → 2025
│       └── 2026_gulbok_datagrunnlag.json         → 2026
├── scripts/
│   └── excel_to_json.py        # Converts the Excel grunnlag → JSON
├── src/
│   ├── assets/favicon.ico
│   ├── css/
│   │   ├── main.css            # ACTIVE stylesheet
│   │   └── theme.css           # LEGACY / unused (an alternate "SEC filing" theme, not linked)
│   └── js/
│       ├── main.js             # ACTIVE script
│       ├── config.js           # LEGACY / unused (ES-module config; main.js has its own copies)
│       └── theme.js            # LEGACY / unused (dark/light toggle; app is forced light)
└── docs/                       # Long-form feature & process notes
```

> **Important:** `index.html` only loads `main.css` and `main.js`. The files
> `theme.css`, `theme.js`, and `config.js` are **not referenced** in production —
> they are leftovers from earlier iterations. If you rebuild, you can delete them
> or fold the wanted parts into the active files. They are kept for reference only.

---

## 3. Data model & pipeline

### Source → JSON
`scripts/excel_to_json.py` converts the official Gul Bok `.xlsx` files into JSON.
Each JSON file is an object whose budget rows live under a top‑level **`Data`** array
(capital D). `main.js` is defensive and also accepts a few other shapes
(`data`, bare array, `[meta, rows]`).

### Row fields used by the app
Each row is one budget line. The app only reads a handful of fields:

| Field | Meaning |
|---|---|
| `fdep_navn` | Department name (level 1) — e.g. *Forsvarsdepartementet* |
| `kap_navn` / `kap_nr` | Budget **chapter** name / number (level 2) |
| `post_navn` / `post_nr` | Budget **post** name / number (level 3) |
| `beløp` | Amount (NOK, in thousands as per Gul Bok) — summed everywhere |
| `year` | Injected at load time (2024/2025/2026), not in source |

### Normalization
On load, the 2024 dataset's **"Olje‑ og energidepartementet"** is harmonized to
**"Energidepartementet"** so the department exists consistently across all years.
Names are `.trim()`‑ed everywhere they are compared or indexed.

### In‑memory shape
```js
budgetData = {
  '2024': [...rows], '2025': [...rows], '2026': [...rows],
  combined: [...all rows from all years]
}
```
Plus derived caches built once after load (see Performance):
- `departmentIndex: Map<deptName, rows[]>`
- `departmentStatsCache` — sorted per‑department year totals + deltas
- `uniqueDepartmentsCache` — sorted department names

### Aggregation
- **Department total for a year** = sum of `beløp` over all that department's rows for that year.
- **Aggregate ("Totalt statsbudsjett")** = sum across every department.
- **Change metrics**: absolute and `%` deltas for 24→25, 25→26, 24→26.
- Department cards are **sorted by 2026 total, descending** (aggregate card first).

---

## 4. Navigation & view model

There is a single `navigationPath` array acting as the breadcrumb/state:

```
['Statsbudsjettet']                                  → Overview (all department charts)
['Statsbudsjettet', dept]                            → Department drill-down (chapters)
['Statsbudsjettet', dept, chapter]                   → Chapter drill-down (posts)
['Statsbudsjettet', dept, chapter, post]             → Single post detail
```

- The **site title** renders the path as clickable breadcrumb segments
  (`updateHeaderTitle`); clicking a crumb jumps to that level.
- The header **drill‑up button** (`←`) pops one level (`drillUpOneLevel`) and is
  hidden at the top level.
- On **mobile** the hamburger is hidden and replaced by a native `<select>`
  department filter injected into the header (`initMobileFilter`).
- The slide‑in **nav menu** (left drawer) lists departments with their 2026 totals.

Two views share one DOM region: `#overview-view` (the grid) and
`#drill-down-view` (`.drill-down-view.active`). Drilling toggles `display`.

---

## 5. Charts (custom SVG)

All charts come from **`createChart(container, dept)`** in `main.js`. There is no
charting library. Key facts for a faithful rebuild:

- A `<svg>` with a `viewBox` is built node‑by‑node via `createElementNS`. It scales
  to the container width (`preserveAspectRatio="xMidYMid meet"`).
- **Responsive intrinsic size** by breakpoint:
  - ≤480px → 280×200, ≤768px → 400×250, else **900×350**.
  - Margins: `{ top:20, right:40, bottom:40, left:60 }`.
- Three data points (2024/2025/2026) → an **area fill** (vertical gradient,
  opacity 0.3) under a 2px **line**, with circle markers (r=4), 6 horizontal
  grid lines, X/Y axis lines, ticks, year labels, and 6 Y labels formatted by
  `formatAmount`.
- **Y‑domain** is padded ~10–20%; negatives are clamped to ≥ −100M to avoid a
  single negative line crushing the scale.
- **Colour rule** (`chartColor`):
  - Overview (path length 1): every department line is the brand blue `#0083ff`.
  - Inside a department (path length ≥ 2): the line uses that department's colour
    from `DEPARTMENT_COLORS`.

### `formatAmount(value)`
Compact NOK formatting used on axes, deltas, and stats:
`≥1e9 → "x.xB"`, `≥1e6 → "x.xM"`, `≥1e3 → "x.xK"`, else integer; sign preserved.

---

## 6. Styling system

### 6.1 Fonts
- **Primary UI font: `Space Grotesk`** (weights 300–700), loaded once via a
  `<link>` to Google Fonts in `index.html` (preconnected for speed).
- Font stack:
  ```css
  --font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont,
                 'Segoe UI', Roboto, sans-serif;
  ```
- Body is anti‑aliased (`-webkit-font-smoothing: antialiased`).

> Note: `src/css/theme.css` defines a *completely different* Times‑New‑Roman
> "SEC filing" aesthetic. It is **not loaded** and does not describe the live site.

### 6.2 Colour palette (CSS custom properties in `:root`)
The live site is **light‑theme only** (`data-theme="light"` is forced in JS).

| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#ffffff` | Page background, cards' inner |
| `--bg-secondary` | `#f8f9f6` | Card surfaces, header, footer, nav |
| `--bg-tertiary` | `#f1f5f9` | Hover fills |
| `--text-primary` | `#2f3531` | Headings / primary text |
| `--text-secondary` | `#595959` | Body / subtitles |
| `--text-muted` | `#8f9091` | De‑emphasized text |
| `--border-primary` | `#d1d3ce` | Card / divider borders |
| `--border-secondary` | `#e6e6e6` | Grid lines |
| `--accent-primary` | `#0083ff` | Brand blue (links, charts, focus) |
| `--accent-secondary` | `#0066cc` | Darker blue |
| `--accent-success` | `#059669` | Positive change (green) |
| `--accent-danger` | `#dc2626` | Negative change (red) |

A `[data-theme="dark"]` block exists (black/white inversion) but is **not used**
by the live app. Keep it only if you intend to re‑enable theming.

### 6.3 Department colours (`DEPARTMENT_COLORS` in `main.js`, mirrored in CSS)
These drive per‑department chart lines and are duplicated as CSS attribute
selectors (`.department-chart-block[data-department="…"] .chart-line`).

| Department | Hex |
|---|---|
| Arbeids- og inkluderingsdepartementet | `#3b82f6` |
| Barne- og familiedepartementet | `#10b981` |
| Digitaliserings- og forvaltningsdepartementet | `#f59e0b` |
| Energidepartementet | `#ef4444` |
| Finansdepartementet | `#8b5cf6` |
| Forsvarsdepartementet | `#06b6d4` |
| Helse- og omsorgsdepartementet | `#84cc16` |
| Justis- og beredskapsdepartementet | `#f97316` |
| Klima- og miljødepartementet | `#22c55e` |
| Kommunal- og distriktsdepartementet | `#eab308` |
| Kultur- og likestillingsdepartementet | `#ec4899` |
| Kunnskapsdepartementet | `#6366f1` |
| Landbruks- og matdepartementet | `#14b8a6` |
| Nærings- og fiskeridepartementet | `#f43f5e` |
| Samferdselsdepartementet | `#0ea5e9` |
| Utenriksdepartementet | `#a855f7` |
| Ymse | `#64748b` |

> If you add/rename a department you must update **both** `DEPARTMENT_COLORS`
> in `main.js` **and** the matching attribute selector in `main.css`. Department
> abbreviations (AID, FIN, …) live in the legacy `config.js` if needed.

### 6.4 Spacing, radius, shadows
```css
--radius-sm: 0.375rem;  --radius-md: 0.5rem;  --radius-lg: 0.75rem;
--shadow-sm: 0 1px 3px rgba(0,0,0,.1);
--shadow-md: 0 4px 6px rgba(0,0,0,.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,.1);
```
- Cards: `--bg-secondary` + `1px` `--border-primary` + `--radius-lg`, padding `1.5rem`.
- Cards lift on hover (border → accent, `--shadow-md`).
- Content max width: **1200px**, centered, `0 1rem` gutters.

### 6.5 Layout
- `.departments-grid` is a single‑column CSS grid with `2rem` gaps (charts are wide).
- `.department-subtitle` is a 3‑column grid: change (left) · years (center) · count (right).
- Footer is `repeat(auto-fit, minmax(250px, 1fr))`, collapsing to one column on mobile.

### 6.6 Responsive breakpoints
- **768px** — primary mobile breakpoint: hamburger hidden → native select;
  breadcrumb segments stack with `→` prefixes; chart heights shrink; footer 1‑col;
  the desktop‑only `zoom: 0.9` on `body` is reset to `1`.
- **480px** — extra‑small tuning (smaller titles, 200px charts).
- iOS safe‑area inset respected on the sticky header.

> The desktop `body { zoom: 0.9 }` is a deliberate "fit more on screen" hack.
> It is non‑standard (Chromium‑family) and is reset to `1` on mobile.

### 6.7 Loading screen
A fixed full‑screen overlay (`#loading-screen`) with a faint animated SVG curve
and the floating "Statsbudsjettet" wordmark. After data + charts are ready, JS
adds `.hidden` (opacity fade) and reveals `#app`. A short ~350ms brand flash is
intentional.

### 6.8 Accessibility & motion
- Keyboard `:focus-visible` rings (2px `--accent-primary`) on all interactive elements.
- `@media (prefers-reduced-motion: reduce)` disables the looping loader/title
  animations and smooth scrolling.
- The viewport allows user zoom (no `user-scalable=no`).

---

## 7. Performance design

The dominant cost is the **~2.7 MB of JSON** (3 files) parsed on load, plus the
SVG rendering of ~18 department cards.

Key decisions / optimizations:
1. **Derived caches built once** after load (`buildDerivedCaches`):
   a `Map` index of department → rows, plus memoized stats and unique‑name lists.
   This turns what used to be repeated full‑dataset `.filter()` scans (re‑run on
   every render *and* every window resize) into O(1) lookups.
2. **Single‑pass year totals** per department instead of three filtered passes.
3. **Resize is debounced** (250ms) before charts re‑render.
4. **Lucide is pinned + minified + `defer`red** (`lucide@1.17.0/.../lucide.min.js`),
   giving an immutable 1‑year CDN cache instead of `@latest`'s 60s cache, and never
   blocking HTML parsing.
5. **Fonts preconnected**; font loaded via a single `<link>` (no blocking CSS `@import`).
6. **`content-visibility: auto`** on chart cards so offscreen cards skip rendering work.
7. Production console logging removed; only genuine error paths log.
8. Cache‑busting query strings on local CSS/JS (`?v=3`) — bump these when editing.

### If you need to go further
- Pre‑slim the JSON to only the ~6 used fields (could cut payload by >70%).
- Pre‑aggregate department/chapter/post totals at build time so the browser fetches
  a tiny summary instead of every raw budget line.
- Self‑host the font and Lucide to drop third‑party round‑trips entirely.

---

## 8. How to run / rebuild

### Run locally
It is fully static — serve the folder over HTTP (needed because it `fetch`es JSON):
```bash
python -m http.server 8000
# open http://localhost:8000
```

### Regenerate data
```bash
pip install -r requirements.txt
python scripts/excel_to_json.py     # Excel (data/excel) → data/json
```

### Deploy
Push to the `main` branch; GitHub Pages serves the repo root (`index.html`).

### Rebuild checklist (minimum viable clone)
1. `index.html` shell: loading screen, sticky header (title + drill‑up + nav toggle),
   left nav drawer, `#overview-view` grid, `#drill-down-view`, footer.
2. `main.css`: the tokens in §6.2/§6.4, card styling, the 3‑column subtitle grid,
   the per‑department `.chart-line` colours, and the 768/480 breakpoints.
3. `main.js`: load 3 JSON files → normalize names → build caches → render one
   card per department (aggregate first) with a `createChart` SVG → wire breadcrumb,
   drill‑up, nav drawer, mobile select, and copy/download buttons.
4. Keep `DEPARTMENT_COLORS` (JS) and the CSS colour selectors in sync.

---

## 9. Known caveats / cleanup opportunities
- `theme.css`, `theme.js`, `config.js` are unused in production (safe to remove).
- Department colours are duplicated in JS and CSS — single‑source them if refactoring.
- Amounts are summed directly from `beløp` (Gul Bok thousands); there is no
  inflation adjustment — figures are nominal.
- 2024's energy department is harmonized in‑app (see the footer disclaimer).
