/**
 * CardContent — drop-in port off styled-components.
 *
 * Only styled rule was `word-break: break-all`. Moved to a CSS rule on
 * `[data-strapi-card-content]` in `componentPolish.css`.
 */
import * as React from 'react';

import { Box, BoxProps } from '../../primitives/Box';

export interface CardContentProps extends BoxProps {
  children: React.ReactNode;
}

export const CardContent = ({ children, ...props }: CardContentProps) => {
  return (
    <Box data-strapi-card-content="" {...props}>
      {children}
    </Box>
  );
};
