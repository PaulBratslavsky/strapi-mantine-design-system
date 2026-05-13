/**
 * TFooter — drop-in port off styled-components.
 *
 * All color/layout (button surface, icon chip, typography color, full-
 * width block button, rounded bottom corners, icon-circle sizing, SVG
 * fill) moved to `[data-strapi-tfooter]` and `[data-strapi-tfooter-icon]`
 * rules in `componentPolish.css`. Those rules read DEDICATED semantic
 * tokens (e.g. --strapi-tfooter-bg) so a theme can re-skin the footer
 * surface without rebranding primary100/200/600 everywhere.
 */
import * as React from 'react';

import { Box, BoxProps } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { Divider } from '../Divider';

export interface TFooterProps extends BoxProps<'button'> {
  children: React.ReactNode;
  icon: React.ReactNode;
}

export const TFooter = ({ children, icon, ...props }: TFooterProps) => {
  return (
    <div>
      <Divider />
      <Box tag="button" padding={5} data-strapi-tfooter="" {...props}>
        <Flex>
          <Flex
            aria-hidden
            justifyContent="center"
            alignItems="center"
            data-strapi-tfooter-icon=""
          >
            {icon}
          </Flex>
          <Box paddingLeft={3}>
            <Typography variant="pi" fontWeight="bold" data-strapi-tfooter-label="">
              {children}
            </Typography>
          </Box>
        </Flex>
      </Box>
    </div>
  );
};
