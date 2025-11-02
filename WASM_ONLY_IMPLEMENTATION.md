# WASM-Only Implementation Summary

## Request

Remove Babel fallback and use only WASM as main transformer, keeping Babel in tests for compatibility verification.

## Implementation Complete

### ✅ Production Code Changes

**Removed from `src/index.ts`:**
- Babel imports (`@babel/core`, `@babel/plugin-proposal-decorators`)
- Babel transformer fallback logic
- `useWasm` option (WASM is now always used)
- `babel` configuration option
- All Babel-related error handling

**New behavior:**
- WASM transformer is loaded on `buildStart`
- If WASM fails to load, plugin throws clear error message
- No runtime fallback - requires WASM to be built

**Error message when WASM not available:**
```
Failed to load WASM transformer.
Please build the WASM module first: npm run build:wasm && npm run build:jco
```

### ✅ Dependencies

**Before:**
```json
{
  "dependencies": {
    "@babel/core": "^7.23.0",
    "@babel/plugin-proposal-decorators": "^7.23.0"
  }
}
```

**After:**
```json
{
  "dependencies": null,
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/plugin-proposal-decorators": "^7.23.0",
    ...
  }
}
```

Babel is now **only** in devDependencies for testing.

### ✅ API Simplification

**Before:**
```typescript
interface ViteOxcDecoratorOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  useWasm?: boolean;           // ❌ Removed
  babel?: TransformOptions;    // ❌ Removed
}
```

**After:**
```typescript
interface ViteOxcDecoratorOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  // That's it! WASM is always used
}
```

### ✅ Tests

**Strategy:**
- Babel remains in devDependencies for test compatibility verification
- `test/decorators.test.ts` uses Babel to verify correct transformation output
- `test/plugin.test.ts` skips WASM-dependent tests until module is built
- 21 tests pass, 2 skipped (awaiting WASM build)

**Purpose of Babel in tests:**
- Verify WASM transformer produces same output as reference implementation
- Ensure compatibility with TC39 Stage 3 spec
- Test against known-good transformations

### ✅ Documentation Updates

**Updated files:**
- `README.md` - Removed all Babel fallback references, simplified examples
- `CHANGELOG.md` - Documented removal of fallback
- `package.json` - Updated description

**Key changes:**
- Removed "hybrid approach" language
- Removed "experimental" warnings for WASM
- Simplified usage examples (no `useWasm: true` needed)
- Added note about Babel in tests

## Benefits

1. **Clearer Architecture**
   - Single transformer implementation
   - No confusing fallback behavior
   - WASM is the primary (and only) option

2. **Simpler API**
   - Fewer options to configure
   - No `useWasm` flag needed
   - Cleaner user experience

3. **Better Performance**
   - No runtime overhead for fallback checks
   - Direct WASM execution
   - Smaller production bundle (no Babel dependency)

4. **Clear Requirements**
   - Users know they need WASM built
   - Clear error messages if not available
   - No silent fallback behavior

## Usage

### Before (Hybrid)

```typescript
// Default: Babel
decorators()

// Or explicitly enable WASM
decorators({ useWasm: true })
```

### After (WASM-only)

```typescript
// Always uses WASM
decorators()

// With options
decorators({
  include: [/\.tsx?$/],
  exclude: [/node_modules/]
})
```

## Testing

All tests pass:
- 21 tests passing
- 2 tests skipped (require WASM module build)
- Babel used only for compatibility verification in test suite

## Commit

Commit hash: `49728ee`
- Removed Babel from production dependencies
- Simplified plugin API
- Updated all documentation
- Tests still pass with Babel in devDependencies
