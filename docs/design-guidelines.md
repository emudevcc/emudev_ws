# Design System — CSS Tokens Reference

Stack: **Next.js 15 App Router + Tailwind CSS 4 + shadcn/ui + MagicUI**  
Theme strategy: **Dark-first** (`:root` = dark defaults, `[data-theme="light"]` overrides)  
Source of truth: `lib/design-tokens.ts` → `app/globals.css` (codegen, see §Workflow)

---

## Architecture

```
lib/design-tokens.ts        ← TypeScript source of truth
  ├── tokens (as const)     ← raw values, imported by components
  └── cssVars export        ← {root, light} maps used by codegen

app/globals.css
  ├── :root { [tokens:start] ... [tokens:end] }         ← GENERATED from cssVars.root
  ├── [data-theme="light"] { [tokens-light:start] ... } ← GENERATED from cssVars.light
  ├── @theme inline { }     ← Tailwind 4 color/radius/font aliases (manual)
  └── @layer base { }       ← element defaults (manual)
```

**Codegen workflow:** Edit `lib/design-tokens.ts` → run `npm run generate:tokens` → `globals.css` is rewritten between marker comments. During `npm run dev`, `tsx --watch` reruns automatically on save.

---

## Color Tokens

### Brand (theme-invariant)

| CSS var | Value | Purpose |
|---------|-------|---------|
| `--accent` | `#e34d2a` | Signal orange — CTAs, focus rings, active states |
| `--accent-soft` | `#e34d2a1a` | Accent at 10% — hover backgrounds, hero tint |
| `--accent-line` | `#e34d2a33` | Accent at 20% — subtle borders on accent elements |
| `--status-ok` | `#22c55e` | Success green — validation, uptime indicators |
| `--spotify` | `#1ed760` | Spotify brand — social links only |

### Dark palette (`:root` defaults)

| CSS var | Value | Purpose |
|---------|-------|---------|
| `--canvas` | `#0f0f10` | Page background |
| `--surface-1` | `rgba(255,255,255,0.04)` | Cards, panels |
| `--surface-2` | `rgba(255,255,255,0.06)` | Secondary buttons, hover tint |
| `--surface-input` | `rgba(255,255,255,0.03)` | Form input backgrounds |
| `--hairline` | `rgba(255,255,255,0.08)` | Borders, dividers |
| `--hairline-mid` | `rgba(255,255,255,0.10)` | Hover border emphasis |
| `--dock-bg` | `rgba(20,20,22,0.70)` | Floating dock (glassmorphism) |
| `--fg-1` | `#ffffff` | Primary text |
| `--fg-2` | `rgba(255,255,255,0.75)` | Secondary text, body copy |
| `--fg-3` | `rgba(255,255,255,0.55)` | Tertiary text, placeholders |
| `--fg-4` | `rgba(255,255,255,0.40)` | Disabled, meta labels |
| `--hero` | `#e34d2a` | Hero section gradient/glow |
| `--hero-vignette` | `rgba(255,255,255,0.08)` | Hero particle background radial gradient edge fade |
| `--overlay` | `rgba(0,0,0,0.65)` | Modal/dialog backdrop |
| `--shadow-dock` | `0 12px 40px rgba(0,0,0,0.5)` | Dock shadow |

### Light overrides (`[data-theme="light"]`)

| CSS var | Override value |
|---------|---------------|
| `--canvas` | `#ffffff` |
| `--surface-1` | `rgba(0,0,0,0.025)` |
| `--surface-2` | `rgba(0,0,0,0.05)` |
| `--surface-input` | `rgba(0,0,0,0.02)` |
| `--hairline` | `rgba(0,0,0,0.08)` |
| `--hairline-mid` | `rgba(0,0,0,0.10)` |
| `--dock-bg` | `rgba(240,238,233,0.80)` |
| `--fg-1` | `#111111` |
| `--fg-2` | `rgba(0,0,0,0.70)` |
| `--fg-3` | `rgba(0,0,0,0.55)` |
| `--fg-4` | `rgba(0,0,0,0.40)` |
| `--hero` | `#e34d2a1a` |
| `--hero-vignette` | `rgba(227,77,42,0.06)` |
| `--overlay` | `rgba(0,0,0,0.45)` |
| `--shadow-dock` | `0 12px 40px rgba(0,0,0,0.12)` |

