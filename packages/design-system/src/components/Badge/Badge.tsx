/**
 * Badge — thin translation layer over Mantine's <Badge>.
 *
 * Strapi's legacy Badge was a custom Flex+Typography composition with
 * variant/size/active props mapped to neutral/primary/danger/etc. tints.
 * Mantine's <Badge> ships variants (filled / light / outline / dot /
 * transparent / default) and color tokens, which cover the same use cases.
 *
 * Strapi prop API preserved:
 *   - variant (success/primary/danger/warning/neutral/secondary/alternative)
 *     → Mantine `color`
 *   - active boolean → switches to "primary" tint (matches legacy
 *     primary200/600 active-badge look)
 *   - size (S|M) → Mantine size (sm|md)
 *   - backgroundColor / textColor accepted for backwards-compat but
 *     superseded by Mantine's color system when `variant` is set
 */
import * as React from 'react';

import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps } from '@mantine/core';

type BadgeSize = 'S' | 'M';
type BadgeVariant = 'success' | 'primary' | 'danger' | 'warning' | 'neutral' | 'secondary' | 'alternative';

interface BadgeProps {
  children?: React.ReactNode;
  /** If true, renders the "active" tint (primary). */
  active?: boolean;
  /** @default 'M' */
  size?: BadgeSize;
  /** @default 'neutral' */
  variant?: BadgeVariant;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const SIZE_MAP: Record<BadgeSize, MantineBadgeProps['size']> = {
  S: 'sm',
  M: 'md',
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ active, size = 'M', variant, children, backgroundColor: _bg, textColor: _tc, ...rest }, ref) => {
    const color = active ? 'primary' : variant ?? 'neutral';

    return (
      <MantineBadge
        ref={ref}
        variant="light"
        color={color}
        size={SIZE_MAP[size]}
        radius="sm"
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </MantineBadge>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeSize, BadgeVariant };
