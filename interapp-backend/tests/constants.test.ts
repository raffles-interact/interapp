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
  (acc, obj) => {
    acc[obj.name] = obj;
    return acc;
  },
  {} as Record<string, (typeof objs)[number]>,
);

// get all methods of a default class
const defaultClassMethods = Object.getOwnPropertyNames(class {});

// get all testable methods of a model, excluding the default class methods
const testableMethods = Object.fromEntries(
  Object.entries(models).map(([name, model]) => [
    name,
    Object.getOwnPropertyNames(model).filter((method) => !defaultClassMethods.includes(method)),
  ]),
) as Record<string, string[]>;

// map all testable methods to a test suite
export const testSuites = Object.entries(testableMethods).reduce(
  (acc, [model, methods]) => {
    const tests = methods.reduce(
      (acc, method) => {
        acc[method] = [] as Test[];
        return acc;
      },
      {} as Record<string, Test[]>,
    );
    return {
      ...acc,
      [model]: tests,
    };
  },
  {} as {
    [model: string]: {
      [method: string]: Test[];
    };
  },
);

process.on('SIGINT', async (s) => {
  console.warn('SIGINT received, aborting...');
  await Promise.all([recreateDB(), recreateMinio(), recreateRedis()]);

  process.exit(0);
});

test('test suites are of correct shape', () => {
  for (const obj of objs) {
    expect(testSuites).toHaveProperty(obj.name);
    expect(testSuites[obj.name]).toBeObject();
    for (const method of Object.getOwnPropertyNames(obj)) {
      if (!defaultClassMethods.includes(method)) {
        expect(testSuites[obj.name]).toHaveProperty(method);
        expect(testSuites[obj.name][method]).toBeArray();
      }
    }
  }
});

export const runSuite = async (name: string, suite: TestSuite) => {
  describe(name, () => {
    for (const [method, tests] of Object.entries(suite)) {
      describe(method, async () => {
        for (const { name, cb, cleanup } of tests) {
          test(name, async () => {
            try {
              await cb();
            } finally {
              if (cleanup) await cleanup();
            }
          });
        }
      });
    }
    test('make sure suite is exhaustive', () => {
      Object.values(suite).forEach((tests) => {
        expect(tests).toBeArray();
        expect(tests).not.toBeEmpty();
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
    updateService: [],
    deleteService: [],
    getAllServices: [],
    createServiceSession: [],
    getServiceSession: [],
    updateServiceSession: [],
    deleteServiceSession: [],
    createServiceSessionUser: [],
    createServiceSessionUsers: [],
    getServiceSessionUser: [],
    getServiceSessionUsers: [],
    updateServiceSessionUser: [],
    deleteServiceSessionUser: [],
    deleteServiceSessionUsers: [],
    getAllServiceSessions: [],
    getActiveServiceSessions: [],
    verifyAttendance: [],
    getAdHocServiceSessions: [],
  },
  AuthModel: {
    signJWT: [],
    signUp: [],
    signIn: [],
    signOut: [],
    getNewAccessToken: [],
    verify: [],
    accessSecret: [],
    refreshSecret: [],
  },
  AnnouncementModel: {
    createAnnouncement: [],
    getAnnouncement: [],
    getAnnouncements: [],
    updateAnnouncement: [],
    deleteAnnouncement: [],
    getAnnouncementCompletions: [],
    updateAnnouncementCompletion: [],
  },
  UserModel: {
    getUser: [],
    deleteUser: [],
    getUserDetails: [],
    changeEmail: [],
    changePassword: [],
    resetPassword: [],
    sendResetPasswordEmail: [],
    verifyEmail: [],
    sendVerifyEmail: [],
    checkPermissions: [],
    updatePermissions: [],
    getPermissions: [],
    getAllServicesByUser: [],
    getAllServiceSessionsByUser: [],
    getAllUsersByService: [],
    addServiceUser: [],
    removeServiceUser: [],
    updateServiceUserBulk: [],
    updateServiceHours: [],
    updateProfilePicture: [],
    deleteProfilePicture: [],
    getNotifications: [],
  },
}
*/
