import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProjectSlug } from "@/lib/content/projects";
import { requireAdminSession } from "@/lib/rbac";

async function createProject(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const name = String(formData.get("name") ?? "");
  await db.project.create({
    data: {
      name,
      slug: String(formData.get("slug") || getProjectSlug(name)),
      category: String(formData.get("category") ?? ""),
      image: String(formData.get("image") ?? ""),
      imageAlt: String(formData.get("imageAlt") ?? name),
      details: String(formData.get("details") ?? ""),
      videoUrl: String(formData.get("videoUrl") ?? ""),
      content: String(formData.get("content") ?? ""),
      order: Number(formData.get("order") ?? 0),
      published: true,
    },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

async function updateProject(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "on";
  await db.project.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      category: String(formData.get("category") ?? ""),
      image: String(formData.get("image") ?? ""),
      imageAlt: String(formData.get("imageAlt") ?? ""),
      details: String(formData.get("details") ?? ""),
      videoUrl: String(formData.get("videoUrl") ?? ""),
      content: String(formData.get("content") ?? ""),
      order: Number(formData.get("order") ?? 0),
      published,
    },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

async function deleteProject(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  await db.project.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

const inputClass = "min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/35";
const textAreaClass = "min-h-24 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

export default async function AdminProjectsPage() {
  if (!(await requireAdminSession())) redirect("/admin/leads");
  const projects = await db.project.findMany({ orderBy: { order: "asc" } });

  return (
    <section className="grid gap-5">
      <form action={createProject} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-3">
        <h2 className="font-display text-2xl font-bold md:col-span-3">Create Project</h2>
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="slug" placeholder="Slug" className={inputClass} />
        <input name="category" required placeholder="Category" className={inputClass} />
        <input name="image" required placeholder="/clients/logo.png" className={inputClass} />
        <input name="imageAlt" placeholder="Image alt" className={inputClass} />
        <input name="videoUrl" placeholder="/videos/brand.mp4 or YouTube URL" className={inputClass} />
        <textarea name="details" placeholder="Brand/project intro text" className={`${textAreaClass} md:col-span-3`} />
        <textarea name="content" placeholder="Long brand content, notes, campaign story, media references" className={`${textAreaClass} md:col-span-3`} />
        <input name="order" type="number" defaultValue="0" className={inputClass} />
        <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold md:col-span-3">Create</button>
      </form>

      {projects.map((project) => (
        <form key={project.id} action={updateProject} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-3">
          <input type="hidden" name="id" value={project.id} />
          <input name="name" defaultValue={project.name} className={inputClass} />
          <input name="slug" defaultValue={project.slug} className={inputClass} />
          <input name="category" defaultValue={project.category} className={inputClass} />
          <input name="image" defaultValue={project.image} className={inputClass} />
          <input name="imageAlt" defaultValue={project.imageAlt} className={inputClass} />
          <input name="videoUrl" defaultValue={project.videoUrl ?? ""} className={inputClass} />
          <textarea name="details" defaultValue={project.details ?? ""} className={`${textAreaClass} md:col-span-3`} />
          <textarea name="content" defaultValue={project.content ?? ""} className={`${textAreaClass} md:col-span-3`} />
          <input name="order" type="number" defaultValue={project.order} className={inputClass} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input name="published" type="checkbox" defaultChecked={project.published} />
            Published
          </label>
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold">Update</button>
          <button formAction={deleteProject} className="rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100">
            Delete
          </button>
        </form>
      ))}
    </section>
  );
}
