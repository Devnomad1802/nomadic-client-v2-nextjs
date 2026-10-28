import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Canonical category/location slug: lowercase ASCII words joined by hyphens.
// Derived from the display name — no stored slug field required.
const slugify = (str: string) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Enforce one canonical URL per category/location at the routing layer so
// legacy links resolve with a real HTTP 301 (page-level redirect() only yields
// a soft meta-refresh once the response is streaming).
//
//   /category/<Anything>            -> 301 /trips/<slug>
//   /trips/<Dirty-First-Segment>    -> 301 /trips/<slug>            (category/location)
//   /trips/<Dirty>/<trip-slug>      -> 301 /trips/<slug>/<trip-slug> (first seg only)
//
// Already-clean trip seoSlugs (lowercase-hyphen) never change, so trip detail
// URLs are untouched. Query strings are preserved by cloning nextUrl.
export function middleware(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return NextResponse.next();

  const [root, firstRaw, ...rest] = segments;
  if (root !== "trips" && root !== "category") return NextResponse.next();

  let first = firstRaw;
  try {
    first = decodeURIComponent(firstRaw);
  } catch {
    /* malformed encoding — fall back to the raw segment */
  }
  const slug = slugify(first);
  if (!slug) return NextResponse.next();

  // Categories live at /trips/<slug>; always fold /category/* onto it.
  if (root === "category") {
    const url = req.nextUrl.clone();
    url.pathname = `/trips/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  // /trips/* — only canonicalise when the first segment isn't already clean.
  if (firstRaw !== slug) {
    const url = req.nextUrl.clone();
    url.pathname = ["", "trips", slug, ...rest].join("/");
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/trips/:path*", "/category/:path*"],
};
