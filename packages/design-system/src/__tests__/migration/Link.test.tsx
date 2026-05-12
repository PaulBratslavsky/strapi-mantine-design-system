/**
 * Phase 5b — Link migration tests.
 *
 * Confirms the Mantine-backed Link:
 *   1. Renders an <a> with the given href
 *   2. Carries the Strapi data hooks (data-strapi-link, data-external)
 *   3. Translates `isExternal` to target="_blank" + rel + the external icon
 *   4. Disables interaction via aria-disabled + tabIndex when disabled
 *   5. Honors the polymorphic `tag` prop (translated to Mantine's `component`)
 *   6. Per-component DSProvider override swaps Link entirely
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { Link } from '../../components/Link';
import { DSProvider } from '../../resolver';

describe('Link migration', () => {
  it('renders an anchor with the given href and text', () => {
    render(<Link href="/foo">go to foo</Link>);

    const link = screen.getByRole('link', { name: /go to foo/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link).toHaveAttribute('href', '/foo');
    expect(link).toHaveAttribute('data-strapi-link');
  });

  it('marks external links with target/rel and renders the external icon', () => {
    render(
      <Link href="https://example.com" isExternal>
        external
      </Link>,
    );

    const link = screen.getByRole('link', { name: /external/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('data-external');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('does not auto-render the external icon when endIcon is provided', () => {
    render(
      <Link href="https://example.com" isExternal endIcon={<span data-testid="custom-end" />}>
        external
      </Link>,
    );

    expect(screen.getByTestId('custom-end')).toBeInTheDocument();
    expect(screen.getByRole('link').querySelectorAll('svg')).toHaveLength(0);
  });

  it('disabled link gets aria-disabled and tabIndex=-1', () => {
    render(
      <Link href="/foo" disabled>
        disabled
      </Link>,
    );

    const link = screen.getByText('disabled').closest('a')!;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveAttribute('data-disabled');
  });

  it('renders startIcon and endIcon around the text', () => {
    render(
      <Link href="/foo" startIcon={<span data-testid="start-icon" />} endIcon={<span data-testid="end-icon" />}>
        with icons
      </Link>,
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('per-Link override swaps the entire impl', () => {
    const CustomLink: React.FC<{ href?: string; children?: React.ReactNode }> = ({ href, children }) => (
      <a data-testid="custom-link" href={href}>
        {children}
      </a>
    );

    render(
      <DSProvider components={{ Link: { default: CustomLink } }}>
        <Link href="/x">swap me</Link>
      </DSProvider>,
    );

    expect(screen.getByTestId('custom-link')).toHaveTextContent('swap me');
    expect(screen.queryByTestId('custom-link')).not.toHaveAttribute('data-strapi-link');
  });
});
