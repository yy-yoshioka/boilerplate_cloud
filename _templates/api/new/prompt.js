const minimist = require('minimist');

module.exports = {
  prompt: ({ inquirer, args }) => {
    // Hygenのargs.rawを使用（process.argvの直接参照を避ける）
    const argv = minimist(args.raw || []);
    
    // CI/CD用: 必須引数チェック
    if (argv.model) {
      // withSoftDeleteは明示的な指定を要求
      if (argv.withSoftDelete === undefined) {
        throw new Error('--withSoftDelete true|false is required in non-interactive mode');
      }
      
      // 文字列と真偽値の両方に対応
      const withSoftDelete = argv.withSoftDelete === true || argv.withSoftDelete === 'true';
      
      return {
        model: argv.model,
        withSoftDelete,
        searchableFields: argv.searchableFields || 'name',
        access: argv.access || 'protected', // デフォルトはprotected
      };
    }
    
    // 対話モード
    return inquirer.prompt([
      {
        type: 'input',
        name: 'model',
        message: 'Model name (PascalCase, e.g., Project, OrganizationMember):',
        validate: (v) => {
          if (!v.length) return 'Model name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(v)) {
            return 'Must be PascalCase (e.g., Project, OrganizationMember)';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'access',
        message: 'Access level:',
        choices: ['public', 'protected', 'admin'],
        default: 'protected'
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Include soft delete functionality?',
        default: false // デフォルトをfalseに変更（明示的な選択を促す）
      },
      {
        type: 'input',
        name: 'searchableFields',
        message: 'Searchable fields (comma-separated):',
        default: 'name'
      }
    ]);
  }
};