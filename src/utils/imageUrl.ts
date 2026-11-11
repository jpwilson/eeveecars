// Wikimedia Commons originals are often several MB and upload.wikimedia.org
// rate-limits (HTTP 429) hotlinked originals. Its thumbnail URLs are small,
// CDN-cached and allowed: /wikipedia/commons/thumb/a/ab/File.jpg/960px-File.jpg.
// Only Wikimedia's standard thumbnail widths are used.
export const COMMONS_WIDTHS = [330, 500, 960, 1280] as const;

const COMMONS_RE = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/i;

export function commonsThumb(url: string | null | undefined, width: number): string | null {
  if (!url) return null;
  const m = COMMONS_RE.exec(url);
  if (!m) return null;
  const [, a, ab, file] = m;
  if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) return null;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${file}/${width}px-${file}`;
}

/** src + srcSet for a catalog image URL (Commons → thumbnails; anything else unchanged). */
export function responsiveSrc(url: string, preferredWidth: number) {
  const thumb = commonsThumb(url, preferredWidth);
  if (!thumb) return { src: url, srcSet: undefined as string | undefined };
  return {
    src: thumb,
    srcSet: COMMONS_WIDTHS.map((w) => `${commonsThumb(url, w)} ${w}w`).join(", "),
  };
}
