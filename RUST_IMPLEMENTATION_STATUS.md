# Rust Decorator Transformer Implementation Status

> ⚠️ **AI-Generated Implementation**: This transformer was implemented by AI based on TC39 Stage 3 specification and oxc documentation.

## What Was Implemented

### ✅ Transformer Foundation (Complete)

**File Structure:**
- `src/lib.rs` - Main entry point with transform function
- `src/transformer.rs` - Decorator transformer using oxc Traverse trait
- `wit/world.wit` - WebAssembly Component Model interface definition
- `Cargo.toml` - Dependencies configuration

**Core Components:**
1. **AST Parsing**: Uses oxc_parser to parse JavaScript/TypeScript with decorators
2. **AST Traversal**: Implements oxc_traverse::Traverse trait to visit decorator nodes
3. **Decorator Detection**: Identifies all decorator types (class, method, field, accessor)
4. **Context Structure**: Documents TC39 Stage 3 context object structure
5. **Error Handling**: Collects and reports transformation errors

**Decorator Types Recognized:**
- ✅ Class decorators
- ✅ Method decorators
- ✅ Field decorators  
- ✅ Accessor decorators
- ✅ Getter/setter decorators
- ✅ Static and private member decorators

### ⚠️ Full Transformation Logic (Not Complete)

**What's Missing:**

The transformer currently **detects** decorators but does not **generate** the transformed AST. Full implementation requires:

1. **AST Node Generation**: Creating new AST nodes for:
   - IIFE wrapping class declarations
   - Decorator evaluation arrays
   - Context object literals
   - addInitializer function implementations
   - Initializer storage and execution logic

2. **Helper Function Injection**: Generating runtime helper functions:
   - `applyDecs()` - Applies decorators in correct order
   - `applyMemberDecs()` - Handles member decorators
   - Context object factory functions
   - Initializer runner functions

3. **Code Generation**: Transforming:
   ```javascript
   @logged
   class C {
     @bound method() {}
   }
   ```
   
   Into:
   ```javascript
   let C = (() => {
     class C { method() {} }
     const memberDecs = [{ kind: "method", key: "method", decorators: [bound] }];
     const classDecs = [logged];
     C = applyDecs(C, memberDecs, classDecs);
     return C;
   })();
   ```

4. **Evaluation Order**: Ensuring correct decorator evaluation:
   - Static members before instance members
   - Fields before methods
   - Methods before accessors
   - Member decorators before class decorators

5. **Initializer Timing**: Proper timing for:
   - Static initializers (run during class evaluation)
   - Instance initializers (run during construction)
   - Extra initializers from addInitializer()

## Why This Is Complex

### Chal Difficulty

1. **oxc AST Builder Complexity**:
   - oxc's AstBuilder requires careful lifetime management
   - Each AST node type has specific construction requirements
   - Complex nesting of expressions, statements, and declarations

2. **TC39 Specification**:
   - ~100 pages of transformation rules
   - Different semantics for each decorator type
   - Subtle timing and ordering requirements

3. **Runtime Helpers**:
   - Need to inject helper functions into every transformed module
   - Helpers must handle edge cases (private fields, symbols, etc.)
   - Must match Babel's proven implementation exactly

### Estimated Effort

- **Detected decorators**: ✅ Complete (current state)
- **Generate simple transformations**: ~40 hours
- **Handle all edge cases**: ~80 hours
- **Match Babel parity**: ~120+ hours

## Current Approach

### Production Use

The plugin currently uses **Babel** for transformation:
- Proven, spec-compliant implementation
- All tests passing
- Production-ready

### Rust Implementation

Provides:
- **Foundation**: Parsing, traversal, detection working
- **Documentation**: Complete TC39 Stage 3 semantics documented in code
- **Architecture**: Proper structure for future completion
- **Learning Resource**: Shows how oxc transformers work

## Testing

### Rust Tests

```bash
cd decorator-transformer
cargo test
```

Tests verify:
- Decorator detection (class, method, field, accessor)
- AST parsing with decorators enabled
- Transformer creation and configuration

### Integration Tests

```bash
npm test
```

Tests use Babel for transformation and verify:
- All decorator types work correctly
- Stage 3 semantics are followed
- Output matches TC39 spec

## Path Forward

### Option 1: Complete Rust Implementation

**Pros:**
- Native performance
- Zero JavaScript dependencies
- Educational value

**Cons:**
- 120+ hours of complex AST generation
- Risk of subtle bugs vs Babel
- Maintenance burden

### Option 2: Keep Babel (Current)

**Pros:**
- Production-ready now
- Proven correctness
- Well-maintained

**Cons:**
- JavaScript dependency
- Slower than native code

### Option 3: Hybrid Approach

**Pros:**
- Rust for simple cases
- Babel for complex cases
- Gradual improvement path

**Cons:**
- Two codepaths to maintain
- Complexity in fallback logic

## Recommendation

For production use: **Continue with Babel**

The Rust implementation serves as:
1. **Learning resource** for oxc transformation patterns
2. **Foundation** for future native implementation
3. **Documentation** of TC39 Stage 3 semantics

A full Rust implementation should be undertaken as a dedicated project with:
- Comprehensive test suite (test262)
- Fuzzing for edge cases
- Performance benchmarks
- Multiple contributors

## References

- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [Babel Decorators Implementation](https://github.com/babel/babel/tree/main/packages/babel-plugin-proposal-decorators)
- [oxc Project](https://oxc-project.github.io/)
- [oxc Traverse Documentation](https://docs.rs/oxc_traverse)

## License

MIT
