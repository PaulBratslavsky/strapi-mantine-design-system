/**
 * Loader — thin translation layer over Mantine's <Loader>.
 *
 * Strapi's legacy Loader was a rotating SVG with a `small` boolean prop.
 * Mantine's <Loader> ships oval/bars/dots types, multiple sizes, and the
 * same animation. We pick the default ("oval", closest to legacy) and
 * translate the boolean `small` to Mantine's size scale.
 *
 * `children` is treated as the screen-reader-only label per legacy
 * behavior — wrapped in Mantine's <VisuallyHidden> for a11y parity.
 */
import * as React from 'react';

import { Loader as MantineLoader, VisuallyHidden, type LoaderProps as MantineLoaderProps } from '@mantine/core';

interface LoaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** @default false */
  small?: boolean;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(({ children, small = false, ...props }, ref) => {
  const size: MantineLoaderProps['size'] = small ? 'xs' : 'md';

  return (
    <div role="alert" aria-live="assertive" ref={ref} {...props}>
      <VisuallyHidden>{children}</VisuallyHidden>
      <MantineLoader size={size} aria-hidden />
    </div>
  );
});

Loader.displayName = 'Loader';

export { Loader };
export type { LoaderProps };
