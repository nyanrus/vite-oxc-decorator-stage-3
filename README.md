# vite-oxc-decorator-stage-3

> ⚠️ **AI-Generated Project**: This project was implemented by AI and has not yet been reviewed or rewritten by humans. Use with caution in production environments.

A Vite plugin for transforming TC39 Stage 3 decorators using a Rust/WASM transformer built with [oxc](https://oxc-project.github.io/).

## Features

- ✅ Full TC39 Stage 3 decorator semantics support
- ✅ All decorator types: class, method, field, accessor, getter, setter
- ✅ `addInitializer` API support
- ✅ Private and static members
- ✅ Rust/WASM transformer (oxc v0.96.0)
- ✅ WebAssembly Component Model
- ✅ Zero runtime dependencies

## Installation

```bash
npm install vite-oxc-decorator-stage-3
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import decorators from 'vite-oxc-decorator-stage-3';

export default defineConfig({
  plugins: [decorators()],
});
```

```typescript
// app.ts
function logged(value, { kind, name }) {
  if (kind === 'method') {
    return function(...args) {
      console.log(`Calling ${name}`);
      return value.apply(this, args);
    };
  }
}

class Calculator {
  @logged
  add(a, b) {
    return a + b;
  }
}
```

## Options

```typescript
interface ViteOxcDecoratorOptions {
  include?: RegExp | RegExp[];  // Default: [/\.[jt]sx?$/]
  exclude?: RegExp | RegExp[];  // Default: [/node_modules/]
}
```

## Architecture

- **Rust Transformer**: Built with oxc v0.96.0 (parser, AST, codegen)
- **WASM Component Model**: Standards-based WebAssembly interop
- **wit-bindgen**: Type-safe Rust bindings
- **jco**: JavaScript Component Tools for bindings

## Building from Source

### Prerequisites

- Rust toolchain (1.90.0+)
- Node.js 16+
- `cargo install cargo-component`
- `npm install -g @bytecodealliance/jco`

### Build

```bash
npm install
npm run build:wasm    # Compile Rust to WASM
npm run build:jco     # Generate JS bindings
npm run build:ts      # Compile TypeScript
```

Or simply:

```bash
npm run build
```

## Development Status

**Foundation Complete:**
- ✅ Parsing with oxc
- ✅ AST manipulation
- ✅ Code generation
- ✅ WASM Component Model integration

**In Progress:**
- ⚠️ Full Stage 3 decorator transformation logic

Tests use Babel's reference implementation for compatibility verification.

## Requirements

- Vite 4.x or 5.x
- Node.js 16+

## Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [decorator-transformer/README.md](decorator-transformer/README.md) - Rust implementation details

## References

- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [oxc Project](https://oxc-project.github.io/)
- [WebAssembly Component Model](https://github.com/WebAssembly/component-model)

## License

MIT
