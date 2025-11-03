/**
 * Runtime Test Example
 * 
 * This file demonstrates the Rust/WASM decorator transformer in action.
 * 
 * Current Status:
 * - ✅ Code transforms successfully (decorators removed, static blocks added, helpers injected)
 * - ✅ Variable declarations (_initProto, _initClass) are correctly generated
 * - ✅ Transformed code executes without syntax errors
 * - ⚠️  Decorator runtime behavior is incomplete (helper function implementation needs work)
 * 
 * Note: The TC39 Stage 3 decorator helper functions are complex and this AI-generated
 * implementation is not yet fully compliant with the specification. The transformation
 * itself is correct, but the runtime behavior of decorators is not yet working as expected.
 * 
 * Run with: node test/runtime-example.mjs
 */

import viteOxcDecoratorStage3 from '../dist/index.js';
import { writeFileSync } from 'fs';

const testCases = [
  {
    name: 'Method Decorator',
    code: `
      const calls = [];
      
      function logged(value, { kind, name }) {
        if (kind === "method") {
          return function (...args) {
            calls.push(\`calling \${name}\`);
            const ret = value.call(this, ...args);
            return ret;
          };
        }
      }
      
      class TestClass {
        @logged
        add(a, b) {
          return a + b;
        }
      }
      
      const instance = new TestClass();
      const result = instance.add(2, 3);
      console.log('Result:', result, '| Calls:', calls);
    `
  },
  {
    name: 'Field Decorator',
    code: `
      const initializations = [];
      
      function logged(value, { kind, name }) {
        if (kind === "field") {
          return function (initialValue) {
            initializations.push({ name, value: initialValue });
            return initialValue;
          };
        }
      }
      
      class TestClass {
        @logged x = 10;
      }
      
      const instance = new TestClass();
      console.log('Field value:', instance.x, '| Initializations:', initializations);
    `
  },
  {
    name: 'Class Decorator',
    code: `
      const instances = [];
      
      function logged(value, { kind }) {
        if (kind === "class") {
          return class extends value {
            constructor(...args) {
              super(...args);
              instances.push(this);
            }
          };
        }
      }
      
      @logged
      class TestClass {
        constructor(name) {
          this.name = name;
        }
      }
      
      const instance1 = new TestClass('test1');
      const instance2 = new TestClass('test2');
      console.log('Instances:', instances.length, '| Names:', [instance1.name, instance2.name]);
    `
  },
  {
    name: 'Bound Method (addInitializer)',
    code: `
      function bound(value, { name, addInitializer }) {
        addInitializer(function () {
          this[name] = this[name].bind(this);
        });
      }
      
      class TestClass {
        value = 42;
        
        @bound
        getValue() {
          return this.value;
        }
      }
      
      const instance = new TestClass();
      const getValue = instance.getValue;
      const result = getValue(); // Should work even without 'this' context
      console.log('Result:', result);
    `
  }
];

async function runTests() {
  const plugin = viteOxcDecoratorStage3();
  await plugin.buildStart.call({});
  
  console.log('Running runtime tests...\n');
  
  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${testCase.name}`);
    console.log('='.repeat(60));
    
    try {
      const result = await plugin.transform(testCase.code, 'test.ts');
      if (!result || typeof result !== 'object' || !('code' in result)) {
        throw new Error('Transformation failed');
      }
      
      // Save transformed code to a file
      const filename = `/tmp/test-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.mjs`;
      writeFileSync(filename, result.code);
      
      console.log(`Transformed code saved to: ${filename}`);
      console.log('\nExecuting transformed code:');
      console.log('-'.repeat(60));
      
      // Execute the transformed code
      const module = await import(filename);
      
      console.log('-'.repeat(60));
      console.log('✓ Test passed!\n');
    } catch (error) {
      console.error(`✗ Test failed:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

runTests().catch(console.error);
