# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Rust/WASM Component Model Transformer**: Built with oxc v0.96.0
  - oxc_parser for JavaScript/TypeScript parsing
  - oxc_ast for AST manipulation
  - oxc_codegen for code generation
  - wit-bindgen for WebAssembly Component Model bindings
  - jco (JavaScript Component Tools) for JavaScript bindings
- **WIT Interface Definition**: Defined transformer interface using WebAssembly Interface Types
- **Hybrid Architecture**: WASM Component transformer with Babel fallback
- `useWasm` option to enable experimental Rust transformer
- Build scripts for WASM Component compilation (`build:wasm`, `build:jco`)
- decorator-transformer Rust crate with Component Model support
- Comprehensive documentation for Rust/WASM Component implementation

### Changed
- **Migrated from wasm-bindgen to wit-bindgen**: Now uses WebAssembly Component Model
- **Build system**: Uses cargo-component and jco instead of wasm-pack
- **Target**: Changed from wasm32-unknown-unknown to wasm32-wasip1
- Plugin now supports both WASM Component and Babel transformation backends
- Updated TypeScript bridge to handle Component Model Result types
- Enhanced README with Component Model architecture explanation
- Updated all documentation with wit-bindgen/jco references

## [0.1.0] - 2024-11-02

### Added
- Initial release
- Vite plugin for transforming TC39 Stage 3 decorators
- Support for all decorator types: class, method, field, accessor, getter, setter
- Support for `addInitializer` API
- Support for private and static class members
- TypeScript and JavaScript support
- Source map generation
- Comprehensive test suite based on TC39 examples (23 tests)
- Documentation with examples
- Study of oxc v0.96.0 transformer implementation
- Study of TC39 proposal-decorators reference implementation

### Implementation Notes
- Uses Babel's `@babel/plugin-proposal-decorators` with `version: '2023-11'`
- Researched oxc AST structure and transformer patterns from v0.96.0
- Studied TC39 Stage 3 decorator proposal semantics
- Analyzed Babel reference implementation for transformation logic
