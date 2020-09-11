import { copyFileSync } from 'fs';

const template = 'template.md';
const destFile = 'README.md';

copyFileSync(template, destFile);
