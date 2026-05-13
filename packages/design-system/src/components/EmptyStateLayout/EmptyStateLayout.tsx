/**
 * EmptyStateLayout — drop-in port off styled-components.
 *
 * Only styled rule was sizing the icon's `svg` to 8.8rem. Replaced with a
 * `data-strapi-empty-state-icon` data hook + CSS rule in `componentPolish.css`.
 */
import * as React from 'react';

import { Box } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

export interface EmptyStateLayoutProps extends Pick<FlexProps, 'hasRadius' | 'shadow'> {
  action?: React.ReactNode;
  content: string;
  icon?: React.ReactNode;
}

export const EmptyStateLayout = React.forwardRef<HTMLDivElement, EmptyStateLayoutProps>(
  ({ icon, content, action, hasRadius = true, shadow = 'tableShadow' }, forwardedRef) => {
    return (
      <Flex
        ref={forwardedRef}
        alignItems="center"
        direction="column"
        padding={11}
        background="neutral0"
        hasRadius={hasRadius}
        shadow={shadow}
      >
        {icon ? (
          <Box paddingBottom={6} aria-hidden data-strapi-empty-state-icon="">
            {icon}
          </Box>
        ) : null}

        <Box paddingBottom={4}>
          <Typography variant="delta" tag="p" textAlign="center" textColor="neutral600">
            {content}
          </Typography>
        </Box>

        {action}
      </Flex>
    );
  },
);
