/**
 * TextButton — drop-in port off styled-components.
 *
 * Background-less button with optional start/end icons + loading spinner.
 * Visual rules (transparent bg, primary text color, disabled state) +
 * the shared focus-ring mixin moved to `componentPolish.css` keyed on
 * `[data-strapi-text-button]`.
 *
 * Loading spinner is now a CSS animation on `[data-strapi-text-button-
 * loader]` instead of styled-components keyframes — same look, no styled-
 * components import.
 */
import * as React from 'react';

import { Loader } from '@strapi/icons';

import { Flex, FlexProps } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from '../../types';
import { forwardRef } from '../../utilities/forwardRef';

type TextButtonProps<C extends React.ElementType = 'button'> = FlexProps<C> & {
  disabled?: boolean;
  endIcon?: React.ReactNode;
  loading?: boolean;
  startIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

const TextButton = forwardRef(
  <C extends React.ElementType = 'button'>(
    { children, startIcon, endIcon, disabled = false, loading = false, type = 'button', ...props }: TextButtonProps<C>,
    ref: PolymorphicRef<C>,
  ) => {
    const isDisabled = disabled || loading;

    // `disabled` is a native button attribute that Flex's typed entry
    // doesn't enumerate (Flex extends BoxProps which is div-shaped). At
    // runtime it's forwarded to the rendered button element via Box's
    // spread. Cast to keep types loose at this seam.
    const flexProps = {
      ref,
      disabled: isDisabled,
      'aria-disabled': isDisabled,
      tag: 'button' as const,
      type,
      gap: 2,
      'data-strapi-text-button': '',
      ...props,
    } as React.ComponentProps<typeof Flex>;

    return (
      <Flex {...flexProps}>
        {loading ? (
          <span aria-hidden data-strapi-text-button-loader="">
            <Loader />
          </span>
        ) : (
          startIcon
        )}

        <Typography variant="pi">{children}</Typography>

        {endIcon}
      </Flex>
    );
  },
) as TextButtonComponent;

type TextButtonComponent<C extends React.ElementType = 'button'> = <T extends React.ElementType = C>(
  props: PolymorphicComponentPropsWithRef<T, TextButtonProps<T>>,
) => JSX.Element;

export { TextButton };
export type { TextButtonProps };
