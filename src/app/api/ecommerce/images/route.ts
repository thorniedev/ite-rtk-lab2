import { getAccessToken } from "@/lib/auth/keycloak";
import { ecommerceApiUrl } from "@/lib/ecommerce/server-api";

export async function POST(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(ecommerceApiUrl("/minio/upload"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: await request.formData(),
      cache: "no-store",
    });
    const body = await response.json();

    return Response.json(body, { status: response.status });
  } catch (error) {
    console.error("Image upload failed", error);

    return Response.json(
      { message: "Could not upload image to Spring." },
      { status: 502 },
    );
  }
}
