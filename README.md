# vite-oxc-decorator-stage-3

> ⚠️ **AI-Generated Project**: This project was implemented by AI and has not yet been reviewed or rewritten by humans. Use with caution in production environments.

A Vite plugin for transforming TC39 Stage 3 decorators using Rust/WASM (oxc v0.96.0).

## Features

- Full TC39 Stage 3 decorator semantics (class, method, field, accessor, getter, setter)
- `addInitializer` API support with private and static members
- Rust/WASM transformer with zero runtime dependencies

## Build

```bash
npm install
npm run build
```
copy pkg/ and dist/ and use dist/index.js as vite plugin

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import decorators from 'vite-oxc-decorator-stage-3';

export default defineConfig({
  plugins: [decorators()],
});
```

## Options

```typescript
interface ViteOxcDecoratorOptions {
  include?: RegExp | RegExp[];  // Default: [/\.[jt]sx?$/]
  exclude?: RegExp | RegExp[];  // Default: [/node_modules/]
}
```

## License

MIT
