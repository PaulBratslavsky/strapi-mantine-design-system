/**
 * Breadcrumbs — drop-in port off styled-components.
 *
 * Only styled rule was a negative left margin on the first list item to
 * visually align with the page edge (CrumbLink has horizontal padding,
 * which would otherwise indent the first crumb). Moved to a CSS rule on
 * `[data-strapi-breadcrumbs-list] > *:first-child` in `componentPolish.css`.
 */
import * as React from 'react';

import { Box } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';

import { Divider } from './Divider';

export interface BreadcrumbsProps extends FlexProps {
  label?: string;
}

export const Breadcrumbs = React.forwardRef<HTMLDivElement, BreadcrumbsProps>(
  ({ label, children, ...props }, forwardedRef) => {
    const childrenArray = React.Children.toArray(children);

    return (
      <Box aria-label={label} tag="nav" {...props} ref={forwardedRef}>
        <Flex tag="ol" data-strapi-breadcrumbs-list="">
          {React.Children.map(childrenArray, (child, index) => {
            const shouldDisplayDivider = childrenArray.length > 1 && index + 1 < childrenArray.length;

            return (
              <Flex inline tag="li">
                {child}
                {shouldDisplayDivider && <Divider />}
              </Flex>
            );
          })}
        </Flex>
      </Box>
    );
  },
);

Breadcrumbs.displayName = 'Breadcrumbs';
