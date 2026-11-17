"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Hard profile-completion gate: a logged-in user whose profile is incomplete
// (missing name or phone) is always sent to /complete-profile and cannot
// proceed — including on a returning/persisted session (not just at login).
const ALLOWED = ["/complete-profile"];

export default function ProfileGate() {
  const user = useSelector((s) => s?.global?.userDbData);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // not logged in → nothing to gate
    const incomplete = !user.name || !user.phone;
    const onAllowed = ALLOWED.some((p) => (pathname || "").startsWith(p));
    if (incomplete && !onAllowed) {
      router.replace("/complete-profile");
    }
  }, [user, pathname, router]);

  return null;
}
