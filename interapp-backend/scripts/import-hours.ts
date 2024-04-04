import { readFileSync, writeFileSync } from 'fs';

const csv = readFileSync('scripts/hours.csv', 'utf8');
const data = csv.split('\n').map((line) => {
  const [name, hours] = line.split(',');
  return [name, Number(hours)] as const;
});

const queries = data.map(([name, hours]) => {
  return `UPDATE "user" SET service_hours = service_hours + ${hours} WHERE username = '${name}';`;
});

queries.forEach((query) => {
  writeFileSync('scripts/hours.sql', query + '\n', { flag: 'a' });
});

console.log(queries);
