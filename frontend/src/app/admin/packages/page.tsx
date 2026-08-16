import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";

const inputClass = "min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/35";
const textAreaClass = "min-h-28 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

function linesToJson(value: FormDataEntryValue | null) {
  return JSON.stringify(
    String(value ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  );
}

function jsonToLines(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join("\n") : "";
  } catch {
    return "";
  }
}

async function createPlan(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packagePlan.create({
    data: {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      price: String(formData.get("price") ?? ""),
      period: String(formData.get("period") ?? ""),
      description: String(formData.get("description") ?? ""),
      features: linesToJson(formData.get("features")),
      cta: String(formData.get("cta") ?? ""),
      featured: formData.get("featured") === "on",
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

async function updatePlan(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packagePlan.update({
    where: { id: String(formData.get("id") ?? "") },
    data: {
      name: String(formData.get("name") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      price: String(formData.get("price") ?? ""),
      period: String(formData.get("period") ?? ""),
      description: String(formData.get("description") ?? ""),
      features: linesToJson(formData.get("features")),
      cta: String(formData.get("cta") ?? ""),
      featured: formData.get("featured") === "on",
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

async function deletePlan(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packagePlan.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

async function createAddOn(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packageAddOn.create({
    data: {
      id: String(formData.get("id") ?? ""),
      label: String(formData.get("label") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

async function updateAddOn(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packageAddOn.update({
    where: { id: String(formData.get("currentId") ?? "") },
    data: {
      id: String(formData.get("id") ?? ""),
      label: String(formData.get("label") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

async function deleteAddOn(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.packageAddOn.delete({ where: { id: String(formData.get("currentId") ?? "") } });
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

export default async function AdminPackagesPage() {
  if (!(await requireAdminSession())) redirect("/admin/leads");
  const [plans, addOns] = await Promise.all([
    db.packagePlan.findMany({ orderBy: { order: "asc" } }),
    db.packageAddOn.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <section className="grid gap-6">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-display text-2xl font-bold">Create Package Plan</h2>
        <form action={createPlan} className="mt-4 grid gap-3 md:grid-cols-4">
          <input name="name" required placeholder="Name" className={inputClass} />
          <input name="tagline" required placeholder="Small subtitle/tagline" className={inputClass} />
          <input name="price" required placeholder="$499" className={inputClass} />
          <input name="period" required placeholder="/mo" className={inputClass} />
          <textarea name="description" required placeholder="Description" className={`${textAreaClass} md:col-span-2`} />
          <textarea name="features" required placeholder={"One feature per line"} className={`${textAreaClass} md:col-span-2`} />
          <input name="cta" required placeholder="CTA text" className={inputClass} />
          <input name="order" type="number" defaultValue="0" className={inputClass} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="featured" type="checkbox" />
            Featured
          </label>
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold">Create Plan</button>
        </form>
      </div>

      <div className="grid gap-4">
        <h2 className="font-display text-2xl font-bold">Package Plans</h2>
        {plans.map((plan) => (
          <form key={plan.id} action={updatePlan} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-4">
            <input type="hidden" name="id" value={plan.id} />
            <input name="name" defaultValue={plan.name} className={inputClass} />
            <input name="tagline" defaultValue={plan.tagline} className={inputClass} />
            <input name="price" defaultValue={plan.price} className={inputClass} />
            <input name="period" defaultValue={plan.period} className={inputClass} />
            <textarea name="description" defaultValue={plan.description} className={`${textAreaClass} md:col-span-2`} />
            <textarea name="features" defaultValue={jsonToLines(plan.features)} className={`${textAreaClass} md:col-span-2`} />
            <input name="cta" defaultValue={plan.cta} className={inputClass} />
            <input name="order" type="number" defaultValue={plan.order} className={inputClass} />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input name="featured" type="checkbox" defaultChecked={plan.featured} />
              Featured
            </label>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold">Update</button>
              <button formAction={deletePlan} className="flex-1 rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100">
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-display text-2xl font-bold">Create Custom Service</h2>
        <form action={createAddOn} className="mt-4 grid gap-3 md:grid-cols-5">
          <input name="id" required placeholder="service-id" className={inputClass} />
          <input name="label" required placeholder="Service name" className={inputClass} />
          <input name="description" required placeholder="Description" className={`${inputClass} md:col-span-2`} />
          <input name="price" required type="number" min="0" placeholder="350" className={inputClass} />
          <input name="order" type="number" defaultValue="0" className={inputClass} />
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold md:col-span-4">Create Service</button>
        </form>
      </div>

      <div className="grid gap-4">
        <h2 className="font-display text-2xl font-bold">Custom Package Services</h2>
        {addOns.map((addOn) => (
          <form key={addOn.id} action={updateAddOn} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-5">
            <input type="hidden" name="currentId" value={addOn.id} />
            <input name="id" defaultValue={addOn.id} className={inputClass} />
            <input name="label" defaultValue={addOn.label} className={inputClass} />
            <input name="description" defaultValue={addOn.description} className={`${inputClass} md:col-span-2`} />
            <input name="price" type="number" min="0" defaultValue={addOn.price} className={inputClass} />
            <input name="order" type="number" defaultValue={addOn.order} className={inputClass} />
            <div className="flex gap-2 md:col-span-4">
              <button className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold">Update</button>
              <button formAction={deleteAddOn} className="flex-1 rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100">
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
