import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/sections/AuthPanel";
import { auth } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams?: { callbackUrl?: string } }) {
  const session = await auth();
  if (session?.user) redirect(searchParams?.callbackUrl ?? "/profile");

  return <AuthPanel mode="login" />;
}
