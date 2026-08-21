# Clause Design System (Nova)

> The Clause design system covers UI for the **Nova** shipping & logistics enterprise platform — a React + TypeScript + Material-UI application built and maintained by **Solverminds**. Every primitive in this kit (`SButton`, `SInput`, `SDialog`, `SAgGrid`, etc.) is sourced directly from the live `Nova-Frontend` codebase and lifted into the `Clause` design system as the canonical visual language.

**Domain:** ocean shipping, logistics, agency operations, vessel scheduling, container & equipment management, bills of lading, customs/EDI, freight accounting.

**Product surface:**

- A **single enterprise web application** (Nova) with a fixed dark-navy header, a left sidebar menu, a tab bar of open modules, and a main content area that hosts ~12 modules: CVP, DOC, ECOM, EDI, EMS, FCT (freight contract), IMP (imports), OPS, PNC, SCG, VDS, ZOR. Plus a dashboard Home with widgets (Vessel Schedule, Agency Bookings, Load & Discharge Planning, Equipment Utilization, Demurrage & Detention Alerts, Bill of Lading Processing, Tasks, Reminders).
- The system is multi-theme (6 color themes + dark mode), but tokens are referenced via CSS custom properties so they adapt automatically.

**Version 3 (current).** Modules are being progressively redesigned to a new layout: a `SQuickLinksLanding` landing screen → `ListingPage` (full-height `SAgGrid`) → `WizardPage` (multi-step form using `WizardHeader` / `WizardFooter`) → `DetailsPage`. See **PAGE STRUCTURE (v3)** below.

## PAGE STRUCTURE (v3)

Every v3 module mounts ONCE and switches internal views via state. The shell is always:

```tsx
<SMainCard
  className="sm-nova-container !flex !flex-col !overflow-hidden"
  contentClass="!flex !flex-col !overflow-hidden !flex-1 !py-[15px] !px-0 !gap-3 !min-h-0"
>
  <div className="flex flex-1 flex-col min-h-0 overflow-hidden px-6">
    {view === 'landing' && <SQuickLinksLanding title="..." quickLinks={[...]} />}
    {view === 'listing' && <ListingPage ... />}      {/* WizardHeader + full-height SAgGrid */}
    {view === 'create'  && <WizardPage ... />}       {/* WizardHeader + steps + WizardFooter */}
    {view === 'details' && <DetailsPage ... />}      {/* WizardHeader + SEditSummaryView */}
  </div>
  <div className="-mx-6 shrink-0">
    <VersionPannel version="1.0" createuser="System" updateuser="System" Cdate={...} currentTimeZone="UTC" />
  </div>
</SMainCard>
```

- **`sm-nova-container`** is the v3 page-root class — flex column, owns the viewport between header/footer.
- **`SQuickLinksLanding`** renders: page title (18px `h3`), optional subtitle, an `SBasicSearch` input (`max-width: 672px`), and a 1/2/3/4-col responsive grid of `QuickLinkCard`s. Each card is **120px tall, radius 12, `linear-gradient(180deg, #f8faff 0%, #ffffff 100%)`, border `1px solid #e2e8f0`**, with a 36×36 `#eff6ff` rounded-square icon tile and the title at 14px / 500. Hover shadow = `--sm-shadow-md`.
- **Listing page** uses `WizardHeader` for the title bar (with a back arrow, right-side controls — search input, filter icon, "Create" CTA) and an `SAgGrid` that fills 100% of remaining viewport via `style={{ height: '100%' }}` inside a `flex-1 min-h-0` container.
- **VersionPannel** is the footer strip — Created by / Updated by / Version, with a collapse arrow. It is ALWAYS the last child of `SMainCard`.
- For side panels, use **`SDialog position="right"`** (never raw MUI `Drawer`).

### `sm-primary-button` (v3 CTA)

For the primary blue CTA in v3, **add the `sm-primary-button` class** alongside `btn`:

```tsx
<SButton text={t('createReceipt')} className="btn sm-primary-button" />       {/* PRIMARY blue CTA */}
<SButton text={t('cancel')} className="btn" />                                {/* default — white/outlined */}
```

`sm-primary-button` fills with `--sm-actionblue` (`#0a91ff`), white text, no border. Disabled state: 50% opacity. Use this for the single primary action on a screen (Create, Save, Submit, Show, Apply). Don't combine with MUI `color="error"` etc. — the class wins.

### Subagent rules (frontend implementation)

