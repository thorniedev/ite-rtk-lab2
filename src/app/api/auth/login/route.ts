import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAMES,
  buildAuthorizationUrl,
  createPkcePair,
  createState,
  hasKeycloakConfig,
} from "@/lib/auth/keycloak";

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/product-table";

  if (!hasKeycloakConfig()) {
    return Response.json(
      {
        message:
          "Missing KEYCLOAK_BASE_URL, KEYCLOAK_REALM, or KEYCLOAK_CLIENT_ID.",
      },
      { status: 500 },
    );
  }

  const state = createState();
  const { codeChallenge, codeVerifier } = await createPkcePair();
  const response = NextResponse.redirect(
    buildAuthorizationUrl({ codeChallenge, state }),
  );

  response.cookies.set(AUTH_COOKIE_NAMES.state, state, getCookieOptions());
  response.cookies.set(
    AUTH_COOKIE_NAMES.codeVerifier,
    codeVerifier,
    getCookieOptions(),
  );
  response.cookies.set(AUTH_COOKIE_NAMES.returnTo, returnTo, getCookieOptions());

  return response;
}
