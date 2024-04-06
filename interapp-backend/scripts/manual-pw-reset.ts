import Bun from 'bun';
import { randomBytes } from 'crypto';

if (process.argv.length < 3) {
  console.error('Usage: ts-node scripts/manual-pw-reset.ts <username>');
  process.exit(1);
}
const username = process.argv[2];
const newPassword = randomBytes(8).toString('hex');

const hashedPassword = await Bun.password.hash(newPassword);
const sql = `UPDATE "user" SET password_hash = '${hashedPassword}', refresh_token = NULL WHERE username = '${username}';`;

console.log(`Username: ${username}`);
console.log(`New Password: ${newPassword}`);

console.log(sql);
