export enum Permissions {
  VISTOR = 0,
  CLUB_MEMBER = 1,
  SERVICE_IC = 2,
  MENTORSHIP_IC = 3,
  EXCO = 4,
  ATTENDANCE_MANAGER = 5,
  ADMIN = 6,
}

export const noLoginRequiredRoutes = ['/', '/auth/login', '/auth/signup', '/forgot-password'];

export const RoutePermissions = {
  [Permissions.VISTOR]: ['/'],
  [Permissions.CLUB_MEMBER]: ['/', '/protected', '/auth/verify_email'],
  [Permissions.SERVICE_IC]: ['/'],
  [Permissions.MENTORSHIP_IC]: ['/'],
  [Permissions.EXCO]: ['/'],
  [Permissions.ATTENDANCE_MANAGER]: ['/'],
  [Permissions.ADMIN]: ['/'],
};
