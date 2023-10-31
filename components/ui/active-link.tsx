"use client";

import Link, { LinkProps } from "next/link";
import React, { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

type ActiveLinkProps = LinkProps & {
  className?: string;
  activeClass?: string;
  nonActiveClass?: string;
  text?: string;
};

export default function ActiveLink({
  href,
  activeClass = "",
  nonActiveClass = "",
  className = "",
  text,
  children,
}: PropsWithChildren<ActiveLinkProps>) {
  const currentRoute = usePathname();
  const isActive = new RegExp(`^${href}`).test(currentRoute);

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClass : nonActiveClass}`}
    >
      {text ? text : children}
    </Link>
  );
}
