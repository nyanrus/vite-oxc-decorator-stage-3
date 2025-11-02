# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Vite Build Process                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         vite-oxc-decorator-stage-3 Plugin                   │
│                  (TypeScript Bridge)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. File Filtering                                  │    │
│  │     - Include: /\.[jt]sx?$/                        │    │
│  │     - Exclude: /node_modules/                      │    │
│  │     - Quick check: code.includes('@')              │    │
│  └────────────────────────────────────────────────────┘    │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. Transformer Selection                          │    │
│  │     - If useWasm: true → Try WASM                  │    │
│  │     - Else → Use Babel                             │    │
│  └────────────────────────────────────────────────────┘    │
│                     │                                        │
│         ┌───────────┴───────────┐                          │
│         ▼                       ▼                          │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │ WASM Path    │        │ Babel Path   │                 │
│  │ (Experimental)│        │ (Default)    │                 │
│  └──────────────┘        └──────────────┘                 │
└──────┬──────────────────────────┬─────────────────────────┘
       │                          │
       ▼                          ▼
┌─────────────────┐      ┌───────────────────┐
│ Rust/WASM       │      │ Babel Transformer │
│ Transformer     │      │                   │
│                 │      │ @babel/plugin-    │
│ Built with oxc: │      │ proposal-         │
│ - oxc_parser    │      │ decorators        │
│ - oxc_ast       │      │                   │
│ - oxc_codegen   │      │ version: 2023-11  │
│                 │      │ (Stage 3)         │
│ Status:         │      │                   │
│ ✅ Foundation   │      │ Status:           │
│ ⚠️  Transform   │      │ ✅ Production     │
│    (in progress)│      │                   │
└────────┬────────┘      └─────────┬─────────┘
         │                         │
         │  On Error               │
         └────────►────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │ Fallback      │
         │ Always uses   │
         │ Babel if WASM │
         │ fails         │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────────┐
         │ Transformed Code  │
         │ + Source Maps     │
         └───────────────────┘
```

## Component Details

### 1. TypeScript Bridge (`src/index.ts`)

**Responsibilities**:
- File filtering and validation
- Transformer selection and loading
- Error handling and fallback logic
- Source map handling

**Key Features**:
- Async WASM module loading
- Graceful degradation
- Compatible with existing Vite plugins

### 2. Rust/WASM Transformer (`decorator-transformer/`)

**Components**:
- `Cargo.toml` - Dependencies (oxc v0.96.0, wit-bindgen)
- `src/lib.rs` - Transformer implementation

**Capabilities**:
- Parse JS/TS with decorators
- Manipulate AST
- Generate transformed code
- Return results to JavaScript

**Current State**:
- ✅ Parsing working
- ✅ Code generation working
- ✅ WASM bindings working
- ⚠️  Decorator transformation in progress

### 3. Babel Transformer (Fallback)

**Purpose**:
- Production-ready transformation
- Fallback when WASM unavailable
- Reference implementation for testing

**Configuration**:
```javascript
{
  plugins: [
    ['@babel/plugin-proposal-decorators', {
      version: '2023-11'  // Stage 3 semantics
    }]
  ]
}
```

## Data Flow

### Input
```javascript
class Example {
  @logged
  method() {
    return 42;
  }
}
```

### WASM Transformer Flow
1. Parse → `oxc_parser::Parser::new()`
2. Transform → (To be implemented)
3. Generate → `oxc_codegen::Codegen::build()`

### Output
```javascript
// Transformed with decorator logic applied
// (Currently: pass-through from WASM, transformed from Babel)
```

## Configuration Options

```typescript
interface ViteOxcDecoratorOptions {
  include?: RegExp | RegExp[];    // File patterns to transform
  exclude?: RegExp | RegExp[];    // File patterns to skip
  useWasm?: boolean;              // Enable WASM transformer
  babel?: TransformOptions;       // Babel options (fallback)
}
```

## Build Pipeline

```
1. Rust Compilation
   cargo build --target wasm32-unknown-unknown --release
   
2. WASM Binding Generation
   wit-bindgen ... --out-dir pkg --target web
   
3. TypeScript Compilation
   tsc
   
4. Result
   dist/index.js  (Plugin)
   pkg/*          (WASM bindings)
```

## Performance Characteristics

| Aspect | WASM (When Complete) | Babel |
|--------|---------------------|-------|
| Speed | Native (Rust) | JavaScript |
| Size | ~500KB WASM bundle | npm dependencies |
| Startup | Module load | npm require |
| Transform | Compiled code | Interpreted |
| Fallback | Babel | N/A |

## Future Enhancements

1. **Complete WASM Transformer**
   - Implement full decorator transformation
   - Match TC39 Stage 3 spec exactly
   - Add comprehensive tests

2. **Optimization**
   - Reduce WASM bundle size
   - Lazy loading of WASM module
   - Caching transformed results

3. **Features**
   - Source map improvements
   - Better error messages
   - Performance benchmarks

## Testing Strategy

Current: All tests use Babel transformer (23/23 passing)

Future: 
- Dual testing (WASM + Babel)
- Output comparison
- Performance benchmarks
- Memory usage profiling
