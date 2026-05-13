/**
 * Phase 6 — Tooltip migration tests.
 *
 * Verifies:
 *   1. Tooltip renders its trigger child (always).
 *   2. Tooltip becomes visible on hover with the label text.
 *   3. `description` alias is honored (deprecated, still supported).
 *   4. When neither label nor description is provided, the trigger renders
 *      bare (no tooltip mount).
 *   5. Per-Tooltip DSProvider override swaps the entire impl.
 */
import * as React from 'react';

import { render, screen } from '@test/utils';

import { Tooltip } from '../../components/Tooltip';
import { DSProvider } from '../../resolver';

describe('Tooltip migration', () => {
  it('renders the trigger child', () => {
    render(
      <Tooltip label="hello">
        <button>trigger</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'trigger' })).toBeInTheDocument();
  });

  it('shows the label on hover', async () => {
    const { user } = render(
      <Tooltip label="my tooltip" delayDuration={0}>
        <button>trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', { name: 'trigger' }));
    // Mantine renders tooltip content lazily on first open; wait for it.
    expect(await screen.findByText('my tooltip')).toBeInTheDocument();
  });

  it('accepts the deprecated `description` alias as label', async () => {
    const { user } = render(
      <Tooltip description="legacy alias" delayDuration={0}>
        <button>trigger</button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button', { name: 'trigger' }));
    expect(await screen.findByText('legacy alias')).toBeInTheDocument();
  });

  it('renders bare trigger when neither label nor description is provided', () => {
    render(
      <Tooltip>
        <button>just a button</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'just a button' })).toBeInTheDocument();
    expect(screen.queryByText(/tooltip/i)).not.toBeInTheDocument();
  });

  it('per-Tooltip DSProvider override swaps the entire impl', () => {
    const CustomTooltip: React.FC<{ children?: React.ReactNode; label?: React.ReactNode }> = ({ children, label }) => (
      <>
        {children}
        <span data-testid="custom-tooltip-label">{label}</span>
      </>
    );

    render(
      <DSProvider components={{ Tooltip: { default: CustomTooltip } }}>
        <Tooltip label="overridden">
          <button>trigger</button>
        </Tooltip>
      </DSProvider>,
    );

    expect(screen.getByTestId('custom-tooltip-label')).toHaveTextContent('overridden');
  });
});
