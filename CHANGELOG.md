# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-11-02

### Added
- Initial release
- Vite plugin for transforming TC39 Stage 3 decorators
- Support for all decorator types: class, method, field, accessor, getter, setter
- Support for `addInitializer` API
- Support for private and static class members
- TypeScript and JavaScript support
- Source map generation
- Comprehensive test suite based on TC39 examples
- Documentation with examples
- Study of oxc v0.96.0 transformer implementation
- Study of TC39 proposal-decorators reference implementation

### Implementation Notes
- Uses Babel's `@babel/plugin-proposal-decorators` with `version: '2023-11'`
- Researched oxc AST structure and transformer patterns from v0.96.0
- Studied TC39 Stage 3 decorator proposal semantics
- Analyzed Babel reference implementation for transformation logic
