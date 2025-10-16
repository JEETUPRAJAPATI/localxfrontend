let DOMPurify = null;

// Load DOMPurify dynamically on the client side
if (typeof window !== 'undefined') {
  import('dompurify').then((mod) => {
    DOMPurify = mod.default || mod;
  });
}
import queryString from 'query-string';

export const appendScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  // const script = document.createElement("script");
  // script.src = scriptToAppend;
  // script.async = true;
  // document.body.appendChild(script);
};
export const removeScript = (scriptToremove) => {
  let allsuspects = document.getElementsByTagName('script');
  try {
    for (let i = allsuspects.length; i >= 0; i--) {
      if (
        allsuspects[i] &&
        allsuspects[i].getAttribute('src') !== null &&
        allsuspects[i].getAttribute('src').indexOf(`${scriptToremove}`) !== -1
      ) {
        allsuspects[i]?.parentNode?.removeChild(allsuspects[i]);
      }
    }
  } catch (error) {
    console.log(error);
  }

  // const script = document.querySelector(`script[src="${scriptToremove}"]`);
  // if (script) {
  //   script.remove();
  // }
};
export const convertToSlug = (Text) => {
  return Text.toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
};

export const slugify = (text) => {
  return text
    ?.toLowerCase()
    .replace(/ /g, '-')          // Replace spaces with -
    .replace(/[^\w.-]+/g, '')    // Remove all non-word chars except dots and hyphens
    .replace(/\.{2,}/g, '.')     // Replace multiple dots with single dot
    .replace(/-{2,}/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

export const unslugify = (text) => {
  if (!text) return text;

  return text
    .replace(/-/g, ' ')       // Replace hyphens with spaces
    .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize first letters
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim();                  // Trim whitespace
};

export const queryStringParse = (Text) => {
  return queryString.parse(Text);
};
export const dynamicSort = (key, order = 'asc') => {
  return function innerSort(a, b) {
    // Use Object.prototype.hasOwnProperty.call() to safely check for property existence
    if (
      !Object.prototype.hasOwnProperty.call(a, key) ||
      !Object.prototype.hasOwnProperty.call(b, key)
    ) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  };
};

// STORE THEME
export const setTheme = (theme) => {
  localStorage.setItem('theme', JSON.stringify(theme));
};
// GET THEME
export const getTheme = () => {
  return JSON.parse(localStorage.getItem('theme'));
};

export const truncatedContent = (text, customLength = 100) => {
  return text.length > customLength
    ? text.slice(0, customLength) + '...'
    : text;
};

export const resizeImage = (file, newWidth, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    console.log('File before resizing:', file);
    console.log('File type:', file.type);

    reader.onloadend = () => {
      img.src = reader.result;
      console.log('Image loaded:', img.src);
    };

    img.onload = () => {
      console.log('Image dimensions:', img.width, img.height);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const aspectRatio = img.height / img.width;
      const newHeight = newWidth * aspectRatio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const mimeType = file.type || 'image/jpeg'; // Use the file's MIME type, default to 'image/jpeg'

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Blob created:', blob);

            resolve(blob);
          } else {
            console.error('Failed to create blob from canvas');

            reject(new Error('Failed to resize image'));
          }
        },
        mimeType,
        quality
      ); // Dynamic quality parameter
    };

    img.onerror = () => {
      console.error('Image failed to load:', file);

      reject(new Error('Image loading failed'));
    };

    reader.readAsDataURL(file);
  });
};

export const generateApiKey = () => {
  const timestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  const combinedKey = `${process.env.NEXT_PUBLIC_X_API_KEY}:${timestamp}`;

  // Use Base64 encoding or any encoding method you prefer
  return btoa(combinedKey); // Encoding the combined key to Base64
};

/**
 * Sanitizes the HTML content to prevent XSS attacks
 * @param {string} content - The HTML content to be sanitized
 * @returns {string} - The sanitized HTML content
 */
