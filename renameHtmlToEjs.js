const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'views');

function renameHtmlToEjs(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameHtmlToEjs(fullPath); // recursive for subfolders
    } else if (path.extname(fullPath) === '.html') {
      const newPath = fullPath.replace(/\.html$/, '.ejs');
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} → ${newPath}`);
    }
  });
}

renameHtmlToEjs(directory);
console.log('✅ All .html files renamed to .ejs');
