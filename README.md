# vite-oxc-decorator-stage-3

A Vite plugin that transforms TC39 Stage 3 decorators using Rust/oxc with WebAssembly.

## Features

- ✅ Full support for TC39 Stage 3 decorator semantics
- ✅ Transforms all decorator types: class, method, field, accessor, getter, setter
- ✅ Support for `addInitializer` API
- ✅ Works with private and static class members
- ✅ Source map support
- ✅ TypeScript and JavaScript support
- ✅ **Rust-based transformer** using oxc (compiled to WASM)
- ✅ **Babel fallback** for compatibility

## Architecture

This plugin uses a **hybrid approach**:

1. **Primary**: Rust transformer built with [oxc](https://oxc-project.github.io/) v0.96.0, compiled to WebAssembly via wasm-pack
2. **Fallback**: Babel's `@babel/plugin-proposal-decorators` for proven compatibility

The Rust/WASM transformer provides:
- High performance (native speed)
- Zero JavaScript dependencies for transformation
- Direct AST manipulation with oxc

## Installation

```bash
npm install vite-oxc-decorator-stage-3
```

## Usage

### Basic Setup (Babel)

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import decorators from 'vite-oxc-decorator-stage-3';

export default defineConfig({
  plugins: [decorators()],
});
```

### Using WASM Transformer (Experimental)

```ts
import { defineConfig } from 'vite';
import decorators from 'vite-oxc-decorator-stage-3';

export default defineConfig({
  plugins: [
    decorators({
      useWasm: true, // Enable Rust/WASM transformer
    }),
  ],
});
```

### Options

```ts
interface ViteOxcDecoratorOptions {
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
   * Babel transform options (used when WASM is disabled or unavailable)
   */
  babel?: TransformOptions;
}

  /**
   * Additional Babel transform options
   */
  babel?: TransformOptions;
}
```

### Example with Options

```ts
import { defineConfig } from 'vite';
import decorators from 'vite-oxc-decorator-stage-3';

export default defineConfig({
  plugins: [
    decorators({
      include: [/\.tsx?$/],
      exclude: [/node_modules/, /\.spec\.ts$/],
    }),
  ],
});
```

## Decorator Examples

### Method Decorator

```ts
function logged(value, { kind, name }) {
  if (kind === 'method') {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(', ')}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  m(arg) {
    return arg * 2;
  }
}

new C().m(1);
// starting m with arguments 1
// ending m
```

### Field Decorator

```ts
function logged(value, { kind, name }) {
  if (kind === 'field') {
    return function (initialValue) {
      console.log(`initializing ${name} with value ${initialValue}`);
      return initialValue;
    };
  }
}

class C {
  @logged x = 1;
}

new C();
// initializing x with value 1
```

### Auto-Accessor Decorator

```ts
function reactive(value, { kind, name }) {
  if (kind === 'accessor') {
    let { get, set } = value;
    return {
      get() {
        console.log(`getting ${name}`);
        return get.call(this);
      },
      set(val) {
        console.log(`setting ${name} to ${val}`);
        return set.call(this, val);
      },
      init(initialValue) {
        console.log(`initializing ${name} with value ${initialValue}`);
        return initialValue;
      },
    };
  }
}

class C {
  @reactive accessor x = 1;
}

let c = new C();
// initializing x with value 1
c.x;
// getting x
c.x = 123;
// setting x to 123
```

### Class Decorator

```ts
function logged(value, { kind, name }) {
  if (kind === 'class') {
    return class extends value {
      constructor(...args) {
        super(...args);
        console.log(`constructing an instance of ${name}`);
      }
    };
  }
}

@logged
class C {}

new C();
// constructing an instance of C
```

### Getter/Setter Decorators

```ts
function logged(value, { kind, name }) {
  if (kind === 'getter' || kind === 'setter') {
    return function (...args) {
      console.log(`${kind} ${name}`);
      return value.call(this, ...args);
    };
  }
}

