const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(), 'src', 'components', 'ui', 'table.jsx');
console.log('Checking file:', filePath);
console.log('Exists:', fs.existsSync(filePath));

try {
  // Mocking the alias manually for simple node check
  const aliasPath = path.join(process.cwd(), 'src', 'components', 'ui', 'table.jsx');
  console.log('Attempting to read file content...');
  const content = fs.readFileSync(aliasPath, 'utf8');
  console.log('File read successfully. Length:', content.length);
  console.log('First 50 chars:', content.substring(0, 50));
} catch (e) {
  console.error('Error reading file:', e);
}
