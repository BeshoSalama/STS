import { auth } from "@/lib/auth";

export async function requireStaffSession() {
  const session = await auth();
  const role = session?.user?.role;
  return role === "ADMIN" || role === "STAFF" ? session : null;
}

export async function requireClientSession() {
  const session = await auth();
  return session?.user?.id ? session : null;
}
