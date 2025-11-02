# Study Guide: oxc v0.96.0 and TC39 Decorators

This document provides guidance on studying the oxc transformer architecture and TC39 decorator proposal to understand the implementation of this plugin.

## Prerequisites

Clone the required repositories to `/tmp`:

```bash
cd /tmp

# Clone oxc at v0.96.0
git clone https://github.com/oxc-project/oxc.git
cd oxc && git checkout crates_v0.96.0 && cd ..

# Clone TC39 decorator proposal
git clone https://github.com/tc39/proposal-decorators.git
```

## Part 1: Understanding oxc AST and Transformer

### 1.1 AST Node Definitions

**Path**: `/tmp/oxc/crates/oxc_ast/src/ast/js.rs`

Key structures to study:
```rust
// Decorator node
pub struct Decorator<'a> {
    pub span: Span,
    pub expression: Expression<'a>,
}

// Class with decorators
pub struct Class<'a> {
    pub decorators: Vec<'a, Decorator<'a>>,
    // ... other fields
}
```

**What to learn**:
- How decorators are represented in the AST
- Where decorators can be attached (classes, methods, properties)
- The relationship between decorator expressions and decorated elements

### 1.2 Transformer Architecture

**Path**: `/tmp/oxc/crates/oxc_transformer/src/decorator/mod.rs`

Key concepts:
```rust
pub struct Decorator<'a, 'ctx> {
    options: DecoratorOptions,
    legacy_decorator: LegacyDecorator<'a, 'ctx>,
}

impl<'a> Traverse<'a, TransformState<'a>> for Decorator<'a, '_> {
    fn enter_class(&mut self, node: &mut Class<'a>, ctx: &mut TraverseCtx<'a>) { }
    fn exit_class(&mut self, node: &mut Class<'a>, ctx: &mut TraverseCtx<'a>) { }
    // ... other hooks
}
```

**What to learn**:
- Visitor pattern for AST traversal
- Enter/exit hooks for transformation
- How transformers maintain state during traversal
- Plugin architecture and composition

### 1.3 Legacy Decorator Implementation

**Path**: `/tmp/oxc/crates/oxc_transformer/src/decorator/legacy/mod.rs`

Study:
- How decorators are collected during traversal
- How decorator expressions are evaluated
- How the transformed code is generated
- Metadata emission for TypeScript

**Key insight**: v0.96.0 only has legacy decorator support, not Stage 3.

### 1.4 Generate Documentation

```bash
cd /tmp/oxc
cargo doc --open --no-deps
```

This generates comprehensive API docs. Focus on:
- `oxc_ast`: AST node definitions
- `oxc_traverse`: Visitor traits
- `oxc_transformer`: Transformation utilities

## Part 2: Understanding TC39 Stage 3 Decorators

### 2.1 Proposal README

**Path**: `/tmp/proposal-decorators/README.md`

This is the authoritative specification. Study these sections in order:

1. **Introduction**: Basic concept and syntax
2. **Detailed Design**: Three-step evaluation
   - Step 1: Evaluating decorators (expressions)
   - Step 2: Calling decorators (with context)
   - Step 3: Applying decorators (transformation)
3. **Decorator APIs**: Each decorator type
   - Class Methods
   - Class Accessors
   - Class Fields
   - Classes
   - Auto-Accessors
4. **Examples**: For each decorator type

### 2.2 Key Concepts

#### Context Object

Every decorator receives a context object:
```typescript
{
  kind: "class" | "method" | "field" | "accessor" | "getter" | "setter";
  name: string | symbol;
  access: { get?(), set?() };
  static?: boolean;
  private?: boolean;
  addInitializer(fn: () => void): void;
}
```

#### Transformation Patterns

**Method Decorator**:
```javascript
// Before
class C {
  @dec
  method() {}
}

// After (conceptual)
C.prototype.method = dec(C.prototype.method, context) ?? C.prototype.method;
```

**Field Decorator**:
```javascript
// Before
class C {
  @dec x = 1;
}

// After (conceptual)
let initX = dec(undefined, context);
class C {
  x = initX.call(this, 1);
}
```

**Accessor Decorator**:
```javascript
// Before
class C {
  @dec accessor x = 1;
}

// After (conceptual)
let { get, set, init } = dec({ get, set }, context);
// Apply get/set to prototype, init during construction
```

### 2.3 Evaluation Order

Critical to understand:

1. **Decorator evaluation**: Left-to-right, top-to-bottom
2. **Decorator calling**: After class body evaluated, before constructor finalized
3. **Decorator application**: All at once, after all called
4. **Initializer timing**: Different for static vs instance, different for element types

## Part 3: Connecting the Concepts

### 3.1 What oxc Teaches Us

From studying oxc, we learn:

1. **Performance**: Early filtering, efficient AST traversal
2. **Architecture**: Separation of concerns (parse → transform → generate)
3. **Patterns**: Visitor pattern, hooks, state management
4. **Best practices**: How production-grade transformers are built

### 3.2 What TC39 Teaches Us

From the proposal, we learn:

1. **Semantics**: Exact transformation rules
2. **Edge cases**: Private members, static members, evaluation order
3. **API design**: Context object, addInitializer
4. **Compatibility**: Differences from legacy decorators

### 3.3 Why Use Babel

Given:
- oxc v0.96.0 doesn't have Stage 3 support
- Babel has official reference implementation
- Need production-ready solution now

Decision: Use Babel's `@babel/plugin-proposal-decorators` with `version: '2023-11'`

## Part 4: Hands-On Exercises

### Exercise 1: Trace Decorator Evaluation

Create a decorator that logs when it's called:

```javascript
function trace(value, context) {
  console.log('Decorator called:', context.kind, context.name);
  return value;
}

class C {
  @trace static x = 1;
  @trace y = 2;
  @trace method() {}
}
```

Question: In what order are the decorators called?

### Exercise 2: Understand addInitializer Timing

```javascript
function init(value, context) {
  context.addInitializer(function() {
    console.log('Initializer for:', context.kind, context.name);
  });
}

class C {
  @init static x = 1;
  @init y = 2;
  constructor() {
    console.log('Constructor');
  }
}

new C();
```

Question: What's the output order?

### Exercise 3: Study AST Structure

Using oxc parser:
```bash
cd /tmp/oxc
cargo run --bin oxc_parser -- --ast-json "class C { @dec method() {} }"
```

Examine the AST to see how decorators are represented.

## Part 5: Testing Your Understanding

Create decorators that:

1. ✅ Log all method calls (method decorator)
2. ✅ Validate field values (field decorator)  
3. ✅ Track property changes (accessor decorator)
4. ✅ Register classes (class decorator with addInitializer)
5. ✅ Bind methods automatically (method decorator with addInitializer)
6. ✅ Memoize getters (getter decorator)
7. ✅ Work with private members
8. ✅ Work with static members

All of these are demonstrated in `examples/comprehensive-example.ts`.

## Resources

- [oxc Documentation](https://oxc-project.github.io/)
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [Babel Decorators Plugin Docs](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)
- [MDN: Decorators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)

## Next Steps

1. Study the oxc transformer architecture
2. Read the TC39 proposal thoroughly
3. Examine the Babel plugin implementation
4. Try the examples in this project
5. Create your own custom decorators
6. Contribute improvements!
