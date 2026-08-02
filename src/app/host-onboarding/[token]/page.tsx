import type { Metadata } from "next";
import HostOnboarding from "@/PageComponents/HostOnboarding";

// Standalone, unlisted host onboarding page. Reached only via the secure
// token link emailed after approval — never in site navigation. Kept out of
// search indexes.
export const metadata: Metadata = {
  title: "Host Onboarding | Nomadic Townies",
  description: "Complete your Nomadic Townies host profile.",
  robots: "noindex, nofollow",
};

type Props = { params: Promise<{ token: string }> };

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <HostOnboarding token={token} />;
}
