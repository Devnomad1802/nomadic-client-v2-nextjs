import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

// Canonicalise the category URL to a lowercase hyphen slug so every category
// resolves at /trips/<slug> (e.g. /category/Business%20And%20Learning ->
// /trips/business-and-learning). Derived from the name; no stored slug needed.
const slugify = (str: string) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function Page({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/trips/${slugify(slug)}`);
}