### shadcn Compatibility Aliases (manual, in `:root`)

These are NOT generated — they forward to semantic tokens so shadcn components work without changes:

```css
--background:          var(--canvas)
--foreground:          var(--fg-1)
--card:                var(--surface-1)
--card-foreground:     var(--fg-1)
--popover:             var(--surface-1)
--popover-foreground:  var(--fg-1)
--primary:             var(--fg-1)
--primary-foreground:  var(--canvas)
--secondary:           var(--surface-2)
--secondary-foreground: var(--fg-2)
--muted:               var(--surface-2)
--muted-foreground:    var(--fg-3)
--border:              var(--hairline)
--input:               var(--surface-input)
--ring:                var(--accent)         ← focus rings auto-use brand orange
--magic-card-bg:       rgba(255,255,255,0.05)  ← light theme: rgba(0,0,0,0.03)
```

### Tailwind 4 `@theme inline` Aliases

These expose CSS vars as Tailwind utility classes (`bg-canvas`, `text-fg-1`, etc.):

```css
@theme inline {
  --color-canvas:       var(--canvas)
  --color-surface-1:    var(--surface-1)
  --color-surface-2:    var(--surface-2)
  --color-hairline:     var(--hairline)
  --color-accent:       var(--accent)
  --color-accent-soft:  var(--accent-soft)
  --color-status-ok:    var(--status-ok)
  --color-fg-1..fg-4:   var(--fg-*)
  --color-overlay:      var(--overlay)
  /* shadcn compat */
  --color-background: var(--canvas)
  --color-foreground: var(--fg-1)
  --color-muted:      var(--surface-2)
  --color-muted-foreground: var(--fg-3)
  --color-border:     var(--hairline)
  --color-ring:       var(--accent)
  --color-destructive: #ef4444
}
```

### MagicUI Component Tokens (TypeScript only, not CSS vars)

Used as inline `style` prop defaults in MagicUI component wrappers:

| Token path | Value | Component |
|-----------|-------|-----------|
| `tokens.colors.borderBeam.from` | `#e34d2a` | `BorderBeam` colorFrom |
| `tokens.colors.borderBeam.to` | `#e34d2a33` | `BorderBeam` colorTo |
| `tokens.colors.magicCard.gradient` | `rgba(227,77,42,0.08)` | `MagicCard` gradientColor |
| `tokens.colors.shimmer` | `#e34d2a` | `ShimmerButton` shimmerColor |
| `tokens.colors.contributions[0..4]` | opacity ramp → `#e34d2a` | Contribution heatmap levels |

---

## Typography

### Font Stack

```
Heading + body: Inter (Next/Google Fonts, variable: --font-inter)
Monospace:      JetBrains Mono (variable: --font-jetbrains-mono)
```

Injected via `app/[locale]/layout.tsx` with `next/font/google`, used in `:root` as:
```css
--font-sans: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
--font-mono: var(--font-jetbrains-mono, 'JetBrains Mono', ui-monospace, monospace);
```

### Type Scale

| Token | Size | Weight | Line-height | Element default | Usage |
|-------|------|--------|-------------|-----------------|-------|
| `--t-display` | 56px | 600 | `--lh-display` 1.05 | `h1` | Hero headlines |
| `--t-h1` | 40px | 600 | `--lh-heading` 1.15 | `h2` | Page titles |
| `--t-h2` | 28px | 600 | `--lh-heading` 1.15 | `h3` | Section headers |
| `--t-h3` | 20px | 600 | `--lh-heading` 1.15 | `h4` | Card headers |
| `--t-body` | 16px | 400 | `--lh-body` 1.5 | `p`, `body` | Paragraph text |
| `--t-body-sm` | 14px | 400 | 1.5 | — | Secondary text |
| `--t-meta` | 13.5px | 400 | 1.5 | — | Timestamps, metadata |
| `--t-label` | 12px | 400 | 1.5 | — | Form labels, chips |
| `--t-micro` | 11px | 400 | 1.5 | `.eyebrow` | Eyebrow text, badges |

