import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verify} from './verify.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
verify(path.join(root,'public'));
fs.cpSync(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
verify(path.join(root,'dist'));
console.log('Website built into dist/ from the canonical public/ files.');
