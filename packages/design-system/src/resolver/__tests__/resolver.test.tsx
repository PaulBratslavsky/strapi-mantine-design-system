/**
 * Resolver unit tests + append-only registry CI gate.
 *
 * Two responsibilities:
 *   1. Verify the cascade and alias behavior of `useDSComponent`.
 *   2. Snapshot `getRegisteredVariants` for every shipped registration.
 *      The snapshot diff is the mechanical enforcement of the principle
 *      "defaults never get removed, only overwritten" (notes/ds-migration/
 *      principles.md, surface 6 / WP template hierarchy).
 */
import * as React from 'react';

import { render, renderHook } from '@testing-library/react';

import {
  DEFAULT,
  DSProvider,
  registerDSComponent,
  useDSComponent,
  getRegisteredVariants,
  _resetRegistryForTests,
} from '../index';

/* -------------------------------------------------------------------------- */
/* Sentinel registry augmentation                                             */
/* -------------------------------------------------------------------------- */

// Augment the registry with a sentinel component used only by these tests.
// `declare module` inside a test file is valid TS and is local to the
// compilation unit.
declare module '../types' {
  interface DSComponentRegistry {
    __Sentinel: {
      props: { id: string };
      variants: SentinelVariants;
    };
  }
  interface SentinelVariants {
    primary: true;
    danger: true;
  }
}

const ShippedDefault: React.FC<{ id: string }> = ({ id }) => <span data-impl="shipped-default" data-id={id} />;
const ShippedPrimary: React.FC<{ id: string }> = ({ id }) => <span data-impl="shipped-primary" data-id={id} />;
const Override: React.FC<{ id: string }> = ({ id }) => <span data-impl="override" data-id={id} />;
const OverrideInner: React.FC<{ id: string }> = ({ id }) => <span data-impl="override-inner" data-id={id} />;

beforeEach(() => {
  _resetRegistryForTests();
  registerDSComponent('__Sentinel', {
    default: ShippedDefault,
    variants: { primary: ShippedPrimary },
    aliases: { destructive: 'danger' },
  });
});

/* -------------------------------------------------------------------------- */
/* Cascade behavior                                                           */
/* -------------------------------------------------------------------------- */

describe('useDSComponent', () => {
  it('returns the shipped default when no provider and no variant', () => {
    const { result } = renderHook(() => useDSComponent('__Sentinel'));
    expect(result.current).toBe(ShippedDefault);
  });

  it('returns the shipped variant impl when a variant is asked for', () => {
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'));
    expect(result.current).toBe(ShippedPrimary);
  });

  it('falls back to shipped default when variant has no shipped impl', () => {
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'danger'));
    expect(result.current).toBe(ShippedDefault);
  });

  it('returns provider override when one matches the variant', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { primary: Override } }}>{children}</DSProvider>
    );
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'), { wrapper });
    expect(result.current).toBe(Override);
  });

  it('returns provider default when variant override is absent', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { [DEFAULT]: Override } }}>{children}</DSProvider>
    );
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'), { wrapper });
    expect(result.current).toBe(Override);
  });

  it('innermost provider wins over outer (cascade)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { primary: Override } }}>
        <DSProvider components={{ __Sentinel: { primary: OverrideInner } }}>{children}</DSProvider>
      </DSProvider>
    );
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'), { wrapper });
    expect(result.current).toBe(OverrideInner);
  });

  it('inner provider default beats outer variant override (WP child-theme semantics)', () => {
    // WP semantics: child theme's whole hierarchy is searched before falling
    // back to the parent. Inner DSProvider == child theme. If inner has a
    // 'default' for this component, it wins over outer's variant-specific
    // override — because as far as the inner subtree is concerned, the
    // resolver has already found a match.
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { primary: Override } }}>
        <DSProvider components={{ __Sentinel: { [DEFAULT]: OverrideInner } }}>{children}</DSProvider>
      </DSProvider>
    );
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'), { wrapper });
    expect(result.current).toBe(OverrideInner);
  });

  it('falls through outer provider when inner has no entry for the component at all', () => {
    // Inner provider exists but doesn't mention __Sentinel — so the search
    // proceeds outward, where outer's variant override applies.
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { primary: Override } }}>
        <DSProvider components={{}}>{children}</DSProvider>
      </DSProvider>
    );
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'primary'), { wrapper });
    expect(result.current).toBe(Override);
  });

  it('resolves aliases — destructive routes to danger', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DSProvider components={{ __Sentinel: { danger: Override } }}>{children}</DSProvider>
    );
    // 'destructive' is an alias for 'danger' (registered in beforeEach)
    const { result } = renderHook(() => useDSComponent('__Sentinel', 'destructive' as any), { wrapper });
    expect(result.current).toBe(Override);
  });

  it('renders end-to-end through DSProvider', () => {
    const { container } = render(
      <DSProvider components={{ __Sentinel: { primary: Override } }}>
        <Renderer variant="primary" id="x" />
      </DSProvider>,
    );
    expect(container.querySelector('[data-impl="override"]')).not.toBeNull();
    expect(container.querySelector('[data-id="x"]')).not.toBeNull();
  });
});

// Helper for the end-to-end render assertion.
function Renderer({ variant, id }: { variant: 'primary' | 'danger'; id: string }) {
  const Resolved = useDSComponent('__Sentinel', variant);
  return <Resolved id={id} />;
}

/* -------------------------------------------------------------------------- */
/* Append-only contract                                                       */
/* -------------------------------------------------------------------------- */

describe('append-only variant registry', () => {
  it('tracks every variant ever registered for a component', () => {
    const variants = getRegisteredVariants('__Sentinel');
    // Only 'primary' was passed to variants; 'danger' was registered as an alias
    // target but no impl shipped, so it's not in knownVariants yet. That's
    // intentional — knownVariants reflects what shipped, not what aliases.
    expect([...variants].sort()).toEqual(['primary']);
  });

  it('survives re-registration without removing prior variants', () => {
    // Re-register the same component with a different variant set.
    // The append-only invariant: prior variants must still appear.
    const NewImpl: React.FC<{ id: string }> = () => null;
    registerDSComponent('__Sentinel', {
      default: ShippedDefault,
      variants: { danger: NewImpl },
    });
    expect([...getRegisteredVariants('__Sentinel')].sort()).toEqual(['danger', 'primary']);
  });
});
