/**
 * ProgressBar — drop-in port off styled-components.
 *
 * Still uses Radix Progress for ARIA + the indicator translation pattern;
 * dropping the styled-components wrapper. Visual tokens (background,
 * width/height per size, transition) live in `componentPolish.css` keyed
 * on `data-strapi-progress-bar` + `data-strapi-progress-bar-size`.
 *
 * Radix stays for now — Mantine has `<Progress>` but its rendered DOM
 * differs (single bar element vs Radix's Root+Indicator). Replacing it
 * isn't required to drop styled-components; can revisit in a follow-up.
 */
import * as React from 'react';

import * as Progress from '@radix-ui/react-progress';

type Size = 'S' | 'M';

interface ProgressBarProps extends Omit<Progress.ProgressProps, 'children'> {
  size?: Size;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ size = 'M', value, ...restProps }, forwardedRef) => {
    return (
      <Progress.Root
        ref={forwardedRef}
        data-strapi-progress-bar=""
        data-strapi-progress-bar-size={size}
        {...restProps}
      >
        <Progress.Indicator
          data-strapi-progress-bar-indicator=""
          style={{ transform: `translate3D(-${100 - (value ?? 0)}%, 0, 0)` }}
        />
      </Progress.Root>
    );
  },
);

export { ProgressBar };
export type { ProgressBarProps, Size as ProgressBarSize };
