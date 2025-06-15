const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'templates');
const dest = path.join(__dirname, 'dist', 'templates');

fs.cpSync(source, dest, { recursive: true });
console.log('✅ Templates copied to dist');
