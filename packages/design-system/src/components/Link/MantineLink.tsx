/**
 * MantineLink — Mantine-backed implementation of Strapi's <Link>.
 *
 * Preserves the Strapi prop API exactly (href, tag/component, disabled,
 * startIcon, endIcon, isExternal, color, activeColor + everything inherited
 * from Box via BaseLink). Translates the relevant props to Mantine's <Anchor>:
 *
 *   - tag       → Mantine's `component` (polymorphic root)
 *   - isExternal → target="_blank" + rel + auto external-link icon
 *   - disabled  → aria-disabled + tabIndex=-1 + data-disabled hook
 *   - color     → resolved via `--strapi-color-*` CSS variable on data-strapi-link
 *
 * The prop type extends `BaseLinkProps<C>` (same as the legacy implementation)
 * so existing styled-components wrappers — most notably
 * `OptionLink = styled(Link)<{ $variant }>` in SimpleMenu — keep the exact
 * prop math they had before the migration. When SimpleMenu/BaseLink migrate
 * later, this dependency on BaseLinkProps can be replaced with a Mantine-only
 * shape.
 */
import * as React from 'react';

import { Anchor as MantineAnchor } from '@mantine/core';
import { ExternalLink } from '@strapi/icons';
import { type DefaultTheme } from 'styled-components';

import { type BaseLinkProps } from '../BaseLink';

/* -------------------------------------------------------------------------- */
/* Public prop type                                                           */
/* -------------------------------------------------------------------------- */

export type LinkProps<C extends React.ElementType = 'a'> = BaseLinkProps<C> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** @default false */
  isExternal?: boolean;
  /** @default primary600 */
  color?: keyof DefaultTheme['colors'];
  /** @default primary700 */
  activeColor?: keyof DefaultTheme['colors'];
};

/* -------------------------------------------------------------------------- */
/* Mantine permissive wrapper                                                 */
/* -------------------------------------------------------------------------- */

// Mantine's <Anchor> has a strict polymorphic union for `component`. Strapi's
// `tag` accepts any ElementType (incl. NavLink, custom components), so we
// widen the JSX-level type. Runtime behavior is unchanged.
const MantineAnchorPermissive = MantineAnchor as unknown as React.ComponentType<
  Record<string, unknown> & { ref?: React.Ref<HTMLAnchorElement> }
>;

/* -------------------------------------------------------------------------- */
/* Implementation                                                             */
/* -------------------------------------------------------------------------- */

const MantineLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      href,
      disabled = false,
      startIcon,
      endIcon,
      isExternal = false,
      color = 'primary600',
      activeColor = 'primary700',
      tag,
      style,
      ...rest
    },
    ref,
  ) => {
    const effectiveColor = disabled ? 'neutral600' : color;
    const componentProp = tag as React.ElementType | undefined;

    // CSS custom properties drive hover/active colors. Kept on the element so
    // CSS overrides only need to read `var(--strapi-link-color)` regardless of
    // which token was passed at render time.
    const cssVars: React.CSSProperties & Record<string, string> = {
      '--strapi-link-color': `var(--strapi-color-${effectiveColor})`,
      '--strapi-link-active-color': `var(--strapi-color-${activeColor})`,
    };

    return (
      <MantineAnchorPermissive
        ref={ref}
        href={href}
        component={componentProp}
        underline="never"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        tabIndex={disabled ? -1 : undefined}
        aria-disabled={disabled || undefined}
        data-strapi-link=""
        data-disabled={disabled || undefined}
        data-external={isExternal || undefined}
        style={{ ...cssVars, ...style }}
        {...(rest as Record<string, unknown>)}
      >
        {startIcon}
        <span data-strapi-link-text="">{children}</span>
        {endIcon}
        {href && !endIcon && isExternal && <ExternalLink aria-hidden />}
      </MantineAnchorPermissive>
    );
  },
);

MantineLink.displayName = 'MantineLink';

export { MantineLink };
