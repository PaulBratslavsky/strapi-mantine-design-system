/**
 * Resolver type contract — WordPress-style component substitution for React.
 *
 * The mental model: every public DS component is a *renderable name*, not a
 * fixed implementation. `<DSProvider>` maps names → implementations, with a
 * cascade across nested providers and a frozen shipped default at the bottom.
 *
 * This file declares the registry shape. Components register themselves via
 * `registerDSComponent` (registry.ts) and consumers extend the registry by
 * module-augmenting the variant interfaces (see usage below).
 *
 *   declare module '@strapi/design-system' {
 *     interface DSButtonVariants {
 *       critical: true; // append-only — adds to DSVariant<'Button'>
 *     }
 *   }
 *
 * Interface declaration-merging is the trick that makes the variant union
 * append-only across packages. Type aliases / string unions cannot merge,
 * so we use `keyof <interface>` to derive the union.
 *
 * See notes/ds-migration/principles.md (this repo's parent) for the
 * "defaults never get removed" contract this enforces.
 */
import type { ComponentType, ReactNode } from 'react';

/**
 * The single source of truth for what components the resolver knows about.
 * Each entry is `{ props: <PropType>; variants: <VariantInterface> }`.
 *
 * Filled by @strapi/design-system itself via module augmentation. Consumers
 * can extend further; this base declaration is intentionally empty so the
 * file can be imported anywhere without coupling to specific components.
 */
export interface DSComponentRegistry {
  // Filled by augmenting from elsewhere.
}

/** All registered component names. */
export type DSComponentName = keyof DSComponentRegistry & string;

/** Helper: extract the props type of a registered component. */
export type DSProps<N extends DSComponentName> = DSComponentRegistry[N] extends {
  props: infer P;
}
  ? P
  : never;

/**
 * Helper: extract the union of variant names of a registered component.
 *
 * The registry entry's `variants` is an interface whose KEYS are the variant
 * names. Using `keyof` lets module augmentation extend the set:
 *
 *   declare module '...' {
 *     interface DSButtonVariants { critical: true }
 *   }
 *   type Vs = DSVariant<'Button'>  // 'primary' | 'secondary' | ... | 'critical'
 */
export type DSVariant<N extends DSComponentName> = DSComponentRegistry[N] extends {
  variants: infer V;
}
  ? keyof V & string
  : never;

/** A renderable override for a registered component. */
export type DSImpl<N extends DSComponentName> = ComponentType<DSProps<N>>;

/**
 * The 'default' bucket in overrides — used when no variant-specific override
 * matches. Plays the role of `single.php` in the WP hierarchy.
 */
export const DEFAULT = 'default' as const;
export type DefaultKey = typeof DEFAULT;

/**
 * Shape passed to `<DSProvider components={...}>`. All entries optional —
 * override only what you want, leave the rest to the cascade.
 */
export type DSOverrides = {
  [N in DSComponentName]?: {
    [V in DSVariant<N> | DefaultKey]?: DSImpl<N>;
  };
};

/**
 * A linked-list node of provider context — each `<DSProvider>` pushes a node
 * whose parent points at the next outer provider. `useDSComponent` walks this
 * list from inside-out, then falls back to the shipped registry.
 *
 * Exposed so other packages in the DS can read the cascade for tooling /
 * devtools / SSR snapshots; consumers should not depend on the shape directly.
 */
export interface ResolutionNode {
  overrides: DSOverrides;
  parent: ResolutionNode | null;
}

/** Convenience: a children-only props type for the provider. */
export interface DSProviderProps {
  components?: DSOverrides;
  children?: ReactNode;
}
