import type { StorybookConfig } from '@storybook/nextjs-vite';

/**
 * Karvita design-system Storybook — only `Kv*` shared UI stories.
 * Feature pages / auth / API-bound modules stay out on purpose.
 */
const config: StorybookConfig = {
  stories: ['../src/components/shared/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
