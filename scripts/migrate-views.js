const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend', 'src');
const srcDir = path.join(rootDir, 'src');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processFile(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8');

  // Replace imports
  content = content.replace(/from\s+['"]react-router-dom['"]/g, "from '@/lib/router-compat'");
  content = content.replace(/from\s+['"]\.\.\/services\/api['"]/g, "from '@/services/api'");
  content = content.replace(/from\s+['"]\.\/services\/api['"]/g, "from '@/services/api'");
  content = content.replace(/from\s+['"]\.\.\/context\/AuthContext['"]/g, "from '@/context/AuthContext'");
  content = content.replace(/from\s+['"]\.\/context\/AuthContext['"]/g, "from '@/context/AuthContext'");
  content = content.replace(/from\s+['"]\.\.\/components\//g, "from '@/components/");
  content = content.replace(/from\s+['"]\.\/components\//g, "from '@/components/");

  // Add 'use client'; if not present
  if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
    content = `'use client';\n` + content;
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`Copied & adapted: ${path.basename(destPath)}`);
}

// 1. Components
const compSrc = path.join(frontendDir, 'components');
const compDest = path.join(srcDir, 'components');
ensureDir(compDest);
if (fs.existsSync(compSrc)) {
  fs.readdirSync(compSrc).forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(compSrc, file), path.join(compDest, file.replace(/\.jsx$/, '.tsx').replace(/\.js$/, '.ts')));
    }
  });
}

// 2. Views / Pages
const pageSrc = path.join(frontendDir, 'pages');
const viewsDest = path.join(srcDir, 'views');
ensureDir(viewsDest);
if (fs.existsSync(pageSrc)) {
  fs.readdirSync(pageSrc).forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(pageSrc, file), path.join(viewsDest, file.replace(/\.jsx$/, '.tsx').replace(/\.js$/, '.ts')));
    }
  });
}

// 3. Layouts
const layoutSrc = path.join(frontendDir, 'layouts');
const layoutDest = path.join(srcDir, 'layouts');
ensureDir(layoutDest);
if (fs.existsSync(layoutSrc)) {
  fs.readdirSync(layoutSrc).forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(path.join(layoutSrc, file), path.join(layoutDest, file.replace(/\.jsx$/, '.tsx').replace(/\.js$/, '.ts')));
    }
  });
}

console.log('Migration of UI components completed successfully.');
