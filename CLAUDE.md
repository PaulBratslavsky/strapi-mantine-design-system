# CLAUDE.md — strapi-mantine-design-system

This is **Paul Bratslavsky's experimental Mantine-backed fork** of
[`@strapi/design-system`](https://github.com/strapi/design-system).

The upstream remote is `upstream`. The publishable fork lives at
[`PaulBratslavsky/strapi-mantine-design-system`](https://github.com/PaulBratslavsky/strapi-mantine-design-system).

## Goal

**Phase 1 (current — `mantine-v2` branch)**: Build a drop-in replacement for
`@strapi/design-system` whose internals are thin wrappers over
[Mantine v7](https://mantine.dev). The public prop API (variant names,
sub-component names, callable signatures) stays unchanged so Strapi v5
admin code and community plugins keep working without changes. The
translation between Strapi's prop API and Mantine's prop API is the
seam.

**Phase 2 (deferred — Strapi v5 → v6 core refactor)**: Drop the
translation layer. Admin + plugins migrate to call Mantine directly with
its native prop API. The DS becomes a thin re-export of Mantine plus
Strapi brand polish, not a translation wrapper.

## Why Mantine v7 (not v5, not emotion/styled)

- Mantine v7 is zero-runtime: native CSS variables + CSS Modules. No
  CSS-in-JS engine in the bundle. Faster, smaller, RSC-compatible.
- Mantine v6 deprecated and v7 removed the `@emotion/styled` integration.
  Pulling emotion back in would fight the substrate. We use Mantine's
  native `classNames` prop + theme tokens instead.
- The whole reason for the migration is reducing the maintenance burden
  on Strapi. Mantine v7's CSS Modules approach means we don't maintain
  component styling — Mantine does.

## Architecture principle

> **Wrap Mantine. Don't replace Mantine.**

Each migrated component is a *thin* translation layer (target: < 100
lines):

1. Translate Strapi's prop API to Mantine's prop API.
2. Apply Strapi brand polish via Mantine's `classNames` prop pointing
   at a small CSS rule that reads `--strapi-color-*` / `--mantine-color-*`
   tokens.
3. Stay resolver-aware via `registerDSComponent` (in `src/resolver/`) so
   consumers can override per-subtree via `<DSProvider>`.

**What we do NOT do:**

- Re-implement Mantine's component styling in `componentPolish.css`.
- Build custom Accordion / Tabs / Dialog / Popover / Menu / Select etc.
  on Radix or `@strapi/ui-primitives` — Mantine has all of these.
- Add per-component CSS rules that fight Mantine's defaults. If a
  default needs to change, fix it at the theme layer
  (`src/theming/mantineTheme.ts`) so every Mantine component picks it up.
- Pull in `@emotion/styled` (CSS-in-JS) as an intermediate step. It
  doesn't solve the actual perf concern and creates two style systems
  in the bundle.

## Mantine docs — required reading before porting any component

Mantine docs are formatted for LLM consumption at:
<https://mantine.dev/llms-full.txt> (~3.5MB, 115K lines, 138 component
sections).

**Three ways to access them:**

1. **MCP server (recommended for future sessions).** Add to your
   Claude Code `settings.json`:

   ```json
   {
     "mcpServers": {
       "mantine": {
         "command": "npx",
         "args": ["-y", "@mantine/mcp-server"]
       }
     }
   }
   ```

   Then restart Claude Code. Mantine docs become available as MCP tools.

2. **Local cache.** This repo's `.ai-docs/mantine-llms-full.txt` (git-
   ignored). Re-download anytime with:

   ```bash
   curl -s -o .ai-docs/mantine-llms-full.txt https://mantine.dev/llms-full.txt
   ```

   Sessions can `grep` it or `Read` specific sections.

3. **Per-component WebFetch.** For one-off lookups:
   - Component docs: `https://mantine.dev/core/<name>/`
   - Single-component LLM docs: `https://mantine.dev/llms/<name>/`

**Before porting any component, read its Mantine docs section.** The
existing v1 work on `main` cycled multiple times because of guessed-at
API. Don't repeat that.