When implementing v3 UI in the codebase: **className-only styling** (no inline `style`, no MUI `sx`, no hardcoded hex), every page wrapped in `SMainCard className="sm-nova-container"`, MUI `Grid` with `rowSpacing={2}` `columnSpacing={3}` and `xs={12}` baseline, all strings via `t('key')` from `public/locales/*/translation.json`, **svm/utils components first** (`SButton`, `SInput`, `SCombo`, `SAgGrid`, `SThemedTable`, `SDialog`, `SConfirmationDialog`, `SInformationDialog`, `SStepWizard`, etc.). For reference patterns see `src/svm/IMP/RCE/` (Receipt — Landing/Listing/Wizard/Details), `src/svm/PNC/CNB/ContributionCalculation.tsx` (side-panel via SDialog), `src/svm/PNC/SUR/surcharge.tsx` (table patterns), and `src/svm/SCG/MAN/SPF/RouteDetailsStep.tsx` (wizard step).

### Non-negotiable styling rules

These are reinforced by the `nova-ui-ux-developer` subagent prompt — every PR is checked against them:

1. **No hardcoded colors anywhere.** Every color comes from a CSS variable in `src/assets/css/variables.css` (`var(--sm-actionblue)`, `var(--sm-primary)`, `var(--sm-gray-500)`, `var(--sm-success)` …) or a `sm-color-*` / `sm-bg-*` utility class. Never paste a hex literal. This is what enables the 6 color themes + dark mode to work.
2. **No inline `style={{…}}`.** Period.
3. **No MUI `sx={{…}}`.** Tailwind + MUI sx conflict; the cascade order is unreliable. Use `className` only.
4. **No hardcoded font-size, spacing, shadow, radius.** Use the design tokens (`--sm-font-size-12`, `--sm-spacing-2`, `--sm-radius-lg`, `--sm-shadow-md`) or the matching utility class (`sm-font-size-12`, `sm-padding-left10`, etc.).
5. **className composition order:** existing `sm-*` utility class first, then Tailwind utilities (e.g. `className="sm-mandatory flex items-center gap-2"`).

If a style isn't expressible via tokens/utilities, the right move is to add a new `sm-*` utility class in `svm.css` (referencing a `--sm-*` variable) — never to inline.

## Sources

- **Codebase:** `Nova-Frontend/` (locally mounted) — React 18, MUI v5, AG Grid, Tabler Icons, Inter font.
  - Tokens: `src/assets/css/variables.css`
  - Components: `src/svm/utils/S*` (`SButton`, `SInput`, `SCombo`, `SDialog`, `SThemedTable`, `SAgGrid`, `SToolBar`, `SMainCard`, `SAccordion`, `STab`, `SLabel`, etc.)
  - Widgets: `src/svm/widgets/` (dashboard cards)
  - Theme overrides: `src/themes/`, `src/assets/scss/_theme*.module.scss`, `src/assets/theme/novaAlpineTheme.ts`
  - Layout: `src/layout/MainLayout/{Header, Sidebar, MainLayout/index.js}`
  - Login: `src/views/pages/authentication/auth-forms/AuthLogin.js`
- **Design system prompt:** `Nova-Frontend/CLAUSE_DESIGN_SYSTEM_PROMPT.md` (the canonical token/component contract — also embedded in the task brief)
- **Logos & imagery:** `Nova-Frontend/public/Logos/`, `Nova-Frontend/public/BGimages/`, `Nova-Frontend/public/Icons/`
- **Fonts:** `Nova-Frontend/src/assets/fonts/Inter/static/` (Inter 18pt static cuts — Regular/Medium/SemiBold/Bold + italics)

---

## CONTENT FUNDAMENTALS

Nova is a **dense, operator-facing enterprise tool** — not a marketing surface. Copy is written for shipping agents, ops controllers, voyage planners, and accounts/EDI clerks who use the app for 6+ hours a day. Tone reflects that.

### Voice & tone

- **Direct, neutral, transactional.** No marketing voice, no exclamation marks, no second-person warmth. Buttons read `Save`, `Cancel`, `Search`, `Edit`, `Delete`, `New` — bare verbs. Toasts read `Saved successfully`, `Failed to save record`, `You are at the limit. Please close a module to open another.` (lifted verbatim from the codebase).
- **Imperative for actions.** "Select departure port." "Enter PAN." Never "Please select…" or "Let's…".
- **Third-person / system-as-subject for state.** "No upcoming vessel movements in the next 7 days." "No record found." Avoid `we` / `our` entirely.
- **Sparing use of "you".** Only in confirmations and limit messages: "Are you sure you want to delete this voyage?", "You are at the limit."
- **No emoji. Anywhere.** Status is communicated via chips (`On time` / `Delayed`), colored dots, or icon glyphs from Tabler. Emoji are never used in product copy, headers, or filenames.

