import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if user is signed in and the current path is / redirect the user to /account
  if (
    user &&
    (req.nextUrl.pathname === "/auth/sign-in" ||
      req.nextUrl.pathname === "/auth/sign-up")
  ) {
    return NextResponse.redirect(new URL("/communities", req.url));
  }

  // // if user is not signed in and the current path is not / redirect the user to /
  if (
    !user &&
    (req.nextUrl.pathname !== "/" ||
      req.nextUrl.pathname.startsWith("/communities") ||
      req.nextUrl.pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/account"],
};