**Letter-spacing conventions:**
- Display/H1: `-0.02em`
- H2: `-0.015em`
- H3: `-0.01em`
- Eyebrow/mono labels: `+0.5px` + `text-transform: uppercase`

---

## Spacing Scale

| Token | Size | Tailwind approx | Common use |
|-------|------|-----------------|------------|
| `--s-1` | 4px | `p-1` / `gap-1` | Micro padding, icon gaps |
| `--s-2` | 8px | `p-2` / `gap-2` | Inline spacing |
| `--s-3` | 12px | `p-3` | Tight padding |
| `--s-4` | 14px | `p-3.5` | Button vertical padding |
| `--s-5` | 16px | `p-4` | Component padding default |
| `--s-6` | 20px | `p-5` | Card padding |
| `--s-7` | 24px | `p-6` | Generous section gaps |
| `--s-8` | 32px | `p-8` | Large section spacing |
| `--s-9` | 40px | `p-10` | Section vertical padding |
| `--s-10` | 56px | `p-14` | Hero / large sections |

**Container width:** `mx-auto max-w-6xl px-5` (consistent across all sections)

---

## Border Radius

| Token | Size | Use |
|-------|------|-----|
| `--r-input` | 8px | Form inputs, small elements |
| `--r-btn` | 10px | Buttons |
| `--r-image` | 12px | Images, avatars |
| `--r-card` | 14px | Cards, panels |
| `--r-dock` | 18px | Floating dock |
| `--r-pill` | 99px | Chips, badges, pill buttons |
| `--radius` | 0.875rem | shadcn compat (`--radius` alias) |

---

## Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing (Material) |
| `--dur-fast` | `0.15s` | Micro-interactions, hover |
| `--dur` | `0.2s` | Standard transitions |

**Rule:** All `transition-*` utilities should pair with `var(--ease)` and `var(--dur)` or `var(--dur-fast)`. Always add `@media (prefers-reduced-motion: reduce)` support.

### DotPattern Twinkle Animation

**File:** `components/ui/dot-pattern.tsx`

Ambient star-like animation for DotPattern background (used in layouts):

- **Trigger:** `twinkle={true}` prop enables animation
- **Selection:** ~12% of dots randomly selected via `dotTiming(index)` hash function (seed: `n1 < 0.12`)
- **Animation:** Per-dot `fillOpacity: [0.2, 0.72, 0.2]` pulse, duration 2.5–5s (staggered per-dot via `dotTiming()`)
- **Stagger:** Delay range 0–7s, applied via `dotTiming()` independent hash seed
- **Easing:** `easeInOut` for smooth pulse
- **Reduced Motion:** Respects `useReducedMotion()` — skips animation if user prefers reduced motion
- **Color:** Uses `text-muted-foreground` token for dot fill color (via `className` prop)

**Usage (layout.tsx):**
```tsx
<DotPattern 
  twinkle 
  className="text-muted-foreground [mask-image:radial-gradient(...)]" 
/>
```

**Note:** DotPattern with `twinkle` does not use `fillOpacity` for non-twinkling dots (they stay static at 0.2). The `glow` prop is separate and controls a different radial gradient animation.

### Smooth Scroll Behavior

**File:** `app/globals.css` (base layer)

Added smooth scroll animation for anchor navigation:

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
}
```

Applied globally to all `<a href="#anchor">` navigation (hero stats, footer, section links). Respects `prefers-reduced-motion` for accessibility.

### PageTransition Component (Route Animations)

**File:** `components/ui/page-transition.tsx`

Client component using `motion/react` (`motion.main`) for blur-fade animation on route changes:

- **Trigger:** Keyed by `usePathname()` — animates on full route change (not hash-only navigation)
- **Animation:** Opacity 0→1, y: 8→0, filter blur(4px)→blur(0px), duration 300ms easeOut
- **Usage:** Wraps `children` in `app/[locale]/layout.tsx` to animate every locale page transition
- **Note:** Hash anchors (About/Contact) do NOT trigger animation (same pathname), only full route changes do

**Implementation:**
```tsx
<motion.main key={pathname} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.3, ease: 'easeOut' }}>
  {children}
