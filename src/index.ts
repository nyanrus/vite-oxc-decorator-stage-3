import type { Plugin } from 'vite';
import { transformAsync, type TransformOptions } from '@babel/core';
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

  /**
   * Use WASM transformer (experimental)
   * Falls back to Babel if WASM is not available
   * @default false
   */
  useWasm?: boolean;

  /**
   * Babel transform options (used when WASM is not available or disabled)
   */
  babel?: TransformOptions;
}

// Type for WASM Component Model transformer (jco-generated)
interface TransformResult {
  code: string;
  map?: string;
  errors: string[];
}

interface WasmTransformer {
  transform(filename: string, sourceText: string, options: string): TransformResult | { tag: 'err', val: string };
}

let wasmTransformer: WasmTransformer | null = null;

/**
 * Load the WASM transformer module (jco-generated)
 */
async function loadWasmTransformer(): Promise<WasmTransformer | null> {
  if (wasmTransformer) {
    return wasmTransformer;
  }

  try {
    // Try to load the jco-generated WASM Component
    const wasm = await import('../pkg/transformer.js');
    wasmTransformer = wasm as unknown as WasmTransformer;
    return wasmTransformer;
  } catch (e) {
    // WASM module not available, will fall back to Babel
    console.warn('WASM transformer not available, falling back to Babel');
    return null;
  }
}

/**
 * Vite plugin for transforming Stage 3 decorators
 * 
 * This plugin can use either:
 * - Rust/WASM Component Model transformer built with oxc (experimental, set useWasm: true)
 * - Babel's decorator plugin (default, proven implementation)
 * 
 * Both follow the TC39 Stage 3 proposal semantics.
 * 
 * @example
 * ```ts
 * import { defineConfig } from 'vite';
 * import decorators from 'vite-oxc-decorator-stage-3';
 * 
 * export default defineConfig({
 *   plugins: [
 *     decorators({ useWasm: true }) // Use experimental WASM transformer
 *   ],
 * });
 * ```
 */
export default function viteOxcDecoratorStage3(
  options: ViteOxcDecoratorOptions = {}
): Plugin {
  const {
    include = [/\.[jt]sx?$/],
    exclude = [/node_modules/],
    useWasm = false,
    babel = {},
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

  let wasmInit: Promise<WasmTransformer | null> | null = null;

  return {
    name: 'vite-oxc-decorator-stage-3',

    enforce: 'pre', // Run before other plugins

    async buildStart() {
      // Initialize WASM if requested
      if (useWasm && !wasmInit) {
        wasmInit = loadWasmTransformer();
      }
    },

    async transform(code: string, id: string) {
      if (!shouldTransform(id)) {
        return null;
      }

      // Check if code contains decorators
      if (!code.includes('@')) {
        return null;
      }

      // Try WASM transformer if enabled
      if (useWasm && wasmInit) {
        const wasm = await wasmInit;
        if (wasm) {
          try {
            // Call Component Model transform function
            const options = JSON.stringify({ source_maps: true });
            const result = wasm.transform(id, code, options);
            
            // Check if result is an error (Component Model Result type)
            if (typeof result === 'object' && 'tag' in result && result.tag === 'err') {
              console.error(`WASM transformer error in ${id}:`, result.val);
              // Fall through to Babel
            } else {
              const transformResult = result as TransformResult;
              if (transformResult.errors.length > 0) {
                console.error(`WASM transformer errors in ${id}:`, transformResult.errors);
                // Fall through to Babel
              } else {
                return {
                  code: transformResult.code,
                  map: transformResult.map ? JSON.parse(transformResult.map) : null,
                };
              }
            }
          } catch (error) {
            console.warn(`WASM transformer failed for ${id}, falling back to Babel:`, error);
            // Fall through to Babel
          }
        }
      }

      // Use Babel transformer (default or fallback)
      try {
        const result = await transformAsync(code, {
          filename: id,
          sourceMaps: true,
          sourceFileName: id,
          plugins: [
            [
              decoratorsPlugin,
              {
                version: '2023-11', // Stage 3 decorators
              },
            ],
          ],
          ...babel,
        });

        if (!result || !result.code) {
          return null;
        }

        return {
          code: result.code,
          map: result.map,
        };
      } catch (error) {
        // If transformation fails, let other plugins handle it
        console.error(`Failed to transform decorators in ${id}:`, error);
        throw error;
      }
    },
  };
}
