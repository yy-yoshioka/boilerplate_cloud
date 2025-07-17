#!/usr/bin/env ts-node

import { globby } from 'globby';
import { readFile } from 'fs/promises';

const main = async (): Promise<void> => {
  const files = await globby(['apps/api/lib/**/*.{ts,tsx}', '!**/*.{spec,test}.ts']);

  const offenders: string[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (content.includes('TODO:')) offenders.push(file);
  }

  if (offenders.length > 0) {
    console.error('⛔  残 TODO が存在します:');
    offenders.forEach((f) => console.error(`   • ${f}`));
    process.exit(1);
  }

  console.log('✅  Scaffold drift なし (TODO 0)');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
