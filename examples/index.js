var HandlebarsDepResolve = require('..');

HandlebarsDepResolve({
  files: './templates/*.hbs',
  helper: 'view',
  outputFile: './resolves.js',
  basePath: './views/'
});
