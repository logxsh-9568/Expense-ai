const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Headers: remove bg-white/80, use glass-panel
  content = content.replace(/bg-white\/80 backdrop-blur-xs/g, 'glass-panel anime-item');
  content = content.replace(/bg-white\/80/g, 'glass-panel anime-item');
  
  // Cards: replace bg-white rounded-xl with glass-panel anime-item
  content = content.replace(/bg-white rounded-xl/g, 'glass-panel anime-item rounded-xl');
  
  // Any other bg-white that needs changing
  content = content.replace(/className="bg-white/g, 'className="glass-panel anime-item');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', file);
}

// Sidebar also
const sidebarPath = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
sidebarContent = sidebarContent.replace(/bg-white\/40 backdrop-blur-md/g, 'glass-panel');
sidebarContent = sidebarContent.replace(/bg-slate-50\/80/g, 'glass-panel anime-item');
sidebarContent = sidebarContent.replace(/bg-slate-50 /g, 'glass-panel anime-item ');
fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');
console.log('Updated Sidebar.tsx');
