/**
 * Public resolver API barrel.
 *
 * Re-exported from the design-system's main index, so consumers can:
 *
 *   import { DSProvider, useDSComponent, registerDSComponent } from '@strapi/design-system';
 *
 * Surface intentionally small. Internal helpers (resolveAlias, shippedFor)
 * are not exported — they're implementation details of the cascade.
 */
export { DSProvider, useDSComponent } from './provider';
export { registerDSComponent, getRegisteredVariants, _resetRegistryForTests } from './registry';
export { DEFAULT } from './types';
export type {
  DSComponentName,
  DSComponentRegistry,
  DSImpl,
  DSOverrides,
  DSProps,
  DSProviderProps,
  DSVariant,
  DefaultKey,
} from './types';
export type { RegisterOptions } from './registry';
