import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAMES,
  exchangeCodeForTokens,
  setAuthCookies,
} from "@/lib/auth/keycloak";

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(AUTH_COOKIE_NAMES.state)?.value;
  const codeVerifier = request.cookies.get(AUTH_COOKIE_NAMES.codeVerifier)?.value;
  const returnTo =
    request.cookies.get(AUTH_COOKIE_NAMES.returnTo)?.value ?? "/product-table";

  if (error || !code || !state || !storedState || state !== storedState || !codeVerifier) {
    const loginUrl = new URL("/api/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", returnTo);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(AUTH_COOKIE_NAMES.state);
    response.cookies.delete(AUTH_COOKIE_NAMES.codeVerifier);
    response.cookies.delete(AUTH_COOKIE_NAMES.returnTo);

    return response;
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    await setAuthCookies(tokens);
  } catch (error) {
    console.error("Keycloak callback failed", error);
    return Response.json({ message: "Keycloak callback failed." }, { status: 500 });
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));

  response.cookies.delete(AUTH_COOKIE_NAMES.state);
  response.cookies.delete(AUTH_COOKIE_NAMES.codeVerifier);
  response.cookies.delete(AUTH_COOKIE_NAMES.returnTo);

  return response;
}
