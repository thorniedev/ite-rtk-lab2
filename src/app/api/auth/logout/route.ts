import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  getLogoutUrl,
  hasKeycloakConfig,
} from "@/lib/auth/keycloak";

export async function GET(request: Request) {
  const redirectUrl = hasKeycloakConfig()
    ? await getLogoutUrl()
    : new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl);

  await clearAuthCookies();
  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    response.cookies.delete(name);
  });

  return response;
}
