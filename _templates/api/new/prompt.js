// SPDX-License-Identifier: MIT
const minimist = require('minimist');

module.exports = {
  prompt: ({ inquirer, args }) => {
    // process.argvからhygenコマンド部分を取り除く
    const processArgs = process.argv.slice(2);
    const hygenIndex = processArgs.indexOf('hygen');
    const relevantArgs = hygenIndex !== -1 ? processArgs.slice(hygenIndex + 3) : processArgs;
    const argv = minimist(relevantArgs);

    // === 非対話モード ===
    if (argv.model) {
      // --- 必須オプション検証 -----------------------------
      const missing = [];
      if (argv.withSoftDelete === undefined) missing.push('--withSoftDelete');
      if (!argv.access) missing.push('--access');
      if (missing.length) {
        console.error(`Missing required flags in non-interactive mode: ${missing.join(', ')}`);
        console.error(
          'Usage: yarn hygen api new --model ModelName --access [public|protected|admin] --withSoftDelete [true|false]',
        );
        process.exit(1);
      }
      // --- withSoftDelete 解析 -----------------------------
      const withSoftDelete =
        argv.withSoftDelete === true ||
        argv.withSoftDelete === 'true' ||
        argv.withSoftDelete === '1';
      // --- access バリデーション --------------------------
      const accessLevels = ['public', 'protected', 'admin'];
      if (!accessLevels.includes(argv.access)) {
        throw new Error(`--access must be one of: ${accessLevels.join(', ')}`);
      }

      return {
        model: argv.model,
        withSoftDelete,
        searchableFields: argv.searchableFields || 'name',
        access: argv.access,
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
        },
      },
      {
        type: 'list',
        name: 'access',
        message: 'Access level:',
        choices: ['public', 'protected', 'admin'],
        default: 'protected',
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Include soft delete functionality?',
        default: false, // デフォルトをfalseに変更（明示的な選択を促す）
      },
      {
        type: 'input',
        name: 'searchableFields',
        message: 'Searchable fields (comma-separated):',
        default: 'name',
      },
    ]);
  },
};
