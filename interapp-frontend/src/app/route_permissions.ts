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
  '/404',
  '/500'
];

export const routePermissions = {
  [Permissions.VISTOR]: ['/', '/auth/verify_email', '/settings', '/profile'],
  [Permissions.CLUB_MEMBER]: [
    '/announcements',
    '/services',
    '/attendance/verify',
    '/attendance/absence',
    '/announcements/*',
  ],
  [Permissions.SERVICE_IC]: ['/service_sessions', '/attendance'],
  [Permissions.MENTORSHIP_IC]: ['/service_sessions', '/attendance'],
  [Permissions.EXCO]: ['/announcements/create', '/announcements/*/edit'],
  [Permissions.ATTENDANCE_MANAGER]: [],
  [Permissions.ADMIN]: ['/admin'],
} as const;
