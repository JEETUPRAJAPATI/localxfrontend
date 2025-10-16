import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="light-theme">
        <Head>
          {/* Character Set & Viewport */}
          <meta charSet="utf-8" />

          {/* Favicon (Use existing favicon.ico) */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="manifest" href="/site.webmanifest" />

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
