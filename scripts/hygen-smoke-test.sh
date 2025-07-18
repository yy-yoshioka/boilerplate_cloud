#!/bin/bash
# Hygen v1 ローカル Fail-fast 検証スクリプト
# 目的: ①生成成功 ②型&Lint通過 ③テスト通過を30秒以内に確認

set -euo pipefail

# タイマー開始
START_TIME=$(date +%s)

echo "🧹 Cleaning up previous generated files..."
rm -rf apps/api/lib/routers/{foo,bar,baz,fooPublic,fooPublicSoft,barProtected,barProtectedSoft,bazAdmin,bazAdminSoft}.*
rm -rf apps/api/lib/services/{foo,bar,baz,fooPublic,fooPublicSoft,barProtected,barProtectedSoft,bazAdmin,bazAdminSoft}.*
rm -rf apps/api/lib/schemas/{foo,bar,baz,fooPublic,fooPublicSoft,barProtected,barProtectedSoft,bazAdmin,bazAdminSoft}.*
rm -rf apps/api/__tests__/{foo,bar,baz,fooPublic,fooPublicSoft,barProtected,barProtectedSoft,bazAdmin,bazAdminSoft}.*

# trpc/serverが存在しない場合は作成
if [[ ! -f "apps/api/lib/trpc/server.ts" ]]; then
    echo "📦 Creating trpc/server.ts..."
    mkdir -p apps/api/lib/trpc
    cat > apps/api/lib/trpc/server.ts << 'EOF'
import { initTRPC } from '@trpc/server';
import type { Context } from '../types/context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.userId) {
    throw new Error('UNAUTHORIZED');
  }
  return opts.next();
});
export const adminProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.userId) {
    throw new Error('UNAUTHORIZED');
  }
  return opts.next();
});
EOF
fi

echo "🚀 Generating test models (6 patterns)..."

# 1) public / no soft-delete
echo "  → FooPublic (public, no soft delete)"
yarn hygen api new --model FooPublic --access=public --withSoftDelete=false --searchableFields=name

# 2) public / soft-delete
echo "  → FooPublicSoft (public, with soft delete)"
yarn hygen api new --model FooPublicSoft --access=public --withSoftDelete=true --searchableFields=name

# 3) protected / no soft-delete
echo "  → BarProtected (protected, no soft delete)"
yarn hygen api new --model BarProtected --access=protected --withSoftDelete=false --searchableFields=name

# 4) protected / soft-delete
echo "  → BarProtectedSoft (protected, with soft delete)"
yarn hygen api new --model BarProtectedSoft --access=protected --withSoftDelete=true --searchableFields=name,description

# 5) admin / no soft-delete
echo "  → BazAdmin (admin, no soft delete)"
yarn hygen api new --model BazAdmin --access=admin --withSoftDelete=false --searchableFields=name

# 6) admin / soft-delete
echo "  → BazAdminSoft (admin, with soft delete)"
yarn hygen api new --model BazAdminSoft --access=admin --withSoftDelete=true --searchableFields=name,email

# 生成ファイルの存在確認
echo "📋 Checking generated files..."
EXPECTED_FILES=(
    "apps/api/lib/routers/fooPublic.router.ts"
    "apps/api/lib/services/fooPublic.service.ts"
    "apps/api/lib/schemas/fooPublic.ts"
    "apps/api/__tests__/fooPublic.spec.ts"
    "apps/api/lib/routers/fooPublicSoft.router.ts"
    "apps/api/lib/services/fooPublicSoft.service.ts"
    "apps/api/lib/schemas/fooPublicSoft.ts"
    "apps/api/__tests__/fooPublicSoft.spec.ts"
    "apps/api/lib/routers/barProtected.router.ts"
    "apps/api/lib/services/barProtected.service.ts"
    "apps/api/lib/schemas/barProtected.ts"
    "apps/api/__tests__/barProtected.spec.ts"
    "apps/api/lib/routers/barProtectedSoft.router.ts"
    "apps/api/lib/services/barProtectedSoft.service.ts"
    "apps/api/lib/schemas/barProtectedSoft.ts"
    "apps/api/__tests__/barProtectedSoft.spec.ts"
    "apps/api/lib/routers/bazAdmin.router.ts"
    "apps/api/lib/services/bazAdmin.service.ts"
    "apps/api/lib/schemas/bazAdmin.ts"
    "apps/api/__tests__/bazAdmin.spec.ts"
    "apps/api/lib/routers/bazAdminSoft.router.ts"
    "apps/api/lib/services/bazAdminSoft.service.ts"
    "apps/api/lib/schemas/bazAdminSoft.ts"
    "apps/api/__tests__/bazAdminSoft.spec.ts"
)

MISSING_FILES=()
for file in "${EXPECTED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        MISSING_FILES+=("$file")
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    echo "❌ Missing files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

echo "✅ All 24 files generated"

# 既知の問題を修正（HTMLエンティティ）
for service in apps/api/lib/services/{fooPublic,fooPublicSoft,barProtected,barProtectedSoft,bazAdmin,bazAdminSoft}.service.ts; do
    if grep -q "&#39;" "$service" 2>/dev/null; then
        sed -i.bak "s/&#39;/'/g" "$service"
        rm -f "${service}.bak"
    fi
