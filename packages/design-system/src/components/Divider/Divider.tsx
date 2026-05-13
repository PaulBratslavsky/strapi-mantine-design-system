/**
 * Divider — drop-in port off styled-components.
 *
 * Renders a 1px horizontal separator backed by Strapi `<Box>` (which routes
 * through MantineBox). The only styled-components rules were `height: 1px;
 * border: none; flex-shrink: 0;` — replicated via Box's `height` prop and a
 * CSS hook in `componentPolish.css` (`[data-strapi-divider]`).
 *
 * Public API unchanged: same props as before, same data-orientation +
 * role attributes for a11y.
 */
import * as React from 'react';

import { Box, type BoxProps } from '../../primitives/Box';

type DividerElement = HTMLDivElement;

interface DividerProps extends Omit<BoxProps<'div'>, 'tag'> {}

const Divider = React.forwardRef<DividerElement, DividerProps>((props, forwardedRef) => {
  return (
    <Box
      ref={forwardedRef}
      background="neutral150"
      {...props}
      data-orientation="horizontal"
      role="separator"
      tag="div"
      data-strapi-divider=""
    />
  );
});

export { Divider };
export type { DividerElement, DividerProps };
