# Examples

This directory contains example usage of the vite-oxc-decorator-stage-3 plugin.

## Running the Examples

1. Install dependencies in the examples directory:
   ```bash
   cd examples
   npm install
   ```

2. Link the plugin from the parent directory:
   ```bash
   npm link ..
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the displayed URL (usually http://localhost:5173)

## Files

- **`vite.config.ts`**: Vite configuration with the decorator plugin
- **`index.html`**: HTML page for the comprehensive demo
- **`example.ts`**: Simple decorator examples from the TC39 proposal
- **`comprehensive-example.ts`**: Full-featured demo showing all decorator types

## What You'll See

The comprehensive example demonstrates:

1. **Class Decorators**: Metadata attachment using `addInitializer`
2. **Method Decorators**: Logging method calls with parameter and return values
3. **Field Decorators**: Validation of initial values
4. **Auto-Accessor Decorators**: Tracking reads and writes to properties
5. **Getter Decorators**: Memoization of computed values
6. **Bound Method Decorators**: Automatic binding to instance
7. **Private Member Decorators**: Decorating private methods

All decorator calls are logged to the console, showing:
- When decorators are applied
- Method invocations
- Property accesses
- Validation results
- Cache hits/misses

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
