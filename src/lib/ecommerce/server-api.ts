import { getAccessToken } from "@/lib/auth/keycloak";

function getEcommerceBaseUrl() {
  const rawBaseUrl = process.env.SPRINGBOOT_API_URL ?? process.env.ECOMMERCE_API_URL;

  if (!rawBaseUrl) {
    throw new Error("Missing SPRINGBOOT_API_URL in the project environment.");
  }

  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  if (baseUrl.endsWith("/api/v1")) return baseUrl;

  return `${baseUrl}/api/v1`;
}

export function ecommerceApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getEcommerceBaseUrl()}${normalizedPath}`;
}

export async function forwardEcommerceRequest(
  path: string,
  init: RequestInit = {},
) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json(
      { message: "Unauthorized. Sign in with Keycloak first." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(ecommerceApiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        Authorization: `Bearer ${accessToken}`,
        ...init.headers,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");
    const body = contentType?.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return Response.json(body, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Ecommerce API request failed", error);

    return Response.json(
      { message: "Could not reach the ecommerce API." },
      { status: 502 },
    );
  }
}
