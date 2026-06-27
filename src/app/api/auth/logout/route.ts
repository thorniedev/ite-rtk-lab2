import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  getLogoutUrl,
  hasKeycloakConfig,
} from "@/lib/auth/keycloak";

export async function GET(request: Request) {
  const homeUrl = new URL("/", request.url);
  const redirectUrl = hasKeycloakConfig()
    ? await getLogoutUrl(homeUrl)
    : homeUrl;
  const response = NextResponse.redirect(redirectUrl);

  await clearAuthCookies();
  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    response.cookies.delete(name);
  });

  return response;
}
