---
version: alpha
name: BlihOps
description: A calm, editorial operations interface where disciplined structure
  communicates trust. White and soft-neutral surfaces carry most of the page;
  a focused blue marks action and live operational signals. Source Serif 4 adds
  authority to headings, while Inter and JetBrains Mono keep the system practical
  and technical. Hairline grids, compact radii, restrained depth, and purposeful
  motion make intelligent outsourcing feel measurable rather than abstract.

colors:
  primary: '#3B82F6'
  primary-foreground: '#FFFFFF'
  foreground: '#333333'
  body: '#4B5563'
  muted-foreground: '#6B7280'
  background: '#FFFFFF'
  card: '#FFFFFF'
  muted: '#F9FAFB'
  secondary: '#F3F4F6'
  border: '#E5E7EB'
  accent: '#E0F2FE'
  accent-foreground: '#1E3A8A'
  destructive: '#EF4444'
  dark-background: '#171717'
  dark-card: '#262626'
  dark-foreground: '#E5E5E5'
  dark-muted: '#1F1F1F'
  dark-muted-foreground: '#A3A3A3'
  dark-border: '#404040'

typography:
  display-hero:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: 60px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -1.5px
  display-section:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -1.2px
  heading-card:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.2px
  body-lg:
    fontFamily: 'Inter, sans-serif'
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: 0
  body-md:
    fontFamily: 'Inter, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: 0
  body-sm:
    fontFamily: 'Inter, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: 0
  label:
    fontFamily: 'Inter, sans-serif'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 1.2px
  technical:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.6px
  button:
    fontFamily: 'Inter, sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0

rounded:
  none: 0px
  sm: 3.6px
  md: 4.8px
  lg: 6px
  xl: 8.4px
  2xl: 10.8px
  3xl: 13.2px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  section-mobile: 64px
  section-desktop: 96px

motion:
  ease-out: 'cubic-bezier(0.22, 1, 0.36, 1)'
  ease-snappy: 'cubic-bezier(0.16, 1, 0.3, 1)'
  micro: 180ms
  interactive: 300ms
  entrance: 450ms
  entrance-long: 550ms
  numeric: 900ms
  stagger: 80ms

components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.button}'
    rounded: '{rounded.md}'
    height: 40px
    padding: '0 {spacing.base}'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    borderColor: '{colors.border}'
    typography: '{typography.button}'
    rounded: '{rounded.md}'
    height: 40px
    padding: '0 {spacing.base}'
  eyebrow-label:
    textColor: '{colors.muted-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
  section-heading:
    textColor: '{colors.foreground}'
    typography: '{typography.display-section}'
  section-intro:
    textColor: '{colors.muted-foreground}'
    typography: '{typography.body-md}'
  structural-panel:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    borderColor: '{colors.border}'
    rounded: '{rounded.none}'
  operational-card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    borderColor: '{colors.border}'
    rounded: '{rounded.xl}'
    padding: '{spacing.lg}'
  status-badge:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.muted-foreground}'
    borderColor: '{colors.border}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
  metric-card:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
    borderColor: '{colors.border}'
    rounded: '{rounded.xl}'
    padding: '{spacing.xl}'
  image-cta-panel:
    backgroundColor: '{colors.dark-background}'
    textColor: '{colors.primary-foreground}'
    borderColor: '{colors.border}'
    rounded: '{rounded.2xl}'
  form-control:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    borderColor: '{colors.border}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
    height: 40px
---

## How to Use This File

Read this file before creating or changing any BlihOps interface. It describes
the visual logic of the current marketing site and turns its strongest recurring
patterns into rules for future work.

Use this precedence when sources appear to disagree:

1. This file decides visual intent, composition, and taste.
2. `src/app/globals.css` supplies implementation values and semantic Tailwind
   tokens.
3. Existing shared primitives such as `SectionWrapper`, `buttonVariants`,
   `TimelineAnimation`, `HeroBackdrop`, and `DecorIcon` supply implementation
   patterns.
4. A style found on only one page is an example, not automatically a new rule.

