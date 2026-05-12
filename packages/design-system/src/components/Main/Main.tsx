/**
 * Public Main entry — resolver-aware shell.
 *
 * Main is purely semantic: it renders a `<main>` element with proper a11y
 * defaults (id, tabIndex, aria-labelledby). The default implementation
 * delegates to Strapi's Box primitive — which is still the legacy
 * styled-components Box. When Phase 5c migrates Box to a Mantine-backed
 * substrate, Main automatically picks up the new internals — no change
 * here required.
 *
 * Why register Main in the resolver if its body is so trivial?
 *   1. Consistency — every public DS component goes through the same
 *      override surface.
 *   2. The "WordPress moment" still applies — apps can swap Main entirely
 *      (e.g. for a different a11y posture) without forking the DS:
 *
 *      <DSProvider components={{ Main: { default: MyCustomMain } }}>
 *
 *   3. Establishes the pattern for the rest of the primitives migration
 *      (Phase 5b-e: Link, Box, Flex, Typography).
 */
import * as React from 'react';

import { Box, type BoxComponent, type BoxProps } from '../../primitives/Box';
import { registerDSComponent, useDSComponent, DEFAULT as RESOLVER_DEFAULT } from '../../resolver';
import { forwardRef } from '../../utilities/forwardRef';

/* -------------------------------------------------------------------------- */
/* Public prop type                                                           */
/* -------------------------------------------------------------------------- */

export interface MainProps extends BoxProps<'main'> {
  labelledBy?: string | undefined;
}

/* -------------------------------------------------------------------------- */
/* Default implementation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Default Main impl. Renders Strapi's Box with tag="main" + a11y defaults.
 * The Box primitive is still legacy styled-components; Phase 5c will swap
 * it to Mantine-backed under the same import path.
 */
const DefaultMain = forwardRef<HTMLElement, MainProps>(({ labelledBy = 'main-content-title', ...props }, ref) => {
  return (
    <Box
      ref={ref}
      aria-labelledby={labelledBy}
      tag="main"
      id="main-content"
      tabIndex={-1}
      data-strapi-main=""
      {...props}
    />
  );
});

(DefaultMain as { displayName?: string }).displayName = 'Main';

/* -------------------------------------------------------------------------- */
/* Registry augmentation                                                      */
/* -------------------------------------------------------------------------- */

declare module '../../resolver/types' {
  interface DSComponentRegistry {
    Main: { props: MainProps; variants: MainVariants };
  }
  interface MainVariants {}
}

registerDSComponent('Main', {
  default: DefaultMain as unknown as React.ComponentType<MainProps>,
});

/* -------------------------------------------------------------------------- */
/* Public resolver shell                                                       */
/* -------------------------------------------------------------------------- */

const MainShell = forwardRef<HTMLElement, MainProps>((props, ref) => {
  const Resolved = useDSComponent('Main', RESOLVER_DEFAULT);
  return React.createElement(Resolved, { ...props, ref } as MainProps & {
    ref: React.Ref<HTMLElement>;
  });
});

(MainShell as { displayName?: string }).displayName = 'Main';

/** Polymorphic callable signature for backwards-compatible imports. */
type MainComponent = <C extends React.ElementType = 'main'>(props: MainProps & { tag?: C }) => React.ReactNode;

const Main = MainShell as unknown as MainComponent;

export { Main };
/* Re-export BoxComponent for any consumer typing on `<typeof Main>`. */
export type { BoxComponent };
