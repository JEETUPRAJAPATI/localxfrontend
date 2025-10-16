const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define all problematic files that need to be temporarily moved
const PROBLEMATIC_FILES = [
    // Sitemap files with getServerSideProps
    'src/pages/sitemap.xml.js',
    'src/pages/sitemap/posts/[page].js',
    'src/pages/sitemap/posts/categories.js',
    'src/pages/sitemap/posts/partners.js',
    'src/pages/sitemap/posts/static-pages.js',
    
    // Blog files with getServerSideProps
    'src/pages/blog/index.js',
    'src/pages/blog/[slug].js',
    'src/pages/blog/category/[category].js',
    
    // Other SSR pages
    'src/pages/site-links/search.js',
    'src/pages/user-panel/recharge-balance/manual-payment.js',
    
    // Middleware that can cause issues
    'src/middleware.js',
    
    // API revalidate
    'src/pages/api/revalidate.js'
];

// Store moved files info
const movedFiles = [];

function moveProblematicFiles() {
    console.log('🔄 Temporarily moving problematic files...');
    
    // Create backup directory
    const backupDir = '.backup';
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    PROBLEMATIC_FILES.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const backupPath = path.join(backupDir, path.basename(filePath));
            let counter = 1;
            let finalBackupPath = backupPath;
            
            // Handle duplicate names
            while (fs.existsSync(finalBackupPath)) {
                const ext = path.extname(backupPath);
                const name = path.basename(backupPath, ext);
                finalBackupPath = path.join(backupDir, `${name}_${counter}${ext}`);
                counter++;
            }
            
            console.log(`  Moving: ${filePath} -> ${finalBackupPath}`);
            fs.renameSync(filePath, finalBackupPath);
            movedFiles.push({ original: filePath, backup: finalBackupPath });
        }
    });
    
    console.log(`✅ Moved ${movedFiles.length} problematic files`);
}

function restoreFiles() {
    console.log('🔄 Restoring moved files...');
    
    movedFiles.forEach(({ original, backup }) => {
        if (fs.existsSync(backup)) {
            console.log(`  Restoring: ${backup} -> ${original}`);
            
            // Ensure directory exists
            const dir = path.dirname(original);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.renameSync(backup, original);
        }
    });
    
    // Remove backup directory if empty
    try {
        const backupDir = '.backup';
        if (fs.existsSync(backupDir)) {
            const files = fs.readdirSync(backupDir);
            if (files.length === 0) {
                fs.rmdirSync(backupDir);
            }
        }
    } catch (err) {
        // Ignore errors when cleaning up
    }
    
    console.log('✅ All files restored');
}

function removeRevalidateFromFiles() {
    console.log('🔄 Temporarily removing revalidate from remaining files...');
    
    const filesToPatch = [
        'src/pages/index.js',
        'src/pages/about-us.js',
        'src/pages/contact-us.js',
        'src/pages/friends.js',
        'src/pages/login.js',
        'src/pages/signup.js',
        'src/pages/terms-and-conditions.js',
        'src/pages/homev1.js',
        'src/pages/partners.js',
        'src/pages/partners/add.js',
        'src/pages/site-links.js',
        'src/pages/forgot-password.js',
        'src/pages/forgot-verification.js',
        'src/pages/reset-password.js',
        'src/pages/signup-verification.js'
    ];
    
    const backups = [];
    
    filesToPatch.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('revalidate:')) {
                    console.log(`  Patching: ${filePath}`);
                    
                    // Backup original content
                    const backupPath = filePath + '.backup';
                    fs.writeFileSync(backupPath, content);
                    backups.push({ original: filePath, backup: backupPath });
                    
                    // Remove revalidate lines
                    const patchedContent = content.replace(/,?\s*revalidate:\s*\d+,?\s*/g, '');
                    fs.writeFileSync(filePath, patchedContent);
                }
            } catch (err) {
                console.warn(`  Warning: Could not patch ${filePath}:`, err.message);
            }
        }
    });
    
    return backups;
}

function restoreRevalidateFiles(backups) {
    console.log('🔄 Restoring revalidate in files...');
    
    backups.forEach(({ original, backup }) => {
        if (fs.existsSync(backup)) {
            console.log(`  Restoring: ${original}`);
            const content = fs.readFileSync(backup, 'utf8');
            fs.writeFileSync(original, content);
            fs.unlinkSync(backup);
        }
    });
    
    console.log('✅ All revalidate files restored');
}

async function main() {
    console.log('🚀 Starting static export build process...\n');
    
    let revalidateBackups = [];
    
    try {
        // Step 1: Move problematic files
        moveProblematicFiles();
        
        // Step 2: Remove revalidate from remaining files
        revalidateBackups = removeRevalidateFromFiles();
        
        // Step 3: Run the build
        console.log('\n📦 Running Next.js build with export...');
        execSync('cross-env NEXT_EXPORT=true next build', { 
            stdio: 'inherit',
            env: { ...process.env, NEXT_EXPORT: 'true' }
        });
        
        console.log('\n✅ Static export build completed successfully!');
        console.log('📁 Check the "out" folder for your static files.');
        
    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        process.exit(1);
    } finally {
        // Always restore files
        console.log('\n🔄 Cleaning up...');
        restoreRevalidateFiles(revalidateBackups);
        restoreFiles();
        console.log('✅ Cleanup completed\n');
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Build interrupted. Cleaning up...');
    restoreFiles();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Build terminated. Cleaning up...');
    restoreFiles();
    process.exit(0);
});

main().catch(error => {
    console.error('❌ Unexpected error:', error);
    restoreFiles();
    process.exit(1);
});