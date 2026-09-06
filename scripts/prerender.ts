import { BASE_PATH, sitePath } from '../src/sitePath';
import { StaticRouter } from "react-router-dom";
import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { MotionConfig } from 'motion/react';
import App from '../src/App';
import { PUBLIC_PRODUCTS, productPath, productSeo } from '../src/productRoutes';
import { Product } from '../src/types';

const dist = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', dist), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('Missing prerender root');
const env = loadEnv('production', process.cwd(), 'SITE_URL');
const configuredUrl = (process.env.SITE_URL ?? env.SITE_URL ?? '').trim();
const siteUrl = configuredUrl ? new URL(configuredUrl) : undefined;
if (siteUrl && (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.pathname !== BASE_PATH || siteUrl.search || siteUrl.hash || siteUrl.hostname === 'localhost' || !siteUrl.hostname.includes('.'))) {
  throw new Error('SITE_URL must be a public HTTPS URL whose path matches BASE_PATH, without credentials, query or fragment.');
}
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[char]!);
const paths = ['/', ...PUBLIC_PRODUCTS.map(productPath)];
if (new Set(paths).size !== paths.length || PUBLIC_PRODUCTS.some(p => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id))) throw new Error('Product slugs must be unique, lowercase and URL-safe.');

function renderPage(pathname: string, product?: Product, notFound = false) {
  let html = template;
  const seo = product ? productSeo(product) : notFound ? { title: 'Página no encontrada | Amazonía en Casa', description: 'La página solicitada no está disponible. Explora el catálogo de Amazonía en Casa.' } : undefined;
  if (seo) {
    html = html.replace(/<noscript[\s\S]*?<\/noscript\s*>/, '<noscript>Consulta la información de esta página sin JavaScript. Actívalo para usar el carrito y los favoritos.</noscript>');
    html = html.replace(/<title>.*?<\/title>/s, `<title>${escape(seo.title)}</title>`);
    html = html.replace(/<meta\s+(name|property)="(description|og:title|og:description|twitter:title|twitter:description)"\s+content="[^"]*"\s*\/>/g, (_, kind, key) => `<meta ${kind}="${key}" content="${escape(key.endsWith('title') ? seo.title : seo.description)}" />`);
  }
  if (notFound) html = html.replace('index, follow, max-image-preview:large', 'noindex, follow');
  if (siteUrl && !notFound) {
    const url = new URL(sitePath(pathname), siteUrl).href;
    const image = new URL(sitePath(product?.image ?? '/images/hero-coffee.jpg'), siteUrl).href;
    const imageAlt = product?.name ?? 'Granos de café tostado, portada de Amazonía en Casa';
    // The catalog uses demo prices: do not advertise fake offers or reviews.
    const data = product ? {
      '@context': 'https://schema.org', '@type': 'WebPage', name: seo!.title, description: seo!.description, url, inLanguage: 'es-BO',
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl.href },
        { '@type': 'ListItem', position: 2, name: 'Catálogo', item: new URL('#catalogo', siteUrl).href },
        { '@type': 'ListItem', position: 3, name: product.name, item: url },
      ] },
    } : { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Amazonía en Casa', url, inLanguage: 'es-BO', description: 'Catálogo de demostración de chocolates, artesanía y cuidado personal de Bolivia, Brasil y Colombia.' };
    html = html.replace('</head>', `
    <link rel="canonical" href="${escape(url)}" />
    <meta property="og:url" content="${escape(url)}" />
    <meta property="og:image" content="${escape(image)}" />
    <meta property="og:image:alt" content="${escape(imageAlt)}" />
    <meta name="twitter:image" content="${escape(image)}" />
    <meta name="twitter:image:alt" content="${escape(imageAlt)}" />
    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
  </head>`);
  }
  const markup = renderToString(React.createElement(MotionConfig, { reducedMotion: 'user' }, React.createElement(StaticRouter, { basename: BASE_PATH, location: sitePath(pathname) }, React.createElement(App))));
  return html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
}
await writeFile(new URL('index.html', dist), renderPage('/'));
await rm(new URL('productos/', dist), { recursive: true, force: true });
for (const product of PUBLIC_PRODUCTS) {
  const directory = new URL(`.${productPath(product)}`, dist);
  await mkdir(directory, {recursive: true});
  await writeFile(new URL('index.html', directory), renderPage(productPath(product), product));
}
await writeFile(new URL('404.html', dist), renderPage('/404/', undefined, true));
let robots = 'User-agent: *\nAllow: /\n';
if (siteUrl) {
  const entries = paths.map(pathname => `<url><loc>${escape(new URL(sitePath(pathname), siteUrl).href)}</loc></url>`).join('\n');
  await writeFile(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
  robots += `\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`;
} else {
  await rm(new URL('sitemap.xml', dist), {force: true});
  console.warn('SEO: set SITE_URL to generate canonical, sitemap and absolute social metadata.');
}
await writeFile(new URL('robots.txt', dist), robots);
console.log(`Prerendered storefront, ${PUBLIC_PRODUCTS.length} product pages and 404 page.`);
