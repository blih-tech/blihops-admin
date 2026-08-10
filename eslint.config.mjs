import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Agent skill scripts are not project code:
    '.agents/**',
    // Tiptap template source is vendored third-party code:
    'src/components/tiptap-extension/**',
    'src/components/tiptap-icons/**',
    'src/components/tiptap-node/**',
    'src/components/tiptap-templates/**',
    'src/components/tiptap-ui/**',
    'src/components/tiptap-ui-primitive/**',
    'src/hooks/use-cursor-visibility.ts',
    'src/hooks/use-element-rect.ts',
    'src/hooks/use-is-breakpoint.ts',
    'src/hooks/use-menu-navigation.ts',
    'src/hooks/use-throttled-callback.ts',
    'src/hooks/use-tiptap-editor.ts',
    'src/hooks/use-unmount.ts',
    'src/lib/tiptap-utils.ts',
  ]),
]);

export default eslintConfig;
