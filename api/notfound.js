/**
 * Real 404 for missing non-HTML assets (/foo.txt, /foo.xml, /foo.json …).
 *
 * Without this the SPA catch-all rewrite answers every unknown path with
 * app.html and a 200, which is a soft 404: search engines treat it as a real
 * page and AI fetchers get HTML where they asked for text. Existing files
 * still win, because Vercel checks the filesystem before applying rewrites.
 */
export default function handler(req, res) {
  res
    .status(404)
    .setHeader("Content-Type", "text/plain; charset=utf-8")
    .setHeader("Cache-Control", "public, max-age=60")
    .send(
      "404 Not Found — this file does not exist on evlineup.org.\n" +
        "Try https://www.evlineup.org/ , /llms.txt , /sitemap.xml or /openapi.json\n"
    );
}
