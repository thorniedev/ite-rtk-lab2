import { getAuthSession } from "@/lib/auth/keycloak";

export async function GET() {
  return Response.json(await getAuthSession(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
