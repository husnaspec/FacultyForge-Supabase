'use client';

import React, { useMemo, useCallback } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (to: any, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
    } else if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useNextSearchParams();
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: '',
    state: {},
  };
}

export function useParams<T extends Record<string, string | string[]>>() {
  return (useNextParams() || {}) as T;
}

export function useSearchParams(): [URLSearchParams, (newParams: any) => void] {
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() || '';

  const currentParams = useMemo(() => {
    return new URLSearchParams(nextSearchParams?.toString() || '');
  }, [nextSearchParams]);

  const setSearchParams = useCallback((newParams: any) => {
    const sp = new URLSearchParams(newParams);
    router.push(`${pathname}?${sp.toString()}`);
  }, [router, pathname]);

  return [currentParams, setSearchParams];
}

export function Link({ to, href, className, style, children, ...props }: any) {
  const target = to || href || '#';
  const computedStyle = typeof style === 'function' ? style({ isActive: false }) : style;
  const computedClass = typeof className === 'function' ? className({ isActive: false }) : className;

  return (
    <NextLink href={target} className={computedClass} style={computedStyle} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({ to, href, className, style, children, ...props }: any) {
  const pathname = usePathname() || '/';
  const target = to || href || '';
  const isActive = pathname === target || (target !== '/app' && target !== '/' && pathname.startsWith(target));
  const computedClass = typeof className === 'function' ? className({ isActive }) : (isActive ? `${className || ''} active` : className);
  const computedStyle = typeof style === 'function' ? style({ isActive }) : style;

  return (
    <NextLink href={target} className={computedClass} style={computedStyle} {...props}>
      {children}
    </NextLink>
  );
}

export function Outlet() {
  return null;
}
