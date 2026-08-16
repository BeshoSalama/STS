import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { defaultAboutContent, defaultAvatar, getAboutContent } from "@/lib/content/about";
import { requireAdminSession } from "@/lib/rbac";

const inputClass = "min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/35";
const textAreaClass = "min-h-28 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

function asString(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback);
}

function normalizedJson(formData: FormData, key: string, fallback: unknown) {
  const raw = asString(formData, key, JSON.stringify(fallback, null, 2));
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch {
    return JSON.stringify(fallback);
  }
}

async function savePublicImage(formData: FormData, field: string, fallback: string, folder: string) {
  const value = formData.get(field);
  if (!(value instanceof File) || value.size === 0) return fallback;
  if (!value.type.startsWith("image/")) return fallback;

  const extension = path.extname(value.name).toLowerCase() || ".png";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "about", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await value.arrayBuffer()));
  return `/uploads/about/${folder}/${filename}`;
}

async function updateAboutContent(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const founderPhoto = await savePublicImage(
    formData,
    "founderPhotoFile",
    asString(formData, "founderPhoto", defaultAboutContent.founderPhoto),
    "founder",
  );

  await db.aboutPageContent.upsert({
    where: { id: 1 },
    update: {
      heroEyebrow: asString(formData, "heroEyebrow"),
      heroTitle: asString(formData, "heroTitle"),
      heroHighlight: asString(formData, "heroHighlight"),
      heroSubtitle: asString(formData, "heroSubtitle"),
      heroStats: normalizedJson(formData, "heroStats", defaultAboutContent.heroStats),
      serviceCards: normalizedJson(formData, "serviceCards", defaultAboutContent.serviceCards),
      processEyebrow: asString(formData, "processEyebrow"),
      processTitle: asString(formData, "processTitle"),
      processSteps: normalizedJson(formData, "processSteps", defaultAboutContent.processSteps),
      founderEyebrow: asString(formData, "founderEyebrow"),
      founderName: asString(formData, "founderName"),
      founderRole: asString(formData, "founderRole"),
      founderPhoto,
      founderBio: asString(formData, "founderBio"),
      founderBullets: normalizedJson(formData, "founderBullets", defaultAboutContent.founderBullets),
      founderStats: normalizedJson(formData, "founderStats", defaultAboutContent.founderStats),
      teamEyebrow: asString(formData, "teamEyebrow"),
      teamTitle: asString(formData, "teamTitle"),
      metricsTitle: asString(formData, "metricsTitle"),
      metrics: normalizedJson(formData, "metrics", defaultAboutContent.metrics),
      reasonsTitle: asString(formData, "reasonsTitle"),
      reasons: normalizedJson(formData, "reasons", defaultAboutContent.reasons),
      termsTitle: asString(formData, "termsTitle"),
      termsText: asString(formData, "termsText"),
      termsButtonLabel: asString(formData, "termsButtonLabel"),
      termsItems: normalizedJson(formData, "termsItems", defaultAboutContent.termsItems),
    },
    create: {
      id: 1,
      heroEyebrow: asString(formData, "heroEyebrow"),
      heroTitle: asString(formData, "heroTitle"),
      heroHighlight: asString(formData, "heroHighlight"),
      heroSubtitle: asString(formData, "heroSubtitle"),
      heroStats: normalizedJson(formData, "heroStats", defaultAboutContent.heroStats),
      serviceCards: normalizedJson(formData, "serviceCards", defaultAboutContent.serviceCards),
      processEyebrow: asString(formData, "processEyebrow"),
      processTitle: asString(formData, "processTitle"),
      processSteps: normalizedJson(formData, "processSteps", defaultAboutContent.processSteps),
      founderEyebrow: asString(formData, "founderEyebrow"),
      founderName: asString(formData, "founderName"),
      founderRole: asString(formData, "founderRole"),
      founderPhoto,
      founderBio: asString(formData, "founderBio"),
      founderBullets: normalizedJson(formData, "founderBullets", defaultAboutContent.founderBullets),
      founderStats: normalizedJson(formData, "founderStats", defaultAboutContent.founderStats),
      teamEyebrow: asString(formData, "teamEyebrow"),
      teamTitle: asString(formData, "teamTitle"),
      metricsTitle: asString(formData, "metricsTitle"),
      metrics: normalizedJson(formData, "metrics", defaultAboutContent.metrics),
      reasonsTitle: asString(formData, "reasonsTitle"),
      reasons: normalizedJson(formData, "reasons", defaultAboutContent.reasons),
      termsTitle: asString(formData, "termsTitle"),
      termsText: asString(formData, "termsText"),
      termsButtonLabel: asString(formData, "termsButtonLabel"),
      termsItems: normalizedJson(formData, "termsItems", defaultAboutContent.termsItems),
    },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
}

async function createTeamMember(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const photo = await savePublicImage(formData, "photoFile", asString(formData, "photo", defaultAvatar), "team");
  await db.teamMember.create({
    data: {
      name: asString(formData, "name"),
      role: asString(formData, "role"),
      photo,
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

async function updateTeamMember(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const removePhoto = formData.get("removePhoto") === "on";
  const currentPhoto = removePhoto ? defaultAvatar : asString(formData, "photo", defaultAvatar);
  const photo = await savePublicImage(formData, "photoFile", currentPhoto, "team");
  await db.teamMember.update({
    where: { id: asString(formData, "id") },
    data: {
      name: asString(formData, "name"),
      role: asString(formData, "role"),
      photo,
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

async function deleteTeamMember(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.teamMember.delete({ where: { id: asString(formData, "id") } });
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function jsonValue(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default async function AdminAboutPage() {
  if (!(await requireAdminSession())) redirect("/admin/briefs");

  const [content, members] = await Promise.all([
    getAboutContent(),
    db.teamMember.findMany({ orderBy: { order: "asc" } }),
  ]);
  return (
    <section className="grid gap-5">
      <div>
        <h2 className="font-display text-3xl font-extrabold">About Page Management</h2>
        <p className="mt-2 text-sm text-white/55">Edit all About page text, numbers, sections, and team photos.</p>
      </div>

      <form action={updateAboutContent} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-3">
        <h3 className="font-display text-2xl font-bold md:col-span-3">Page Content</h3>
        <input name="heroEyebrow" defaultValue={content.heroEyebrow} className={inputClass} />
        <input name="heroTitle" defaultValue={content.heroTitle} className={inputClass} />
        <input name="heroHighlight" defaultValue={content.heroHighlight} className={inputClass} />
        <textarea name="heroSubtitle" defaultValue={content.heroSubtitle} className={`${textAreaClass} md:col-span-3`} />
        <textarea name="heroStats" defaultValue={jsonValue(content.heroStats)} className={textAreaClass} />
        <textarea name="serviceCards" defaultValue={jsonValue(content.serviceCards)} className={textAreaClass} />
        <textarea name="processSteps" defaultValue={jsonValue(content.processSteps)} className={textAreaClass} />

        <input name="processEyebrow" defaultValue={content.processEyebrow} className={inputClass} />
        <input name="processTitle" defaultValue={content.processTitle} className={inputClass} />
        <input name="teamEyebrow" defaultValue={content.teamEyebrow} className={inputClass} />
        <input name="teamTitle" defaultValue={content.teamTitle} className={inputClass} />
        <input name="metricsTitle" defaultValue={content.metricsTitle} className={inputClass} />
        <input name="reasonsTitle" defaultValue={content.reasonsTitle} className={inputClass} />

        <input name="founderEyebrow" defaultValue={content.founderEyebrow} className={inputClass} />
        <input name="founderName" defaultValue={content.founderName} className={inputClass} />
        <input name="founderRole" defaultValue={content.founderRole} className={inputClass} />
        <input name="founderPhoto" defaultValue={content.founderPhoto} placeholder="/team/default-avatar.svg" className={inputClass} />
        <input name="founderPhotoFile" type="file" accept="image/*" className={`${inputClass} py-2`} />
        <textarea name="founderBio" defaultValue={content.founderBio} className={`${textAreaClass} md:col-span-2`} />
        <textarea name="founderBullets" defaultValue={jsonValue(content.founderBullets)} className={textAreaClass} />
        <textarea name="founderStats" defaultValue={jsonValue(content.founderStats)} className={textAreaClass} />
        <textarea name="metrics" defaultValue={jsonValue(content.metrics)} className={textAreaClass} />
        <textarea name="reasons" defaultValue={jsonValue(content.reasons)} className={textAreaClass} />

        <input name="termsTitle" defaultValue={content.termsTitle} className={inputClass} />
        <input name="termsButtonLabel" type="hidden" defaultValue={content.termsButtonLabel} />
        <textarea name="termsText" defaultValue={content.termsText} className={textAreaClass} />
        <textarea name="termsItems" defaultValue={jsonValue(content.termsItems)} className={`${textAreaClass} md:col-span-3`} />

        <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold md:col-span-3">Save About Page</button>
      </form>

      <form action={createTeamMember} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-5">
        <h3 className="font-display text-2xl font-bold md:col-span-5">Add Team Member</h3>
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="role" required placeholder="Role" className={inputClass} />
        <input name="photo" defaultValue={defaultAvatar} placeholder="/team/default-avatar.svg" className={inputClass} />
        <input name="photoFile" type="file" accept="image/*" className={`${inputClass} py-2`} />
        <input name="order" type="number" defaultValue="0" className={inputClass} />
        <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold md:col-span-5">Add Member</button>
      </form>

      {members.map((member) => (
        <form key={member.id} action={updateTeamMember} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[1fr_1fr_1.2fr_1fr_100px_160px_auto_auto] md:items-center">
          <input type="hidden" name="id" value={member.id} />
          <input name="name" defaultValue={member.name} className={inputClass} />
          <input name="role" defaultValue={member.role} className={inputClass} />
          <input name="photo" defaultValue={member.photo ?? defaultAvatar} className={inputClass} />
          <input name="photoFile" type="file" accept="image/*" className={`${inputClass} py-2`} />
          <input name="order" type="number" defaultValue={member.order} className={inputClass} />
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 text-xs font-bold text-white/70">
            <input name="removePhoto" type="checkbox" className="h-4 w-4 accent-violet-500" />
            Use default photo
          </label>
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold">Update</button>
          <button formAction={deleteTeamMember} className="rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100">
            Delete
          </button>
        </form>
      ))}
    </section>
  );
}
