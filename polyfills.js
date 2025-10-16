// Global polyfills for server-side rendering
// This file prevents "self is not defined" errors in Node.js environment

if (typeof global !== 'undefined') {
  // Polyfill browser globals for server environment
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  
  if (typeof global.window === 'undefined') {
    global.window = undefined;
  }
  
  if (typeof global.document === 'undefined') {
    global.document = undefined;
  }
  
  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js'
    };
  }
  
  if (typeof global.location === 'undefined') {
    global.location = {
      href: '',
      origin: '',
      protocol: 'https:',
      host: '',
      hostname: '',
      port: '',
      pathname: '/',
      search: '',
      hash: ''
    };
  }
}

// Export for Next.js
module.exports = {};