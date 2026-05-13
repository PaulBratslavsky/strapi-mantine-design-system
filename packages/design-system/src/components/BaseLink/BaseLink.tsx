/**
 * BaseLink — drop-in port off styled-components.
 *
 * Only styled rules were `text-decoration: none` and `:visited { color:
 * inherit }`. Both moved to `componentPolish.css` keyed on
 * `[data-strapi-base-link]`. All disabled / isExternal behavior unchanged.
 */
import * as React from 'react';

import { Box, BoxProps } from '../../primitives/Box';
import { forwardRef } from '../../utilities/forwardRef';

type BaseLinkProps<C extends React.ElementType = 'a'> = BoxProps<C> & {
  disabled?: boolean;
  isExternal?: boolean;
};

const BaseLink = forwardRef<HTMLAnchorElement, BaseLinkProps>(
  ({ href, disabled = false, isExternal = false, ...props }, ref) => {
    return (
      <Box
        tag="a"
        ref={ref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        href={href}
        tabIndex={disabled ? -1 : undefined}
        aria-disabled={disabled}
        pointerEvents={disabled ? 'none' : undefined}
        cursor={disabled ? undefined : 'pointer'}
        data-strapi-base-link=""
        {...props}
      />
    );
  },
);

type BaseLinkComponent<C extends React.ElementType = 'a'> = (props: BaseLinkProps<C>) => React.ReactNode;

export { BaseLink };
export type { BaseLinkProps, BaseLinkComponent };
