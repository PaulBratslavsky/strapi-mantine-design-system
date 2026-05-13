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
  /**
   * Override the resting link color. When unset, the CSS variable
   * `--strapi-link-color` (defined in `componentPolish.css`, default
   * primary600) is used — letting themes re-skin links without
   * touching every consumer.
   */
  color?: keyof DefaultTheme['colors'];
  /**
   * Override the hover/active link color. When unset, the CSS variable
   * `--strapi-link-color-active` (default primary700) is used.
   */
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
      color,
      activeColor,
      tag,
      style,
      ...rest
    },
    ref,
  ) => {
    const componentProp = tag as React.ElementType | undefined;

    /**
     * Per-instance color overrides — only emitted as inline CSS variables
     * when the consumer explicitly passes `color` / `activeColor`. The
     * defaults live in `componentPolish.css` as `--strapi-link-color`,
     * `--strapi-link-color-active`, and `--strapi-link-color-disabled`,
     * which themes can re-skin at @layer app without rebranding the
     * primary scale.
     *
     * Disabled state is signaled via `data-disabled` and the CSS rule
     * switches the effective color — no inline override needed.
     */
    const cssVars: Record<string, string> = {};
    if (color !== undefined) {
      cssVars['--strapi-link-color'] = `var(--strapi-color-${color})`;
    }
    if (activeColor !== undefined) {
      cssVars['--strapi-link-color-active'] = `var(--strapi-color-${activeColor})`;
    }
    const hasInlineOverrides = Object.keys(cssVars).length > 0;

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
        style={hasInlineOverrides ? { ...(cssVars as React.CSSProperties), ...style } : style}
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
