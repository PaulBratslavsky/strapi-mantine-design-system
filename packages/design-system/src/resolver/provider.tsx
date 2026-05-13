/**
 * DSProvider + useDSComponent — the public hooks for WordPress-style component
 * substitution.
 *
 * Resolution order (WordPress template hierarchy translated):
 *   1. nearest provider, alias-resolved variant         (single-product-dmc-12.php)
 *   2. nearest provider, 'default'                      (single-product.php)
 *   3. outer provider, alias-resolved variant           (single.php)
 *   4. outer provider, 'default'                        (singular.php)
 *   ... walking outward through every <DSProvider>
 *   N. shipped variant default                          (singular.php fallback)
 *   N+1. shipped 'default'                              (index.php — always exists)
 *
 * `useDSComponent` always returns a renderable component. It never returns
 * null. If the registry has no default for the component name, it throws —
 * that's a programmer error (forgot to import the registering module).
 */
import { createContext, useContext, useMemo } from 'react';
import type { ReactElement } from 'react';

import { resolveAlias, shippedDefaultFor, shippedFor } from './registry';
import { DEFAULT } from './types';

import type { DSComponentName, DSImpl, DSProviderProps, DSVariant, DefaultKey, ResolutionNode } from './types';

const DSContext = createContext<ResolutionNode | null>(null);

/**
 * Push a layer of overrides onto the resolver cascade.
 *
 * Multiple `<DSProvider>` can nest; the innermost wins. Each provider holds
 * a reference to its parent so `useDSComponent` can walk the chain at lookup
 * time (React contexts only expose the nearest value).
 */
export const DSProvider = ({ components = {}, children }: DSProviderProps): ReactElement => {
  const parent = useContext(DSContext);

  // Note: if `components` is inlined ({...}) at the call site, this memo
  // remakes the node every render. That's correct for object identity but
  // busts downstream memoization. Consumers should hoist their override map
  // out of render — documented in principles.md.
  const node = useMemo<ResolutionNode>(() => ({ overrides: components, parent }), [components, parent]);

  return <DSContext.Provider value={node}>{children}</DSContext.Provider>;
};

/**
 * Resolve the component to render for (name, variant) at this point in the
 * tree. Walks the provider cascade outward, then falls back to the shipped
 * registry. Always returns a renderable component.
 *
 * Stable across renders for a given (name, variant) within the same provider
 * cascade, *if* the provider's `components` prop is referentially stable.
 */
export function useDSComponent<N extends DSComponentName>(name: N, variant?: DSVariant<N> | DefaultKey): DSImpl<N> {
  const node = useContext(DSContext);
  const canonical = resolveAlias(name, variant);
  const effectiveKey: string = canonical ?? (variant as string | undefined) ?? DEFAULT;

  // Walk inside → outside.
  for (let n: ResolutionNode | null = node; n; n = n.parent) {
    // Cast once at the boundary — `DSOverrides[N]` has a complex mapped key
    // type that TS won't let us index with a plain string. The value type is
    // unchanged.
    const slots = n.overrides[name] as Record<string, DSImpl<N> | undefined> | undefined;
    if (!slots) continue;

    if (effectiveKey !== DEFAULT) {
      const variantImpl = slots[effectiveKey];
      if (variantImpl) return variantImpl;
    }
    const defaultImpl = slots[DEFAULT];
    if (defaultImpl) return defaultImpl;
  }

  // Provider chain exhausted — fall through to shipped registry.
  if (effectiveKey !== DEFAULT) {
    const shippedVariantImpl = shippedFor(name, effectiveKey);
    if (shippedVariantImpl) return shippedVariantImpl;
  }
  return shippedDefaultFor(name);
}
