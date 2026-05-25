const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Run Vite build inside the frontend directory
  console.log('Building frontend application...');
  execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  // 2. Define source and destination directories
  const srcDir = path.join(__dirname, 'frontend', 'dist');
  const destDir = path.join(__dirname, 'public');

  // 3. Clear or create the root public directory
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  // 4. Copy helper function to recursively copy directories
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // 5. Copy the build outputs to root public
  console.log('Copying built assets to root public directory...');
  copyDir(srcDir, destDir);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build script failed:', error);
  process.exit(1);
}
