# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Hygen v1 基盤導入** - 高速・型安全なスカフォールド生成システムを実装
  - 3パターンのアクセスレベル (public/protected/admin) に対応
  - TypeScript/ESLint/Vitest完全対応、10秒以内でFail-fast検証完了
  - `yarn test:hygen` でローカル検証可能

### Changed
- スカフォールド生成を`gen:api`から`hygen api new`ベースに移行
- CI/CDパイプラインにスモークテストを追加

### Fixed
- HTMLエンティティエスケープ問題を解消
- Prismaモック型の安全性を向上