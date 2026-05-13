import * as React from 'react';

import { CaretDown, Cross } from '@strapi/icons';
import { Combobox as ComboboxPrimitive } from '@strapi/ui-primitives';

import { stripReactIdOfColon } from '../../helpers/strings';
import { useComposedRefs } from '../../hooks/useComposeRefs';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { useIntersection } from '../../hooks/useIntersection';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Typography } from '../../primitives/Typography';
import { ScrollArea } from '../../utilities/ScrollArea';
import { Field, useField } from '../Field';
import { IconButton } from '../IconButton';
import { Loader } from '../Loader';

import { VirtualizedList } from './VirtualizedList';

/* -------------------------------------------------------------------------------------------------
 * ComboboxInput
 * -----------------------------------------------------------------------------------------------*/

interface ComboboxProps
  extends Pick<
      ComboboxPrimitive.RootProps,
      | 'allowCustomValue'
      | 'autocomplete'
      | 'children'
      | 'disabled'
      | 'defaultTextValue'
      | 'defaultOpen'
      | 'defaultFilterValue'
      | 'filterValue'
      | 'isPrintableCharacter'
      | 'open'
      | 'onOpenChange'
      | 'onFilterValueChange'
      | 'onTextValueChange'
      | 'required'
      | 'textValue'
      | 'value'
    >,
    Pick<Field.InputProps, 'hasError' | 'name' | 'id'>,
    Omit<ComboboxPrimitive.TextInputProps, 'required' | 'disabled' | 'value' | 'onChange' | 'size'> {
  clearLabel?: string;
  creatable?: boolean | 'visible';
  creatableDisabled?: boolean;
  createMessage?: (value: string) => string;
  creatableStartIcon?: React.ReactNode;
  hasMoreItems?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  noOptionsMessage?: (value: string) => string;
  onChange?: ComboboxPrimitive.RootProps['onValueChange'];
  onClear?: React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
  onCreateOption?: (value?: string) => void;
  onLoadMore?: (entry: IntersectionObserverEntry) => void;
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  /**
   * @default "M"
   */
  size?: 'S' | 'M';
  startIcon?: React.ReactNode;
  /**
   * Enable virtualization for large lists
   * @default false
   */
  // Virtualization is automatic based on the number of options; manual
  // control props were removed to simplify the API.
}

type ComboboxInputElement = HTMLInputElement;

