import { forwardEcommerceRequest } from "@/lib/ecommerce/server-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return forwardEcommerceRequest(`/products/${id}`);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return forwardEcommerceRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return forwardEcommerceRequest(`/products/${id}`, {
    method: "DELETE",
  });
}
