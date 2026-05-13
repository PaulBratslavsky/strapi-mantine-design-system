/**
 * Badge — drop-in port off styled-components.
 *
 * Pill-shaped status indicator with size + variant + active state. The
 * styled-components base added per-size border-radius and padding-block;
 * those moved to `componentPolish.css` keyed on `[data-strapi-badge]` +
 * `data-strapi-badge-size`.
 *
 * Color tokens (variant→{backgroundColor, textColor}, active state) and
 * the typography variant `sigma` pass through unchanged.
 */
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { DefaultThemeOrCSSProp } from '../../types';

type BadgeSize = 'S' | 'M';

type BadgeVariant = 'success' | 'primary' | 'danger' | 'warning' | 'neutral' | 'secondary' | 'alternative';

interface BadgeProps extends FlexProps {
  /** If `true`, switches to `primary200` background + `primary600` text. */
  active?: boolean;
  backgroundColor?: DefaultThemeOrCSSProp<'colors', 'background'>;
  /** @default 'M' */
  size?: BadgeSize;
  textColor?: DefaultThemeOrCSSProp<'colors', 'color'>;
  /** @default undefined — when set, variant-derived colors override
   * `backgroundColor`/`textColor`. */
  variant?: BadgeVariant;
}

const Badge = ({
  active = false,
  size = 'M',
  textColor = 'neutral600',
  backgroundColor = 'neutral150',
  variant,
  children,
  minWidth = 5,
  ...props
}: BadgeProps) => {
  const paddingX = size === 'S' ? 1 : 2;

  const colors = variant
    ? { backgroundColor: `${variant}200`, textColor: `${variant}700` }
    : { backgroundColor, textColor };

  return (
    <Flex
      inline
      alignItems="center"
      justifyContent="center"
      minWidth={minWidth}
      paddingLeft={paddingX}
      paddingRight={paddingX}
      background={active ? 'primary200' : colors.backgroundColor}
      data-strapi-badge=""
      data-strapi-badge-size={size}
      {...props}
    >
      <Typography
        variant="sigma"
        textColor={active ? 'primary600' : (colors.textColor as 'neutral600')}
        lineHeight="1rem"
      >
        {children}
      </Typography>
    </Flex>
  );
};

export { Badge };
export type { BadgeProps, BadgeSize };
