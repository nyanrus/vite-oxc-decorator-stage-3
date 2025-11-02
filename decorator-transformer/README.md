# Decorator Transformer (Rust/WASM)

This is a Rust-based transformer for TC39 Stage 3 decorators, built with oxc and compiled to WebAssembly.

## Building

### Prerequisites

- Rust toolchain (1.90.0 or later)
- wasm32-unknown-unknown target: `rustup target add wasm32-unknown-unknown`
- wasm-bindgen-cli: `cargo install wasm-bindgen-cli`

### Build Steps

```bash
# Build the WASM module
cargo build --target wasm32-unknown-unknown --release

# Generate JavaScript bindings
wasm-bindgen target/wasm32-unknown-unknown/release/decorator_transformer.wasm \
  --out-dir ../pkg \
  --target web
```

Or use the npm scripts from the root directory:

```bash
npm run build:wasm
npm run build:bindgen
```

## Architecture

This transformer uses oxc v0.96.0 for:
- Parsing JavaScript/TypeScript with decorators
- AST manipulation and traversal
- Code generation

## Current Status

**Note**: This is the foundation for a Rust/WASM-based transformer. The current implementation:
- ✅ Parses code using oxc
- ✅ Generates code from AST
- ✅ Exports WASM bindings
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
- [wasm-bindgen Guide](https://rustwasm.github.io/docs/wasm-bindgen/)
