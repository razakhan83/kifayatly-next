const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));

files.forEach(file => {
  if (file.includes('mongooseConnect.js')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('dbConnect')) {
    console.log(`Updating ${file}`);
    content = content.replace(/dbConnect/g, 'mongooseConnect');
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Update complete.');
