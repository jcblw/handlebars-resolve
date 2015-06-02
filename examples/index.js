var HandlebarsDepResolve = require('..');

HandlebarsDepResolve({
  files: './templates/*.hbs',
  helper: 'view',
  outputFile: './resolves.js',
  basePath: './views/',
  cwd: process.cwd(),
  // need to simplify this....
  inject: [[{line: 1, column: 2}, '../views/quxz', 'a file']]
});