The hexadecimal values above are readable equivalents of the current OKLCH
theme. In code, use semantic classes such as `bg-background`, `text-foreground`,
`text-muted-foreground`, `border-border`, and `bg-primary`. Do not copy the hex
values into components.

## Overview

BlihOps should feel like an operations partner before it feels like a software
product. The interface is calm, exact, and visibly structured. Its visual
language borrows from editorial typography, operational dashboards, process
diagrams, and carefully ruled documents. The result should communicate that
complex work will be made orderly, measured, and accountable.

Most pages are bright and neutral. Blue carries action and live operational
meaning, so it stays scarce enough to remain useful. Serif headings make the
brand assured and human; sans-serif descriptions keep it direct; monospaced
labels make SLAs, steps, identifiers, and metrics feel concrete.

The design is not card-led. Structure comes from whitespace, hairline borders,
full-width dividers, visible grids, alternating compositions, and occasional
dark contrast panels. Rounded cards and shadows are available, but they are
supporting devices rather than the page's default grammar.

**Key characteristics:**

- Editorial serif hierarchy paired with practical sans-serif copy.
- A restrained blue signal inside an overwhelmingly neutral interface.
- Hairline grids, crossing rules, square frames, and small crosshair details.
- Operational proof shown through SLAs, workflows, metrics, steps, and reporting.
- Compact radii and quiet shadows rather than soft, oversized SaaS cards.
- Purposeful motion that resolves quickly and never competes with comprehension.

## Design Principles

### Structure is the visual metaphor

The service promise is operational control. Layouts should therefore reveal
their structure: grids may keep their borders, timelines may expose their rail,
and feature groups may share a single framed surface. Avoid hiding every piece
inside a separate floating card.

### Proof before decoration

Use meaningful operational artifacts—workflow stages, SLA adherence, pod roles,
response times, reporting cadence, and measurable outcomes—as visual material.
Do not fill empty areas with abstract gradient blobs or arbitrary dashboards.

### Restraint creates authority

Let typography, spacing, and alignment establish hierarchy. Blue, shadows,
rounded shapes, and animation should each have a clear job. Repeating them
without purpose weakens the brand.

### Warm expertise, not sterile machinery

Source Serif headings and confident plain-language copy keep the technical
structure human. The system should feel capable and calm, never cold or robotic.

## Colors

The implementation source of truth is the semantic variable set in
`src/app/globals.css`. The roles below explain when to use those variables.

### Brand and action