### Casing & punctuation

- **Sentence case everywhere.** `Vessel departure & arrival`, `Tasks to-do`, `Bill of lading processing`, `Reminders & alerts`. Not Title Case.
- Column headers in tables are sentence case at 13px / weight 600: `Voyage`, `Port`, `Event`, `Status`, `TEU capacity`.
- Toolbar labels: short verbs — `New`, `Search`, `Save`, `Edit`, `Delete`, `Cancel`. No "Add new" or "Create".
- Periods: only inside multi-sentence body copy and tooltips. Single labels and table cells have no terminal punctuation.

### Numbers, units, codes

- Ports are referenced by their **5-letter UN/LOCODE** with no separator: `SGSIN`, `INNSA`, `AEDXB`, `NLRTM`, `USLAX`, `FRLEH`.
- Voyage numbers are alphanumeric, ALL CAPS, no spaces: `EL042N`, `AS0425`, `CU009W`.
- Vessel names render as displayed by carrier: `MSC ELARA`, `MV Atlantic Star`, `COSCO Universe`, `CMA CGM Marco Polo`.
- TEU capacity uses `,`-separated thousands and the suffix `TEU`: `18,900 TEU`. Large numbers in charts collapse to `k` (`19k`).
- Dates in lists: `Mon, Jan 6` (short weekday + short month + day). Timestamps in grids: `06:30`. Range labels: `Jan 6 – Jan 12`.
- Amounts: `SAmountCurrency` component — number formatted with thousands, currency code right-aligned (`12,540.00 USD`). Never `$12,540`.

### Examples lifted from the codebase

```
Page title:       Dashboard
Section heading:  Vessel departure & arrival
Section subtitle: Next 7 days · Jan 6 – Jan 12
KPI labels:       Arrivals · Departures · Total TEUs · Delayed
Status chip:      On time | Delayed
Toolbar buttons:  New · Search · Save · Edit · Delete · Cancel
Toast (success):  Saved successfully
Toast (error):    Failed to save record
Empty state:      No upcoming vessel movements in the next 7 days.
Limit dialog:     You are at the limit. Please close a module to open another.
Confirm delete:   This will permanently remove the voyage. Are you sure?
Label + tooltip:  Port of Loading · Select departure port
```

### The vibe

Functional. Reliable. Quietly maritime — surfaces hint at the domain through accent stripes (Maritime Blue, Agency Purple, Demurrage Red), the occasional ship-container background image on landing screens, and port codes everywhere — but the chrome itself stays disciplined and neutral. Information density is a feature, not a bug. The system rewards experienced users with keyboard shortcuts (Alt+PageUp/Down, Alt+Left/Right, Ctrl+ArrowLeft/Right) and a 12px body text it never apologizes for.

---

## VISUAL FOUNDATIONS

### Color
- **Brand blue (`--sm-primary` `#3b7ddd`)** is the identity color — used in logos, primary buttons, and the dark-navy app header (`rgb(13, 33, 136)`, a darker variant).
- **Action blue (`--sm-actionblue` `#0a91ff`)** is the *interactive* color — focus rings, active states, required-field asterisks, the left-border accent bar on focused rows (`inset 3px 0 0 var(--sm-actionblue)`), and links. Do **not** swap `--sm-primary` and `--sm-actionblue`; they have different roles.
- **9-stop neutral gray** for everything chrome (`--sm-gray-50` through `--sm-gray-900`).
- **Semantic colors always pair with a `-light` surface:** `--sm-success` (`#1cbb8c`) with `--sm-success-light` (`#f4fff9`); same for error / warning. Never use a saturated semantic color as a fill for a large surface.
- **Dashboard widgets** add a small accent vocabulary: Maritime Blue (`#1565c0`) for vessel cards, Purple (`#6a1b9a`) for agency / BoL, Orange (`#f57c00`) for load & discharge, Red (`#c62828`) for demurrage, Teal (`#0d9488`) for reminders — all applied as a `3px` top stripe on the card.

### Type
- **Inter only**, weights 400/500/600/700 (italic for 400/500). No serifs, no display faces, no mono outside `code` / `kbd`.
- The system is **compact**: body and table cells are **12px**, column headers and toolbar labels are **13px**, dialog titles 16px. Page headings cap at 20px, display at 24px. Do not inflate.
- **Letter-spacing is +0.04em on uppercase section labels** (KPI labels, group headers): `ARRIVALS`, `DEPARTURES`, `MON, JAN 6`.

