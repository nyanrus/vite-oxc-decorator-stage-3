import type { Plugin } from 'vite';
import { transformAsync } from '@babel/core';
// @ts-expect-error - Babel plugin types
import decoratorsPlugin from '@babel/plugin-proposal-decorators';

export interface ViteOxcDecoratorOptions {
  /**
   * Include files matching these patterns.
   * @default [/\.[jt]sx?$/]
   */
  include?: RegExp | RegExp[];

  /**
   * Exclude files matching these patterns.
   * @default [/node_modules/]
   */
  exclude?: RegExp | RegExp[];
}

/**
 * Vite plugin for transforming Stage 3 decorators using Babel
 * 
 * This plugin uses Babel's @babel/plugin-proposal-decorators to transform
 * decorators following the TC39 Stage 3 proposal semantics.
 * 
 * @example
 * ```ts
 * import { defineConfig } from 'vite';
 * import decorators from 'vite-oxc-decorator-stage-3';
 * 
 * export default defineConfig({
 *   plugins: [decorators()],
 * });
 * ```
 */
export default function viteOxcDecoratorStage3(
  options: ViteOxcDecoratorOptions = {}
): Plugin {
  const {
    include = [/\.[jt]sx?$/],
    exclude = [/node_modules/],
  } = options;

  const includePatterns = Array.isArray(include) ? include : [include];
  const excludePatterns = Array.isArray(exclude) ? exclude : [exclude];

  const shouldTransform = (id: string): boolean => {
    // Check exclude patterns first
    if (excludePatterns.some((pattern) => pattern.test(id))) {
      return false;
    }
    // Check include patterns
    return includePatterns.some((pattern) => pattern.test(id));
  };

  return {
    name: 'vite-oxc-decorator-stage-3',

    enforce: 'pre', // Run before other plugins

    async transform(code: string, id: string) {
      if (!shouldTransform(id)) {
        return null;
      }

      // Check if code contains decorators
      if (!code.includes('@')) {
        return null;
      }

      try {
        // Transform using Babel with Stage 3 decorators
        const result = await transformAsync(code, {
          filename: id,
          plugins: [[decoratorsPlugin, { version: '2023-11' }]],
          sourceMaps: true,
          configFile: false,
          babelrc: false,
        });

        if (!result || !result.code) {
          return null;
        }

        return {
          code: result.code,
          map: result.map,
        };
      } catch (error) {
        // Re-throw with better context
        if (error instanceof Error) {
          throw new Error(`Failed to transform decorators in ${id}: ${error.message}`);
        }
        throw error;
      }
    },
  };
}
