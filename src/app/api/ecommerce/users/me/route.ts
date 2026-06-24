import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET() {
  return forwardEcommerceRequest("/users/me");
}
