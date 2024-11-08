/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  const headers = new Headers(response.headers);
  
  const path = event.url.pathname;
  
  // Add proper MIME types
  if (path.endsWith('.js')) {
    headers.set('Content-Type', 'application/javascript; charset=utf-8');
  } else if (path.endsWith('.css')) {
    headers.set('Content-Type', 'text/css; charset=utf-8');
  } else if (path.endsWith('.svg')) {
    headers.set('Content-Type', 'image/svg+xml');
  } else if (path.endsWith('.woff2')) {
    headers.set('Content-Type', 'font/woff2');
  } else if (path.endsWith('.woff')) {
    headers.set('Content-Type', 'font/woff');
  }

  return new Response(response.body, {
    status: response.status,
    headers
  });
}