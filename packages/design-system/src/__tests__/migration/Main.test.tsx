/**
 * Phase 5a — Main migration tests.
 *
 * Main is a thin semantic wrapper. Tests confirm:
 *   1. Renders a <main> element with correct a11y defaults
 *   2. labelledBy override works
 *   3. Per-component DSProvider override swaps Main entirely
 *
 * Main delegates to Strapi's Box primitive (still legacy in Phase 5a;
 * becomes Mantine-backed in Phase 5c). These tests don't depend on the
 * substrate — they verify only the resolver-aware shell and Main's own
 * a11y behavior.
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { Main } from '../../components/Main';
import { DSProvider } from '../../resolver';

describe('Main migration', () => {
  it('renders a <main> element with a11y defaults', () => {
    render(<Main>page content</Main>);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main.tagName.toLowerCase()).toBe('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('aria-labelledby', 'main-content-title');
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(main).toHaveAttribute('data-strapi-main');
  });

  it('respects a custom labelledBy', () => {
    render(<Main labelledBy="my-page-title">content</Main>);

    expect(screen.getByRole('main')).toHaveAttribute('aria-labelledby', 'my-page-title');
  });

  it('renders children', () => {
    render(
      <Main>
        <h1>Hello</h1>
      </Main>,
    );

    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
  });

  it('per-Main override swaps the entire impl', () => {
    const CustomMain: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <main data-testid="custom-main">{children}</main>
    );

    render(
      <DSProvider components={{ Main: { default: CustomMain } }}>
        <Main>swap me</Main>
      </DSProvider>,
    );

    expect(screen.getByTestId('custom-main')).toHaveTextContent('swap me');
    // The shipped DefaultMain's data-strapi-main attribute is absent
    expect(screen.queryByTestId('custom-main')).not.toHaveAttribute('data-strapi-main');
  });
});
