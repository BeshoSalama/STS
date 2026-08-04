import { auth } from "@/lib/auth";
import { isAdmin, isClient, isStaff } from "@/lib/roles";

export async function requireSession() {
  const session = await auth();
  return session?.user?.id ? session : null;
}

export async function requireStaffSession() {
  const session = await auth();
  return isStaff(session?.user?.role) ? session : null;
}

export async function requireAdminSession() {
  const session = await auth();
  return isAdmin(session?.user?.role) ? session : null;
}

export async function requireClientSession() {
  const session = await auth();
  return isClient(session?.user?.role) ? session : null;
}