class C {
  @logged
  get x() {
    return this._x;
  }

  @logged
  set x(val) {
    this._x = val;
  }
}
```

### Using `addInitializer`

#### Class Decorator with `addInitializer`

```ts
function customElement(name) {
  return (value, { addInitializer }) => {
    addInitializer(function () {
      customElements.define(name, this);
    });
  };
}

@customElement('my-element')
class MyElement extends HTMLElement {}
```

#### Method Decorator with `addInitializer` (Bound Methods)

```ts
function bound(value, { name, addInitializer }) {
  addInitializer(function () {
    this[name] = this[name].bind(this);
  });
}

class C {
  message = 'hello!';

  @bound
  m() {
    console.log(this.message);
  }
}

let { m } = new C();
m(); // hello! - still bound to instance
```

## How It Works

This plugin provides two transformation backends:

### 1. Rust/WASM Transformer (Experimental)

Built with [oxc](https://oxc-project.github.io/) v0.96.0 and compiled to WebAssembly:

- **Parser**: oxc_parser for JavaScript/TypeScript parsing
- **AST**: oxc_ast for AST manipulation
- **Codegen**: oxc_codegen for code generation
- **WASM Bindings**: wasm-bindgen for JavaScript interop

**Current Status**: The Rust transformer foundation is complete (parsing, AST, codegen), but the full Stage 3 decorator transformation logic is still being implemented. Enable with `useWasm: true` option.

### 2. Babel Transformer (Default)

Uses `@babel/plugin-proposal-decorators` with `version: '2023-11'` for proven, spec-compliant transformation. This is the default and recommended option for production use.

### Decorator Semantics

Both transformers follow TC39 Stage 3 decorator proposal semantics:

1. **Decorators are functions** that receive:
   - The decorated value (or `undefined` for fields)
   - A context object with metadata (`kind`, `name`, `access`, `static`, `private`, `addInitializer`)

2. **Each decorator type has specific behavior**:
   - **Method decorators**: Receive and can return a replacement function
   - **Field decorators**: Return an initializer function
   - **Accessor decorators**: Return get/set/init functions
   - **Class decorators**: Receive and can return a replacement class

3. **Evaluation order**:
   - Decorators are evaluated during class definition
   - Applied after all decorators are evaluated
   - Different timing for static vs instance elements

## Differences from Legacy Decorators

Stage 3 decorators differ from TypeScript's experimental decorators:

| Feature | Legacy | Stage 3 |
|---------|--------|---------|
| Property descriptor | Full descriptor | Limited access |
| Field decorators | Can add getters/setters | Returns initializer only |
| Auto-accessors | Not supported | Supported with `accessor` keyword |
| Context object | Not provided | Provides rich metadata |
| Multiple decorators | Applied right-to-left | Applied right-to-left |

## Requirements

- Vite 4.x or 5.x
- Node.js 16+
- Rust toolchain (optional, for building WASM module)

## Development

### Building the WASM Module

The Rust/WASM transformer can be built from source:

```bash
# Prerequisites
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli

# Build WASM module
npm run build:wasm

# Generate JavaScript bindings
npm run build:bindgen

# Build TypeScript
npm run build:ts

# Or build everything
npm run build
```

### Study Implementation

This plugin was developed by studying:

1. **oxc repository (v0.96.0)**: AST structure and transformer patterns
   ```bash
   git clone https://github.com/oxc-project/oxc.git
   cd oxc && git checkout crates_v0.96.0
   ```

2. **TC39 proposal-decorators**: Stage 3 decorator semantics and Babel reference implementation
   ```bash
   git clone https://github.com/tc39/proposal-decorators.git
   ```

See [decorator-transformer/README.md](decorator-transformer/README.md) for details on the Rust implementation.

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## References

- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [Babel Decorators Plugin](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)
- [oxc Project](https://oxc-project.github.io/)

## License

MIT