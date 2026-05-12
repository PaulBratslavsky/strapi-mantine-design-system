/**
 * Phase 3 — Button migration tests.
 *
 * Validates:
 *   1. The default <Button> renders (no resolver override needed).
 *   2. <DSProvider> override per variant swaps the implementation.
 *   3. <DSProvider> override of `default` swaps ALL variants for that subtree
 *      (WP child-theme semantics — inner default beats outer variant).
 *   4. The append-only variant set for Button matches the shipped list.
 *
 * Pure behavioral assertions against the resolver shell — no visual snapshot.
 * Visual parity is verified by manual smoke in examples/getstarted.
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { Button, type ButtonProps } from '../../components/Button';
import { DSProvider, getRegisteredVariants } from '../../resolver';

// Override implementations must satisfy `ButtonProps` to slot into the resolver.
// They can ignore most props at runtime — that's by design.
const CustomButton: React.FC<ButtonProps> = ({ children, onClick }) => (
  <button type="button" data-testid="custom-button" onClick={onClick}>
    {children}
  </button>
);

describe('Button migration', () => {
  it('renders the shipped MantineButton when no resolver override applies', () => {
    render(<Button>click me</Button>);
    // Mantine renders a real <button> with .mantine-Button-root class.
    const btn = screen.getByRole('button', { name: 'click me' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('data-strapi-button');
    expect(btn).toHaveAttribute('data-strapi-variant', 'default');
  });

  it('forwards variant and size as data-* hooks for CSS overrides', () => {
    render(
      <Button variant="danger" size="L">
        delete
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'delete' });
    expect(btn).toHaveAttribute('data-strapi-variant', 'danger');
    expect(btn).toHaveAttribute('data-strapi-size', 'L');
  });

  it('renders the override implementation when DSProvider swaps it (default slot)', () => {
    render(
      <DSProvider components={{ Button: { default: CustomButton } }}>
        <Button>hello</Button>
      </DSProvider>,
    );
    expect(screen.getByTestId('custom-button')).toHaveTextContent('hello');
  });

  it('per-variant override applies only to that variant', () => {
    render(
      <DSProvider components={{ Button: { danger: CustomButton } }}>
        <Button variant="danger">delete</Button>
        <Button variant="default">save</Button>
      </DSProvider>,
    );
    // danger went through the override; default went through the shipped Mantine.
    expect(screen.getByTestId('custom-button')).toHaveTextContent('delete');
    expect(screen.getByRole('button', { name: 'save' })).toHaveAttribute('data-strapi-button');
  });

  it('inner DSProvider default beats outer variant — WP child-theme semantics', () => {
    const InnerImpl: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <button type="button" data-testid="inner-impl">
        {children}
      </button>
    );

    render(
      <DSProvider components={{ Button: { danger: CustomButton } }}>
        <DSProvider components={{ Button: { default: InnerImpl } }}>
          <Button variant="danger">whatever</Button>
        </DSProvider>
      </DSProvider>,
    );
    // Inner provider's `default` short-circuits the cascade — outer's
    // variant-specific override never gets a chance to win.
    expect(screen.getByTestId('inner-impl')).toHaveTextContent('whatever');
    expect(screen.queryByTestId('custom-button')).not.toBeInTheDocument();
  });

  it('passes through onClick and disabled-via-loading guard', async () => {
    const handle = jest.fn();
    const { user } = render(
      <Button loading onClick={handle}>
        save
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: /save/i }));
    // Mantine sets data-loading and disables interaction when loading; clicks
    // shouldn't fire. This is the same disabled-on-loading semantics the
    // legacy Strapi Button had.
    expect(handle).not.toHaveBeenCalled();
  });
});

describe('Button registry (append-only contract)', () => {
  it('Button is registered and has no per-variant shipped impls', () => {
    // MantineButton handles every variant internally, so the registry stores
    // it as a single `default` impl with no entries in the per-variant map.
    // `knownVariants` is empty here on purpose.
    //
    // The append-only protection for Button's variant SET lives at the TS
    // level: removing a key from `interface DSButtonVariants` in Button.tsx
    // is a compile error wherever that key is referenced. CI catches it via
    // `yarn test:ts`. The registry snapshot only catches removals of
    // explicitly-registered variant impls.
    expect([...getRegisteredVariants('Button')]).toEqual([]);
  });
});
