import { ServiceModel, AuthModel, AnnouncementModel, UserModel } from '../api/models';
import { expect, test } from 'bun:test';

interface Test {
  name: string;
  cb: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

type TestSuite = {
  [name: string]: Test[];
};

// get all models in an array
const objs = [ServiceModel, AuthModel, AnnouncementModel, UserModel] as const;

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
