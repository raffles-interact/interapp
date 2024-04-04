import { readFileSync, writeFileSync } from 'fs';

const csv = readFileSync('scripts/hours2.csv', 'utf8');
const data = csv.split('\n').map((line) => {
  const [name, hours] = line.split(',');
  return [name, Number(hours)] as const;
});

const queries = data.map(([name, hours]) => {
  return `UPDATE "user" SET service_hours = ${hours} WHERE username = '${name}';`;
}).join('\n');

writeFileSync('scripts/hours.sql', queries, { flag: 'w' });

console.log(queries);
