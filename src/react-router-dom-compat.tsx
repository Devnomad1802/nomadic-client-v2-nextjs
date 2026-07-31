"use client";

import React from "react";
import NextLink from "next/link";
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

// Mock Link
export const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, children, ...props }, ref) => {
    // Normalise 'to' parameter to string if needed
    const href = typeof to === "string" ? to : to?.pathname || "/";
    return (
      <NextLink href={href} {...props} ref={ref}>
        {children}
      </NextLink>
    );
  }
);
Link.displayName = "Link";

// Mock NavLink (simple version)
export const NavLink = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, children, className, activeClassName, ...props }, ref) => {
    const pathname = usePathname();
    const href = typeof to === "string" ? to : to?.pathname || "/";
    const isActive = pathname === href;

    const combinedClassName =
      typeof className === "function"
        ? className({ isActive })
        : `${className || ""} ${isActive ? activeClassName || "active" : ""}`;

    return (
      <NextLink href={href} className={combinedClassName} {...props} ref={ref}>
        {children}
      </NextLink>
    );
  }
);
NavLink.displayName = "NavLink";

// ── Navigation state (react-router's location.state) ──
// Next.js router.push carries no state, so persist it per-pathname in
// sessionStorage. This is what makes flows like TripDetail → /payment
// ({ paymentDetail }) and Razorpay → /paymentsuccess ({ data }) work.
// Bonus over react-router: state survives a refresh within the session.
const NAV_STATE_KEY = "rr-compat-state";

const readNavStore = (): Record<string, any> => {
  try {
    return JSON.parse(sessionStorage.getItem(NAV_STATE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveNavState = (to: any, state: any) => {
  if (typeof window === "undefined") return;
  const path = (typeof to === "string" ? to : to?.pathname || "/").split("?")[0];
  try {
    const store = readNavStore();
    if (state === undefined || state === null) delete store[path];
    else store[path] = state;
    sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(store));
  } catch { /* storage full/blocked — degrade to stateless nav */ }
};

// Mock useNavigate
export const useNavigate = () => {
  const router = useRouter();
  return (to: any, options?: { replace?: boolean; state?: any }) => {
    if (to === -1) {
      window.history.back();
      return;
    }
    saveNavState(to, options?.state);
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
};

// Mock useLocation
export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  // Synchronous lazy read: the client sees state on its FIRST render, so
  // redirect guards like Paymentsuccess's `if (!data) navigate("/")` don't
  // fire before the state arrives. SSR renders null (no sessionStorage).
  const [state] = React.useState<any>(() =>
    typeof window === "undefined" ? null : readNavStore()[pathname] ?? null
  );
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state,
  };
};

// Mock useParams
export const useParams = () => {
  return useNextParams();
};

// Mock useSearchParams
export const useSearchParams = () => {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = (newParams: any) => {
    const params = new URLSearchParams(
      typeof newParams === "function" ? newParams(searchParams) : newParams
    );
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams, setSearchParams] as const;
};

// Mock Navigate component
export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
};

// Mock Outlet
export const Outlet = () => null;
