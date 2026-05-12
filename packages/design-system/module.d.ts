/* eslint-disable import/no-default-export */
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

/**
 * CSS side-effect imports — both our own `*.css` (layers, tokens) and
 * `@mantine/core/styles.layer.css`. Vite handles them at build time; TS
 * needs declarations to stop TS2882.
 */
declare module '*.css';
declare module '@mantine/core/styles.css';
declare module '@mantine/core/styles.layer.css';
