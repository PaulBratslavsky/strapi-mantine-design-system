/* -------------------------------------------------------------------------------------------------
 * CSS side-effect imports — ORDER MATTERS, must precede component code.
 *
 *   1. theming/layers.css         — cascade-layer declaration + @import Mantine
 *                                    styles. MUST be first so layer order is
 *                                    established before any layered CSS arrives.
 *   2. theming/tokens.css         — --strapi-* CSS vars in @layer strapi-tokens.
 *   3. styles/global.css          — base reset + body typography in @layer reset.
 *   4. theming/componentPolish.css — Strapi-specific polish in @layer
 *                                    strapi-components.
 *
 * `sideEffects` in package.json explicitly allowlists *.css + this file so
 * Vite / Rollup don't tree-shake these imports out.
 * -----------------------------------------------------------------------------------------------*/
import './theming/layers.css';
import './theming/tokens.css';
import './styles/global.css';
import './theming/componentPolish.css';

/**
 * Styled Components Module Declaration
 * -----------------------------------------------------------------------------------------------*/
import 'styled-components';
import type { StrapiTheme } from './themes';

declare module 'styled-components' {
  export interface DefaultTheme extends StrapiTheme {}
}

/* -------------------------------------------------------------------------------------------------
 * Components
 * -----------------------------------------------------------------------------------------------*/
export * from './components';
export * from './primitives';
export * from './themes';

/* -------------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/
export * from './hooks/useComposeRefs';
export * from './hooks/useControllableState';
export * from './hooks/useDateFormatter';
export * from './hooks/useId';
export * from './hooks/useIsomorphicLayoutEffect';
export * from './hooks/useMeasure';

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/
export { setOpacity } from './helpers/setOpacity';
export {
  handleResponsiveValues,
  type ResponsiveProps,
  type ResponsiveThemeProperty,
  type ResponsiveProperty,
  type Breakpoint,
} from './helpers/handleResponsiveValues';
export { KeyboardKeys } from './helpers/keyboardKeys';
export { extractStyleFromTheme } from './helpers/theme';

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/
export * from './utilities/AccessibleIcon';
export * from './utilities/DesignSystemProvider';
export * from './utilities/DismissibleLayer';
export * from './utilities/FocusTrap';
export * from './utilities/KeyboardNavigable';
export * from './utilities/Portal';
export * from './utilities/ScrollArea';
export * from './utilities/VisuallyHidden';

/* -------------------------------------------------------------------------------------------------
 * Primitives re-exports
 * -----------------------------------------------------------------------------------------------*/
export { useFilter, useCollator, type Filter, useCallbackRef, composeEventHandlers } from '@strapi/ui-primitives';

/* -------------------------------------------------------------------------------------------------
 * Resolver — consumer-facing override surface
 *
 * Lets consumer apps register per-subtree component overrides via DSProvider.
 * Public API used by `packages/core/admin/admin/src/pages/Home/HomePage.tsx`
 * and `Theme.tsx`. Wires through to the cherry-picked src/resolver/ system.
 * -----------------------------------------------------------------------------------------------*/
export {
  DSProvider,
  useDSComponent,
  registerDSComponent,
  getRegisteredVariants,
  _resetRegistryForTests,
  DEFAULT,
} from './resolver';
export type { DSProviderProps, DSComponentRegistry, RegisterOptions } from './resolver';