## Branch layout

- `mantine-v2` — current Phase 1 work. Fresh from `upstream/main`.
  Foundation (theming, resolver, MantineProvider) cherry-picked from
  `main`. Components ported one phase at a time.
- `main` — v1 fork: "drop styled-components" hybrid. 30+ components
  migrated, but with custom CSS + Radix substrate + `@strapi/ui-primitives`
  alongside Mantine. Kept as reference; **don't** add new work here.
- `upstream/main` — Strapi's official DS. Read-only.

## Phase 1 plan (mantine-v2)

| Phase | Status | Components |
|---|---|---|
| v2.0 | ✅ done | Foundation: MantineProvider, theme overlay, resolver, cascade layers, trimmed componentPolish.css |
| **v2.1** | **in progress** | Box, Flex, Typography — thin Mantine wraps (Box / Group / Stack / Text / Title) |
| v2.2 | pending | Primitives: Button, IconButton (Mantine ActionIcon), Link (Anchor), Field, TextInput, Tooltip, Loader, Divider, Badge, Checkbox, Radio, Switch |
| v2.3 | pending | Compounds: Tabs, Accordion, Modal/Dialog (Mantine Modal for both, AlertDialog as confirm-mode), Popover, Menu (SimpleMenu), ProgressBar, Avatar, Card |
| v2.4 | pending | Form: Combobox, Select (Single/Multi), DatePicker (`@mantine/dates`), TimePicker (`@mantine/dates`), Alert, Searchbar, Textarea, NumberInput, JSONInput |
| v2.5 | pending | Table family + EmptyStateLayout + Main / SubNav |
| v2.6 | pending | Strapi-specific polish: button halos, `<AppThemeSwitcher>` in DS public API, token-surface docs |
| v2.7 | deferred | Phase 2 — Strapi v6 core refactor that drops the translation layer |

## Consuming the fork (in `strapi-experimental` monorepo)

The fork is portal-linked into the strapi-experimental monorepo via
`package.json` resolutions:

```json
"@strapi/design-system": "portal:../strapi-design-system/packages/design-system"
```

To see fork changes in Strapi admin:

1. `yarn build` here (or `yarn watch` for continuous rebuild).
2. Restart Strapi dev server in `strapi-experimental/examples/getstarted`
   if HMR doesn't catch it.

## Workflow rules for AI sessions

1. **Read Mantine docs first.** Use the MCP server, local cache, or
   WebFetch. Don't guess at API surfaces — Mantine evolves, and v6→v7
   changes broke a lot of assumptions.
2. **Each component port < 100 lines of wrapper code.** If you're past
   that, you're likely re-implementing what Mantine already does. Step
   back and reconsider.
3. **No per-component CSS in componentPolish.css.** It's intentionally
   minimal. If you need brand polish, use Mantine's `classNames` prop
   pointing at a CSS rule defined alongside the component (or, for
   genuine cross-cutting polish like button halos, a single named class
   in componentPolish.css with a clear comment about why Mantine can't
   express it).
4. **Preserve the Strapi prop API.** Variant names, sub-component
   names, callable signatures. Strapi admin and community plugins
   import these names — changing them breaks consumers.
5. **Use the resolver.** Each component registers via
   `registerDSComponent` so `<DSProvider>` overrides work. Don't bypass
   the resolver.
6. **Read project memories.** See
   `~/.claude/projects/-Users-paul-projects-strapi-experimental/memory/MEMORY.md`.
   Key entries: `project-true-mantine-intent.md`, `feedback-minimize-core-changes.md`,
   `feedback-search-before-guessing.md`, `migration-cascade-pitfalls.md`,
   `feedback-no-important-css.md`.

## Build & test

- Build: `yarn build` (Vite, ~10s warm)
- Type check: `yarn test:ts` (tsc --noEmit)
- Unit tests: `yarn test:unit` (Jest)
- Watch (continuous build): `yarn watch`

Build artifact: `dist/`. Strapi admin reads from there via the portal
link.
