import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="light-theme">
        <Head>
          {/* Character Set & Viewport */}
          <meta charSet="utf-8" />

          {/* Favicon (Modern Approach) */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/favicon.svg" color="#5bbad5" />

          {/* Resource Hints for API */}
          <link rel="dns-prefetch" href="https://api.localxlist.net" />
          <link rel="preconnect" href="https://api.localxlist.net" crossOrigin />

          {/* PWA */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </Head>
        <body data-bs-theme="light" style={{visibility: 'hidden'}} suppressHydrationWarning={true}>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Prevent layout shift by setting theme immediately
                document.body.style.visibility = 'visible';
                // Prevent FOUC (Flash of Unstyled Content)
                if (typeof window !== 'undefined') {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.body.setAttribute('data-bs-theme', theme);
                }
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
