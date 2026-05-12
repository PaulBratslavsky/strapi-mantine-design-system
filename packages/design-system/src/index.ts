/**
 * CSS side-effect imports — order matters.
 *
 *   1. theming/layers.css            — cascade-layer declaration + @import Mantine
 *   2. theming/tokens.css            — --strapi-* CSS vars in @layer strapi-tokens
 *   3. styles/global.css             — base reset + body typography in @layer reset
 *   4. theming/componentPolish.css   — per-component overrides in @layer strapi-components
 *
 * sideEffects allowlist in package.json keeps these imports from being tree-shaken.
 * See src/theming/README.md for how the theming module is organized.
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
 * Resolver — WordPress-style component substitution. See notes/ds-migration/principles.md
 * for the contract and the "Mantine first, resolver last" guidance.
 * -----------------------------------------------------------------------------------------------*/
export * from './resolver';

/* -------------------------------------------------------------------------------------------------
 * Theming — Mantine theme object, public for consumers who want to compose their own theme on top.
 * See src/theming/README.md for the override hierarchy and examples.
 * -----------------------------------------------------------------------------------------------*/
export * from './theming';
