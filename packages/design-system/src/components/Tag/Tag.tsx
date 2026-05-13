/**
 * Tag — drop-in port off styled-components.
 *
 * Pill-shaped tag with a label + dismiss icon. The button half had three
 * styled-components rules (inline-flex, SVG sizing/color, hover cursor);
 * the text half had a right border divider. Both replaced by `[data-strapi-
 * tag-button]` and `[data-strapi-tag-text]` rules in `componentPolish.css`.
 *
 * Public API and visual output identical: disabled state colors,
 * primary/neutral palettes, fixed 3.2rem height.
 */
import * as React from 'react';

import { Box } from '../../primitives/Box';
import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';

export interface TagProps extends Omit<FlexProps, 'onClick'> {
  icon: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tag = ({ children, icon, label, disabled = false, onClick, ...props }: TagProps) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled || !onClick) return;
    onClick(e);
  };

  return (
    <Flex
      inline
      background={disabled ? 'neutral200' : 'primary100'}
      color={disabled ? 'neutral700' : 'primary600'}
      paddingLeft={3}
      paddingRight={1}
      borderColor={disabled ? 'neutral300' : 'primary200'}
      hasRadius
      height="3.2rem"
      {...props}
    >
      <Typography
        tag="span"
        variant="pi"
        fontWeight="bold"
        data-strapi-tag-text=""
        data-strapi-tag-disabled={disabled || undefined}
      >
        {children}
      </Typography>
      <Box
        tag="button"
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={label}
        padding={2}
        onClick={handleClick}
        data-strapi-tag-button=""
        data-strapi-tag-button-clickable={!!onClick && !disabled ? '' : undefined}
      >
        {icon}
      </Box>
    </Flex>
  );
};
