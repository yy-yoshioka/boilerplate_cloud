const minimist = require('minimist');

module.exports = {
  prompt: ({ inquirer, args }) => {
    // Hygenのargs.rawを使用（process.argvの直接参照を避ける）
    const argv = minimist(args.raw || []);

    // === 非対話モード ===
    if (argv.model) {
      // --- 必須オプション検証 -----------------------------
      const missing = [];
      if (argv.withSoftDelete === undefined) missing.push('--withSoftDelete');
      if (!argv.access) missing.push('--access');
      if (missing.length) {
        throw new Error(`Missing required flags in non‑interactive mode: ${missing.join(', ')}`);
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
