/**
 * CarouselImage — drop-in port off styled-components.
 *
 * The legacy applied the `ellipsis` mixin from `styles/type.ts` (display:
 * block + nowrap + overflow:hidden + text-overflow:ellipsis). On an <img>
 * the only meaningful rule is `display: block` (removes inline-block
 * whitespace below the image); the others are text-only no-ops. Now set
 * via Box's `display` prop directly — no mixin import needed.
 */
import * as React from 'react';

import { Box, BoxProps } from '../../primitives/Box';
import { Tooltip } from '../Tooltip';

export interface CarouselImageProps extends BoxProps<'img'> {
  alt: string;
  src: string;
}

export const CarouselImage = (props: CarouselImageProps) => {
  const [isError, setIsError] = React.useState(false);

  const handleImageError = () => {
    setIsError(true);
  };

  const img = (
    <Box
      tag="img"
      display="block"
      height="100%"
      maxWidth="100%"
      {...props}
      onError={isError ? undefined : handleImageError}
    />
  );

  if (isError) {
    return <Tooltip label={props.alt ?? ''}>{img}</Tooltip>;
  }
  return img;
};
