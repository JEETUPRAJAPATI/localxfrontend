import { useEffect } from 'react';
import { cleanSeoContent } from '@/utils/helpers';

const useCustomSEO = ({
  author,
  title,
  description,
  keywords,
  favicon,
  ogType,
  ogTitle,
  ogSiteName,
  ogDescription,
  ogImage,
  ogImageHeight,
  ogUrl,
  fbAppId,
  yandexVerificationId,
  twitterCard,
  twitterSite,
  twitterCreator,
  twitterTitle,
  twitterUrl,
  twitterDescription,
  twitterImage,
  generator,
  googleAnalyticsId,
}) => {
  useEffect(() => {
    const getCurrentUrl = () => {
      return window?.location.href;
    };

    const setMetaTag = (name, content) => {
      content = cleanSeoContent(content);
      if (!content) return;
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setPropertyMetaTag = (property, content) => {
      content = cleanSeoContent(content);
      if (!content) return;
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setLinkTag = (rel, href) => {
      href = cleanSeoContent(href);
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Update SEO tags
    if (title) document.title = cleanSeoContent(title);

    setMetaTag('author', author);
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setLinkTag('icon', favicon);
    setLinkTag('canonical', getCurrentUrl());
    setMetaTag('og:type', ogType);
    setMetaTag('og:title', ogTitle);
    setMetaTag('og:site_name', ogSiteName);
    setMetaTag('og:description', ogDescription);
    setMetaTag('og:image', ogImage);
    setMetaTag('og:image:height', ogImageHeight);
    setMetaTag('og:url', ogUrl);
    setPropertyMetaTag('fb:app_id', fbAppId);
    setMetaTag('yandex-verification', yandexVerificationId);
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:site', twitterSite);
    setMetaTag('twitter:creator', twitterCreator);
    setMetaTag('twitter:title', twitterTitle);
    setMetaTag('twitter:url', twitterUrl);
    setMetaTag('twitter:description', twitterDescription);
    setMetaTag('twitter:image', twitterImage);
    setMetaTag('generator', generator);

    // Google Analytics script
    if (googleAnalyticsId) {
      if (!document.querySelector(`#ga-script`)) {
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${cleanSeoContent(
          googleAnalyticsId,
        )}`;
        script1.id = 'ga-script';
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'ga-inline-script';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${cleanSeoContent(googleAnalyticsId)}');
        `;
        document.head.appendChild(script2);
      }
    }

    return () => {
      // Optional cleanup logic
    };
  }, [
    author,
    title,
    description,
    keywords,
    favicon,
    ogType,
    ogTitle,
    ogSiteName,
    ogDescription,
    ogImage,
    ogImageHeight,
    ogUrl,
    fbAppId,
    yandexVerificationId,
    twitterCard,
    twitterSite,
    twitterCreator,
    twitterTitle,
    twitterUrl,
    twitterDescription,
    twitterImage,
    generator,
    googleAnalyticsId,
  ]);
};

export default useCustomSEO;