### Spacing
- **4px base unit.** `8px` is the universal gap; `12px` is the "spacious" gap. `16px+` reads as loose.
- Cards: header `20px 24px`, body `24px 28px`. Dialogs: title `12px 32px 8px`, content `24px`, actions `16px 24px`.

### Backgrounds, imagery, illustration
- **No full-bleed photography in the app shell.** Main content sits on white (`#fff`) or a faint dashboard canvas (`#f4f5f7`).
- **Login screen** uses one branded background image (`login_bg.png`) plus a centered card — that's the only place imagery dominates.
- **Empty states** use line illustrations from `BGimages/` (`norecordfound.png`, `empty-box.png`, `mailsuccess.png`) — always grayscale or single-blue line art, never gradient illustrations.
- **Hand-drawn / iconographic backgrounds** appear on landing-summary cards (`booking_summary_bg.svg`, `container_bg_bottom.svg`, `route_bg.png`) as subtle silhouettes of containers and ships behind tables. Used sparingly.
- **No repeating patterns, no textures, no gradients on backgrounds.** Buttons get a subtle vertical gradient (`color-mix` 10% white→8% black) but everything else is flat.

### Borders & corners
- **8px radius** for everything substantial: cards, panels, modals, AG Grid wrapper, dashboard widgets.
- **4px** for inline things: inputs, chips, AG cells, tags.
- **9999px** for pills, avatars, toggle sliders, circular back buttons.
- **12px** only on large modals / dashboard widget chrome.
- Standard border: `1px solid #d1d5db` on most surfaces; AG row dividers are deliberately faint (`rgba(0,0,0,0.06)`).
- The **focused/selected state** uses a left-bar accent — `inset 3px 0 0 var(--sm-actionblue)` — never an outline ring around the whole element. Form controls additionally get a 2px focus-visible outline mixed with the button base color.

### Shadows
- A 3-stop system (`sm`/`md`/`lg`) — never more.
- **Buttons** use a layered inset highlight + lift: `inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.12)` resting; `0 2px 8px rgba(0,0,0,0.18)` on hover.
- **Dashboard cards** have a softer, deeper pair: `0 1px 2px rgba(24,29,39,0.05), 0 6px 20px rgba(24,29,39,0.04)`.
- **Right drawer** (`SDialog position="right"`) has a leftward shadow: `-4px 0 16px rgba(0,0,0,0.08)`.
- Modals: `0 8px 32px rgba(0,0,0,0.12)`.

### Motion
- **200ms ease-in-out** is the universal default. 150ms for focus borders and micro-interactions. 300ms for panel open/close.
- **Button :active** lifts by `transform: translateY(0.5px)` — a tiny press feedback.
- **Toolbar icon hover** scales `1.2` — that's intentional and bigger than feels right, because the toolbar icons are 16px and need the affordance.
- **Toasts** slide in from the right; no bounce, no spring.

### Hover / press states
- **Buttons:** lighter vertical gradient + bigger shadow on hover; subtle translateY-down on press.
- **Toolbar icons:** `scale(1.2)` + background pill `rgba(0,0,0,0.08)` on hover.
- **AG Grid rows:** `#f7f7f7` on hover, `#d6ecff` on selection.
- **Header hover:** `#d3e5f7` (slightly darker than the `#EAF6FF` resting bg).
- **Disabled** state is universal: `opacity: 0.6; cursor: not-allowed;` — never gray-out via color.

### Transparency & blur
- **Transparency is rare.** It appears only in: AG row borders (`rgba(0,0,0,0.06)`), divider subtle (`rgba(24,29,39,0.08)`), shadow stops, dashboard close button hover (`rgba(24,29,39,0.06)`), and toolbar icon hover.
- **Backdrop-blur is not used.** Modal scrims are solid black at ~40% opacity (MUI default).

### Imagery color vibe
- **Cool, blue-leaning, photographic** when used at all (login, landing pages, container/ship/route bgs). Never warm, never grainy, never B&W intentionally. Illustrations are sparse line art in `#3b7ddd` or `#717171`.

### Card anatomy
- Surface `#ffffff`, border `1px solid #c9c9c9` (or `#d1d5db` outside dashboards), radius `8px` (`12px` on dashboard widgets), shadow `sm` (or the layered dashboard shadow), header padding `20px 24px`, body padding `24px 28px`. A **top accent stripe** (3px) on dashboard widgets carries the module color.

