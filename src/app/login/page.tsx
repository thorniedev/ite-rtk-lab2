import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth/keycloak";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getAuthSession();

  if (session.authenticated) {
    redirect("/product-table");
  }

  const { returnTo = "/product-table" } = await searchParams;

  redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
}
