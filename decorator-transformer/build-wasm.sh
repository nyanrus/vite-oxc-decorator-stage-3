#!/bin/bash
set -e

# Build WASM module
cargo build --target wasm32-wasip1 --release

# Convert to Component Model
wasm-tools component new \
  target/wasm32-wasip1/release/decorator_transformer.wasm \
  -o target/wasm32-wasip1/release/decorator_transformer_component.wasm \
  --adapt wasi_snapshot_preview1=wasi_snapshot_preview1.reactor.wasm

echo "WASM component built successfully!"