const Combobox = React.forwardRef<ComboboxInputElement, ComboboxProps>(
  (
    {
      allowCustomValue,
      autocomplete,
      children,
      className,
      clearLabel = 'Clear',
      creatable = false,
      creatableDisabled = false,
      creatableStartIcon,
      createMessage = (value) => `Create "${value}"`,
      defaultFilterValue,
      defaultTextValue,
      defaultOpen = false,
      open,
      onOpenChange,
      disabled = false,
      hasError: hasErrorProp,
      id: idProp,
      filterValue,
      hasMoreItems = false,
      isPrintableCharacter,
      loading = false,
      loadingMessage = 'Loading content...',
      name: nameProp,
      noOptionsMessage = () => 'No results found',
      onChange,
      onClear,
      onCreateOption,
      onFilterValueChange,
      onInputChange,
      onTextValueChange,
      onLoadMore,
      placeholder = 'Select or enter a value',
      required: requiredProp = false,
      size = 'M',
      startIcon,
      textValue,
      value,
      ...restProps
    },
    forwardedRef,
  ) => {
    const [internalIsOpen, setInternalIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [internalTextValue, setInternalTextValue] = useControllableState({
      prop: textValue,
      defaultProp: allowCustomValue && !defaultTextValue ? value : defaultTextValue,
      onChange: onTextValueChange,
    });
    const [internalFilterValue, setInternalFilterValue] = useControllableState({
      prop: filterValue,
      defaultProp: defaultFilterValue,
      onChange: onFilterValueChange,
    });

    /**
     * Used for the intersection observer
     */
    const triggerRef = React.useRef<HTMLInputElement>(null!);
    const scrollViewportRef = React.useRef<HTMLDivElement>(null);

    const composedTriggerRefs = useComposedRefs(triggerRef, forwardedRef);

    const clearRef = React.useRef(null);

    const handleClearClick: React.MouseEventHandler<HTMLButtonElement> & React.MouseEventHandler<HTMLDivElement> = (
      e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
    ) => {
      if (onClear && !disabled) {
        setInternalTextValue('');
        setInternalFilterValue('');
        onClear(e);
        triggerRef.current.focus();
      }
    };

    const handleOpenChange: ComboboxPrimitive.RootProps['onOpenChange'] = (open) => {
      setInternalIsOpen(open);
    };

    const handleTextValueChange: ComboboxPrimitive.RootProps['onTextValueChange'] = (textValue) => {
      setInternalTextValue(textValue);
    };

    const handleFilterValueChange: ComboboxPrimitive.RootProps['onFilterValueChange'] = (filterValue) => {
      setInternalFilterValue(filterValue);
    };

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (onInputChange) {
        onInputChange(e);
      }
    };

    const handleChange: ComboboxPrimitive.RootProps['onValueChange'] = (value) => {
      if (onChange) {
        onChange(value);
      }
    };

    const handleReachEnd = (entry: IntersectionObserverEntry) => {
      if (onLoadMore && hasMoreItems && !loading) {
        onLoadMore(entry);
      }
    };

    const handleCreateItemClick = () => {
      if (onCreateOption && internalTextValue && creatable !== 'visible') {
        onCreateOption(internalTextValue);
      } else if (onCreateOption && creatable === 'visible') {
        onCreateOption();
        setInternalIsOpen(false);
      }
    };

    const generatedIntersectionId = useId();
    const intersectionId = `intersection-${stripReactIdOfColon(generatedIntersectionId)}`;

    useIntersection(scrollViewportRef, handleReachEnd, {
      selectorToWatch: `#${intersectionId}`,
      /**
       * We need to know when the select is open because only then will viewportRef
       * not be null. Because it uses a portal that (sensibly) is not mounted 24/7.
       */
      skipWhen: !internalIsOpen,
    });

    const { error, ...field } = useField('Combobox');
    const hasError = Boolean(error) || hasErrorProp;
    const id = field.id ?? idProp;
    const name = field.name ?? nameProp;
    const required = field.required || requiredProp;

    // Compute children count early so we can decide about virtualization
    const childArray = React.Children.toArray(children).filter(Boolean);
    const childrenCount = childArray.length;

    // If the user is actively filtering/typing, disable virtualization so
    // the list can resize to the filtered results and show the NoValueFound node.
    const isFiltering = Boolean(
      (internalTextValue && internalTextValue !== '') || (internalFilterValue && internalFilterValue !== ''),
    );

    // Auto-enable virtualization when there are more than 100 items and the
    // user is not currently filtering.
    const AUTO_VIRTUALIZE_THRESHOLD = 100;
    const shouldVirtualizeOptions = !isFiltering && childrenCount > AUTO_VIRTUALIZE_THRESHOLD;

    let ariaDescription: string | undefined;
    if (error) {
      ariaDescription = `${id}-error`;
    } else if (field.hint) {
      ariaDescription = `${id}-hint`;
    }

    return (
      <ComboboxPrimitive.Root
        autocomplete={autocomplete || (creatable === true ? 'list' : 'both')}
        onOpenChange={handleOpenChange}
        open={internalIsOpen}
        onTextValueChange={handleTextValueChange}
        textValue={internalTextValue}
        allowCustomValue={!!creatable || allowCustomValue}
        disabled={disabled}
        required={required}
        value={value}
        onValueChange={handleChange}
        filterValue={internalFilterValue}
        onFilterValueChange={handleFilterValueChange}
        isPrintableCharacter={isPrintableCharacter}
        visible={creatable === 'visible'}
      >
        <ComboboxPrimitive.Trigger
          data-strapi-combobox-trigger=""
          data-has-error={hasError ? '' : undefined}
          data-has-value={internalTextValue ? '' : undefined}
          data-has-clear={internalTextValue && onClear ? '' : undefined}
          data-size={size || 'M'}
          className={className}
        >
          <Flex flex="1" tag="span" gap={3}>
            {startIcon ? (
              <Flex flex="0 0 1.6rem" tag="span" aria-hidden>
                {startIcon}
              </Flex>
            ) : null}
            <ComboboxPrimitive.TextInput
              data-strapi-combobox-input=""
              placeholder={placeholder}
              id={id}
              aria-invalid={Boolean(error)}
              onChange={handleInputChange}
              ref={composedTriggerRefs}
              name={name}
              aria-describedby={ariaDescription}
              {...restProps}
            />
          </Flex>
          <Flex tag="span" gap={3}>
            {internalTextValue && onClear ? (
              <IconButton
                size="XS"
                variant="ghost"
                onClick={handleClearClick}
                aria-disabled={disabled}
                aria-label={clearLabel}
                label={clearLabel}
                ref={clearRef}
              >
                <Cross />
              </IconButton>
            ) : null}
            {loading ? (
              <Loader small>Loading</Loader>
            ) : (
              <ComboboxPrimitive.Icon data-strapi-combobox-icon="">
                <CaretDown fill="neutral500" />
              </ComboboxPrimitive.Icon>
            )}
          </Flex>
        </ComboboxPrimitive.Trigger>
        <ComboboxPrimitive.Portal>
          <ComboboxPrimitive.Content data-strapi-combobox-content="" sideOffset={4}>
            <ScrollArea viewportRef={scrollViewportRef}>
              <ComboboxPrimitive.Viewport>
                <Box padding={1}>
                  {shouldVirtualizeOptions ? (
                    <VirtualizedList itemCount={childrenCount}>{children}</VirtualizedList>
                  ) : (
                    children
                  )}
                  {creatable !== true && !loading ? (
                    <ComboboxPrimitive.NoValueFound asChild>
                      <div data-strapi-combobox-option="" data-no-hover="">
                        <Typography>{noOptionsMessage(internalTextValue ?? '')}</Typography>
                      </div>
                    </ComboboxPrimitive.NoValueFound>
                  ) : null}
                  {loading ? (
                    <Flex justifyContent="center" alignItems="center" paddingTop={2} paddingBottom={2}>
                      <Loader small>{loadingMessage}</Loader>
                    </Flex>
                  ) : null}
                  <Box id={intersectionId} width="100%" height="1px" />
                </Box>
              </ComboboxPrimitive.Viewport>
            </ScrollArea>
            {creatable ? (
              <ComboboxPrimitive.CreateItem
                data-strapi-combobox-create-item=""
                onPointerUp={handleCreateItemClick}
                onClick={handleCreateItemClick}
                disabled={creatableDisabled}
                asChild
              >
                <div data-strapi-combobox-option="">
                  <Flex gap={2}>
                    {creatableStartIcon && (
                      <Box tag="span" aria-hidden display={'inline-flex'}>
                        {creatableStartIcon}
                      </Box>
                    )}
                    <Typography>{createMessage(internalTextValue ?? '')}</Typography>
                  </Flex>
                </div>
              </ComboboxPrimitive.CreateItem>
            ) : null}
          </ComboboxPrimitive.Content>
        </ComboboxPrimitive.Portal>
      </ComboboxPrimitive.Root>
    );
  },
);


/* -------------------------------------------------------------------------------------------------
 * ComboboxOption
 * -----------------------------------------------------------------------------------------------*/

interface ComboboxOptionProps extends ComboboxPrimitive.ItemProps {
  children: React.ReactNode;
}

const Option = React.forwardRef<HTMLDivElement, ComboboxOptionProps>(
  ({ children, value, disabled, textValue, ...props }, ref) => {
    return (
      <ComboboxPrimitive.ComboboxItem asChild value={value} disabled={disabled} textValue={textValue}>
        <div data-strapi-combobox-option="" ref={ref} {...props}>
          <ComboboxPrimitive.ItemText asChild>
            <Typography>{children}</Typography>
          </ComboboxPrimitive.ItemText>
        </div>
      </ComboboxPrimitive.ComboboxItem>
    );
  },
);


export { Combobox, Option as ComboboxOption };
export type { ComboboxInputElement, ComboboxOptionProps, ComboboxProps };
