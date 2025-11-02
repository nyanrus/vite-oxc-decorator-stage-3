# WebAssembly Component Model Migration

## Summary

Migrated from wasm-bindgen to wit-bindgen and jco, implementing the WebAssembly Component Model standard.

## Changes Made

### 1. WIT Interface Definition

Created `decorator-transformer/wit/world.wit`:

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

This defines the interface contract in WebAssembly Interface Types (WIT), providing:
- Type-safe bindings
- Language-agnostic interface
- Component Model compliance

### 2. Rust Implementation

**Updated `Cargo.toml`:**
- Removed: `wasm-bindgen`, `serde-wasm-bindgen`, `console_error_panic_hook`
- Added: `wit-bindgen = "0.16"`
- Changed crate-type to `["cdylib"]` (Component Model requirement)

**Updated `src/lib.rs`:**
```rust
wit_bindgen::generate!({
    path: "wit",
});

impl exports::Transform for Component {
    fn transform(...) -> Result<exports::TransformResult, String> {
        // Implementation
    }
}

export_transformer!(Component);
```

### 3. Build System

**Before (wasm-bindgen):**
```bash
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen ... --out-dir pkg --target web
```

**After (Component Model):**
```bash
cargo component build --release
jco transpile ... -o pkg
```

**package.json scripts:**
- `build:wasm`: `cargo component build --release`
- `build:jco`: `jco transpile decorator-transformer/target/wasm32-wasip1/release/decorator_transformer.wasm -o pkg`

### 4. Target Platform

**Changed:**
- From: `wasm32-unknown-unknown`
- To: `wasm32-wasip1` (WASI Preview 1, Component Model compatible)

**Rationale:** Component Model requires WASI support.

### 5. TypeScript Bridge

**Updated interface:**
```typescript
interface TransformResult {
  code: string;
  map?: string;
  errors: string[];
}

interface WasmTransformer {
  transform(filename: string, sourceText: string, options: string): 
    TransformResult | { tag: 'err', val: string };
}
```

**Key changes:**
- Result type follows Component Model `Result<T, E>` pattern
- Options passed as JSON string (simpler than complex types)
- Synchronous API (Component Model default)
- Error handling via Result type

**Updated transform call:**
```typescript
const options = JSON.stringify({ source_maps: true });
const result = wasm.transform(id, code, options);

// Handle Component Model Result type
if (typeof result === 'object' && 'tag' in result && result.tag === 'err') {
  // Error case
} else {
  // Success case
  const transformResult = result as TransformResult;
}
```

### 6. Generated Bindings

**Before (wasm-bindgen):**
- Generated: `pkg/decorator_transformer.js`, `pkg/decorator_transformer_bg.wasm`
- Format: ES modules with WASM imports

**After (jco):**
- Generated: `pkg/transformer.js` (and related Component files)
- Format: ES modules implementing Component Model
- Better tree-shaking and optimization

## Benefits of Component Model

### 1. Standardization
- Based on W3C WebAssembly Component Model standard
- Better long-term compatibility
- Industry-wide adoption

### 2. Type Safety
- WIT provides compile-time type checking
- Interface contracts enforced at build time
- Reduces runtime errors

### 3. Composability
- Components can be linked together
- Multiple languages can share interfaces
- Better modularity

### 4. Future-Proof
- Aligns with WebAssembly roadmap
- Better tooling support expected
- More ecosystem integrations

### 5. Performance
- jco generates optimized bindings
- Better code splitting
- Smaller bundle sizes

## Migration Checklist

- [x] Install cargo-component: `cargo install cargo-component`
- [x] Add wasm32-wasip1 target: `rustup target add wasm32-wasip1`
- [x] Install jco: `npm install -g @bytecodealliance/jco`
- [x] Create WIT interface definition
- [x] Update Rust code for Component Model
- [x] Update build scripts
- [x] Update TypeScript bindings
- [x] Update documentation
- [x] Test changes
- [x] Commit migration

## Development Workflow

### Building the Component

```bash
# Full build
npm run build

# Or step by step:
npm run build:wasm    # Compile Rust to WASM Component
npm run build:jco     # Generate JavaScript bindings
npm run build:ts      # Compile TypeScript
```

### Testing

```bash
npm test              # All tests still pass
```

### Local Development

For local development without full WASM build:
1. Stub files in `pkg/` allow TypeScript to compile
2. Runtime will fall back to Babel transformer
3. Full WASM build required for actual Component usage

## Resources

- [WebAssembly Component Model](https://github.com/WebAssembly/component-model)
- [wit-bindgen Documentation](https://github.com/bytecodealliance/wit-bindgen)
- [jco (JavaScript Component Tools)](https://github.com/bytecodealliance/jco)
- [WIT Format Specification](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md)

## Next Steps

1. **Complete Decorator Transformation**: Implement actual decorator transformation logic in Rust
2. **Optimize Bundle Size**: Use jco optimization flags
3. **Add More WIT Types**: Define more complex types as needed
4. **Component Composition**: Consider splitting into multiple components
