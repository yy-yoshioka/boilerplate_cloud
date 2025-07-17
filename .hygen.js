// Hygen configuration – 100% 関数ベース
/** @type {import('hygen').Config} */
module.exports = {
  helpers: {
    pascal: (str) => str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase()),
    camel: (str) => str.replace(/-./g, (c) => c[1].toUpperCase()),
  },
  templates: `${__dirname}/_templates`,
};
