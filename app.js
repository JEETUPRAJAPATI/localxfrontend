/*global require*/
/*eslint no-undef: "error"*/
require('dotenv').config();
const fs = require('fs');
const util = require('util');
// Load polyfills first
require('./polyfills');

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Create custom log files
// eslint-disable-next-line no-undef
const logDir = __dirname;
const debugLog = fs.createWriteStream(`${logDir}/debug.log`, { flags: 'a' });
const errorLog = fs.createWriteStream(`${logDir}/error.log`, { flags: 'a' });

// Enhanced console.log that writes to files AND stdout
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] INFO: ${util.format(...args)}\n`;
    debugLog.write(message);
    originalLog.apply(console, args);
};

console.error = function (...args) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ERROR: ${util.format(...args)}\n`;
    errorLog.write(message);
    originalError.apply(console, args);
};

// Log startup information
console.log('=== Application Starting ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_NODE_ENV:', process.env.NEXT_PUBLIC_NODE_ENV);
console.log('PORT:', process.env.PORT);
// eslint-disable-next-line no-undef
console.log('Current directory:', __dirname);
console.log('Node version:', process.version);

const dev = process.env.NEXT_PUBLIC_NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Changed to accept all interfaces
const port = process.env.PORT || 3000;

console.log('Starting Next.js app with dev mode:', dev);

const app = next({ dev });
const handle = app.getRequestHandler();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.stack || err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.prepare().then(() => {
    console.log('Next.js app prepared successfully');

    createServer(async (req, res) => {
        try {
            console.log(`Request: ${req.method} ${req.url}`);
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling request:', req.url, err.stack || err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }).listen(port, hostname, (err) => {
        if (err) {
            console.error('Server failed to start:', err);
            throw err;
        }
        console.log(`> Server ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('Failed to prepare Next.js app:', err.stack || err);
    process.exit(1);
});
