// Global polyfills for server-side rendering
// This file prevents "self is not defined" and other browser global errors

if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // Polyfill browser globals for server-side rendering
  global.self = global;
  global.window = undefined;
  global.document = undefined;
  global.navigator = undefined;
  global.location = undefined;
  global.localStorage = undefined;
  global.sessionStorage = undefined;
  
  // For libraries that check for these globals
  global.HTMLElement = undefined;
  global.HTMLAnchorElement = undefined;
  global.HTMLButtonElement = undefined;
  
  // For web-vitals and performance libraries
  global.performance = global.performance || {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  };
  
  // For intersection observer
  global.IntersectionObserver = undefined;
  global.ResizeObserver = undefined;
  global.MutationObserver = undefined;
  
  console.log('✅ Server-side polyfills loaded');
}