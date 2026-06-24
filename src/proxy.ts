import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "kc_access_token";
const REFRESH_TOKEN_COOKIE = "kc_refresh_token";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ||
      request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );
  const isEcommerceApiRequest = pathname.startsWith("/api/ecommerce");
  const isLoginPage = pathname === "/login";

  if (isAuthenticated) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/product-table", request.url));
    }

    return NextResponse.next();
  }

  if (isEcommerceApiRequest) {
    return NextResponse.json(
      { message: "Unauthorized. Sign in with Keycloak first." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/api/auth/login", request.url);
  const returnTo = isLoginPage
    ? request.nextUrl.searchParams.get("returnTo") ?? "/product-table"
    : `${pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/api/ecommerce/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