export function sanitizeHTML(input, ALLOWED_ATTR = []) {
  // Sanitize input using DOMPurify to remove dangerous elements like <script>

  if (!DOMPurify) return input;

  let sanitizedInput;
  if (ALLOWED_ATTR.length > 0) {
    sanitizedInput = DOMPurify.sanitize(input, {
      ALLOWED_ATTR: ALLOWED_ATTR, // Explicitly allow 'target'
    });
  } else {
    sanitizedInput = DOMPurify.sanitize(input);
  }

  // Additional custom check: Remove any remaining <script> tags just to be safe
  sanitizedInput = sanitizedInput.replace(/<script.*?>.*?<\/script>/gi, ''); // Remove <script> tags

  // Optionally, we can strip out inline event handlers (e.g., onclick="alert('XSS')")
  sanitizedInput = sanitizedInput.replace(/on\w+="[^"]*"/g, ''); // Remove inline event handlers

  // Strip out any potential JavaScript function calls like alert(), prompt(), etc.
  sanitizedInput = sanitizedInput.replace(/(alert|prompt|confirm|eval)/gi, ''); // Remove JavaScript functions

  return sanitizedInput;
}

export function removeHTMLTags(input) {
  if (!input) return '';

  // Remove all HTML tags
  let cleanedInput = input.replace(/<\/?[^>]+(>|$)/g, '');

  // Remove encoded entities like &lt; and &gt;
  cleanedInput = cleanedInput.replace(/&lt;|&gt;/g, '');

  return cleanedInput;
}

export function removeATags(input) {

  return typeof input === 'string'
    ? input.toString().replace(/(&lt;a[^&]*?&gt;|<a[^>]*?>|<\/a>|&lt;\/a&gt;)/gi, '')
    : input;
}

export function removeScriptTags(input) {
  return typeof input === 'string' ? input.replace(
    /(&lt;script[^&]*?&gt;.*?&lt;\/script&gt;|<script[^>]*?>.*?<\/script>)/gis,
    '') : input;
}

export function cleanSeoContent(content) {
  if (!content) return '';

  // Remove all HTML tags
  let cleanContent = content.replace(/<[^>]+>/g, '');

  // Decode HTML entities (&nbsp;, &amp;, etc.)
  cleanContent = cleanContent.replace(
    /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&[#\w]+;/g,
    ' '
  );

  // Replace HTML entities (e.g., &nbsp;, &amp;)
  cleanContent = cleanContent.replace(/&(amp;)?#?[a-z0-9]+;/gi, ' ');

  // Decode special characters like é, ö, etc.
  cleanContent = cleanContent.replace(
    /&([a-z])(acute|uml|circ|grave|ring|cedil|slash|tilde|caron|lig|quot|rsquo);/gi,
    '$1'
  );

  // Replace any remaining non-alphanumeric characters except spaces
  // cleanContent = cleanContent.replace(/[^a-z0-9 ]/gi, ' ');

  // Replace multiple spaces with a single space
  return cleanContent.replace(/\s+/g, ' ').trim();
}

export function sanitizeInputFields(values, fieldsToSanitize) {
  return Object.keys(values).reduce((acc, key) => {
    acc[key] = fieldsToSanitize.includes(key)
      ? sanitizeHTML(values[key])
      : values[key];
    return acc;
  }, {});
}

export function sanitizeFields(fields) {
  return Object.keys(fields).reduce((acc, key) => {
    const value = fields[key];

    // Sanitize only if the value is a string
    acc[key] =
      typeof value === 'string'
        ? sanitizeHTML(removeScriptTags(removeATags(value)))
        : value;

    return acc;
  }, {});
}

// Supported Anchor Tag
export function sanitizeFields2(fields, ALLOWED_ATTR = []) {
  return Object.keys(fields).reduce((acc, key) => {
    const value = fields[key];

    // Sanitize only if the value is a string
    acc[key] =
      typeof value === 'string'
        ? sanitizeHTML(removeScriptTags(value), ALLOWED_ATTR)
        : value;

    return acc;
  }, {});
}

// Function to convert base64 to Blob
export const base64ToBlob = (base64, mime) => {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};

// Function to convert Blob to base64
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Function to return query string from object
export const createURLQueryString = (url, query = {}) => {
  if (!query || Object.keys(query).length === 0) {
    return url;
  }
  const queryString = Object.entries(query)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
  return `${url}?${queryString}`;
};