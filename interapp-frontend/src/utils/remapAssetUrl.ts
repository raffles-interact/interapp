/**
 * Remaps a given asset URL from a Minio server to a local asset URL.
 *
 * The function takes a URL of an asset stored on a Minio server, removes the server part of the URL,
 * and prepends the local server address to the asset path, effectively remapping the asset URL to point
 * to a local server.
 *
 * @param {string} url - The URL of the asset on the Minio server.
 * @returns {string} The remapped URL pointing to the local server.
 *
 * @example
 * // Original Minio URL: http://interapp-minio:9000/interapp-minio/service/yes677?X-Amz-Algorithm=...
 * // Remapped URL: http://localhost:3000/assets/service/yes677?X-Amz-Algorithm=...
 * const remappedUrl = remapAssetUrl('http://interapp-minio:9000/interapp-minio/service/yes677?X-Amz-Algorithm=...');
 */
export function remapAssetUrl(url: string) {
  // get the website URL from the environment variables, remove trailing slashes
  const websiteURL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string).replace(/\/$/, '');
  const minioURL = new URL(url);
  const path = minioURL.pathname.split('/').slice(2).join('/');
  return `${websiteURL}/assets/${path}`;
}
