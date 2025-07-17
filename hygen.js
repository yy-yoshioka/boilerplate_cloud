const changeCase = require('change-case');

module.exports = {
  helpers: {
    changeCase,
    // ショートハンド
    pascal: (str) => changeCase.pascalCase(str),
    camel: (str) => changeCase.camelCase(str),
    kebab: (str) => changeCase.kebabCase(str),
  }
};