import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../web/dist');
const targetDir = path.resolve(__dirname, '../android/app/src/main/assets/web');

console.log('🔄 Syncing compiled web assets into Android APK assets...');

if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Source directory ${sourceDir} does not exist. Run 'npm run build' first.`);
  process.exit(1);
}

// Clean target directory
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Copy all files recursively
function copyFolderRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyFolderRecursive(sourceDir, targetDir);
console.log(`✅ Successfully synced compiled assets to: ${targetDir}`);
