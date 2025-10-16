import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const seoSelectorData = createSelector(
  (state) => state.headSeo,
  (headSeo) => ({
    seo_DATA: (headSeo && Object.keys(headSeo).length > 0) ? headSeo : null,
  })
);
const SEO = ({ seoData = {}, blogDetail = "" }) => {
  const { seo_DATA } = useSelector(seoSelectorData);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let MySeoData = seo_DATA || seoData;

  const {
    title = 'Localxlist - Casual Dating & Escorts',
    robots = 'index, follow',
    description = 'Join Localxlist for free casual dating and personal classifieds.',
    keywords = 'casual dating, escorts, localxlist',
    image = '/default-og.png',
    canonical = '',
    ogTitle = title,
    ogDescription = description,
    ogImage = image,
    ogImageHeight = '',
    ogUrl = baseUrl,
    ogSiteName = 'Localxlist',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    twitterSite = '@localxlist',
    twitterCreator = '@localxlist',
    twitterTitle = title,
    twitterDescription = description,
    twitterImage = image,
    fbAppId = '239031463576298',
    yandexVerificationId = '87591adb069fe964',
    googleAnalyticsId = '',
    favicon = '/favicon.ico'
  } = MySeoData;

  const fullCanonical = canonical || `${baseUrl}${router.asPath}`;
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const absoluteTwitterImage = twitterImage.startsWith('http') ? twitterImage : `${baseUrl}${twitterImage}`;

  if (!title || !description) {
    console.warn(`SEO: Missing title or description for ${router.asPath}`);
  }

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robots} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="localxlist.org" />
      <meta name="yandex-verification" content={yandexVerificationId} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={absoluteOgImage} />
      {ogImageHeight && <meta property="og:image:height" content={ogImageHeight} />}
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="fb:app_id" content={fbAppId} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={absoluteTwitterImage} />
      <link rel="canonical" href={fullCanonical} />
      <link rel="shortcut icon" type="image/x-icon" href={favicon} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: fullCanonical,
            publisher: {
              '@type': 'Organization',
              name: 'Localxlist',
              logo: `${baseUrl}/logo.png`,
            },
          }),
        }}
      />

      {
        blogDetail && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: blogDetail?.title || "Article",
                image: blogDetail?.image || "",
                author: {
                  "@type": "Person",
                  name: blogDetail?.author || "Unknown",
                },
                publisher: {
                  "@type": "Organization",
                  name: 'Localxlist',
                  logo: {
                    "@type": "ImageObject",
                    logo: `${baseUrl}/logo.png`,
                  },
                },
                datePublished: blogDetail?.publishedDate || "",
                description: blogDetail?.excerpt || blogDetail?.description?.slice(0, 160) || "",
              })
            }}
          />
        )
      }


      {googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </Head>
  );
};

export default SEO;