/**
 * Shipped-component registry — the bottom of the cascade.
 *
 * Components call `registerDSComponent('Name', { default, variants, aliases })`
 * at module init time. This is the "index.php" layer: even if no provider
 * matches, `useDSComponent` will fall through to whatever was registered here.
 *
 * Append-only invariant: variant names registered for a component name are
 * tracked in a frozen-on-read set. CI snapshots `getRegisteredVariants` to
 * detect removals. See notes/ds-migration/principles.md for the contract.
 */
import type { ComponentType } from 'react';

import type { DSComponentName, DSImpl, DSVariant } from './types';

/**
 * Storage-only entry shape. Erases per-N generics so heterogeneous components
 * share one Map. `ComponentType<never>` is the contravariant supertype every
 * concrete `DSImpl<N>` assigns into — no `any` needed.
 *
 * Type safety is restored at the read boundary (shippedFor, shippedDefaultFor)
 * where N is concrete and we cast back to `DSImpl<N>`.
 */
interface StoredEntry {
  default: ComponentType<never>;
  variants: Map<string, ComponentType<never>>;
  /** Append-only — every variant ever registered for this name. */
  knownVariants: Set<string>;
  /** Alias name → canonical variant. Both keep working forever. */
  aliases: Map<string, string>;
}

// Module-scoped Map. Persistent for the lifetime of the JS module graph.
// Imports of @strapi/design-system that trigger `registerDSComponent` mutate
// this. SSR-safe because each module instance is per-bundle.
const shipped = new Map<DSComponentName, StoredEntry>();

export interface RegisterOptions<N extends DSComponentName> {
  /**
   * The shipped default — the absolute fallback. Always rendered when nothing
   * upstream matches.
   */
  default: DSImpl<N>;
  /** Optional per-variant shipped defaults. */
  variants?: Partial<Record<DSVariant<N>, DSImpl<N>>>;
  /**
   * Alias map: { oldName: 'canonicalVariant' }. Old names route to the
   * canonical variant on resolution; both names continue to work forever.
   * Use this in place of renames to preserve the append-only contract.
   */
  aliases?: Record<string, DSVariant<N>>;
}

/**
 * Register (or re-register) the shipped defaults for a component name.
 *
 * Safe to call multiple times — merges into the existing entry. Variants and
 * aliases accumulate; calling with a previously-registered variant overrides
 * the implementation but keeps the variant in `knownVariants`.
 */
export function registerDSComponent<N extends DSComponentName>(name: N, opts: RegisterOptions<N>): void {
  const prev = shipped.get(name);

  const variants = new Map<string, ComponentType<never>>(prev?.variants ?? []);
  for (const [key, impl] of Object.entries(opts.variants ?? {})) {
    if (impl) variants.set(key, impl as ComponentType<never>);
  }

  // Append-only: union new keys with everything previously seen.
  const knownVariants = new Set<string>(prev?.knownVariants ?? []);
  for (const key of variants.keys()) knownVariants.add(key);

  const aliases = new Map<string, string>(prev?.aliases ?? []);
  for (const [alias, canonical] of Object.entries(opts.aliases ?? {})) {
    aliases.set(alias, canonical);
  }

  shipped.set(name, {
    default: opts.default as ComponentType<never>,
    variants,
    knownVariants,
    aliases,
  });
}

/**
 * The CI safety net for the append-only contract. Tests should snapshot this
 * result for every registered component; the snapshot diff fails when a
 * variant is removed.
 */
export function getRegisteredVariants<N extends DSComponentName>(name: N): ReadonlySet<string> {
  return shipped.get(name)?.knownVariants ?? new Set<string>();
}

/**
 * Translate an alias to its canonical variant name, if one exists. Returns
 * `undefined` when `variant` is undefined or unknown to the alias map.
 */
export function resolveAlias<N extends DSComponentName>(
  name: N,
  variant: string | undefined,
): DSVariant<N> | undefined {
  if (!variant) return undefined;
  const canonical = shipped.get(name)?.aliases.get(variant);
  return (canonical ?? variant) as DSVariant<N>;
}

/** Lookup a shipped variant impl (post-alias-resolution). */
export function shippedFor<N extends DSComponentName>(name: N, variant: string): DSImpl<N> | undefined {
  return shipped.get(name)?.variants.get(variant) as DSImpl<N> | undefined;
}

/**
 * Lookup the shipped 'default' impl. Throws if the component was never
 * registered — that's a programmer error (you forgot to import the module
 * that calls `registerDSComponent`), not a runtime case to handle gracefully.
 */
export function shippedDefaultFor<N extends DSComponentName>(name: N): DSImpl<N> {
  const entry = shipped.get(name);
  if (!entry) {
    throw new Error(
      `[@strapi/design-system] No shipped default registered for "${name}". ` +
        `Did you import the module that calls registerDSComponent('${name}', ...)?`,
    );
  }
  return entry.default as DSImpl<N>;
}

/**
 * Test-only: clear the entire registry. Never used in production code.
 * Exposed so unit tests can isolate registration state per test.
 */
export function _resetRegistryForTests(): void {
  shipped.clear();
}
