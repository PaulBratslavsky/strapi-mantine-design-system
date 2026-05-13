/**
 * CardBadge — drop-in port off styled-components.
 *
 * Two styled rules: wrapper has `margin-left: auto; flex-shrink: 0` (pushes
 * badge to the right side of its flex parent), inner Badge has a 1-space
 * left margin. Both moved to `[data-strapi-card-badge*]` CSS rules.
 */
import { Badge, BadgeProps } from '../Badge';

export type CardBadgeProps = BadgeProps;

export const CardBadge = (props: CardBadgeProps) => (
  <div data-strapi-card-badge="">
    <Badge data-strapi-card-badge-inner="" {...props} />
  </div>
);
