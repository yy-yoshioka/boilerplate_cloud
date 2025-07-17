const minimist = require('minimist');

module.exports = {
  prompt: ({ inquirer }) => {
    const argv = minimist(process.argv.slice(2));
    
    // CI/CD用: 引数があれば対話をスキップ
    if (argv.model) {
      return {
        model: argv.model,
        withSoftDelete: argv.withSoftDelete !== 'false',
        searchableFields: argv.searchableFields || 'name',
      };
    }
    
    return inquirer.prompt([
      {
        type: 'input',
        name: 'model',
        message: 'Model name (PascalCase):',
        validate: (v) => /^[A-Z][a-zA-Z0-9]*$/.test(v) || 'Must be PascalCase'
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Include soft delete?',
        default: true
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