import { ServiceModel, AuthModel, AnnouncementModel, UserModel, ExportsModel } from '../api/models';
import { expect, test, describe } from 'bun:test';
import { recreateDB, recreateMinio, recreateRedis } from './utils';

interface Test {
  name: string;
  cb: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

type TestSuite = {
  [name: string]: Test[];
};

// get all models in an array
const objs = [ServiceModel, AuthModel, AnnouncementModel, UserModel, ExportsModel] as const;

// map all models to an object with the name as key
const models = objs.reduce(
  (acc, obj) => ({ ...acc, [obj.name]: obj }),
  {} as Record<string, (typeof objs)[number]>,
);

// get all methods of a default class
const defaultClassMethods = Object.getOwnPropertyNames(class {});

// filter out all non-function properties of a model and exclude the default class methods
const filterObjectProperties = (model: (typeof objs)[number]) =>
  Object.getOwnPropertyNames(model)
    .filter((method) => typeof (model as any)[method] === 'function')
    .filter((method) => !defaultClassMethods.includes(method));

// get all testable methods of a model, excluding the default class methods
const testableMethods = Object.fromEntries(
  Object.entries(models).map(([name, model]) => [name, filterObjectProperties(model)]),
) as Record<string, string[]>;

// map all testable methods to a test suite
export const testSuites = Object.entries(testableMethods).reduce(
  (acc, [model, methods]) => {
    // create an empty array for each method
    const tests = methods.reduce(
      (acc, method) => ({
        ...acc,
        [method]: [],
      }),
      {} as TestSuite,
    );
    // assign the testsuite to the model
    return {
      ...acc,
      [model]: tests,
    };
  },
  {} as {
    [model: string]: TestSuite;
  },
);

process.on('SIGINT', async () => {
  console.warn('SIGINT received, aborting.');
  // recreate the database, minio and redis to prevent side effects on the next test run
  await Promise.all([recreateDB(), recreateMinio(), recreateRedis()]);

  process.exit(0);
});

test('test suites are of correct shape', () => {
  for (const obj of objs) {
    // check if the model is in the test suites
    expect(testSuites).toHaveProperty(obj.name);
    // check if the test suite is an object
    expect(testSuites[obj.name]).toBeObject();

    // loop through all methods of the model and check if they are in the test suite
    for (const method of filterObjectProperties(obj)) {
      expect(testSuites[obj.name]).toHaveProperty(method);
      expect(testSuites[obj.name][method]).toBeArray();
    }
  }
});

// Runs a suite of tests.
export const runSuite = async (name: string, suite: TestSuite) => {
  // The outermost describe block groups all tests for a specific model.
  describe(name, () => {
    // Iterate over each method in the suite.
    for (const [method, tests] of Object.entries(suite)) {
      // Create a describe block for each method.
      describe(method, async () => {
        // Iterate over each test for the method.
        for (const { name, cb, cleanup } of tests) {
          // Define the test.
          test(name, async () => {
            try {
              // Run the test callback.
              await cb();
            } finally {
              // If a cleanup function is provided, run it after the test.
              if (cleanup) await cleanup();
            }
          });
        }
      });
    }
    // Add a test to make sure that the test suite is exhaustive.
    test('make sure suite is exhaustive', () => {
      // Iterate over each method in the suite.
      Object.values(suite).forEach((tests) => {
        try {
          // Assert that the tests array is not empty.
          expect(tests).toBeArray();
          expect(tests).not.toBeEmpty();
        } catch (e) {
          // If the tests array is empty, find all methods with no tests.
          const failed = Object.entries(suite)
            .filter(([, tests]) => tests.length === 0)
            .reduce((acc, [name]) => {
              // Add the method name to the failed array.
              acc.push(name);
              return acc;
            }, [] as string[]);

          // Log the methods with no tests.
          console.error(`The following methods have no test coverage: ${failed.join(', ')}`);

          // Re-throw the error to fail the test.
          throw e;
        }
      });
    });
  });
};

// looks like this:
/*
{
  ServiceModel: {
    createService: [],
    getService: [],
    ...
    getAdHocServiceSessions: [],
  },
  AuthModel: {
    signJWT: [],
    signUp: [],
    ...
  },
  ...
*/
