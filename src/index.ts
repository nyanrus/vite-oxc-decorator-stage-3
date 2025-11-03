import type { Plugin } from 'vite';
import { transformAsync } from '@babel/core';
// @ts-expect-error - Babel plugin types
import decoratorsPlugin from '@babel/plugin-proposal-decorators';
// @ts-expect-error - Babel preset types
import typescriptPreset from '@babel/preset-typescript';

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
let wasmAvailable: boolean | null = null;

/**
 * Try to load the WASM transformer module (jco-generated)
 * Returns null if WASM is not available (not built yet)
 */
async function tryLoadWasmTransformer(): Promise<WasmTransformer | null> {
  if (wasmAvailable === false) {
    return null;
  }

  if (wasmTransformer) {
    return wasmTransformer;
  }

  try {
    // Load the jco-generated WASM Component
    // @ts-expect-error - WASM module may not be built yet
    const wasm = await import('../pkg/decorator_transformer.js');
    wasmTransformer = wasm as unknown as WasmTransformer;
    wasmAvailable = true;
    return wasmTransformer;
  } catch (e) {
    // WASM not available, will use Babel fallback
    wasmAvailable = false;
    return null;
  }
}

/**
 * Transform code using Babel (fallback transformer)
 */
async function transformWithBabel(code: string, id: string): Promise<{ code: string; map: any } | null> {
  // Determine if file is TypeScript
  const isTypeScript = /\.[mc]?tsx?$/.test(id);
  
  const result = await transformAsync(code, {
    filename: id,
    presets: isTypeScript ? [[typescriptPreset, { onlyRemoveTypeImports: true }]] : [],
    plugins: [[decoratorsPlugin, { version: '2023-11' }]],
    sourceMaps: true,
  });

  if (!result || !result.code) {
    return null;
  }

  return {
    code: result.code,
    map: result.map,
  };
}

/**
 * Vite plugin for transforming Stage 3 decorators using oxc WASM transformer
 * 
 * This plugin uses a Rust/WASM Component Model transformer built with oxc
 * to transform decorators following the TC39 Stage 3 proposal semantics.
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

  let wasmInit: Promise<WasmTransformer | null> | null = null;

  return {
    name: 'vite-oxc-decorator-stage-3',

    enforce: 'pre', // Run before other plugins

    async buildStart() {
      // Try to initialize WASM transformer
      if (!wasmInit) {
        wasmInit = tryLoadWasmTransformer();
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

      // Try to load WASM transformer first
      const wasm = await wasmInit;
      
      if (wasm) {
        // Use WASM transformer if available
        try {
          // Call Component Model transform function
          const options = JSON.stringify({ source_maps: true });
          const result = wasm.transform(id, code, options);
          
          // Check if result is an error (Component Model Result type)
          if (typeof result === 'object' && 'tag' in result && result.tag === 'err') {
            throw new Error(`WASM transformer error in ${id}: ${result.val}`);
          }
          
          const transformResult = result as TransformResult;
          
          // Check for transformation errors
          if (transformResult.errors.length > 0) {
            throw new Error(
              `WASM transformer errors in ${id}:\n${transformResult.errors.join('\n')}`
            );
          }
          
          return {
            code: transformResult.code,
            map: transformResult.map ? JSON.parse(transformResult.map) : null,
          };
        } catch (error) {
          // Re-throw with better context
          if (error instanceof Error) {
            throw new Error(`Failed to transform decorators in ${id}: ${error.message}`);
          }
          throw error;
        }
      } else {
        // Use Babel fallback if WASM is not available
        try {
          return await transformWithBabel(code, id);
        } catch (error) {
          // Re-throw with better context
          if (error instanceof Error) {
            throw new Error(`Failed to transform decorators in ${id}: ${error.message}`);
          }
          throw error;
        }
      }
    },
  };
}
