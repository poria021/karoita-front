import type { Preview, ReactRenderer } from '@storybook/nextjs-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { Direction } from 'radix-ui';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vazirmatn } from '@/lib/vazirmatn-font';

import '../src/app/globals.css';

faConfig.autoAddCss = false;

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    nextjs: {
      appDirectory: true,
    },
    options: {
      storySort: {
        order: [
          'Design System',
          [
            'Actions',
            'Fields',
            'Feedback',
            'Typography',
            'Layout',
            'Data Display',
            'Overlays',
          ],
        ],
      },
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    (Story) => (
      <Direction.Provider dir="rtl">
        <TooltipProvider delayDuration={200}>
          <div
            lang="fa"
            dir="rtl"
            className={`${vazirmatn.variable} font-sans antialiased bg-kv-canvas text-kv-text p-kv-section`}
          >
            <Story />
          </div>
        </TooltipProvider>
      </Direction.Provider>
    ),
  ],
};

export default preview;
