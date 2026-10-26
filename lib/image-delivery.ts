// Transform only explicitly public assets. Draft R2 images stay behind the authorized API.
export function cloudflareImage(source: string, width: 320 | 640 | 1280 = 640): string {
  const zone = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ORIGIN;
  const allowed = process.env.NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN;
  if (!zone || !allowed) return source;
  try {
    const image = new URL(source);
    if (image.protocol !== 'https:' || image.origin !== new URL(allowed).origin) return source;
    return `${new URL(zone).origin}/cdn-cgi/image/width=${width},quality=80,format=auto/${image.href}`;
  } catch { return source; }
}
