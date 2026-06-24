import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET() {
  return forwardEcommerceRequest("/categories");
}

export async function POST(request: Request) {
  return forwardEcommerceRequest("/categories", {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
}
