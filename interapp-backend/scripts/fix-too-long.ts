import { User, UserPermission } from '@db/entities';
import appDataSource from '@utils/init_datasource';
import { writeFileSync } from 'fs';

const ids = [
  2514, 2525, 2531, 2542, 2556, 2409, 2413, 2415, 2421, 2444, 2454, 2462, 2468, 2559, 2562,
];

const names = [
  'elke',
  'jael',
  'fion',
  'jane',
  'anne',
  'nila',
  'tana',
  'ivy',
  'sia',
  'ace',
  'jan',
  'luke',
  'qida',
  'venkatesan',
  'jhala',
];
const fullNames = [
  'elke_goh',
  'jael_pey',
  'fion_tsai',
  'jane_mak',
  'anne_yong',
  'nila_ramamoorthy',
  'tana_leong',
  'ivy_chong',
  'sia_pathania',
  'ace_yeo',
  'jan_loh',
  'luke_ng',
  'shao_qida',
  'surya',
  'hraday',
];

// nila and tana are service ics

async function deleteUsers(names: string[]) {
  let a = [];
  for (const name of names) {
    // find if user exists
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('username = :name', { name })
      .getOne();
    if (user) {
      // delete user and user permission by generating sql
      const userSql = `DELETE FROM "user" WHERE username = '${name}'`;
      const userPermissionSql = `DELETE FROM "user_permission" WHERE username = '${name}'`;
      a.push([userSql, userPermissionSql]);
    }
  }
  return a.flat().flat();
}

async function signUp(user_id: number, username: string, email: string, password: string) {
  // init a new user
  const user = new User();
  user.user_id = user_id;
  user.username = username;
  user.email = email;
  user.service_hours = 0;
  user.verified = false;
  user.profile_picture = null;

  user.password_hash = await Bun.password.hash(password);

  // init a new permission entry for the user, will insert/update regardless if this entry already exists
  const userPermission = new UserPermission();
  userPermission.user = user;
  userPermission.username = username;
  userPermission.permission_id = 0;

  async function convert(obj: any, values: any) {
    const [query, params] = await appDataSource.manager
      .createQueryBuilder()
      .insert()
      .into(obj)
      .values(values)
      .getQueryAndParameters();

    let paramIndex = 0;
    const filledQuery = query.replace(/\$\d+/g, () => {
      const value = params[paramIndex++];
      if (typeof value === 'string') {
        // Escape single quotes and quote the string
        return `'${value.replace(/'/g, "''")}'`;
      } else if (typeof value === 'number') {
        return value.toString();
      } else if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
      } else if (value instanceof Date) {
        return `'${value.toISOString()}'`;
      } else if (value === null || value === undefined) {
        return 'NULL';
      } else {
        throw new Error(`Unhandled parameter type: ${typeof value}`);
      }
    });

    return filledQuery;
  }
  const userSql = await convert(User, user);
  const userPermissionSql = await convert(UserPermission, userPermission);

  return [userSql, userPermissionSql];
}

deleteUsers(names).then((res) => {
  writeFileSync('scripts/j.sql', res.join(';\n') + ';', { flag: 'w' });
  fullNames.forEach((name, i) => {
    signUp(ids[i], name, 'default@email.com', 'password').then((sqls) => {
      const computed = sqls.flat().join(';\n');
      writeFileSync('scripts/j.sql', computed + ';', { flag: 'a' });
    });
  });
});
