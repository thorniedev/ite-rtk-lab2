import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function POST(request: Request) {
  return forwardEcommerceRequest("/products/search", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
