/**
 * Mantine type augmentations.
 *
 * This file is a proper module (it imports from `@mantine/core`), so the
 * `declare module '@mantine/core' { ... }` block below MERGES with Mantine's
 * existing typings rather than replacing them — that's the requirement for
 * TypeScript module augmentation.
 *
 * Augmentation: add Strapi's `initial | small | medium | large` to Mantine's
 * breakpoint type alongside Mantine's `xs | sm | md | lg | xl` defaults. The
 * runtime values are wired in `mantineTheme.ts`.
 *
 * Drop-in path: existing `<Box padding={{ medium: 2 }}>` call sites now
 * compile cleanly and trigger at Strapi's original pixel boundaries
 * (small=520px, medium=768px, large=1080px).
 */
import '@mantine/core';

declare module '@mantine/core' {
  interface MantineThemeSizesOverride {
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      initial: string;
      small: string;
      medium: string;
      large: string;
    };
  }
}
