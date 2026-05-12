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
import type { DSComponentName, DSImpl, DSVariant } from './types';

interface RegistryEntry<N extends DSComponentName> {
  default: DSImpl<N>;
  variants: Map<DSVariant<N>, DSImpl<N>>;
  /** Append-only — every variant ever registered for this name. */
  knownVariants: Set<string>;
  /** Alias name → canonical variant. Both keep working forever. */
  aliases: Map<string, DSVariant<N>>;
}

// Module-scoped Map. Persistent for the lifetime of the JS module graph.
// Imports of @strapi/design-system that trigger `registerDSComponent` mutate
// this. SSR-safe because each module instance is per-bundle.
const shipped = new Map<DSComponentName, RegistryEntry<any>>();

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
  const prev = shipped.get(name) as RegistryEntry<N> | undefined;

  const variants = new Map<DSVariant<N>, DSImpl<N>>(prev?.variants ?? []);
  for (const [key, impl] of Object.entries(opts.variants ?? {})) {
    variants.set(key as DSVariant<N>, impl as DSImpl<N>);
  }

  // Append-only: union new keys with everything previously seen.
  const knownVariants = new Set<string>(prev?.knownVariants ?? []);
  for (const key of variants.keys()) knownVariants.add(String(key));

  const aliases = new Map<string, DSVariant<N>>(prev?.aliases ?? []);
  for (const [alias, canonical] of Object.entries(opts.aliases ?? {})) {
    aliases.set(alias, canonical as DSVariant<N>);
  }

  // Cast to RegistryEntry<any> at the storage boundary: React component types
  // are not covariant in their props, so DSImpl<N> isn't assignable to
  // DSImpl<any> structurally. Type safety is preserved at the public API
  // (registerDSComponent, useDSComponent) where N is concrete.
  shipped.set(name, {
    default: opts.default,
    variants,
    knownVariants,
    aliases,
  } as RegistryEntry<any>);
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
  const entry = shipped.get(name);
  const canonical = entry?.aliases.get(variant);
  return (canonical as DSVariant<N> | undefined) ?? (variant as DSVariant<N>);
}

/** Lookup a shipped variant impl (post-alias-resolution). */
export function shippedFor<N extends DSComponentName>(name: N, variant: string): DSImpl<N> | undefined {
  // The registry map is typed `<any>` to permit heterogeneous entries;
  // the `as` cast restores the per-N relationship at the boundary.
  return shipped.get(name)?.variants.get(variant as any) as DSImpl<N> | undefined;
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
