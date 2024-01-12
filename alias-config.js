const moduleAlias = require('module-alias');

const isProduction = process.env.NODE_ENV === 'production';

moduleAlias.addAliases({
  '@': isProduction ? __dirname + '/dist/app' : __dirname + '/app',
  // 其他别名...
});
