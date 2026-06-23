import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return forwardEcommerceRequest(`/products${url.search}`);
}

export async function POST(request: Request) {
  return forwardEcommerceRequest("/products", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
