export function remapAssetUrl(url: string) {
  const minioURL = new URL(url);
  const path = minioURL.pathname.split('/').slice(2).join('/');
  return `http://localhost:3000/assets/${path}`;
}