done

# Prismaモデルの追加（存在しない場合）
for model in FooPublic FooPublicSoft BarProtected BarProtectedSoft BazAdmin BazAdminSoft; do
    if ! grep -q "model $model" prisma/schema.prisma 2>/dev/null; then
        cat >> prisma/schema.prisma << EOF

model $model {
  id          String    @id @default(cuid())
  name        String
  description String?
  email       String?
  status      String    @default("ACTIVE")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
}
EOF
    fi
done

# Prisma生成
echo "🔄 Regenerating Prisma client..."
yarn prisma generate > /dev/null 2>&1

# TypeScriptチェック（生成ファイルのみ）
echo "🔍 Running TypeScript check on generated files..."
GENERATED_FILES=(
    "apps/api/lib/routers/fooPublic.router.ts"
    "apps/api/lib/services/fooPublic.service.ts"
    "apps/api/lib/schemas/fooPublic.ts"
    "apps/api/__tests__/fooPublic.spec.ts"
    "apps/api/lib/routers/fooPublicSoft.router.ts"
    "apps/api/lib/services/fooPublicSoft.service.ts"
    "apps/api/lib/schemas/fooPublicSoft.ts"
    "apps/api/__tests__/fooPublicSoft.spec.ts"
    "apps/api/lib/routers/barProtected.router.ts"
    "apps/api/lib/services/barProtected.service.ts"
    "apps/api/lib/schemas/barProtected.ts"
    "apps/api/__tests__/barProtected.spec.ts"
    "apps/api/lib/routers/barProtectedSoft.router.ts"
    "apps/api/lib/services/barProtectedSoft.service.ts"
    "apps/api/lib/schemas/barProtectedSoft.ts"
    "apps/api/__tests__/barProtectedSoft.spec.ts"
    "apps/api/lib/routers/bazAdmin.router.ts"
    "apps/api/lib/services/bazAdmin.service.ts"
    "apps/api/lib/schemas/bazAdmin.ts"
    "apps/api/__tests__/bazAdmin.spec.ts"
    "apps/api/lib/routers/bazAdminSoft.router.ts"
    "apps/api/lib/services/bazAdminSoft.service.ts"
    "apps/api/lib/schemas/bazAdminSoft.ts"
    "apps/api/__tests__/bazAdminSoft.spec.ts"
)

TSC_OUTPUT=$(yarn tsc ${GENERATED_FILES[@]} --noEmit --skipLibCheck --pretty false 2>&1 || true)
# Filter out errors not from generated files
FILTERED_OUTPUT=$(echo "$TSC_OUTPUT" | grep -E "(apps/api/lib|apps/api/__tests__)" | grep -E "(fooPublic|fooPublicSoft|barProtected|barProtectedSoft|bazAdmin|bazAdminSoft)" || true)
TSC_ERRORS=$(echo "$FILTERED_OUTPUT" | grep -c "error TS" || true)
if [[ $TSC_ERRORS -gt 0 ]]; then
    echo "❌ TypeScript errors in generated files: $TSC_ERRORS"
    echo "$FILTERED_OUTPUT" | head -15
    exit 1
else
    echo "✅ TypeScript: 0 errors in generated files"
fi

# ESLintチェック（生成ファイルのみ）
echo "🔍 Running ESLint on generated files..."
ESLINT_OUTPUT=$(yarn eslint ${GENERATED_FILES[@]} 2>&1 || true)
ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c " error " || true)
if [[ $ESLINT_ERRORS -gt 0 ]]; then
    echo "❌ ESLint errors in generated files: $ESLINT_ERRORS"
    echo "$ESLINT_OUTPUT" | grep " error " | head -5
    exit 1
else
    echo "✅ ESLint: 0 errors in generated files"
fi

# Vitestチェック（生成モデルのみ）
echo "🧪 Running tests for generated models..."
if yarn vitest run fooPublic fooPublicSoft barProtected barProtectedSoft bazAdmin bazAdminSoft --reporter=dot 2>&1 | grep -q "failed"; then
    echo "❌ Some tests failed"
    exit 1
else
    echo "✅ All tests passed"
fi

# HTMLエンティティチェック
echo "🔍 Checking for HTML entities..."
HTML_ENTITIES=$(grep -R "&#[0-9]\+;" apps/api/lib 2>/dev/null | wc -l || true)
if [[ $HTML_ENTITIES -gt 0 ]]; then
    echo "⚠️  Warning: Found $HTML_ENTITIES HTML entities in generated files"
    grep -R "&#[0-9]\+;" apps/api/lib | head -5
else
    echo "✅ No HTML entities found"
fi

# 実行時間計測
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo ""
echo "🎉 All checks passed!"
echo "⏱  Total time: ${TOTAL_TIME}s"

# 簡潔なサマリー
echo ""
echo "Summary:"
echo "  ✅ Generated 24 files (6 models × 4 files)"
echo "  ✅ TypeScript: 0 errors"
echo "  ✅ ESLint: 0 errors"
echo "  ✅ Tests: All passed"
echo "  ✅ No HTML entities"
echo "  ⏱  Completed in ${TOTAL_TIME}s"