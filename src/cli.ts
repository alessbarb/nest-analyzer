/** @format */

import yargs from 'yargs';
import {analyzeNestProject} from './main';

const argv = yargs(process.argv.slice(2))
  .strict()
  .usage('Usage: $0 [options]')
  .option('path', {
    alias: 'p',
    describe: 'Project path or NestJS file to analyze',
    demandOption: true,
    type: 'string',
  })
  .help('h')
  .alias('h', 'help')
  .parse();
if ((argv as any).path) {
  analyzeNestProject((argv as any).path).then(dotOutput => {
    console.log(dotOutput);
  });
}
