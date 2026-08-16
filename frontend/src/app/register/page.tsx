import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/sections/AuthPanel";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/profile");

  return <AuthPanel mode="register" />;
}
