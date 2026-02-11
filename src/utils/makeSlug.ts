/** Convert a make name to a URL-safe slug */
export function makeNameToSlug(name: string): string {
  return (name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Check if a make name matches a URL slug */
export function makeNameMatchesSlug(name: string, slug: string): boolean {
  return makeNameToSlug(name) === slug.toLowerCase();
}
