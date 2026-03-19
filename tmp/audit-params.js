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

const files = walk(path.join(process.cwd(), 'src', 'app'));
const missingAwait = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('({ params') || content.includes('({ searchParams')) {
    const hasAwaitParams = content.includes('await params');
    const hasAwaitSearchParams = content.includes('await searchParams');
    
    // Simple heuristic: if it mentions params/searchParams in the arg list but doesn't await them
    if ((content.includes('params') && !hasAwaitParams && !file.includes('route.js')) || 
        (content.includes('searchParams') && !hasAwaitSearchParams && !file.includes('route.js'))) {
        
        // Check if params is actually an argument
        const lines = content.split('\n');
        const functionLines = lines.filter(l => l.includes('function') && (l.includes('params') || l.includes('searchParams')));
        
        if (functionLines.some(l => l.includes('{ params') || l.includes('{ searchParams'))) {
           // Double check if they are already awaited or if it's a client component
           if (!content.includes("'use client'")) {
              missingAwait.push(file);
           }
        }
    }
  }
});

console.log('Files potentially missing await:');
missingAwait.forEach(f => console.log(f));
