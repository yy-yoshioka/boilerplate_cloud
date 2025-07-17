# Contributing Guide (Boilerplate Cloud)

1. **2 コミットルール**
   1. `yarn gen:api <Model>` → `chore(scaffold): <model>` をコミット
   2. 実装・テストを緑にして `feat(api): <model>` を別コミットに。

2. **禁止事項**
   - `packages/shared-types/src/errors.ts` を直接編集しない
   - `class` / `extends` / `interface` の宣言は禁止
   - `TODO:` を残したまま PR を出さない

3. **CLI**
   - 新規エラーは `yarn gen:error CODE "Human readable message"`
   - スキーマ同期は `yarn gen:schema`
