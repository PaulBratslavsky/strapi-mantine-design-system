/**
 * Tr — drop-in port off styled-components.
 *
 * Border + per-cell padding + first-cell narrow padding + th height all
 * moved to `[data-strapi-tr]` CSS rules in `componentPolish.css`.
 */
import * as React from 'react';

import { RawTr, RawTrProps } from '../RawTable/RawTr';

export const Tr = (props: RawTrProps) => {
  return <RawTr data-strapi-tr="" {...props} />;
};
