# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Hygen v1 基盤導入** - 高速・型安全なスカフォールド生成システムを実装
  - 3パターンのアクセスレベル (public/protected/admin) に対応
  - TypeScript/ESLint/Vitest完全対応、10秒以内でFail-fast検証完了
  - `yarn test:hygen` でローカル検証可能

### Changed
- スカフォールド生成を`gen:api`から`hygen api new`ベースに完全移行
- CI/CDパイプラインにスモークテストを追加
- 古い`gen:api`スクリプトを非推奨化

### Removed
- `scripts/gen-api.ts` - Hygenへの完全移行により削除

### Fixed
- HTMLエンティティエスケープ問題を解消
- Prismaモック型の安全性を向上