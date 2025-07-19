#!/bin/bash
set -euo pipefail

# 初期化
GENERATED=()
REPORT_FILE="hygen-validation-REPORT.md"
START_TIME=$(date +%s)

# レポート開始
cat > "$REPORT_FILE" <<MD
# Hygen Smoke 6× Patterns – Validation Report ($(date +%Y-%m-%d))

| Model | Access | SoftDelete | Generated |
|-------|--------|------------|-----------|
MD

# 事前クリーンアップ
echo "🧹 Pre-cleaning generated files..."
rm -rf apps/api/lib/routers/{foo,bar,baz,qux,quux,quuz}.router.ts
rm -rf apps/api/lib/services/{foo,bar,baz,qux,quux,quuz}.service.ts
rm -rf apps/api/lib/schemas/{foo,bar,baz,qux,quux,quuz}.ts
rm -rf apps/api/__tests__/{foo,bar,baz,qux,quux,quuz}.spec.ts

# 6パターンのモデル生成
# Foo: public, NO soft delete
echo "🔨 Generating Foo (public, no soft delete)..."
yarn hygen api new --model Foo --access=public --withSoftDelete=false --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/foo.router.ts")
GENERATED+=("apps/api/lib/services/foo.service.ts")
GENERATED+=("apps/api/lib/schemas/foo.ts")
GENERATED+=("apps/api/__tests__/foo.spec.ts")
echo "| Foo | public | ❌ | ✅ |" >> "$REPORT_FILE"

# Bar: public, WITH soft delete
echo "🔨 Generating Bar (public, with soft delete)..."
yarn hygen api new --model Bar --access=public --withSoftDelete=true --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/bar.router.ts")
GENERATED+=("apps/api/lib/services/bar.service.ts")
GENERATED+=("apps/api/lib/schemas/bar.ts")
GENERATED+=("apps/api/__tests__/bar.spec.ts")
echo "| Bar | public | ✅ | ✅ |" >> "$REPORT_FILE"

# Baz: protected, NO soft delete
echo "🔨 Generating Baz (protected, no soft delete)..."
yarn hygen api new --model Baz --access=protected --withSoftDelete=false --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/baz.router.ts")
GENERATED+=("apps/api/lib/services/baz.service.ts")
GENERATED+=("apps/api/lib/schemas/baz.ts")
GENERATED+=("apps/api/__tests__/baz.spec.ts")
echo "| Baz | protected | ❌ | ✅ |" >> "$REPORT_FILE"

# Qux: protected, WITH soft delete
echo "🔨 Generating Qux (protected, with soft delete)..."
yarn hygen api new --model Qux --access=protected --withSoftDelete=true --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/qux.router.ts")
GENERATED+=("apps/api/lib/services/qux.service.ts")
GENERATED+=("apps/api/lib/schemas/qux.ts")
GENERATED+=("apps/api/__tests__/qux.spec.ts")
echo "| Qux | protected | ✅ | ✅ |" >> "$REPORT_FILE"

# Quux: admin, NO soft delete
echo "🔨 Generating Quux (admin, no soft delete)..."
yarn hygen api new --model Quux --access=admin --withSoftDelete=false --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/quux.router.ts")
GENERATED+=("apps/api/lib/services/quux.service.ts")
GENERATED+=("apps/api/lib/schemas/quux.ts")
GENERATED+=("apps/api/__tests__/quux.spec.ts")
echo "| Quux | admin | ❌ | ✅ |" >> "$REPORT_FILE"

# Quuz: admin, WITH soft delete
echo "🔨 Generating Quuz (admin, with soft delete)..."
yarn hygen api new --model Quuz --access=admin --withSoftDelete=true --searchableFields=name || exit 1
GENERATED+=("apps/api/lib/routers/quuz.router.ts")
GENERATED+=("apps/api/lib/services/quuz.service.ts")
GENERATED+=("apps/api/lib/schemas/quuz.ts")
GENERATED+=("apps/api/__tests__/quuz.spec.ts")
echo "| Quuz | admin | ✅ | ✅ |" >> "$REPORT_FILE"

# Prisma Client 再生成
echo "🔄 Re-generating Prisma client..."
yarn prisma generate --schema=prisma/schema.prisma > /dev/null 2>&1

# バリデーション結果テーブル追加
echo "" >> "$REPORT_FILE"
echo "## Validation Results" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Check | Status | Time | Details |" >> "$REPORT_FILE"
echo "|-------|--------|------|---------|" >> "$REPORT_FILE"

# TypeScript チェック（生成ファイルのみ）
echo "🔍 Running TypeScript check..."
TSC_START=$(date +%s)
if yarn tsc -p tsconfig.generated.json --noEmit --skipLibCheck 2>&1; then
  TSC_STATUS="✅ 0 err"
  TSC_EXIT=0
else
  TSC_STATUS="❌ Failed"
  TSC_EXIT=1
fi
TSC_END=$(date +%s)
TSC_TIME=$((TSC_END - TSC_START))
echo "| TSC | $TSC_STATUS | ${TSC_TIME}s | Generated files only |" >> "$REPORT_FILE"

# ESLint チェック（生成ファイルのみ）
echo "🔍 Running ESLint..."
ESLINT_START=$(date +%s)
if yarn eslint --max-warnings=0 "${GENERATED[@]}" 2>&1; then
  ESLINT_STATUS="✅ 0 err"
  ESLINT_EXIT=0
else
  ESLINT_STATUS="❌ Failed"
  ESLINT_EXIT=1
fi
ESLINT_END=$(date +%s)
ESLINT_TIME=$((ESLINT_END - ESLINT_START))
echo "| ESLint | $ESLINT_STATUS | ${ESLINT_TIME}s | Max warnings: 0 |" >> "$REPORT_FILE"

# Vitest 実行（生成されたテストファイルのみ）
echo "🔍 Running Vitest..."
VITEST_START=$(date +%s)
TEST_FILES=""
for file in "${GENERATED[@]}"; do
  if [[ $file == *"__tests__"* ]]; then
    TEST_FILES="$TEST_FILES $file"
  fi
done

if yarn vitest run $TEST_FILES 2>&1; then
  VITEST_STATUS="✅ 6 pass"
  VITEST_EXIT=0
else
  VITEST_STATUS="❌ Failed"
  VITEST_EXIT=1
fi
VITEST_END=$(date +%s)
VITEST_TIME=$((VITEST_END - VITEST_START))
echo "| Vitest | $VITEST_STATUS | ${VITEST_TIME}s | 6 test suites |" >> "$REPORT_FILE"

# 総計
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
echo "| **Total** | — | ${TOTAL_TIME}s | — |" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "生成ファイル: Foo, Bar, Baz, Qux, Quux, Quuz (合計 24 ファイル)" >> "$REPORT_FILE"

# クリーンアップ
echo "🧹 Cleaning up generated files..."
for file in "${GENERATED[@]}"; do
  rm -f "$file"
done

# 完全クリーンアップ（ダミーモデルは残す）
echo "🔄 Restoring repository state..."
git restore apps/api/lib apps/api/__tests__ 2>/dev/null || true
git clean -fd apps/api/lib apps/api/__tests__ 2>/dev/null || true

# 結果サマリー
echo ""
echo "📊 Validation Report saved to: $REPORT_FILE"
cat "$REPORT_FILE"

# エラーがあれば終了コード1
if [[ $TSC_EXIT -ne 0 ]] || [[ $ESLINT_EXIT -ne 0 ]] || [[ $VITEST_EXIT -ne 0 ]]; then
  echo "❌ Validation failed!"
  exit 1
fi

echo "✅ All validations passed!"
exit 0