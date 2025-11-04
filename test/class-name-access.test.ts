import { describe, it, expect } from 'vitest';
import viteOxcDecoratorStage3 from '../src/index';

describe('Class Name Access in Method Decorator', () => {
  async function transformCode(code: string): Promise<string> {
    const plugin = viteOxcDecoratorStage3();
    await plugin.buildStart!.call({} as any);
    
    const result = await plugin.transform!(code, 'test.ts');
    if (!result || typeof result !== 'object' || !('code' in result)) {
      throw new Error('Transformation failed');
    }
    
    return result.code;
  }

  it('should allow accessing class name from method decorator addInitializer', async () => {
    const input = `
      const _rpcMethods = new Map();

      function rpcMethod(_: Function, context: any) {
        context.addInitializer(function () {
          // This initializer may be called with 'this' as the class (static)
          // or 'this' as the prototype (instance). We need the class name in both cases.
          const className =
            typeof this === "function" ? this.name : this.constructor.name;

          console.log("rpcMethodDecorator");

          if (!className) {
            console.error(
              "RPCMethod: Could not determine class name for decorator on method:",
              context.name,
            );
            return;
          }
          console.log(className);

          if (!_rpcMethods.has(className)) _rpcMethods.set(className, new Set());
          _rpcMethods.get(className).add(context.name);
        });
      }

      class TestClass {
        @rpcMethod
        testMethod() {
          return "test";
        }
      }

      const instance = new TestClass();
      console.log(_rpcMethods);
    `;

    const output = await transformCode(input);
    expect(output).toBeTruthy();
    expect(output).toContain('function rpcMethod');
    expect(output).toContain('static {');
    expect(output).not.toContain('@rpcMethod');
  });

  it('should allow accessing class name from static method decorator addInitializer', async () => {
    const input = `
      const _rpcMethods = new Map();

      function rpcMethod(_: Function, context: any) {
        context.addInitializer(function () {
          const className =
            typeof this === "function" ? this.name : this.constructor.name;

          if (!className) {
            console.error(
              "RPCMethod: Could not determine class name for decorator on method:",
              context.name,
            );
            return;
          }
          console.log(className);

          if (!_rpcMethods.has(className)) _rpcMethods.set(className, new Set());
          _rpcMethods.get(className).add(context.name);
        });
      }

      class TestClass {
        @rpcMethod
        static staticMethod() {
          return "static";
        }
      }

      console.log(_rpcMethods);
    `;

    const output = await transformCode(input);
    expect(output).toBeTruthy();
    expect(output).toContain('function rpcMethod');
    expect(output).toContain('static {');
    expect(output).not.toContain('@rpcMethod');
  });
});
