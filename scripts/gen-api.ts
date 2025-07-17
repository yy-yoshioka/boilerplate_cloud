#!/usr/bin/env ts-node

import { execa } from 'execa';
import { existsSync } from 'fs';
import { join } from 'path';

const main = async () => {
  const [model, ...args] = process.argv.slice(2);
  
  if (!model || !/^[A-Z][a-zA-Z0-9]*$/.test(model)) {
    console.error('Usage: yarn gen:api <ModelName> [--no-soft-delete] [--fields=name,email]');
    process.exit(1);
  }

  const withSoftDelete = !args.includes('--no-soft-delete');
  const searchableFields = args.find(a => a.startsWith('--fields='))?.split('=')[1] || 'name';

  console.log(`🚀 Generating ${model} API`);
  console.log(`   Soft delete: ${withSoftDelete}`);
  console.log(`   Searchable: ${searchableFields}`);

  try {
    // Hygenを実行
    await execa('yarn', [
      'hygen', 'api', 'new',
      '--model', model,
      '--withSoftDelete', String(withSoftDelete),
      '--searchableFields', searchableFields
    ], { stdio: 'inherit' });

    // ファイル確認
    const routerPath = join('apps/api/lib/routers', `${model.toLowerCase()}.router.ts`);
    if (!existsSync(routerPath)) {
      throw new Error('Generation failed');
    }

    // Git commit
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', `chore(scaffold): add ${model.toLowerCase()} api`, '--no-verify']);

    console.log(`✅ Success! Next steps:
   1. Update Prisma schema
   2. yarn prisma generate
   3. Update generated schema.ts
   4. yarn test ${model.toLowerCase()}
   5. yarn lint:fix`);
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
};

main();