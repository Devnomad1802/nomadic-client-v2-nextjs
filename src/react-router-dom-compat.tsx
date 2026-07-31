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

// Mock useNavigate
export const useNavigate = () => {
  const router = useRouter();
  return (to: any, options?: { replace?: boolean; state?: any }) => {
    if (to === -1) {
      window.history.back();
    } else if (options?.replace) {
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
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state: null,
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
