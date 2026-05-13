/**
 * Toggle — drop-in port off styled-components.
 *
 * Two-option pill toggle (Off / On) backed by a hidden checkbox input.
 * Visual rules — focus ring via `:focus-within`, hidden absolute-positioned
 * input, per-option padding — moved to `componentPolish.css` keyed on
 * `[data-strapi-toggle*]` hooks.
 *
 * The inputFocusStyle() shared mixin (from `themes/utils.ts`) is replicated
 * inline here via a CSS rule on `[data-strapi-toggle]:focus-within` so we
 * don't drag styled-components in via the themes import path.
 */
/* eslint-disable no-nested-ternary */
import * as React from 'react';

import { useControllableState } from '../../hooks/useControllableState';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { Field, useField } from '../Field';

interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'name' | 'children' | 'required' | 'id' | 'size' | 'checked'>,
    Pick<Field.InputProps, 'required' | 'name' | 'id' | 'hasError'> {
  onLabel: string;
  offLabel: string;
  checked?: boolean | null;
}

type ToggleInputElement = HTMLInputElement;

const Toggle = React.forwardRef<ToggleInputElement, ToggleProps>(
  (
    {
      offLabel,
      onLabel,
      disabled,
      hasError: hasErrorProp,
      required: requiredProp,
      id: idProp,
      name: nameProp,
      checked: checkedProp,
      onChange,
      ...props
    },
    forwardedRef,
  ) => {
    const [checked = false, setChecked] = useControllableState<boolean | null>({ prop: checkedProp });

    const isFalseyChecked = checked !== null && !checked;

    const { error, ...field } = useField('Toggle');
    const hasError = Boolean(error) || hasErrorProp;
    const id = field.id ?? idProp;
    const name = field.name ?? nameProp;
    const required = field.required || requiredProp;

    let ariaDescription: string | undefined;
    if (error) ariaDescription = `${id}-error`;
    else if (field.hint) ariaDescription = `${id}-hint`;

    return (
      <Flex
        position="relative"
        hasRadius
        padding={1}
        background={disabled ? 'neutral150' : 'neutral100'}
        borderStyle="solid"
        borderWidth="1px"
        borderColor={hasError ? 'danger600' : 'neutral200'}
        wrap="wrap"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        data-strapi-toggle=""
        data-strapi-toggle-error={hasError ? '' : undefined}
      >
        <Flex
          hasRadius
          flex="1 1 50%"
          paddingTop={2}
          paddingBottom={2}
          paddingLeft={3}
          paddingRight={3}
          justifyContent="center"
          background={disabled && isFalseyChecked ? 'neutral200' : isFalseyChecked ? 'neutral0' : 'transparent'}
          borderColor={
            disabled && isFalseyChecked
              ? 'neutral300'
              : isFalseyChecked
                ? 'neutral200'
                : disabled
                  ? 'neutral150'
                  : 'neutral100'
          }
          data-strapi-toggle-option=""
        >
          <Typography
            variant="pi"
            fontWeight="bold"
            textTransform="uppercase"
            textColor={disabled ? 'neutral700' : isFalseyChecked ? 'danger700' : 'neutral600'}
          >
            {offLabel}
          </Typography>
        </Flex>
        <Flex
          hasRadius
          flex="1 1 50%"
          paddingLeft={3}
          paddingRight={3}
          justifyContent="center"
          background={disabled && checked ? 'neutral200' : checked ? 'neutral0' : 'transparent'}
          borderColor={
            disabled && checked ? 'neutral300' : checked ? 'neutral200' : disabled ? 'neutral150' : 'neutral100'
          }
          data-strapi-toggle-option=""
        >
          <Typography
            variant="pi"
            fontWeight="bold"
            textTransform="uppercase"
            textColor={disabled ? 'neutral700' : checked ? 'primary600' : 'neutral600'}
          >
            {onLabel}
          </Typography>
        </Flex>
        <input
          {...props}
          id={id}
          name={name}
          ref={forwardedRef}
          onChange={(e) => {
            setChecked(e.currentTarget.checked);
            onChange?.(e);
          }}
          type="checkbox"
          aria-required={required}
          disabled={disabled}
          aria-disabled={disabled}
          checked={Boolean(checked)}
          aria-describedby={ariaDescription}
          data-strapi-toggle-input=""
        />
      </Flex>
    );
  },
);

export { Toggle };
export type { ToggleProps };
