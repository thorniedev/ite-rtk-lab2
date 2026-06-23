import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return forwardEcommerceRequest(`/products/spec${url.search}`);
}
