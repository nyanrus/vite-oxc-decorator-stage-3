# Decorator Transformer (Rust/WASM Component Model)

This is a Rust-based transformer for TC39 Stage 3 decorators, built with oxc and compiled to WebAssembly using the Component Model.

## Building

### Prerequisites

- Rust toolchain (1.90.0 or later)
- wasm32-wasi target: `rustup target add wasm32-wasi`
- cargo-component: `cargo install cargo-component`
- jco (JavaScript Component Tools): `npm install -g @bytecodealliance/jco`

### Build Steps

```bash
# Build the WASM Component
cargo component build --release

# Generate JavaScript bindings using jco
jco transpile target/wasm32-wasi/release/decorator_transformer.wasm -o ../pkg
```

Or use the npm scripts from the root directory:

```bash
npm run build:wasm
npm run build:jco
```

## Architecture

This transformer uses:
- **oxc v0.96.0** for parsing, AST manipulation, and code generation
- **wit-bindgen** for WebAssembly Component Model bindings
- **jco** for generating JavaScript bindings from the Component

### WIT Interface

The transformer exposes a simple interface defined in `wit/world.wit`:

```wit
package decorator:transformer;

world transformer {
  export transform: func(filename: string, source-text: string, options: string) -> result<transform-result, string>;
}

record transform-result {
  code: string,
  map: option<string>,
  errors: list<string>,
}
```

## Current Status

**Note**: This is the foundation for a Rust/WASM Component Model-based transformer. The current implementation:
- ✅ Parses code using oxc
- ✅ Generates code from AST
- ✅ Exports Component Model interface
- ✅ Uses wit-bindgen for Rust bindings
- ⚠️  Does not yet transform decorators (passes through as-is)

The full Stage 3 decorator transformation logic needs to be implemented in Rust. For production use, the plugin falls back to Babel's proven implementation.

## Future Work

To complete the Rust transformer:

1. **AST Walking**: Implement visitor to find decorator nodes
2. **Context Object**: Build decorator context (kind, name, access, etc.)
3. **Transformation Logic**: 
   - Method decorators → function wrapping
   - Field decorators → initializer injection
   - Accessor decorators → get/set replacement
   - Class decorators → class wrapping
4. **addInitializer**: Track and inject initializers
5. **Evaluation Order**: Ensure correct decorator evaluation sequence

## References

- [oxc Documentation](https://oxc-project.github.io/)
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [WebAssembly Component Model](https://github.com/WebAssembly/component-model)
- [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen)
- [jco (JavaScript Component Tools)](https://github.com/bytecodealliance/jco)
