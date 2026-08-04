import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireClientSession } from "@/lib/rbac";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await requireClientSession();
  if (!session) return;
  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    },
  });
  revalidatePath("/portal/profile");
  revalidatePath("/portal");
}

export default async function PortalProfilePage() {
  const session = await requireClientSession();
  const user = await db.user.findUnique({ where: { id: session?.user.id } });

  return (
    <form action={updateProfile} className="grid max-w-2xl gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-display text-2xl font-bold">Edit Profile</h2>
      <label className="grid gap-2 text-sm font-bold">
        Name
        <input name="name" defaultValue={user?.name ?? ""} className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Phone
        <input name="phone" defaultValue={user?.phone ?? ""} className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white" />
      </label>
      <p className="text-sm text-white/50">{user?.email}</p>
      <button className="rounded-lg bg-violet-600 px-4 py-3 text-sm font-bold">Save Profile</button>
    </form>
  );
}
