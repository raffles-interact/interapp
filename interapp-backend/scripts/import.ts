
// Generate db dump from csv file
// place the csv file in the same directory as this script
// usage: POSTGRES_HOST=localhost REDIS_URL=redis://localhost:6379 MINIO_ENDPOINT=localhost bun run scripts/import.ts
import { readFileSync, writeFileSync } from 'fs';
import { User, UserPermission } from '@db/entities';
import appDataSource from '@utils/init_datasource';

const csv = readFileSync('scripts/usernames.csv', 'utf8');
const lines = csv.split('\n');

const defaultPassword = 'password';
const defaultEmail = 'default1234@email.com'
const data = lines.map((line) => {
  const regex = /"([^"]*)"|([^,]+)/g;
  const fields = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    fields.push(match[1] ? match[1] : match[2]);
  }
  const [,,, id, username] = fields;
  console.log(id, username);
  return [Number(id), username.replace('\r', ''), defaultEmail, defaultPassword] as const;
})

//generate sql

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
    const filledQuery = query.replace(/\$[0-9]+/g, () => {
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

const queries = Promise.all(data.map(async (d) => {
  return await signUp(...d);
}))

queries.then((sqls) => {
  // write to file
  writeFileSync('scripts/insert.sql', sqls.flat().join(';\n') + ';');
  
});