### Layout rules
- **App header is fixed at 45px.** Toolbar tab bar sits flush below at ~27px. Main content gets `margin-top: 44px` and consumes the rest of the viewport.
- `SMainCard` is sized `calc(100vh - 76px)` and **owns its own scroll** — the page does not scroll behind it.
- Tables and AG Grids fill their container; the wrapper has the 8px radius and the rows scroll inside it.
- **Maximum 7 modules** can be open as tabs at once (`MAX_OPEN_MODULES = 7`) — this is a hard product rule, not a styling choice, but it shapes density.

---

## ICONOGRAPHY

- **Primary system:** **Tabler Icons** (`@tabler/icons-react`), always consumed via the in-codebase `SIcons` wrapper, **never** imported directly.
- **Default render:** `size={16}` and `stroke={1.5}`. This is the visual weight to match across all new icon work. Heavier (`stroke={2}`) is reserved for emphasized inline glyphs inside dashboard cards (the up/down arrow next to "Arrival"/"Departure").
- **No icon font.** Icons are React components from Tabler. No inline SVG sprite sheet.
- **Module icons** (`acc.png`, `cnt.png`, `doc.png`, `ecm.png`, `edi.png`, `ems.png`, `fac.png`, `imp.png`, `pnc.png`, `vss.png`) are small flat PNGs used in the megamenu and sidebar — copied into `assets/icons/`. They are domain badges (Accounts, Container, Document, ECOM, EDI, EMS, Facility, Imports, PNC, Vessel) and should be reused as-is, not redrawn.
- **No emoji**, **no unicode-character icons** (no ▶ or ✕ from text glyphs — the close icon is `<IconCircleX>` / `<CancelIcon>`).
- **Logo:** `assets/nova-logo.svg` — the four-letter "Cloud" + "LRP" word-mark in light blue (`#6BA6DA`), dark blue (`#1B639C`), and orange (`#F26722`), with a "Reaching new heights" tagline. Use white-on-dark version (`assets/svmlogowhite.png`) inside the navy app header.
- **CDN fallback:** if a Tabler icon is unavailable in your output, link `@tabler/icons-react` via unpkg or use the matching SVG from `https://unpkg.com/@tabler/icons@latest/icons/`. Document the substitution.
- **No icon was substituted in this design system** — all icon usage in the UI kit is via the official Tabler set at the documented size + stroke. Module badges are the original PNGs from `Nova-Frontend/public/Icons/`.

---

## Index — what's in this folder

```
README.md                — you are here
SKILL.md                 — Agent SKills entrypoint (cross-compatible)
colors_and_type.css      — canonical CSS tokens for type, color, spacing, radius, shadow, motion
                           + v3 sm-nova-container pill-input scope · sm-section-card ·
                           sm-info-strip · sm-badge · sm-status family · sm-title-text-* utilities
assets/                  — logos, module badges, background imagery (copied from Nova-Frontend/public)
  svmlogowhite.png       — white SOLVERMINDS lockup used in the app header
  nova-logo.svg          — legacy word-mark (not used in the header)
  nova.png, favicon.ico  — favicon + small badge
  login_bg.png           — login screen background
  landing_image.png      — landing/feature illustration
  ship-container.png, container1.png, route_bg.png — domain imagery
  booking_summary_bg.svg, container_bg_bottom.svg  — subtle card backgrounds
  norecordfound.png, norecordfound2.png, empty-box.png — empty states
  icons/                 — module badges (acc/cnt/doc/ecm/edi/ems/fac/imp/pnc/vss)
    svg/                 — utility SVGs from public/Icons/icon (edit, delete, copy, view, filter, …)
fonts/                   — Inter 18pt static (Regular, Medium, SemiBold, Bold, Italic)
preview/                 — Design System tab cards (colors, type, spacing, components, brand)
ui_kits/
  nova/                  — Nova/Clause web app UI kit (interactive prototype)
    index.html           — entry — open this
    README.md            — kit-specific notes
    nova.css             — kit-only chrome
    components.jsx       — SButton · SInput · SCombo · SLabel · StatusChip · SMainCard ·
                           SVersionPanel · WizardHeader · WizardFooter · SDialog ·
                           SConfirmationDialog · SMessage + Tabler-style icons
    AppShell.jsx         — AppHeader + TabBar + Sidebar
    Login.jsx            — login screen
    Dashboard.jsx        — Home dashboard with 8 widgets
    ReceiptList.jsx      — RCE Landing + Listing (full-height SAgGrid)
    ReceiptWizard.jsx    — RCE Create wizard (4 steps) + Details view
```

For every visual decision, **the codebase is the source of truth** — when in doubt, search `Nova-Frontend/src/svm/utils/` for the corresponding `S*` component and copy its props/styling rather than inventing.
