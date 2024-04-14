export function remapAssetUrl(url: string) {
  // get the website URL from the environment variables, remove trailing slashes
  const websiteURL = (process.env.NEXT_PUBLIC_WEBSITE_URL as string).replace(/\/$/, '');
  const minioURL = new URL(url);
  const path = minioURL.pathname.split('/').slice(2).join('/');
  return `${websiteURL}/assets/${path}`;
}