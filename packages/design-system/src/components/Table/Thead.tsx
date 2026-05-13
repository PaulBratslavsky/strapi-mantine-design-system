/**
 * Thead — drop-in port off styled-components.
 *
 * Only styled rule was a bottom border. Moved to `[data-strapi-thead]` in
 * `componentPolish.css`.
 */
import * as React from 'react';

import { RawThead, RawTheadProps } from '../RawTable/RawThead';

export const Thead = ({ children, ...props }: RawTheadProps) => {
  return (
    <RawThead data-strapi-thead="" {...props}>
      {children}
    </RawThead>
  );
};
