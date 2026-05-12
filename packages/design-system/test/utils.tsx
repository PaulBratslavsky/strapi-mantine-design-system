import * as React from 'react';

import { render as renderRTL, RenderOptions as RTLRenderOptions, RenderResult } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { DesignSystemProvider } from '../src/utilities/DesignSystemProvider';

interface RenderOptions {
  renderOptions?: RTLRenderOptions;
  userEventOptions?: Parameters<typeof userEvent.setup>[0];
}

type RenderRTLResult = RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
};

// eslint-disable-next-line react/jsx-no-useless-fragment
const fallbackWrapper = ({ children }) => <>{children}</>;

export const render = (
  ui: React.ReactElement,
  { renderOptions, userEventOptions }: RenderOptions = {},
): RenderRTLResult => {
  const { wrapper: Wrapper = fallbackWrapper, ...restOptions } = renderOptions ?? {};

  return {
    ...renderRTL(ui, {
      wrapper: ({ children }) => (
        <DesignSystemProvider locale="en-GB">
          <Wrapper>{children}</Wrapper>
        </DesignSystemProvider>
      ),
      ...restOptions,
    }),
    user: userEvent.setup(userEventOptions),
  };
};

export type { RenderOptions, RenderRTLResult, RenderResult };

export { within, type RenderHookOptions, renderHook, screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Returns the first child of `container` that is not Mantine's injected
 * `<style data-mantine-styles>` element. Use in tests that previously read
 * `container.firstChild` or `container.children[0]` to get at the rendered
 * component root.
 *
 * Mantine's `<MantineProvider>` emits a single `<style>` tag carrying the
 * theme's CSS-variable definitions at render time. Tests written against
 * the styled-components substrate (where no such element existed) need to
 * skip past it to inspect the actual component output.
 */
export const getRoot = (container: HTMLElement): HTMLElement => {
  const root = Array.from(container.children).find(
    (el) => !(el instanceof HTMLStyleElement) && !el.hasAttribute('data-mantine-styles'),
  );
  if (!root) throw new Error('getRoot: no non-style child found in container');
  return root as HTMLElement;
};
