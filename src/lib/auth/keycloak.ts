import { cookies } from "next/headers";

export const AUTH_COOKIE_NAMES = {
  accessToken: "kc_access_token",
  refreshToken: "kc_refresh_token",
  idToken: "kc_id_token",
  state: "kc_state",
  codeVerifier: "kc_code_verifier",
  returnTo: "kc_return_to",
} as const;

type KeycloakTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
};

type KeycloakUser = {
  name?: string;
  preferred_username?: string;
  email?: string;
};

const encoder = new TextEncoder();

function base64UrlEncode(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function getKeycloakBaseUrl() {
  return process.env.KEYCLOAK_BASE_URL?.replace(/\/$/, "");
}

export function hasKeycloakConfig() {
  return Boolean(
    getKeycloakBaseUrl() &&
      process.env.KEYCLOAK_REALM &&
      process.env.KEYCLOAK_CLIENT_ID,
  );
}

export function getKeycloakConfig() {
  const baseUrl = getKeycloakBaseUrl();
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;

  if (!baseUrl || !realm || !clientId) {
    throw new Error(
      "Missing KEYCLOAK_BASE_URL, KEYCLOAK_REALM, or KEYCLOAK_CLIENT_ID.",
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const issuer = `${baseUrl}/realms/${realm}`;

  return {
    appUrl,
    clientId,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    issuer,
    redirectUri:
      process.env.KEYCLOAK_REDIRECT_URI ?? `${appUrl}/api/auth/callback`,
  };
}

export async function createPkcePair() {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64UrlEncode(verifierBytes);
  const challengeBytes = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(codeVerifier),
  );

  return {
    codeChallenge: base64UrlEncode(challengeBytes),
    codeVerifier,
  };
}

export function createState() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

export function buildAuthorizationUrl({
  codeChallenge,
  state,
}: {
  codeChallenge: string;
  state: string;
}) {
  const config = getKeycloakConfig();
  const url = new URL(`${config.issuer}/protocol/openid-connect/auth`);

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url;
}

async function requestToken(body: URLSearchParams) {
  const config = getKeycloakConfig();

  body.set("client_id", config.clientId);

  if (config.clientSecret) {
    body.set("client_secret", config.clientSecret);
  }

  const response = await fetch(`${config.issuer}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Keycloak token request failed.");
  }

  return (await response.json()) as KeycloakTokenResponse;
}

export function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const config = getKeycloakConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: config.redirectUri,
  });

  return requestToken(body);
}

function refreshKeycloakTokens(refreshToken: string) {
  return requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
}

export async function setAuthCookies(tokens: KeycloakTokenResponse) {
  const cookieStore = await cookies();

  cookieStore.set(
    AUTH_COOKIE_NAMES.accessToken,
    tokens.access_token,
    getCookieOptions(tokens.expires_in),
  );

  if (tokens.refresh_token) {
    cookieStore.set(
      AUTH_COOKIE_NAMES.refreshToken,
      tokens.refresh_token,
      getCookieOptions(tokens.refresh_expires_in),
    );
  }

  if (tokens.id_token) {
    cookieStore.set(AUTH_COOKIE_NAMES.idToken, tokens.id_token, getCookieOptions());
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    cookieStore.delete(name);
  });
}

function decodeJwtPayload<T>(token?: string): T | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function isTokenExpired(token?: string, skewSeconds = 30) {
  const payload = decodeJwtPayload<{ exp?: number }>(token);

  if (!payload?.exp) return !token;

  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) return null;

  try {
    const tokens = await refreshKeycloakTokens(refreshToken);
    await setAuthCookies(tokens);

    return tokens.access_token;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      authenticated: false,
      user: null,
    };
  }

  return {
    authenticated: true,
    user: decodeJwtPayload<KeycloakUser>(
      cookieStore.get(AUTH_COOKIE_NAMES.idToken)?.value ?? accessToken,
    ),
  };
}

export async function getLogoutUrl() {
  const config = getKeycloakConfig();
  const cookieStore = await cookies();
  const idToken = cookieStore.get(AUTH_COOKIE_NAMES.idToken)?.value;
  const url = new URL(`${config.issuer}/protocol/openid-connect/logout`);

  url.searchParams.set("post_logout_redirect_uri", config.appUrl);
  url.searchParams.set("client_id", config.clientId);

  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  }

  return url;
}
