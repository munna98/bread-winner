// const fs = require('fs');
// const path = require('path');

// function walk(dir, indent = '') {
//   const items = fs.readdirSync(dir);
//   for (let item of items) {
//     if (['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) continue;
//     const fullPath = path.join(dir, item);
//     const isDir = fs.statSync(fullPath).isDirectory();
//     console.log(`${indent}${isDir ? '📁' : '📄'} ${item}`);
//     if (isDir) walk(fullPath, indent + '  ');
//   }
// }

// walk(process.cwd());

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir, prefix = '', isRoot = true) {
  const items = readdirSync(dir).filter(item =>
    !['node_modules', '.git', '.next', 'dist', 'build'].includes(item)
  );

  items.forEach((item, index) => {
    const fullPath = join(dir, item);
    const isDir = statSync(fullPath).isDirectory();
    const isLast = index === items.length - 1;

    const connector = isLast ? '└── ' : '├── ';
    console.log(prefix + connector + item + (isDir ? '/' : ''));

    if (isDir) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      walk(fullPath, newPrefix, false);
    }
  });
}

walk(process.cwd());
