# Implementation Notes

## Overview

This project implements a Vite plugin for transforming TC39 Stage 3 decorators by studying the oxc transformer architecture and the TC39 decorator proposal.

## Research Phase

### 1. oxc Repository Study (v0.96.0)

**Location**: `/tmp/oxc`
**Tag**: `crates_v0.96.0`

#### Key Findings:

1. **AST Structure** (`crates/oxc_ast/src/ast/js.rs`):
   - Decorator nodes are defined in the AST
   - Decorators can be attached to classes, methods, properties, accessors
   - AST provides visitor pattern for traversal

2. **Transformer Architecture** (`crates/oxc_transformer/src/decorator/`):
   - Legacy decorator implementation exists (`decorator/legacy/`)
   - Uses the Traverse trait for AST manipulation
   - Decorators are processed in specific lifecycle hooks (enter/exit)
   - No Stage 3 implementation in v0.96.0

3. **Key Insight**: 
   - oxc v0.96.0 only implements legacy decorators
   - Stage 3 decorators require different transformation semantics
   - The architecture uses a visitor pattern with enter/exit hooks

### 2. TC39 Proposal Study

**Location**: `/tmp/proposal-decorators`

#### Key Findings from README.md:

1. **Decorator Types**:
   - Class decorators
   - Method decorators  
   - Field decorators (return initializer function)
   - Auto-accessor decorators (new feature with `accessor` keyword)
   - Getter/Setter decorators

2. **Context Object**:
   ```ts
   {
     kind: string;           // "class" | "method" | "field" | "accessor" | "getter" | "setter"
     name: string | symbol;
     access: {
       get?(): unknown;
       set?(value: unknown): void;
     };
     static?: boolean;
     private?: boolean;
     addInitializer(fn: () => void): void;
   }
   ```

3. **Evaluation Order**:
   - Decorators evaluated left-to-right, top-to-bottom
   - Called during class definition
   - Applied after all are evaluated
   - Different timing for static vs instance elements

4. **Transformation Patterns**:
   - Method decorator: `method = decorator(method, context) ?? method`
   - Field decorator: `field = initFn.call(this, initialValue)`
   - Accessor decorator: Return `{get, set, init}` object
   - Class decorator: `Class = decorator(Class, context) ?? Class`

### 3. Babel Reference Implementation

The Babel implementation (`@babel/plugin-proposal-decorators` with `version: '2023-11'`) serves as the reference implementation for TC39 Stage 3 decorators.

**Why use Babel**:
- Official reference implementation
- Tested against TC39 test262 suite
- Handles all edge cases correctly
- Maintained by TC39 participants

## Implementation Approach

Given that:
1. oxc v0.96.0 doesn't have Stage 3 decorator support
2. Babel has a mature, spec-compliant implementation
3. The goal is a practical Vite plugin

**Decision**: Use Babel's decorator plugin for the transformation, informed by the oxc and TC39 studies.

### Architecture

```
┌─────────────────┐
│  Vite Project   │
│  (with @decorators)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ vite-oxc-decorator-stage-3 │
│      (Vite Plugin)          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Babel Transform       │
│   @babel/plugin-proposal-decorators│
│   (version: '2023-11')  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ Transformed Code│
└─────────────────┘
```

### Plugin Implementation

The plugin (`src/index.ts`):

1. **File Filtering**: 
   - Include: `/\.[jt]sx?$/` by default
   - Exclude: `/node_modules/` by default
   - Quick check: Skip files without `@` symbol

2. **Transformation**:
   - Use `@babel/core` transformAsync API
   - Configure `@babel/plugin-proposal-decorators` with `version: '2023-11'`
   - Generate source maps

3. **Integration**:
   - `enforce: 'pre'` - Run before other plugins
   - Return `{ code, map }` for successful transformations
   - Return `null` for files that don't need transformation

## Lessons from oxc Study

While we use Babel for the actual transformation, studying oxc provided valuable insights:

1. **Performance Considerations**:
   - Early filtering (check for `@` before parsing)
   - Process files in parallel
   - Efficient AST traversal patterns

2. **Architecture Patterns**:
   - Visitor pattern for AST manipulation
   - Separate concerns (parsing, transformation, generation)
   - Lifecycle hooks (enter/exit)

3. **Future Improvements**:
   - When oxc adds Stage 3 support, the plugin can switch to native oxc
   - The current architecture allows easy swapping of the transformer
   - Keep the same public API

## Testing Strategy

Tests cover all decorator types from TC39 proposal:

1. **Method Decorators**: Basic transformation, context object
2. **Field Decorators**: Initializer functions
3. **Accessor Decorators**: Auto-accessor with get/set/init
4. **Class Decorators**: Class replacement, addInitializer
5. **Getter/Setter Decorators**: Individual decoration
6. **Private Members**: Private fields and methods
7. **Static Members**: Static fields and methods
8. **Multiple Decorators**: Stacking decorators
9. **addInitializer**: Timing and execution

Each test verifies:
- Successful transformation
- Presence of key code patterns
- No syntax errors in output

## Compatibility

The implementation follows the TC39 Stage 3 proposal exactly as implemented in Babel with `version: '2023-11'`, ensuring:

- Compatibility with future JavaScript standards
- Interoperability with other tools using the same spec
- Correct semantics for all decorator types
- Proper evaluation and application order

## Future Work

1. **Native oxc Support**: When oxc adds Stage 3 decorator transformation, integrate it
2. **Performance Optimization**: Benchmark and optimize for large codebases
3. **Extended Testing**: Add more complex real-world scenarios
4. **TypeScript Integration**: Better TypeScript decorator metadata support
