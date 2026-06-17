import { Providers } from "@/lib/providers";

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
