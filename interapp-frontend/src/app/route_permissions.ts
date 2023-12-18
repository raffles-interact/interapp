export enum Permissions {
  VISTOR = 0,
  CLUB_MEMBER = 1,
  SERVICE_IC = 2,
  MENTORSHIP_IC = 3,
  EXCO = 4,
  ATTENDANCE_MANAGER = 5,
  ADMIN = 6,
}

export const noLoginRequiredRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot_password',
  '/auth/forgot_password_verify',
];

export const RoutePermissions = {
  [Permissions.VISTOR]: ['/', '/auth/verify_email', '/settings'],
  [Permissions.CLUB_MEMBER]: ['/', '/announcements', '/services'],
  [Permissions.SERVICE_IC]: ['/'],
  [Permissions.MENTORSHIP_IC]: ['/'],
  [Permissions.EXCO]: ['/'],
  [Permissions.ATTENDANCE_MANAGER]: ['/'],
  [Permissions.ADMIN]: ['/', '/admin'],
};
