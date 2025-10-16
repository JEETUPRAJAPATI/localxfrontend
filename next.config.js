/*global require*/
/*eslint no-undef: "error"*/
const { ROUTES } = require('./src/utils/constant');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
    // Enable static export only when NEXT_EXPORT is set
    ...(process.env.NEXT_EXPORT && {
        output: 'export',
        trailingSlash: true,
        skipTrailingSlashRedirect: true,
        // Exclude pages that can't be statically exported
        exportPathMap: async function (defaultPathMap) {
            // Remove problematic pages
            const pathsToRemove = [
                '/sitemap.xml',
                '/api/revalidate',
                '/blog',
                '/blog/[slug]',
                '/blog/category/[category]',
                '/site-links/search',
                '/user-panel/recharge-balance/manual-payment',
                '/sitemap/posts/[page]',
                '/sitemap/posts/categories',
                '/sitemap/posts/partners',
                '/sitemap/posts/static-pages'
            ];
            
            const filteredPathMap = {};
            Object.keys(defaultPathMap).forEach(path => {
                if (!pathsToRemove.includes(path) && !path.startsWith('/api/')) {
                    filteredPathMap[path] = defaultPathMap[path];
                }
            });
            
            return filteredPathMap;
        },
        images: {
            unoptimized: true,
            domains: ["localhost", "api.localxlist.net"],
            deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
            imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
            minimumCacheTTL: 60,
            formats: ['image/webp'],
        }
    }),
    // Performance optimizations
    compress: true,
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    // Disable ISR when exporting
    generateBuildId: async () => {
        return process.env.NEXT_EXPORT ? 'export-build' : null;
    },
    async rewrites() {
        return [
            {
                source: ROUTES.userDashboard,
                destination: ROUTES.userDashboardMain,
            },
            {
                source: '/sitemap-pages.xml',
                destination: '/sitemap/posts/static-pages',
            },
            {
                source: '/sitemap-posts-:page.xml',
                destination: '/sitemap/posts/:page',
            },
            {
                source: '/sitemap-categories.xml',
                destination: '/sitemap/posts/categories',
            },
            {
                source: '/sitemap-partners.xml',
                destination: '/sitemap/posts/partners',
            },
        ];
    },
    // Standard configuration
    productionBrowserSourceMaps: false,
    compress: true,
    // HTTP headers for better performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    }
                ]
            },
            {
                source: '/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            {
                source: '/images/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400'
                    }
                ]
            }
        ];
    },
    // Experimental features (keep only valid ones)
    experimental: {
        optimizePackageImports: [
            'react-bootstrap',
            'react-google-recaptcha',
            'react-player',
            'yet-another-react-lightbox',
            '@tinymce/tinymce-react',
            '@fortawesome/react-fontawesome',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-regular-svg-icons'
        ],
        // Remove optimizeCss as it requires additional dependencies
        // Tree shake unused code
        serverMinification: true,
        // Remove modularizeImports as it's now handled by optimizePackageImports
    },

    webpack: (config, { isServer, dev }) => {
        console.log('Environment:', {
            NODE_ENV: process.env.NODE_ENV,
            isServer,
            isDev: dev
        });

        // Enable gzip compression for all assets
        if (!dev) {
            const CompressionPlugin = require('compression-webpack-plugin');
            config.plugins.push(
                new CompressionPlugin({
                    algorithm: 'gzip',
                    test: /\.(js|css|html|svg)$/,
                    threshold: 8192,
                    minRatio: 0.8,
                })
            );
        }

        // Optimize module resolution
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };

        // Handle browser globals for server-side rendering
        if (isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
            
            // Add node polyfills to prevent 'self is not defined' errors
            config.node = {
                ...config.node,
                global: true,
            };
            
            // Polyfill browser globals for server
            const webpack = require('webpack');
            config.plugins.push(
                new webpack.DefinePlugin({
                    'typeof window': '"undefined"',
                    'typeof document': '"undefined"',
                    'typeof self': '"undefined"',
                    'typeof global': '"object"',
                    self: 'global',
                    window: 'undefined',
                    document: 'undefined',
                })
            );
        }

        // Tree shaking optimization
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;

        // Aggressive code splitting for better performance
        config.optimization = {
            ...config.optimization,
            splitChunks: {
                chunks: 'all',
                minSize: 10000, // 10KB minimum chunk size
                maxSize: 100 * 1024, // 100KB maximum chunk size (reduced)
                minChunks: 1,
                maxAsyncRequests: 30,
                maxInitialRequests: 6, // Reduced from 30 to 6
                automaticNameDelimiter: '~',
                cacheGroups: {
                    // Essential React chunks
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                        name: 'react-core',
                        chunks: 'all',
                        priority: 30,
                        enforce: true,
                    },
                    // Redux - separate chunk
                    redux: {
                        test: /[\\/]node_modules[\\/](redux|react-redux|@reduxjs\/toolkit|reselect)[\\/]/,
                        name: 'redux',
                        chunks: 'all',
                        priority: 25,
                        enforce: true,
                    },
                    // Bootstrap - separate chunk
                    bootstrap: {
                        test: /[\\/]node_modules[\\/](bootstrap|react-bootstrap)[\\/]/,
                        name: 'bootstrap',
                        chunks: 'all',
                        priority: 20,
                    },
                    // Heavy third-party libraries - async only
                    heavyLibs: {
                        test: /[\\/]node_modules[\\/](react-player|yet-another-react-lightbox|@tinymce\/tinymce-react|react-google-recaptcha)[\\/]/,
                        name: 'heavy-libs',
                        chunks: 'async', // Only load when needed
                        priority: 15,
                    },
                    // FontAwesome
                    fontawesome: {
                        test: /[\\/]node_modules[\\/](@fortawesome)[\\/]/,
                        name: 'fontawesome',
                        chunks: 'all',
                        priority: 10,
                    },
                    // Utilities
                    utils: {
                        test: /[\\/]node_modules[\\/](axios|js-cookie|query-string|formik|yup|dompurify|html-react-parser)[\\/]/,
                        name: 'utils',
                        chunks: 'all',
                        priority: 8,
                    },
                    // Default vendor chunk
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all',
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                    // Common code across pages
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                        priority: 0,
                        reuseExistingChunk: true,
                    }
                }
            }
        };

        return config;
    },
    // SCSS configuration
    sassOptions: {
        quietDeps: true,
        logger: {
            warn: function (message, { deprecation }) {
                if (deprecation) return;
                console.warn(message);
            }
        },
        includePaths: ['styles'],
    },
    // Images configuration (only when not exporting)
    ...(!process.env.NEXT_EXPORT && {
        images: {
            domains: ["localhost", "api.localxlist.net"],
            deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
            imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
            minimumCacheTTL: 60,
            formats: ['image/webp'],
        },
    }),
    // For React Bootstrap
    transpilePackages: ['react-bootstrap'],
});