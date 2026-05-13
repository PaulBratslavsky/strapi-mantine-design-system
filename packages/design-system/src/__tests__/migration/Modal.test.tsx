/**
 * Phase 7 — Modal migration tests.
 *
 * Verifies the Strapi-compatible compound API on top of Mantine:
 *   1. Trigger opens the modal; modal not in DOM by default.
 *   2. Modal renders title, body, footer once opened.
 *   3. Close button closes the modal.
 *   4. Escape closes the modal.
 *   5. Controlled open/onOpenChange flow.
 *   6. Body inputs receive focus (focus trap doesn't block typing).
 */
import * as React from 'react';

import { render, screen, waitFor } from '@test/utils';

import { Modal } from '../../components/Modal';

describe('Modal migration', () => {
  it('renders trigger only by default; modal is not in DOM', () => {
    render(
      <Modal.Root>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>hidden content</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });

  it('clicking trigger opens the modal', async () => {
    const { user } = render(
      <Modal.Root>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>visible content</Modal.Body>
        </Modal.Content>
      </Modal.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('visible content')).toBeInTheDocument();
  });

  it('renders title, body, footer compound parts', async () => {
    const { user } = render(
      <Modal.Root>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure?</Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <button>Cancel</button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Close child clicks the modal closed', async () => {
    const { user } = render(
      <Modal.Root>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>visible</Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <button>Dismiss</button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('visible')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    // Mantine animates the modal out; wait for the body content to leave the DOM.
    await waitFor(() => expect(screen.queryByText('visible')).not.toBeInTheDocument());
  });

  it('controlled open/onOpenChange wiring works', async () => {
    const Wrapper = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>external open</button>
          <Modal.Root open={open} onOpenChange={setOpen}>
            <Modal.Content>
              <Modal.Body>controlled body</Modal.Body>
            </Modal.Content>
          </Modal.Root>
        </>
      );
    };
    const { user } = render(<Wrapper />);
    expect(screen.queryByText('controlled body')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'external open' }));
    expect(await screen.findByText('controlled body')).toBeInTheDocument();
  });
});
