// Walks through the API one request at a time, printing the raw DB state after each step.
//   npm run demo   pause for Enter between steps
//   npm test       run straight through; exit 1 if any status was unexpected
// Server must already be running (npm run dev). Only touches @demo.test volunteers and "[demo]" shifts.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'node:readline/promises';

dotenv.config({ quiet: true });

const BASE = 'http://localhost:3000';
const AUTO = process.argv.includes('--auto');
const rl = AUTO ? null : readline.createInterface({ input: process.stdin, output: process.stdout });
let failures = 0;
const green = (t: string) => `\x1b[32m${t}\x1b[0m`;
const red = (t: string) => `\x1b[31m${t}\x1b[0m`;
const dim = (t: string) => `\x1b[2m${t}\x1b[0m`;

async function showDb() {
  const db = mongoose.connection.db!;
  console.log(dim('  DB volunteers:'));
  for (const v of await db.collection('volunteers').find().toArray()) console.log(dim(`    ${v._id}  ${v.name} <${v.email}>`));
  console.log(dim('  DB shifts:'));
  for (const s of await db.collection('shifts').find().toArray()) console.log(dim(`    ${s._id}  "${s.title}"  capacity=${s.capacity}  volunteers=[${s.volunteers.join(', ')}]`));
}

async function step(title: string, method: string, path: string, body: unknown, expect: number) {
  console.log(`\n${title}\n  → ${method} ${path}${body ? '  ' + JSON.stringify(body) : ''}`);

  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();

  const ok = res.status === expect;
  if (!ok) failures++;
  console.log(`  ← ${ok ? green(`✓ ${res.status}`) : red(`✗ ${res.status} (expected ${expect})`)}${text ? '  ' + text : ''}`);

  await showDb();
  if (rl) await rl.question(dim('  [Enter]'));
  return text ? JSON.parse(text) : null;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  await db.collection('volunteers').deleteMany({ email: /@demo\.test$/ });
  await db.collection('shifts').deleteMany({ title: /^\[demo\]/ });

  // volunteers
  const ann = await step('Create volunteer Ann (messy input gets cleaned)', 'POST', '/volunteers', { name: '  Ann ', email: ' ANN@demo.test ' }, 201);
  await step('Reject invalid volunteer body', 'POST', '/volunteers', { name: 5 }, 400);
  await step('Reject duplicate email', 'POST', '/volunteers', { name: 'Ann again', email: 'ann@demo.test' }, 409);
  const bob = await step('Create volunteer Bob', 'POST', '/volunteers', { name: 'Bob', email: 'bob@demo.test' }, 201);

  // shifts
  const shiftBody = { title: '[demo] Check-in', startTime: '2026-10-01T10:00:00Z', endTime: '2026-10-01T12:00:00Z', capacity: 1 };
  await step('Reject shift that ends before it starts', 'POST', '/shifts', { ...shiftBody, endTime: '2026-10-01T09:00:00Z' }, 400);
  const shift = await step('Create shift with capacity 1', 'POST', '/shifts', shiftBody, 201);
  const S = `/shifts/${shift._id}`;

  // signups
  await step('Ann signs up', 'POST', `${S}/signup`, { volunteerId: ann._id }, 204);
  await step('Ann signs up again → already signed up', 'POST', `${S}/signup`, { volunteerId: ann._id }, 409);
  await step('Bob signs up → shift is full', 'POST', `${S}/signup`, { volunteerId: bob._id }, 409);
  await step('Raise capacity to 2', 'PUT', S, { ...shiftBody, capacity: 2 }, 200);
  await step('Bob signs up → fits now', 'POST', `${S}/signup`, { volunteerId: bob._id }, 204);
  await step('Try to shrink capacity below signups', 'PUT', S, { ...shiftBody, capacity: 1 }, 409);
  await step('Get shift with volunteers populated', 'GET', S, undefined, 200);
  await step('Bob un-signs', 'DELETE', `${S}/signup/${bob._id}`, undefined, 204);
  await step('Delete Ann → also removed from the shift', 'DELETE', `/volunteers/${ann._id}`, undefined, 204);

  // errors
  await step('Malformed id → 400', 'GET', '/volunteers/not-an-id', undefined, 400);
  await step('Unknown id → 404', 'GET', '/shifts/000000000000000000000000', undefined, 404);

  // cleanup
  await step('Delete shift', 'DELETE', S, undefined, 204);
  await step('Delete Bob', 'DELETE', `/volunteers/${bob._id}`, undefined, 204);

  console.log(failures ? red(`\n${failures} step(s) failed`) : green('\nAll steps passed'));
  process.exitCode = failures ? 1 : 0;
  rl?.close();
  await mongoose.disconnect();
}

main();
