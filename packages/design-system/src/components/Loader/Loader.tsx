/**
 * Loader — drop-in port off styled-components.
 *
 * The legacy emitted a `<img>` with a `keyframes` rotation animation and an
 * optional `small` size override. Now the rotation animation + sizing live
 * in `componentPolish.css` keyed on a `data-strapi-loader` attribute (with
 * `data-strapi-loader-size="small"` for the smaller variant).
 *
 * VisuallyHidden a11y text + role="alert" + aria-live preserved unchanged.
 */
import * as React from 'react';

import { VisuallyHidden } from '../../utilities/VisuallyHidden';

import loaderSvg from './assets/loader.svg';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  small?: boolean;
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ children, small = false, ...props }, ref) => {
    return (
      <div role="alert" aria-live="assertive" ref={ref} {...props}>
        <VisuallyHidden>{children}</VisuallyHidden>
        <img
          src={loaderSvg}
          aria-hidden
          data-strapi-loader=""
          data-strapi-loader-size={small ? 'small' : undefined}
        />
      </div>
    );
  },
);
