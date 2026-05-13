/**
 * SimpleMenu utils — drop-in port off styled-components.
 *
 * Used to return `keyof DefaultTheme['colors']` strings; we drop the
 * styled-components type-only import and type the returns as plain strings
 * so Box's color resolver still picks up the token names at render.
 */
import type { ItemVariant } from './Menu';

export const getBackgroundColorHover = (variant: ItemVariant): string => {
  switch (variant) {
    case 'danger':
      return 'danger100';
    default:
      return 'primary100';
  }
};

export const getTextColor = (variant: ItemVariant, disabled?: boolean): string => {
  switch (variant) {
    case 'danger':
      return disabled ? 'danger500' : 'danger700';
    default:
      return disabled ? 'neutral500' : 'neutral800';
  }
};

export const getIconColor = (variant: ItemVariant, disabled?: boolean): string => {
  switch (variant) {
    case 'danger':
      return disabled ? 'danger500' : 'danger700';
    default:
      return disabled ? 'neutral300' : 'neutral500';
  }
};
