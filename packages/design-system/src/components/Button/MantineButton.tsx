/**
 * MantineButton — Mantine-backed implementation of Strapi's <Button>.
 *
 * Preserves the Strapi prop API exactly (variant, size, startIcon, endIcon,
 * loading, disabled, fullWidth, type, polymorphic tag). Translates each prop
 * to its Mantine equivalent. Strapi consumers don't change a single call site.
 *
 * Override surfaces this exposes (per principles.md):
 *   1. className / style — forwarded straight to Mantine.
 *   2. styles prop      — forwarded to Mantine (Styles API: root, section, label, loader).
 *   3. component=       — Mantine native polymorphic prop; we also accept `tag` for backwards
 *                          compatibility and translate.
 *   4. theme.components.Button — set in DesignSystemProvider, affects every render.
 *   5. CSS vars + .mantine-Button-* selectors — token-driven styling.
 *   6. <DSProvider components={{ Button: { ... } }}> — full subtree swap via the resolver.
 */
import * as React from 'react';

import { Button as MantineButtonBase, type ButtonProps as MantineButtonProps } from '@mantine/core';

import { BUTTON_SIZES, type ButtonSize, type ButtonVariant, DEFAULT } from './constants';

/**
 * Public prop type for Strapi <Button>. Identical surface across the legacy
 * implementation and this Mantine-backed one — the wrapper is the *permanent*
 * boundary between Strapi's stable API and the underlying component library.
 *
 * The `<C>` polymorphic generic is kept for compatibility with existing
 * callers (`<Button<typeof BaseLink>>`, `ButtonProps<typeof BaseLink>`) used
 * by LinkButton, SimpleMenu, IconButton, etc. At runtime the polymorphism is
 * realized by Mantine's `component` prop (we accept Strapi's legacy `tag`).
 *
 * `ref` is included in the prop type so call sites that build props
 * imperatively (`const props: ButtonProps = { ...rest, ref }`) keep type-
 * checking — that pattern predates this refactor.
 */
export type ButtonProps<C extends React.ElementType = 'button'> = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  /** Polymorphic via Mantine's `component`. Strapi's legacy `tag` is aliased to this. */
  tag?: C;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<C>, 'type' | 'onClick' | 'children' | 'ref'>;

type StrapiVariantMap = Record<ButtonVariant, { variant: MantineButtonProps['variant']; color: string }>;

/**
 * Strapi variant → Mantine (variant, color) pair.
 * Colors map to the named palettes registered in DesignSystemProvider's
 * `mantineTheme.colors` — `primary`, `danger`, `success`, `neutral`, etc.
 */
const VARIANT_MAP: StrapiVariantMap = {
  default: { variant: 'filled', color: 'primary' },
  secondary: { variant: 'default', color: 'neutral' },
  tertiary: { variant: 'outline', color: 'neutral' },
  danger: { variant: 'filled', color: 'danger' },
  success: { variant: 'filled', color: 'success' },
  ghost: { variant: 'subtle', color: 'neutral' },
  'success-light': { variant: 'light', color: 'success' },
  'danger-light': { variant: 'light', color: 'danger' },
};

/**
 * Strapi size → Mantine size.
 *
 * Shifted one notch up vs the literal 1:1 mapping so Strapi 'S' (the default
 * Button size) renders at Mantine 'md' — a comfortable mid-size that reads
 * more confidently than Mantine 'sm'. Mantine's coordinated per-size
 * variables (height + padding + line-height + section sizes + fz) all come
 * along for the ride.
 *
 * If you want a different default scale, change the mapping here — DO NOT
 * override sizing variables from external CSS, which knocks Mantine's
 * coordinated variables out of proportion (see memory:
 * feedback-mantine-size-via-props).
 */
const SIZE_MAP: Record<ButtonSize, MantineButtonProps['size']> = {
  XS: 'md',
  S: 'lg', // Strapi default — matches Input default ('M' → 'lg') so form
  M: 'xl', // controls share the same visual height
  L: 'xl',
};

// Mantine's <Button> has a strict polymorphic union type for the `component`
// prop and uses bivariant ref handling. We cast it to a permissive shape
// because (a) Strapi's `tag` accepts any ElementType, including arbitrary
// custom components, and (b) we want a plain forwardRef wrapper for the
// resolver. Runtime behavior is unchanged — only the TS shape at the JSX
// call site is widened.
//
// Using `Record<string, unknown>` for the prop type accepts any spread.
// The actual prop shape is enforced by the surrounding `MantineButton`
// forwardRef whose first generic IS `ButtonProps`.
const MantineButtonPermissive = MantineButtonBase as unknown as React.ComponentType<
  Record<string, unknown> & { ref?: React.Ref<HTMLButtonElement> }
>;

// Runtime impl is non-polymorphic; the `<C>` generic on ButtonProps is
// phantom for caller compatibility. Mantine's `component` prop handles the
// runtime polymorphism via the legacy `tag` alias.
const MantineButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = DEFAULT,
      size = BUTTON_SIZES[1],
      disabled = false,
      loading = false,
      fullWidth = false,
      startIcon,
      endIcon,
      onClick,
      type = 'button',
      tag,
      children,
      ...rest
    },
    ref,
  ) => {
    const { variant: mantineVariant, color } = VARIANT_MAP[variant];
    const isDisabled = disabled || loading;
    const componentProp = tag as React.ElementType | undefined;

    return (
      <MantineButtonPermissive
        ref={ref}
        variant={mantineVariant}
        color={color}
        size={SIZE_MAP[size]}
        leftSection={startIcon}
        rightSection={endIcon}
        loading={loading}
        disabled={isDisabled}
        fullWidth={fullWidth}
        onClick={onClick}
        type={componentProp && componentProp !== 'button' ? undefined : type}
        component={componentProp}
        data-strapi-button=""
        data-strapi-variant={variant}
        data-strapi-size={size}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </MantineButtonPermissive>
    );
  },
);

MantineButton.displayName = 'MantineButton';

export { MantineButton };
