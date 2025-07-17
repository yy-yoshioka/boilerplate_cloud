const changeCase = require('change-case');

module.exports = {
  helpers: {
    changeCase,
    // ショートハンド（後方互換性）
    pascal: (str) => changeCase.pascalCase(str),
    camel: (str) => changeCase.camelCase(str),
    kebab: (str) => changeCase.kebabCase(str),

    // プロジェクト設定
    config: {
      trpcPath: '@boilerplate/trpc',
      utilsPath: '@boilerplate/shared-utils',
      typesPath: '@boilerplate/shared-types',
    }
  }
};