- **Primary blue** (`{colors.primary}` — #3B82F6): Primary CTAs, selected
  services, active workflow states, progress fills, live status dots, inline
  action links, and occasional icon backgrounds. Do not use it as a large page
  background by default.
- **Primary foreground** (`{colors.primary-foreground}` — #FFFFFF): Text and
  icons placed on primary blue.
- **Accent blue** (`{colors.accent}` — #E0F2FE) and **accent foreground**
  (`{colors.accent-foreground}` — #1E3A8A): Quiet selected or informational
  states where primary blue would be too loud.

### Surfaces

- **Background** (`{colors.background}` — #FFFFFF): Default page floor.
- **Card** (`{colors.card}` — #FFFFFF): Content plates placed within bordered or
  muted structures. It intentionally matches the canvas in light mode; borders
  provide separation.
- **Muted** (`{colors.muted}` — #F9FAFB): Section bands, inactive controls,
  diagram layers, metric surfaces, and subtle hover states.
- **Secondary** (`{colors.secondary}` — #F3F4F6): Controls or surfaces that need
  one more step of contrast than muted.

### Text and rules

- **Foreground** (`{colors.foreground}` — #333333): Headings, important body
  text, icons, and the near-black contrast surface used by selected callouts.
- **Body** (`{colors.body}` — #4B5563): Supporting text when stronger contrast
  than muted copy is required.
- **Muted foreground** (`{colors.muted-foreground}` — #6B7280): Descriptions,
  labels, metadata, inactive navigation, and secondary iconography.
- **Border** (`{colors.border}` — #E5E7EB): The primary structural device.
  Dividers, grids, cards, inputs, timelines, and framed visuals all use this
  hairline neutral.
- **Destructive** (`{colors.destructive}` — #EF4444): Errors and destructive
  actions only. It is not a decorative brand accent.

### Dark contrast

Dark values exist for theme compatibility and for deliberate contrast panels.
Use a dark foreground or dark-background block as a single moment inside a
light page—for security, a quote, or a strong proof point. Do not alternate
light and dark every section.

The repository contains dark theme tokens, but no public theme switch is part
of the documented marketing experience. New dark-mode work must verify every
marketing composition rather than assuming token support is sufficient.

## Typography

### Families

- **Source Serif 4:** Display headings, section headings, card titles, large
  numbers, and high-value statements. It gives BlihOps editorial authority.
- **Inter:** Body copy, navigation, controls, labels, and form content. It keeps
  operational information direct and readable.
- **JetBrains Mono:** Step numbers, pod identifiers, compact percentages,
  technical labels, and system-state metadata. Use it sparingly; it is a signal
  for structured information, not the body font.

### Hierarchy

| Role               | Desktop |  Mobile |  Weight | Use                                          |
| ------------------ | ------: | ------: | ------: | -------------------------------------------- |
| Hero display       |    60px |    36px |     600 | One primary claim per page                   |
| Section display    |    48px |    30px |     600 | Major section titles                         |
| Subsection heading | 30–36px | 24–30px |     600 | Split-layout or framed-section headings      |
| Card heading       | 16–24px | 16–20px | 500–600 | Feature, service, and process titles         |
| Lead body          |    18px |    16px |     400 | Hero support copy only                       |
| Body               |    16px |    14px |     400 | Section descriptions and longer explanations |
| Compact body       |    14px | 12–14px | 400–500 | Cards, metadata, and controls                |
| Eyebrow label      |    12px |    12px |     500 | Uppercase section categories                 |
| Technical label    | 10–12px | 10–12px | 500–600 | IDs, steps, system states, percentages       |

### Principles

Headings rely on serif character, size, and tight tracking rather than extreme
weight. Use `font-heading`, `font-semibold`, and `tracking-tight` as the normal
display combination. Keep hero copy to roughly two lines on a small laptop and
avoid forced line breaks unless the composition has been verified across
breakpoints.

Body text normally uses `leading-relaxed`. Intro paragraphs should usually cap
between `max-w-lg` and `max-w-2xl`; do not let explanatory text run the full
container width. Uppercase labels use `tracking-widest` and muted color so they
organize without competing with headings.

### Font substitutes

The fonts load through `next/font/google` in `src/app/layout.tsx`. If loading is
unavailable, use Georgia for Source Serif, system sans-serif for Inter, and the
system monospace stack for JetBrains Mono. Do not introduce a fourth family.

## Layout

### Container and grid

Use `SectionWrapper` for normal site content: `max-w-6xl`, centered, with `16px`
mobile gutters and `24px` gutters from the small breakpoint upward. Full-bleed
backgrounds belong outside it; their content remains constrained inside it.

The canonical section rhythm is `{spacing.section-mobile}` (64px) vertically on
mobile and `{spacing.section-desktop}` (96px) from the medium breakpoint. Use
48–64px between a section introduction and its primary visual. Denser process
rows and inner cells may use 32–48px.

### Composition patterns

Choose a composition based on content rather than repeating the same centered
stack:

- **Centered editorial intro:** Eyebrow, serif heading, restrained description,
  then a large structured visual. Use for major capability and proof sections.
- **Asymmetric split:** Text and visual in roughly 45/55 or 50/50 columns. Use
  for services, detailed value propositions, and product-like demonstrations.
- **Sticky narrative:** A short left introduction remains sticky while steps or
  service rows move on the right. Use for sequential explanations.
- **Framed system:** Multiple cells share one border and internal dividers. Use
  when features form one operating model.
- **Timeline:** Alternate text and visuals around a visible center rail. Use only
  when order and progression are meaningful.
- **Editorial marquee:** Repeating testimonials or logos may extend horizontally
  while headings remain aligned to the main container.

Avoid using more than two consecutive sections with the same alignment and grid.
Vary rhythm through content structure, not arbitrary decoration.

### Whitespace philosophy

Whitespace represents control. Preserve generous separation around section
headings and primary claims, but keep related UI fragments tightly grouped.
When a layout feels empty, first improve scale, alignment, or meaningful proof;
do not immediately add a decorative card or gradient.

## Shape and Decoration

The base radius is 6px. Buttons and controls use compact `rounded-md`; small
interface modules use `rounded-lg` or `rounded-xl`; high-value image panels may
reach `rounded-2xl`. `rounded-full` is reserved for status dots, avatars,
progress tracks, and truly pill-shaped badges.

Structural surfaces may use no radius at all. Square borders are especially
appropriate for timelines, service imagery, comparison grids, and process
diagrams. This tension between compact rounded controls and square structural
frames is part of the BlihOps taste.

Small crosshair or plus marks may appear where border lines meet. Use the shared
`DecorIcon` or the established grid-plus treatment. These marks should clarify
the constructed geometry; do not scatter them across unrelated empty space.

Background graphics remain quiet: faint radial light, vertical hairlines, and
low-opacity grid rules. Avoid saturated mesh gradients, neon glows, noise
textures, and decorative blobs.

## Elevation

The default depth model is border first, surface second, shadow third.

- **Flat:** Page sections, grid cells, testimonials, timelines, and most feature
  groups use a 1px `{colors.border}` rule with no shadow.
- **Raised:** Small operational mockups may use `shadow-xs` or `shadow-md` so
  they read as interface artifacts sitting inside a flat editorial frame.
- **Prominent:** `shadow-lg` is reserved for a primary image CTA, an active
  overlay, or a deliberately floating demonstration card.
- **Atmospheric glow:** A faint primary or chart-color blur may support one
  automation visual. It must not become a general card treatment.

Never place a shadow on every card in a grid. Do not combine strong shadow,
large radius, gradient, blur, and border on the same ordinary component.

## Components

**`button-primary`** — The main conversion action. Use the existing default
`buttonVariants` treatment: `{colors.primary}` background,
`{colors.primary-foreground}` content, `{typography.button}`, compact
`{rounded.md}` corners, and a 40px large-CTA height. Marketing CTAs may keep a
solid primary hover over imagery. An inline arrow may move 2px on hover.

**`button-outline`** — The secondary action beside or near a primary CTA.
Background `{colors.background}`, border `{colors.border}`, text
`{colors.foreground}`, and the same height and radius as its primary partner.
Hover changes the surface to `{colors.muted}`; it does not become another blue
button.

**`eyebrow-label`** — A short category such as “Our approach,” “Trust & Proof,”
or “Intelligent Outsourcing Services.” Use `{typography.label}`, uppercase,
wide tracking, and `{colors.muted-foreground}`. It may sit inside a compact
bordered badge when status-like, but plain text is the normal section treatment.

**`section-heading`** — A concise Source Serif statement using
`{typography.display-section}` and `{colors.foreground}`. Center it for broad
category sections and left-align it for narrative or split sections. Do not
center all headings by habit.

**`section-intro`** — One to three sentences of `{typography.body-md}` in
`{colors.muted-foreground}`. Keep the measure narrow and place it close to the
heading. It explains the promise; the following visual or proof should support
it rather than repeat it.

**`structural-panel`** — A square-cornered `{colors.card}` surface bounded by
`{colors.border}`. Internal children share dividers instead of becoming nested
cards. Use for operating models, timelines, process sequences, service images,
and multi-part demonstrations. Crosshair details are allowed at meaningful
intersections.

**`operational-card`** — A compact interface artifact representing a pod,
workflow, SLA, or report. It uses `{colors.card}`, `{colors.border}`, modest
`{rounded.xl}`, and restrained shadow. Combine serif values, sans-serif labels,
and selective mono metadata. It should show plausible information, not random
dashboard chrome.

**`status-badge`** — A compact state marker. Neutral states use muted surface and
border; live or active states may use a pale primary treatment and primary text.
Full-pill geometry is appropriate here. Include text, not color alone, when the
state matters.

**`metric-card`** — A proof block with one large serif value and a short
sans-serif explanation. It may sit in a low-contrast muted grid with
`{rounded.xl}` corners, but adjacent metrics should behave as one composition.
Use tabular numbers and animate only when the value enters view.

**`image-cta-panel`** — The main pre-footer conversion moment. Use one strong
photograph, a dark neutral overlay, white serif heading, compact support copy,
and one primary CTA. Rounded `{rounded.2xl}` corners and `shadow-lg` are allowed
because this is a singular focal surface.

**`form-control`** — A compact white control using `{colors.border}`,
`{typography.body-sm}`, and `{rounded.md}`. Focus uses the semantic ring and a
visible three-pixel translucent halo. Placeholder text is muted. Error and
disabled states must use the existing semantic tokens rather than new colors.

## Imagery and Iconography

Use operationally credible photography: teams at work, service contexts,
infrastructure, and environments connected to delivery. Images are normally
contained in square or lightly rounded editorial frames and may receive a quiet
dark overlay when supporting white text. Avoid glossy stock-photo collages,
floating image bubbles, and decorative photos that do not support the message.

Use Lucide icons for interface concepts. Normal icon size is 16–20px with a
1.5–1.75 stroke. Place icons in small bordered or muted containers when they
need emphasis. Use inline SVG only for brand or social marks unavailable in
Lucide. Do not mix filled cartoon icons with the line-icon system.

## Motion

Motion should feel like a system resolving into order.

### Entrance motion

The canonical section entrance moves from `opacity: 0`, `y: 16–18px`, and
`blur(10px)` to a sharp resting state. Use `{motion.entrance}` (450ms),
`{motion.ease-out}`, and an 80ms stagger. Hero sequences may stagger by
100–140ms and last up to 500ms. Footer or large visual sequences may use 550ms.

Use the shared `TimelineAnimation` where appropriate. Existing marketing
sections intentionally replay when re-entering view (`once={false}`), but do not
replay dense controls, form feedback, or anything whose movement could interrupt
task completion.

### Interaction motion

- Hover and state changes: about 300ms.
- Menu open and close: about 180ms with `{motion.ease-snappy}`.
- Icons: translate 2px, scale to roughly 1.05–1.10, or rotate no more than 3°.
- Images: scale to no more than 1.05 inside an overflow-hidden frame.
- Active list highlights may use a high-stiffness, well-damped spring.
- Animated metrics may use 900ms with `{motion.ease-out}`.

Never animate every decorative layer independently. Avoid continuous motion
except a subtle live-status ping, marquee, progress rail, or slowly rotating
globe with genuine semantic value.

### Reduced motion

Honor `prefers-reduced-motion`. Remove blur, large translations, smooth-scroll
effects, autoplay marquees, and nonessential number animation while preserving
content and state changes.

## Responsive Behavior

| Name    |       Width | Key changes                                                                                                       |
| ------- | ----------: | ----------------------------------------------------------------------------------------------------------------- |
| Mobile  |     < 640px | 16px gutters; 36px hero; 30px section titles; one-column grids; mobile navigation; 64px section rhythm            |
| Small   |   640–767px | 24px gutters; larger hero copy; CTAs may remain inline when they fit; two-column compact grids may begin          |
| Medium  |  768–1023px | 48px section titles; 96px section rhythm; two-column cards; larger process visuals; desktop-scale spacing         |
| Desktop | 1024–1279px | Full navigation; split layouts; sticky narratives; alternating timelines; 3–4 column grids; decorative hero rails |
| Wide    |    ≥ 1280px | Content remains capped at 1152px; outer gutters absorb additional width                                           |

### Collapsing strategy

- Split layouts stack to one column before their text becomes narrow.
- Four-column feature grids reduce to two columns and then one.
- Shared bordered systems keep their internal dividers when stacked; remove only
  borders that would double up.
- Alternating timeline rows become a simple vertical sequence on small screens.
- Sticky introductions return to normal flow below the desktop breakpoint.
- Hero background rails and other nonessential geometry may disappear below
  desktop to protect space and performance.
- CTAs wrap as a centered or left-aligned group according to the section, then
  become full-width only when that improves mobile usability.
- Do not use horizontal scrolling to preserve a desktop card grid. Marquees and
  intentionally scrollable tab systems are the exceptions.

### Touch and readability

Primary mobile actions should provide at least a 44px effective touch area.
Existing 32–40px compact controls are acceptable in desktop chrome but should
receive surrounding hit area or a larger mobile size. Body copy must not fall
below 12px, and 12px is reserved for metadata or compact card copy rather than
long paragraphs.

## Accessibility and Interaction States

- Preserve visible `focus-visible` rings and semantic border changes.
- Maintain at least WCAG AA contrast for text and controls.
- Never communicate active, success, warning, or failure state through color
  alone; pair it with text, an icon, or both.
- Use semantic headings in document order even when a visual style differs.
- Give decorative images empty alt text and meaningful images concise alt text.
- Keyboard focus must activate the same service previews and menus as hover.
- Interactive elements need disabled, hover, focus, active, and invalid states
  where relevant.
- Motion and smooth scrolling must not prevent keyboard navigation or reading.

## Content and Voice

Copy is direct, operational, and evidence-oriented. Prefer concrete nouns and
measurable outcomes: pods, SLAs, QA, reporting, response time, deployment window,
cost reduction, ownership, and weekly cadence.

Headings should make one confident claim. Descriptions explain how the claim is
delivered. Avoid inflated AI language, vague transformation promises, and dense
consulting jargon. The recurring primary CTA is “Get free pilot”; do not invent
several competing conversion labels on the same page.

## Agent Guardrails

### Do

- Read this file and inspect nearby shared components before writing UI.
- Use semantic theme classes and the existing font mappings.
- Reuse `SectionWrapper`, `buttonVariants`, `TimelineAnimation`, `HeroBackdrop`,
  and `DecorIcon` when their roles match.
- Build one strong structured composition instead of many unrelated cards.
- Use blue to express action, selection, progress, or a live operational state.
- Vary section alignment and rhythm while keeping tokens consistent.
- Show plausible BlihOps operational proof inside interface mockups.
- Check mobile, reduced-motion, keyboard, and focus behavior.

### Do not

- Add purple-blue mesh gradients, neon glows, or generic gradient hero text.
- Default to a centered hero followed by repeated three-card grids.
- Put every idea inside a rounded, shadowed card.
- Use excessive `rounded-full` geometry outside badges, indicators, and avatars.
- introduce hardcoded brand hex values when semantic tokens exist.
- Add a new font, gray scale, blue, radius system, or animation curve casually.
- Use glassmorphism as a general surface treatment.
- Add decorative dashboards whose data does not support the message.
- Turn every section dark or alternate dark and light without narrative reason.
- Hide essential information behind hover-only interaction.

## Review Checklist for New UI

Before considering a page or component complete, verify:

1. Does the page feel structured, calm, editorial, and operational?
2. Is blue scarce and semantically meaningful?
3. Are heading, body, and technical roles using the correct font families?
4. Does the layout use the shared container and 64/96px section rhythm?
5. Are borders and whitespace doing more work than shadows?
6. Is there compositional variety without introducing a new visual system?
7. Are operational mockups plausible and connected to the surrounding copy?
8. Do animation timings and easing match the documented motion language?
9. Does the UI remain clear on mobile, by keyboard, and with reduced motion?
10. Did the implementation reuse semantic tokens and shared primitives?

## Known Gaps

- Dark theme variables exist, but the complete marketing site has not been
  established here as a fully validated dark-mode experience.
- Form success, warning, loading, and server-error compositions are only partly
  represented by current pages.
- Data visualizations beyond compact metrics, progress bars, and process diagrams
  are not yet part of the canonical visual language.
- Photography selection has a clear role but not yet a formal art-direction or
  image-treatment specification.
- Some routes linked by the shared navigation and footer are not implemented, so
  their content-specific compositions remain open.
- Existing small controls do not always reach a 44px mobile touch target; future
  work should improve effective hit areas without changing the compact visual
  character.
