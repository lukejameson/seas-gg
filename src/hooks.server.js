/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  const headers = new Headers(response.headers);
  
  const path = event.url.pathname;
  
  // Handle _app/immutable directory specifically
  if (path.includes('/_app/immutable/')) {
    if (path.endsWith('.js')) {
      headers.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      headers.set('Content-Type', 'text/css; charset=utf-8');
    }
    // Add cache headers for immutable content
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: response.status,
    headers
  });
}