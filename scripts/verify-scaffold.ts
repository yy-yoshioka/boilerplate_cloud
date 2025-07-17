#!/usr/bin/env ts-node

const { globby } = require('globby');
const { readFile } = require('fs/promises');
const { ERROR, ErrorMessages } = require('../packages/shared-types/src/errors');

const main = async () => {
  // TODO検査
  const files = await globby(['apps/api/lib/**/*.{ts,tsx}', '!**/*.{spec,test}.ts']);

  const todoOffenders = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (content.match(/(?:TODO|FIXME|XXX):/)) {
      todoOffenders.push(file);
    }
  }

  if (todoOffenders.length > 0) {
    console.error('⛔  残TODO/FIXME/XXXが存在します:');
    todoOffenders.forEach((f) => console.error(`   • ${f}`));
    process.exit(1);
  }

  // ERROR/ErrorMessages整合性チェック
  const errorKeys = Object.keys(ERROR);
  const missingMessages = errorKeys.filter((key) => !ErrorMessages[key]);

  if (missingMessages.length > 0) {
    console.error('⛔  ErrorMessagesに定義が不足しています:');
    missingMessages.forEach((key) => console.error(`   • ${key}`));
    process.exit(1);
  }

  // ErrorMessagesに余分なキーがないかチェック
  const messageKeys = Object.keys(ErrorMessages);
  const extraMessages = messageKeys.filter((key) => !(key in ERROR));

  if (extraMessages.length > 0) {
    console.error('⛔  ErrorMessagesに余分な定義があります:');
    extraMessages.forEach((key) => console.error(`   • ${key}`));
    process.exit(1);
  }

  console.log('✅  Scaffold drift なし (TODO/FIXME/XXX: 0)');
  console.log('✅  ERROR/ErrorMessages 整合性 OK');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
