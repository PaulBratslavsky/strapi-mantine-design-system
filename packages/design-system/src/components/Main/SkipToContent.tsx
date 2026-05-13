/**
 * SkipToContent — drop-in port off styled-components.
 *
 * Standard a11y "skip to main content" link. Hidden off-screen by default
 * (left/top: -100%); on focus, jumps into the visible area. The focus
 * styling + text-decoration removal live in `componentPolish.css`
 * keyed on `[data-strapi-skip-to-content]`.
 */
import { Box } from '../../primitives/Box';

export interface SkipToContentProps {
  children?: React.ReactNode;
}

export const SkipToContent = ({ children }: SkipToContentProps) => {
  return (
    <Box
      tag="a"
      href="#main-content"
      background="primary600"
      color="neutral0"
      left="-100%"
      padding={3}
      position="absolute"
      top="-100%"
      hasRadius
      zIndex={9999}
      data-strapi-skip-to-content=""
    >
      {children}
    </Box>
  );
};
