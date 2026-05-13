/**
 * CrumbLink — drop-in port off styled-components.
 *
 * BaseLink with breadcrumb-specific tokens (small font, neutral600 color,
 * hover/focus state). All styling moved to `componentPolish.css` keyed on
 * `[data-strapi-crumb-link]`.
 */
import * as React from 'react';

import { BaseLink, BaseLinkProps } from '../BaseLink';

export const CrumbLink = React.forwardRef<HTMLAnchorElement, BaseLinkProps>(
  ({ children, ...props }, forwardedRef) => (
    <BaseLink ref={forwardedRef} data-strapi-crumb-link="" {...props}>
      {children}
    </BaseLink>
  ),
);

CrumbLink.displayName = 'CrumbLink';
