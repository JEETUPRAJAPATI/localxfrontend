const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to temporarily move problematic files
function moveProblematicFiles() {
    const backupDir = path.join(__dirname, '.backup');
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Files that can't be statically exported
    const problematicFiles = [
        'src/pages/sitemap.xml.js',
        'src/pages/api/revalidate.js'
    ];
    
    problematicFiles.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            const backupPath = path.join(backupDir, path.basename(filePath));
            fs.renameSync(fullPath, backupPath);
            console.log(`Moved ${filePath} to backup`);
        }
    });
}

// Function to restore problematic files
function restoreProblematicFiles() {
    const backupDir = path.join(__dirname, '.backup');
    
    const problematicFiles = [
        { backup: 'sitemap.xml.js', original: 'src/pages/sitemap.xml.js' },
        { backup: 'revalidate.js', original: 'src/pages/api/revalidate.js' }
    ];
    
    problematicFiles.forEach(({ backup, original }) => {
        const backupPath = path.join(backupDir, backup);
        const originalPath = path.join(__dirname, original);
        
        if (fs.existsSync(backupPath)) {
            // Ensure directory exists
            const dir = path.dirname(originalPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.renameSync(backupPath, originalPath);
            console.log(`Restored ${original}`);
        }
    });
}

// Function to temporarily remove revalidate from files
function removeRevalidateFromFiles() {
    const pagesDir = path.join(__dirname, 'src', 'pages');
    const backupDir = path.join(__dirname, '.backup');
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Function to process files recursively
    function processFiles(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                processFiles(filePath);
            } else if (file.endsWith('.js')) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Check if file contains revalidate
                if (content.includes('revalidate:')) {
                    // Create backup
                    const relativePath = path.relative(pagesDir, filePath);
                    const backupPath = path.join(backupDir, relativePath);
                    const backupDirPath = path.dirname(backupPath);
                    
                    if (!fs.existsSync(backupDirPath)) {
                        fs.mkdirSync(backupDirPath, { recursive: true });
                    }
                    
                    fs.writeFileSync(backupPath, content);
                    
                    // Remove revalidate lines
                    const modifiedContent = content.replace(/,?\s*revalidate:\s*\d+,?\s*(\/\/.*)?/g, '');
                    fs.writeFileSync(filePath, modifiedContent);
                    
                    console.log(`Processed: ${relativePath}`);
                }
            }
        });
    }
    
    processFiles(pagesDir);
}

// Function to restore files from backup
function restoreFiles() {
    const pagesDir = path.join(__dirname, 'src', 'pages');
    const backupDir = path.join(__dirname, '.backup');
    
    if (!fs.existsSync(backupDir)) {
        return;
    }
    
    function restoreFilesRecursive(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const backupPath = path.join(dir, file);
            const stat = fs.statSync(backupPath);
            
            if (stat.isDirectory()) {
                restoreFilesRecursive(backupPath);
            } else if (file.endsWith('.js')) {
                const relativePath = path.relative(backupDir, backupPath);
                const originalPath = path.join(pagesDir, relativePath);
                
                const backupContent = fs.readFileSync(backupPath, 'utf8');
                fs.writeFileSync(originalPath, backupContent);
                
                console.log(`Restored: ${relativePath}`);
            }
        });
    }
    
    restoreFilesRecursive(backupDir);
    
    // Remove backup directory
    fs.rmSync(backupDir, { recursive: true, force: true });
}

// Main execution
try {
    console.log('Starting static export build...');
    
    // Step 1: Move problematic files that can't be statically exported
    console.log('Moving problematic files...');
    moveProblematicFiles();
    
    // Step 2: Remove revalidate from all files
    console.log('Removing revalidate properties...');
    removeRevalidateFromFiles();
    
    // Step 3: Run the build with export
    console.log('Building for export...');
    execSync('cross-env NEXT_EXPORT=true next build', { stdio: 'inherit' });
    
    console.log('Static export build completed successfully!');
    
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
} finally {
    // Step 4: Restore original files
    console.log('Restoring original files...');
    restoreFiles();
    restoreProblematicFiles();
    console.log('Files restored.');
}