</motion.main>
```

---

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-dock` | dark: `0 12px 40px rgba(0,0,0,0.5)` / light: `0 12px 40px rgba(0,0,0,0.12)` | Floating dock |
| `--shadow-glow-ok` | `0 0 8px rgba(34,197,94,0.6)` | Success state glow |

---

## Theming

### Provider setup (`app/[locale]/layout.tsx`)

```tsx
<ThemeProvider
  attribute="data-theme"     // sets data-theme="dark"|"light" on <html>
  defaultTheme="dark"
  enableSystem={false}       // ignore OS preference
  disableTransitionOnChange
>
```

### Custom dark variant (Tailwind 4)

```css
@custom-variant dark (&:is([data-theme="dark"] *));
```

Use `dark:` prefix in class names: `dark:bg-surface-2 dark:text-fg-1`

### Theme-aware CSS patterns

```css
/* ✅ Let tokens handle it — no dark: needed */
background: var(--canvas);         /* automatically #0f0f10 → #ffffff */
border-color: var(--hairline);     /* automatically rgba white → rgba black */

/* ✅ Use dark: for non-token overrides only */
.special { @apply text-fg-2 dark:text-fg-1; }
```

---

## How to Use Tokens

### In JSX (Tailwind classes)

```tsx
// Semantic palette
<section className="bg-canvas text-fg-1 border-hairline" />
<p className="text-fg-3 text-sm" />                       // tertiary text
<div className="bg-surface-1 rounded-[var(--r-card)]" />  // card

// shadcn compat (same result via aliases)
<div className="bg-background text-foreground" />
<p className="text-muted-foreground" />

// Accent / interactive
<button className="bg-[var(--accent)] text-white" />
<div className="ring-2 ring-ring" />                       // focus ring
```

### In TypeScript (component style props)

```tsx
import { tokens } from '@/lib/design-tokens'

// MagicUI defaults
<BorderBeam colorFrom={tokens.colors.borderBeam.from} colorTo={tokens.colors.borderBeam.to} />
<MagicCard gradientColor={tokens.colors.magicCard.gradient} />
<ShimmerButton shimmerColor={tokens.colors.shimmer} />

// Dynamic inline styles
<div style={{ background: tokens.colors.dark.dockBg }} />
<div style={{ transitionDuration: tokens.motion.normal }} />
```

### In CSS (raw vars)

```css
.my-element {
  background: var(--surface-1);
  border: 1px solid var(--hairline);
  border-radius: var(--r-card);
  transition: background var(--dur) var(--ease);
}

.modal-backdrop {
  background: var(--overlay);  /* rgba(0,0,0,0.65) dark / 0.45 light */
}
```

---

## Focus Ring (Accessibility)

shadcn components use `ring-ring` which resolves to `--ring: var(--accent)` = `#e34d2a`. This is applied automatically on `focus-visible`.

For custom interactive elements:

```tsx
// Standard focus ring (matches shadcn)
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">

// Minimal accent outline
<button className="focus-visible:outline-2 focus-visible:outline-accent">
```

