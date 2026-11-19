// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: a GTA 6 meme (a skeleton still waiting
// since 2013, paid to keep waiting by the make.fun ghost) posted on X with
// make.fun and the entrant's play code in its text. This program's only job
// is to hand the post's address to the gate: it copies POST.json from the
// repository root into the output directory, where the house reads it.
// Nothing this program writes about the post is judged — the house reads
// the post itself from X.
//
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// out/POST.json is then byte for byte this directory's POST.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'POST.json');
const TARGET = join(OUTPUT_DIR, 'POST.json');

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

if (!existsSync(SOURCE)) {
  fail(`POST.json not found at ${SOURCE} — the post's address is missing.`);
}

let payload: Buffer;
try {
  payload = readFileSync(SOURCE);
} catch (err) {
  fail(`could not read ${SOURCE}: ${(err as Error).message}`);
}

try {
  const parsed: unknown = JSON.parse(payload!.toString('utf8'));
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { url?: unknown }).url !== 'string'
  ) {
    fail('POST.json is not a JSON object with a string "url" field.');
  }
} catch (err) {
  if (err instanceof Error && err.message.startsWith('gta6-meme-x-01:')) throw err;
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  writeFileSync(TARGET, payload!);
} catch (err) {
  fail(`could not write ${TARGET}: ${(err as Error).message}`);
}

// Verify the copy: the gate reads exactly what landed in the output dir,
// so re-read it and refuse to report success on a partial or empty write.
let written: Buffer;
try {
  written = readFileSync(TARGET);
} catch (err) {
  fail(`could not re-read ${TARGET} to verify the copy: ${(err as Error).message}`);
}
if (!written!.equals(payload!)) {
  fail(`${TARGET} does not match ${SOURCE} after copying.`);
}

console.log(`gta6-meme-x-01: copied POST.json to ${TARGET}`);
