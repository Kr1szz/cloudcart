import { useEffect } from 'react';

const SITE_NAME = 'CloudCart';
const DEFAULT_DESCRIPTION =
  'CloudCart is a cloud commerce demo with product discovery, cart, checkout, invoices, and account workflows.';
const DEFAULT_KEYWORDS = [
  'cloud commerce',
  'ecommerce demo',
  'React storefront',
  'AWS ecommerce',
  'CloudCart',
];

const getOrigin = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

const getUrl = (path = '/') => {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).toString();
};

const upsertMeta = (attribute, key, content) => {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

const upsertStructuredData = (data) => {
  const existing = document.head.querySelector('script[data-seo-jsonld="true"]');
  if (existing) existing.remove();
  if (!data) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-jsonld', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  canonical = '/',
  image,
  type = 'website',
  noIndex = false,
  structuredData,
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Cloud Commerce`;
    const canonicalUrl = getUrl(canonical);
    const imageUrl = image ? getUrl(image) : '';
    const mergedKeywords = [...DEFAULT_KEYWORDS, ...keywords].filter(Boolean);

    document.title = fullTitle;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', mergedKeywords.join(', '));
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('name', 'theme-color', '#0a84ff');

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonicalUrl);
    if (imageUrl) upsertMeta('property', 'og:image', imageUrl);

    upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    if (imageUrl) upsertMeta('name', 'twitter:image', imageUrl);

    upsertCanonical(canonicalUrl);
    upsertStructuredData(structuredData);
  }, [title, description, keywords, canonical, image, type, noIndex, structuredData]);

  return null;
};

export const homeStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: getOrigin(),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${getOrigin()}/products?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export default SEO;
