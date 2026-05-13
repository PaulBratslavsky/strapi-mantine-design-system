/**
 * SubNav — drop-in port off styled-components.
 *
 * Sticky left-column nav (used in Settings, Content Manager, Content-Type
 * Builder). The styled wrapper around Box set width, background, sticky
 * positioning, full viewport height, scroll, right border, z-index. All
 * those rules moved to `[data-strapi-subnav]` in `componentPolish.css`.
 *
 * The strapi-experimental admin layers its own breakpoint-specific
 * overrides on top via `MainSubNav = styled(DSSubNav)\`...\`` — those
 * still work because our CSS rule is at class-level specificity, so a
 * consumer styled() wrapper's class beats it via source order.
 */
import * as React from 'react';

import { Box, BoxProps } from '../../primitives/Box';

interface SubNavProps extends Omit<BoxProps<'nav'>, 'tag'> {}

const SubNav = React.forwardRef<HTMLDivElement, SubNavProps>(({ ...props }, ref) => {
  return <Box ref={ref} {...props} tag="nav" data-strapi-subnav="" />;
});

export { SubNav };
export type { SubNavProps };
