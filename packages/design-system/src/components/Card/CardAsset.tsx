/**
 * CardAsset — drop-in port off styled-components.
 *
 * Image container at top of a Card. Two styled rules: the wrapper has
 * flex centering + sized height + checkered background pattern + top-
 * radius; the inner img normalizes margin/padding + sizing. Both moved
 * to `componentPolish.css` keyed on `[data-strapi-card-asset*]`.
 */
import * as React from 'react';

type CardAssetSize = 'S' | 'M';

interface CardAssetProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** @default 'M' */
  size?: CardAssetSize;
  children?: React.ReactNode;
}

const CardAsset = ({ size = 'M', children, ...props }: CardAssetProps) => {
  return (
    <div data-strapi-card-asset="" data-strapi-card-asset-size={size}>
      {children ? children : <img {...props} aria-hidden data-strapi-card-asset-img="" />}
    </div>
  );
};

export { CardAsset };
export type { CardAssetProps, CardAssetSize };
