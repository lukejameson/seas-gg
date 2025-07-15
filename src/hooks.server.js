// src/hooks.server.js
import { minify } from 'html-minifier';

const minifyOpts = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  decodeEntities: true,
  html5: true,
  ignoreCustomComments: [/^#/],
  minifyCSS: true,
  minifyJS: false,
  removeAttributeQuotes: true,
  removeComments: false,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return minify(html, minifyOpts);
    },
  });

  const headers = new Headers(response.headers);
  const path = event.url.pathname;

  // Add security headers
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('X-Content-Type-Options', 'nosniff');

  // Handle static assets
  if (path.startsWith('/_app/')) {
    if (path.endsWith('.js')) {
      headers.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      headers.set('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.svg')) {
      headers.set('Content-Type', 'image/svg+xml');
    } else if (path.endsWith('.png')) {
      headers.set('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      headers.set('Content-Type', 'image/jpeg');
    }

    // Cache control for immutable content
    if (path.includes('/immutable/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      headers.set('Cache-Control', 'public, max-age=3600');
    }
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
};