**Contrast:** `--accent` (#e34d2a) on `--canvas` (#0f0f10) = ~5.2:1 — passes WCAG AA.

---

## Responsive Breakpoints

| Prefix | Width | Target |
|--------|-------|--------|
| (none) | 0px | Mobile default |
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

**Strategy:** Mobile-first. Write base styles for 375px, add `sm:` / `md:` / `lg:` overrides.

```tsx
// Grid: 1 col → 2 col → 3 col
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

// Text: smaller on mobile
<h1 className="text-4xl font-bold sm:text-5xl lg:text-7xl">

// Section container (consistent across all sections)
<section className="mx-auto max-w-6xl px-5 py-24">
```

---

## Three.js Background Pattern

### Hero Particle Network

The hero section features a Three.js particle network (`components/ui/hero-background.tsx`):

**Technical approach:**
- 110 white particles distributed in 3D space; accent-orange connection lines (20% opacity) for nearby nodes
- Mouse parallax: camera follows cursor via `lerp(mouseX, mouseY)` for subtle depth effect
- Ambient rotation: slow `group.rotation.y/x` for infinite motion
- Mobile optimized: low pixel ratio cap (1.5×), fixed particle count, static topology
- Motion-safe: `prefers-reduced-motion` → static frame (no rotation, no parallax)
- Vignette overlay: `radial-gradient` using `--hero-vignette` token (dark: white fade, light: accent fade)

**SSR boundary (critical):**
Three.js renders only on client. Use the `hero-background-loader.tsx` shim in server components:

```tsx
// In server component (HeroSection.tsx):
import { HeroBackground } from '@/components/ui/hero-background-loader'
<HeroBackground />

// loader is:
export const HeroBackground = dynamic(
  () => import('@/components/ui/hero-background').then(m => m.HeroBackground),
  { ssr: false }
)
```

The loader is necessary because `next/dynamic` with `ssr: false` must be called from a Client Component, but HeroSection is a Server Component. The shim provides the boundary.

**Dependencies:** `three` package (r184+) for 3D rendering.

### Design Token: --hero-vignette

CSS variable controlling hero background edge fade:
- **Dark mode:** `rgba(255, 255, 255, 0.08)` — white fade
- **Light mode:** `rgba(227, 77, 42, 0.06)` — accent-orange fade (lighter, subtle)

Applied as `radial-gradient(ellipse 85% 65% at 50% 45%, transparent 25%, var(--hero-vignette) 100%)` in hero-background.tsx.

---

## Component Checklist

Before shipping any new component:

- [ ] Uses `var(--token)` or Tailwind token class — no hardcoded hex in JSX
- [ ] Mobile-first responsive (tested at 375px, 768px, 1024px)
- [ ] Dark + light mode verified (no `dark:` hacks needed for tokenized props)
- [ ] Interactive elements have `focus-visible:ring-2 ring-ring` or equivalent
- [ ] All UI strings externalized to `messages/{locale}.json`
- [ ] No hardcoded motion durations — use `var(--dur)` / `var(--dur-fast)`
- [ ] `prefers-reduced-motion` respected for animations
- [ ] Touch targets ≥ 44px for interactive elements

### FooterSection Component

**File:** `components/sections/footer-section.tsx` — async server component

Layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with brand spanning `lg:col-span-2`.

| Column | Content |
|---|---|
| Brand (lg: 2 cols) | Site name (`font-mono font-semibold`), tagline (`text-muted-foreground text-sm`), social links (`ExternalLink` icon + handle) |
| Navigate | Home, Blog, Projects, Contact — locale-prefixed hrefs |
| Explore | About, Experience, Skills, Credentials — hash anchors |
| Bottom bar | Full-width separator + copyright (`font-mono text-xs text-muted-foreground`) |

**Tokens used:** `border-border/50` (separators), `text-muted-foreground` (body), `hover:text-foreground` (link hover), `font-mono text-xs` (labels/metadata), `text-sm` (body links).

---

## Codegen Workflow

The generated sections of `globals.css` are kept in sync with `lib/design-tokens.ts`:

```bash
# One-shot: regenerate globals.css from current tokens
npm run generate:tokens

# During dev: auto-updates on every save of design-tokens.ts
npm run dev   # starts both Turbopack + tsx --watch

# Before production build (runs automatically)
npm run build  # prepends generate:tokens
```

**To add a new CSS token:**
1. Add value to `tokens` object in `lib/design-tokens.ts`
2. Add `'--my-token': tokens.path.to.value` in `cssVars.root` (and `cssVars.light` if theme-aware)
3. Save → codegen rewrites the marker section automatically
4. Optionally add `--color-my-token: var(--my-token)` to `@theme inline` for Tailwind class access
