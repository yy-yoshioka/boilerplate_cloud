# Hygen Smoke 6× Patterns – Validation Report (2025-07-19)

| Model | Access | SoftDelete | Generated |
|-------|--------|------------|-----------|
| Foo | public | ❌ | ✅ |
| Bar | public | ✅ | ✅ |
| Baz | protected | ❌ | ✅ |
| Qux | protected | ✅ | ✅ |
| Quux | admin | ❌ | ✅ |
| Quuz | admin | ✅ | ✅ |

## Validation Results

| Check | Status | Time | Details |
|-------|--------|------|---------|
| TSC | ✅ 0 err | 1s | Generated files only |
| ESLint | ✅ 0 err | 2s | Max warnings: 0 |
| Vitest | ✅ 6 pass | 1s | 6 test suites |
| **Total** | — | 11s | — |

生成ファイル: Foo, Bar, Baz, Qux, Quux, Quuz (合計 24 ファイル)
