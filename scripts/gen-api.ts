#!/usr/bin/env ts-node

import { execa } from 'execa';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as changeCase from 'change-case';

const checkPrismaModel = (modelName: string): boolean => {
  try {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    const schema = readFileSync(schemaPath, 'utf-8');
    const modelRegex = new RegExp(`model\\s+${modelName}\\s*{`, 'i');
    return modelRegex.test(schema);
  } catch {
    return false;
  }
};

const main = async () => {
  const [model, ...args] = process.argv.slice(2);

  if (!model || !/^[A-Z][a-zA-Z0-9]*$/.test(model)) {
    console.error('Usage: yarn gen:api <ModelName> [options]');
    console.error('Options:');
    console.error(
      '  --access=level       Set access level (public, protected, admin) [default: protected]',
    );
    console.error('  --no-soft-delete     Disable soft delete');
    console.error('  --fields=name,email  Specify searchable fields');
    console.error('  --no-verify          Skip git hooks (CI only)');
    process.exit(1);
  }

  const withSoftDelete = !args.includes('--no-soft-delete');
  const searchableFields = args.find((a) => a.startsWith('--fields='))?.split('=')[1] || 'name';
  const access = args.find((a) => a.startsWith('--access='))?.split('=')[1] || 'protected';
  const skipVerify = args.includes('--no-verify') && process.env.CI === 'true';

  // Access level validation
  if (!['public', 'protected', 'admin'].includes(access)) {
    console.error('❌ Invalid access level. Must be one of: public, protected, admin');
    process.exit(1);
  }

  // changeCase.camelCaseで統一
  const camelModel = changeCase.camelCase(model);

  console.log(`🚀 Generating ${model} API`);
  console.log(`   Access level: ${access}`);
  console.log(`   Soft delete: ${withSoftDelete}`);
  console.log(`   Searchable: ${searchableFields}`);

  // Prismaモデルチェック
  if (!checkPrismaModel(model)) {
    console.warn(`⚠️  Warning: Model '${model}' not found in schema.prisma`);
    console.warn(`   Please add the model to your Prisma schema before running migrations`);
  }

  try {
    // Hygenを実行
    await execa(
      'yarn',
      [
        'hygen',
        'api',
        'new',
        '--model',
        model,
        '--withSoftDelete',
        String(withSoftDelete),
        '--searchableFields',
        searchableFields,
        '--access',
        access,
      ],
      { stdio: 'inherit' },
    );

    // 生成されたファイルパス（camelCaseで統一）
    const generatedFiles = [
      join('apps/api/lib/routers', `${camelModel}.router.ts`),
      join('apps/api/lib/services', `${camelModel}.service.ts`),
      join('apps/api/lib/schemas', `${camelModel}.ts`),
      join('apps/api/__tests__', `${camelModel}.spec.ts`),
    ];

    // ファイル確認
    const missingFiles = generatedFiles.filter((f) => !existsSync(f));
    if (missingFiles.length > 0) {
      throw new Error(`Generation failed. Missing files: ${missingFiles.join(', ')}`);
    }

    // Git add（生成ファイルのみ）
    await execa('git', ['add', ...generatedFiles]);

    // ESLint fix
    console.log('🔧 Running ESLint fix...');
    await execa('yarn', ['eslint', '--fix', ...generatedFiles], {
      stdio: 'inherit',
      reject: false, // ESLintエラーでもプロセスを続行
    });

    // Git commit
    const commitArgs = ['commit', '-m', `scaffold(${camelModel}): add ${model} api`];

    if (skipVerify) {
      commitArgs.push('--no-verify');
    }

    await execa('git', commitArgs);

    console.log(`
✅ Success! ${model} API scaffolded.

📝 Next steps:
   1. Update Prisma schema with ${model} model
   2. yarn prisma generate
   3. Update generated ${camelModel}.ts schema with actual fields
   4. Fix any remaining lint errors: yarn lint:fix
   5. Run tests: yarn test ${camelModel}
`);
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
};

main();
